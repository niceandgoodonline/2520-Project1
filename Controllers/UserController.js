var   passport       = require('passport');
const RequestService = require('../Services/RequestService');

const User           = require('../Models/User');
const UserRepo = require('../Data/UserRepo')
const _userRepo = new UserRepo();

const Review = require('../Models/Review');
const ReviewRepo = require('../Data/ReviewRepo');
const _reviewRepo = new ReviewRepo();

const MovieRepo = require('../Data/MovieRepo');
const _movieRepo = new MovieRepo();

// Displays registration form.
exports.Register = async function(req, res) {
    let reqInfo = RequestService.reqHelper(req);
    res.render('User/Register', {errorMessage:"", user:{}, reqInfo:reqInfo})
};

// Handles 'POST' with registration form submission.
exports.RegisterUser  = async function(req, res){
   
    var password        = req.body.password;
    var passwordConfirm = req.body.passwordConfirm;

    if (password == passwordConfirm) {

        var newUser = new User({
            firstName:    req.body.firstName,
            lastName:     req.body.lastName,
            email:        req.body.email,
            username:     req.body.username,
        });
       
        
        User.register(new User(newUser), req.body.password, 
                function(err, account) {
                    // Show registration form with errors if fail.
                    if (err) {
                        let reqInfo = RequestService.reqHelper(req);
                        return res.render('User/Register', 
                        { user : newUser, errorMessage: err, 
                          reqInfo:reqInfo });
                    }
                    // User registered so authenticate and redirect to secure 
                    // area.
                    passport.authenticate('local') (req, res, 
                            function () { res.redirect('/'); });
                });

    }
    else {
      res.render('User/Register', { user:newUser, 
              errorMessage: "Passwords do not match.", 
              reqInfo:reqInfo})
    }
};

exports.Profile = async function(req, res){
    let reqInfo = RequestService.reqHelper(req);
    let userObj = await _userRepo.getUserByName(reqInfo.username)

    if(reqInfo.authenticated){
        res.render("User/Profile", {user: userObj.obj, errorMessage:'', reqInfo: reqInfo})
    }
    else {
        res.redirect('/User/Login?errorMessage=You ' + 
                     'must be logged in to view this page.')
    }
}

exports.UpdateUser = async function(req, res){
    let reqInfo = RequestService.reqHelper(req);
    let userToUpdate = await _userRepo.getUserByName(reqInfo.username)

    if(reqInfo.authenticated){
        var userUpdate = new User({
            firstName:    req.body.firstName,
            lastName:     req.body.lastName,
            email:        req.body.email,
            username:     req.body.username,
        });

        let updatedUserInfo = await _userRepo.updateUser(userUpdate, userToUpdate.obj)

        if(updatedUserInfo.errorMessage =='' && updatedUserInfo.obj.username != userToUpdate.obj.username){
            let newUserDetails = await _userRepo.getUserByName(userUpdate.username)
            res.render("User/Profile",{user: newUserDetails.obj, reqInfo: reqInfo, errorMessage:'Username changed, logging you out for security reasons.'})
        }
        else if(updatedUserInfo.errorMessage == ""){
            let newUserDetails = await _userRepo.getUserByName(userUpdate.username)
            res.render("User/Profile",{user: newUserDetails.obj, reqInfo: reqInfo, errorMessage:'User Info Updated!'})
        }
        else{
            res.render(res.render("User/Profile",{user: userToUpdate.obj, reqInfo: reqInfo, errorMessage:updatedUserInfo.errorMessage}))
        }
    }
    else{
        res.redirect('/User/Login?errorMessage=You must be logged in to view this page.')
    }
}



// Shows login form.
exports.Login = async function(req, res) {
    let reqInfo      = RequestService.reqHelper(req);
    let errorMessage = req.query.errorMessage; 

    res.render('User/Login', { user:{}, errorMessage:errorMessage, 
                               reqInfo:reqInfo});
}

// Receives login information & redirects 
// depending on pass or fail.
exports.LoginUser = (req, res, next) => {
  passport.authenticate('local', {
      successRedirect : '/', 
      failureRedirect : '/User/Login?errorMessage=Invalid login.', 
  }) (req, res, next);
};

// Log user out and direct them to the login screen.
exports.Logout = (req, res) => {
    req.logout();
    let reqInfo = RequestService.reqHelper(req);

    res.render('User/Login', { user:{}, isLoggedIn:false, errorMessage : "", 
                               reqInfo:reqInfo});
};


exports.MyReviews  = async function(req, res) {
    let reqInfo = RequestService.reqHelper(req);
    let errorMessage = req.query.errorMessage;

    if(reqInfo.authenticated) {
        let movies = await _movieRepo.allMovie()
        let myReviews = await _reviewRepo.allReviewsFromUser(reqInfo.username)
        res.render('User/MyReviews', {reviews:myReviews, errorMessage:errorMessage, movies:movies, reqInfo:reqInfo})
    }
    else {
        res.redirect('/User/Login?errorMessage=You ' + 
                     'must be logged in to view this page.')
    }
}

