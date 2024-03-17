const mongoose = require('mongoose');
require('dotenv').config();

const mongoURL = process.env.db_url_local;

// setup mongodb connection
mongoose.connect(mongoURL, {
    // useNewUrlParser : true,
    // useUnifiedTopology : true
});

const db = mongoose.connection;

// Event Listeners
db.on('connected', function(){
    console.log("Connected to Mongo DB server");
})

db.on('disconnected', function(){
    console.log("Disconnected to Mongo DB server");
})

db.on('error', function(err){
    console.log("An error ocurred", err);
})

module.exports = db;