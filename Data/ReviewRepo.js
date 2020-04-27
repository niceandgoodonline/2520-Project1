const Review = require('../Models/Review');
 
class ReviewRepo {
    
    ReviewRepo() {        
    }
 
    async allReviews() {     
        let reviews = await Review.find().exec();
        return reviews;
        
    }

    async allReviewsForOneMovie(movieName) {     
        let reviews = await Review.find({movieName:movieName}).exec();
        return reviews; 
    }

    async allReviewsFromUser(user) {     
        let reviews = await Review.find({reviewUser:user}).exec();
        return reviews;
    }

    async stopDuplicate(userReviews, movieName){
        for(let i = 0; i < userReviews.length; i++){
            if(movieName == userReviews[i].movieName){
                return false
            }
        }
        return true
    }

    async getMovieRatings(movies){
        let ratings = []

        for(let i = 0; i < movies.length; i++){

            let reviews = await this.allReviewsForOneMovie(movies[i].movieName)
            let ratingTotal = 0

            for(let i = 0; i < reviews.length; i++){
                ratingTotal += reviews[i].reviewRating
            }

            if(ratingTotal == NaN){
                ratings.push(0)
            }
            else{
                ratings.push(parseFloat(ratingTotal/reviews.length).toFixed(1) )
            }
        }
 
        return ratings
    }

    async getReviewCount(movies){
        let count = []

        for(let i = 0; i < movies.length; i++){
            let reviews = await this.allReviewsForOneMovie(movies[i].movieName)
            let reviewCount = reviews.length

            if(reviewCount == NaN){
                count.push(0)
            }
            else{
                count.push(reviewCount)
            }
        }
        return count
    }

    async getOneReviewFromUser(user, movieName) {  
        let review = await Review.findOne({movieName: movieName, reviewUser: user}).exec();
        return review;
    }
    

    
    async create(reviewObj) {
        try {
            // Checks if model conforms to validation rules that we set in Mongoose.
            var error = await reviewObj.validateSync();
    
            // The model is invalid. Return the object and error message. 
            if(error) {
                let res = {
                    obj:          reviewObj,
                    errorMessage: error.message };
                return res; // Exit if the model is invalid.
            } 
    
            // Model is not invalid so save it.
            const result = await reviewObj.save();
    
            // Success! Return the model and no error message needed.
            let res = {
                obj:          result,
                errorMessage: "" };
            return res;
        } 
        //  Error occurred during the save(). Return orginal model and error message.
        catch (err) {
            let res = {
                obj:          reviewObj,
                errorMessage: err.message };
            return  res;
        }    
    } 

    async update(editedObj) {

        let res = {
            obj:          editedObj,
            errorMessage: "" };

        try {

            var error = await editedObj.validateSync();

            if(error) {
                res.errorMessage = error.message;
                return res;
            } 

            let reviewObject = await this.getOneReviewFromUser(editedObj.reviewUser, editedObj.movieName);

            if(reviewObject) {

                let updated = await Review.updateOne(

                    { movieName: reviewObject.movieName, reviewUser: reviewObject.reviewUser},

                    {$set: { reviewText: editedObj.reviewText,
                            reviewRating: editedObj.reviewRating,
                            date  : editedObj.date                 
                    }}); 

                if(updated.nModified!=0) {
                    res.obj = editedObj;
                    return res;
                }

                else {
                    res.errorMessage = 
                        "An error occurred during the update. The review was not saved." 
                };
                return res; 
            }
                
            else {
                res.errorMessage = "A movie with this id cannot be found." };
                return res; 
            }

        catch (err) {
            res.errorMessage = err.message;
            return  res;
        }
    }

    async delete(movieName, username) {
        let deletedItem =  await Review.find({movieName:movieName, reviewUser: username}).remove().exec();
        return deletedItem;
    }  
}
module.exports = ReviewRepo;