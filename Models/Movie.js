var mongoose              = require('mongoose');

var movieSchema = mongoose.Schema({
    id: {
        type: Number,
        index: true
    },
    movieName: {
        type: String,
        index:true // Index ensures property is unique in db.
    }
});

var Movie = module.exports = mongoose.model('Movie', movieSchema);
module.exports = Movie;
