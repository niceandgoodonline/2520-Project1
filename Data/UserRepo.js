const User = require('../Models/User');

class UserRepo {
    UserRepo() {        
    }

    async getUserByName(userName) {
        var user = await User.findOne({username: userName});
        if(user) {
            let response = { obj: user, errorMessage:"" }
            return response;
        }
        else {
            return null;
        }
        
    }

    async updateUser(editedObj, userObj){

        let userNameRef = userObj.username

        let res = {
            obj:          editedObj,
            errorMessage: "" };

        try {
            var error = await editedObj.validateSync();

            if(error) {
                res.errorMessage = error.message;
                return res;
            } 

            
            if(userObj) {

                let updated = await User.updateOne(
                
                    { username: userNameRef }, 

                    {$set: { username: editedObj.username,
                        email: editedObj.email,
                        firstName: editedObj.firstName,
                        lastName: editedObj.lastName                 
                }}); 

                if(updated.nModified!=0) {
                    res.obj = editedObj;
                    return res;
                }

                else {
                    res.errorMessage = 
                        "An error occurred during the update. Your user profile was not updated." 
                };
                return res; 
            }
                
            else {
                res.errorMessage = "A user with this username cannot be found." };
                return res; 
            }

        catch (err) {
            res.errorMessage = err.message;
            return  res;
        }     
    }
      
}
module.exports = UserRepo;

