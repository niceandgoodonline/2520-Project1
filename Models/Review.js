var mongoose              = require('mongoose');

var reviewSchema = mongoose.Schema({
    movieName: {
        type: String,
    },
    reviewRating:{
        type: Number, min:1, max:5
    },
    reviewText:{
        type: String
    },
    reviewUser:{
        type: String
    },
    date:{
        type: Date,
        default: Date.now
    }
});

var Review = module.exports = mongoose.model('Review', reviewSchema);
module.exports = Review;
