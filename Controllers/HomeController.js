const RequestService = require('../Services/RequestService');
const ReviewRepo = require('../Data/ReviewRepo');
const _reviewRepo = new ReviewRepo();
const MovieRepo = require('../Data/MovieRepo');
const _movieRepo = new MovieRepo();


exports.Index = async function(req, res) {
    let reqInfo = RequestService.reqHelper(req);
    let movie = await _movieRepo.allMovie();
    let ratings = await _reviewRepo.getMovieRatings(movie);
    let reviewCount = await _reviewRepo.getReviewCount(movie);

        
    if(movie!= null) {
        res.render('Home/Index', { reviewCount: reviewCount, movie:movie, reqInfo:reqInfo, ratings:ratings })
    }
    else {
        res.render('Home/Index', { movie:[], reqInfo:reqInfo })
    }
};

exports.Reviews = async function(req, res) {
    let movieID  = req.query.id;
    let movieObj = await _movieRepo.getMovie(movieID)
    let reqInfo = RequestService.reqHelper(req);
    let allReviewForMovie = await _reviewRepo.allReviewsForOneMovie(movieObj.movieName)
    res.render('Home/Reviews', { movie:movieObj, reviews: allReviewForMovie, reqInfo:reqInfo, errorMessage:"" } );    
};

exports.ReviewsByUser = async function(req, res) {
    let userID  = req.query.user;
    let reqInfo = RequestService.reqHelper(req);
    let allMovie = _movieRepo.allMovie();
    let allReviewFromUser = await _reviewRepo.allReviewsFromUser(userID)
    res.render('Home/ReviewsByUser', { reviews: allReviewFromUser, movie: allMovie, reqInfo:reqInfo, errorMessage:"" } );    
};

