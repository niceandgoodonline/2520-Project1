var HomeController = require('./Controllers/HomeController');
var UserController = require('./Controllers/UserController');

// Routes
module.exports = function(app){  
    // HomeController Gets
    app.get('/',      HomeController.Index);
    app.get('/Home/Reviews', HomeController.Reviews);
    app.get('/Home/ReviewsByUser', HomeController.ReviewsByUser);

    // UserController Gets
    app.get('/User/Register', UserController.Register);
    app.get('/User/Login', UserController.Login);
    app.get('/User/Logout', UserController.Logout);
    app.get('/User/MyReviews', UserController.MyReviews);
    app.get('/User/WriteReview', UserController.WriteReview);
    app.get('/User/Profile', UserController.Profile);
    app.get('/User/EditReview', UserController.EditReview);
    app.get('/User/DeleteReview', UserController.DeleteReview)

    // UserController Posts
    app.post('/User/PostReview', UserController.PostReview);
    app.post('/User/UpdateReview', UserController.UpdateReview);
    app.post('/User/LoginUser', UserController.LoginUser);
    app.post('/User/RegisterUser', UserController.RegisterUser);
    app.post('/User/UpdateProfile', UserController.UpdateUser)

};
