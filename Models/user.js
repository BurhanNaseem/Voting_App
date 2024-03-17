const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Define the User schema
const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    age : {
        type : Number,
        required : true
    },
    email : {
        type : String
    },
    mobile : {
        type : String
    },
    address : {
        type : String,
        required : true
    },
    adhaarCardNumber : {
        type : String,
        required : true,
        unique : true
    },
    password : {
        type : String,
        required : true
    },
    role : {
        type : String,
        enum : ['voter', "admin"],
        default : 'voter'
    },
    isVoted : {
        type : Boolean,
        default : false
    }
});

// while saving the password we convert the password into a hash value
userSchema.pre('save', async function(next){
    const person = this;

    // Hash the password only if it has been modified (or it is new)
    if(!person.isModified('password')){
        return next();
    }

    try{
        // generate salt
        const salt = await bcrypt.genSalt(10);
        // generate hashed password
        const hashedPassword = await bcrypt.hash(person.password,salt);
        
        // override the plain password with the hashed one
        person.password = hashedPassword;
        next();
    }
    catch(err){
        return next(err);
    }
});

userSchema.methods.comparePassword = async function(enteredPassword){
    try{
        // use bcrypt to compare the entered passowrd with the stored hashed
        // password
        const isMatched = await bcrypt.compare(enteredPassword, this.password);
        return isMatched;
    }
    catch(err){
        throw err;
    }
}

// Create person model
const User = mongoose.model('User', userSchema);
module.exports = User;