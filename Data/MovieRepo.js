const Movie = require('../Models/Movie');
 
class MovieRepo {
    
    MovieRepo() {        
    }
 
    async allMovie() {     
        let movies = await Movie.find().exec();
        return   movies;  
    }

    async getMovie(id) {  
        let movie = await Movie.findOne({id:id}).exec();
        return   movie;
    }

    async getMovieByName(movieName) {  
        let movie = await Movie.findOne({movieName:movieName}).exec();
        return   movie;
    }

}

module.exports = MovieRepo;