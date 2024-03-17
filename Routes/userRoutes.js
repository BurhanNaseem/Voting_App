const express = require('express');
const router = express.Router();
const User = require('../Models/user'); // Mongoose model of a person
const {jwtAuthMiddleware, generateToken} = require('../jwt');

// post request on /user signup route
router.post('/signup', async (req, res) => {
  
  try {
    const data = req.body;
    const newUser = new User(data);

    // to check if there is any multiple entries for admin role
    const isAdmin = await User.findOne({role : "admin"});
    if(isAdmin && newUser.role == "admin"){
      return res.status(403).json({Message : "We can have only one admin"});
    }

    const response = await newUser.save();
    console.log("Data saved successfully");

    const payload = {
      id : response.id
    }
    console.log(JSON.stringify(payload));
    const token = generateToken(payload);
    console.log("Token : ", token);

    // send the status code 200 (successfully work done) and the response data in JSON format
    res.status(200).json({response : response, token : token});
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// login route
router.post("/login", async(req,res) => {
  try{
    // extract the adhaarCardNumber and password from req.body
    const {adhaarCardNumber, password} = req.body;

    // find user by adhaarCardNumber in the database
    const user = await User.findOne({adhaarCardNumber : adhaarCardNumber});

    // if user does not exits or password does does not match then return error
    if(!user || !(await user.comparePassword(password))){
      return res.status(401).json({error : "Invalid username or password"});
    }
    
    // generate token
    const payload = {
      id : user.id
    };
    const token = generateToken(payload);

    // return token as response
    res.send({token});
  }
  catch(error){
    console.log(error);
    res.status(500).json({error : "Internal server error"});
  }
});

// profile route
router.get("/profile", jwtAuthMiddleware, async(req,res) => {
  try{
    const userData = req.user;
    const userId = userData.id;
    const user = await Person.findById(userId);

    res.status(200).json({User : user});
  }
  catch(error){
    console.log(error);
    res.status(500).json({error : "Internal server error"});
  }
});


// update person data
router.put("/profile/password", jwtAuthMiddleware, async (req, res) => {
  try {
    // extract the id from the token
    const userId = req.user.id;

    // fetch current and new password from the user
    const {currentPassword, newPassword} = req.body;

    // find the user by its id
    const user = await User.findById(userId);

    if(!(await user.comparePassword(currentPassword))){
      return res.status(401).json({error : "Invalid password"});
    }

    user.password = newPassword;
    await user.save();

    console.log("Password Updates Successfully");
    res.status(200).json({Message : "Password Updates Successfully"});
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
});


module.exports = router;