exports.WriteReview = async function(req, res) {
    let reqInfo = RequestService.reqHelper(req);
    let errorMessage = req.query.errorMessage;

    if(reqInfo.authenticated) {
        let movieID  = req.query.id;
        let movieObj = await _movieRepo.getMovie(movieID)
        let reviewsByUser = await _reviewRepo.allReviewsFromUser(reqInfo.username)
        let newReview = await _reviewRepo.stopDuplicate(reviewsByUser, movieObj.movieName)

        if(newReview == true){
            res.render('User/WriteReview', {movie:movieObj, reqInfo:reqInfo,  errorMessage:errorMessage});
        }
        else{
            let thisReview = await _reviewRepo.getOneReviewFromUser(reqInfo.username, movieObj.movieName)
            res.render('User/EditReview', {movie:movieObj, review: reviewsByUser[0], reqInfo:reqInfo, errorMessage:'Error: You have already reviewed this movie.'})
        }

    }
    else {
        res.redirect('/User/Login?errorMessage=You must be logged in to write a review.')
    }
    
}

exports.PostReview = async function(req, res) {
    let reqInfo = RequestService.reqHelper(req);
    let rating = parseInt(req.body.rating);
    let allowedRatings = [1,2,3,4,5]

    if(reqInfo.authenticated){

        if( allowedRatings.includes(rating) ){
            let tempReviewObj  = new Review( {
                movieName: req.body.movieName,
                reviewRating: rating,
                reviewText: req.body.review,
                reviewUser: reqInfo.username
                } 
            );
        
            let reviewObject = await _reviewRepo.create(tempReviewObj);
            let movieRef = await _movieRepo.getMovie(req.body.id)

            if(reviewObject.errorMessage == "") {
                let myReviews = await _reviewRepo.allReviewsFromUser(reqInfo.username)
                res.render('User/MyReviews', { reviews:myReviews, reqInfo:reqInfo, errorMessage:"" });
            }

            else {
                res.render('User/WriteReview', { 
                    review: reviewObject.obj, movie:movieRef, reqInfo:reqInfo, errorMessage: reviewObject.errorMessage });
            }
        }

        else {
            res.redirect('/User/MyReviews?errorMessage=ERROR: Ratings must be whole numbers between 1 and 5, and will be rounded down.')
        }
    }
    else{
        res.redirect('/User/Login?errorMessage=You must be logged in to write a review.')
    }
}

exports.EditReview = async function(req, res){
    let reqInfo = RequestService.reqHelper(req);
    let userObj = await _userRepo.getUserByName(reqInfo.username)
    let review = await _reviewRepo.getOneReviewFromUser(reqInfo.username, req.query.movieName)


    if(reqInfo.authenticated){
        res.render("User/EditReview", {user: userObj.obj, review:review, errorMessage:'', reqInfo: reqInfo})
    }
    else {
        res.redirect('/User/Login?errorMessage=You must be logged in to view this page.')
    }
}

exports.DeleteReview = async function(req, res){
    let reqInfo = RequestService.reqHelper(req);
    deleteThisMovie = req.query.movieName;
    if(reqInfo.authenticated){
        deleteInfo = await _reviewRepo.delete(deleteThisMovie, reqInfo.username)
        let movies = await _movieRepo.allMovie()
        let myReviews = await _reviewRepo.allReviewsFromUser(reqInfo.username)
        res.render('User/MyReviews', {reviews:myReviews, errorMessage:"Deleted review for " + deleteThisMovie, movies:movies, reqInfo:reqInfo})
    }
    else{
        res.redirect('/User/Login?errorMessage=You must be logged in to delete reviews.') 
    }
}

exports.UpdateReview = async function(req, res){
    let reqInfo = RequestService.reqHelper(req);
    let rating = parseInt(req.body.rating);
    let allowedRatings = [1,2,3,4,5]

    if(reqInfo.authenticated){
        if( allowedRatings.includes(rating) ){

            let tempReviewObj  = new Review( {
                movieName: req.body.movieName,
                reviewRating: rating,
                reviewText: req.body.review,
                reviewUser: reqInfo.username
                } 
            );
        
            let reviewObject = await _reviewRepo.update(tempReviewObj);
            let movieRef = await _movieRepo.getMovieByName(req.body.movieName)

            if(reviewObject.errorMessage == "") {
                let myReviews = await _reviewRepo.allReviewsFromUser(reqInfo.username)
                res.render('User/MyReviews', { reviews:myReviews, reqInfo:reqInfo, errorMessage:"" });
            }
            else { 
                res.render('User/EditReview', { 
                    reviews: reviewObject.obj, movie:movieRef, reqInfo:reqInfo, errorMessage: reviewObject.errorMessage });
            }
        }

        else {
            res.redirect('/User/MyReviews?errorMessage=ERROR: Ratings must be whole numbers between 1 and 5, and will be rounded down.')
        }
    }
    else{
        res.redirect('/User/Login?errorMessage=You must be logged in to edit a review')
    }
}
