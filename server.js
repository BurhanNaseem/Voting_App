const express = require('express');
const app = express();
require('dotenv').config();
const db = require('./db'); // database connection

const bodyParser = require('body-parser');
app.use(bodyParser.json());  // the data sent from the client side will be saved in req.body
const PORT = process.env.PORT || 3000;

// import the router files
const userRoutes = require('./Routes/userRoutes');
const candidateRoutes = require('./Routes/candidateRoutes');

// use the routers 
app.use("/user",userRoutes);
app.use("/candidate",candidateRoutes);

app.listen(PORT, function(){
    console.log("server running on port 3000");
});