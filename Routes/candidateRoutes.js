const express = require('express');
const router = express.Router();
const Candidate = require('../Models/candidate'); // Mongoose model of a person
const User = require('../Models/user'); // Mongoose model of a person
const {jwtAuthMiddleware, generateToken} = require('../jwt');

const checkAdminRole = async(userId) => {
  const user = await User.findById(userId);
  if(user.role == 'admin') return true;
  return false;
}

// get the list of candidates
router.get("/", jwtAuthMiddleware, async(req,res)=>{
  try{
    const candidates = await Candidate.find();

    const candidateRecords = candidates.map((data) =>{
      return {
        name : data.name,
        party : data.party
      }
    });

    return res.status(200).json(candidateRecords);
  }
  catch(error){
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
})

// create a new candidate
router.post('/',jwtAuthMiddleware, async (req, res) => {

  if(! (await checkAdminRole(req.user.id))){
    return res.status(403).json({Message : "You don't have admin access"});
  }

  try {
    const data = req.body;
    // create an object of Candidate named as newCandidate which contains the data fetched
    // from req.body
    const newCandidate = new Candidate(data);

    // save the new object newCandidate in the database and wait unitl the database 
    // processing is done
    const response = await newCandidate.save();
    console.log("Candidate created successfully");

    // send the status code 200 (successfully work done) and the response data in JSON format
    res.status(200).json({response : response});
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// update Candidate details
router.put("/:id", jwtAuthMiddleware,async(req,res) => {

  if(!checkAdminRole(req.user.id)){
    return res.status(403).json({Message : "You don't have admin access"});
  }

  try{
      const candidateId = req.params.id;
      const upadatedCandidateData = req.body;

      const response = await Candidate.findByIdAndUpdate(candidateId, upadatedCandidateData, {
          new : true,
          runValidators : true
      });

      if(!response){
          return res.status(404).json({error : "Candidate not found"});
      }

      console.log("Candidate Data updated successfully");
      res.status(200).json(response);
  }
  catch(err){
      console.log(err);
      res.status(500).json({error : "Internal server error"});
  }
});

// delete the Candidate data
router.delete("/:id", jwtAuthMiddleware,async(req,res) => {

  if(!checkAdminRole(req.user.id)){
    return res.status(403).json({Message : "You don't have admin access"});
  }

  try{
    const candidateId = req.params.id;

    const deletedData = await Candidate.findByIdAndDelete(candidateId);

    if(!deletedData){
      return res.status(404).json({error : "Candidate not found"});
    }

    console.log("Candidate removed successfully");
    res.status(200).json(deletedData);
  }
  catch(err){
    console.log(err);
    res.status(500).json({error : "Internal server error"});
  }
});

// voting route
router.post("/vote/:candidateId", jwtAuthMiddleware, async(req,res) => {

  // Requirements
  // 1) admin cannot vote.
  // 2) user can vote only once.
  // 3) update the candidate document and user document.

  const candidateId = req.params.candidateId;
  const userId = req.user.id;

  try{
    // find the candidate and user with help of candidateId and userId.
    const candidate = await Candidate.findById(candidateId);
    const user = await User.findById(userId);

    // if no candidate is found.
    if(!candidate){
      return res.status(404).json({Message : "Candidate not found"});
    }

    // if no user is found.
    if(!user){
      return res.status(404).json({Message : "User not found"});
    }

    // if user has already voted.
    if(user.isVoted == true){
      return res.status(400).json({Message : "You can vote only once"});
    }

    // if user is has admin role.
    if(user.role == "admin"){
      return res.status(400).json({Message : "Admin cannot vote"});
    }

    // update the candidate document to record the vote.
    candidate.votes.push({user : userId});
    candidate.voteCount += 1;
    await candidate.save();

    // update the user document.
    user.isVoted = true;
    await user.save();

    console.log("Vote Recorded Successfully");
    res.status(200).json({Message : "Vote Recorded Successfully"});
  }
  catch(error){
    console.log(error);
    res.status(500).json({Message : "Internal server error"});
  }
});

// get vote count
router.get("/vote/count", async(req,res)=>{
  try{
    // find all the candidates and sort them based on voteCount in desc order
    const candidate = await Candidate.find().sort({voteCount : 'desc'});

    const voteRecord = candidate.map((data) => {
      return {
        party : data.party,
        count : data.voteCount
      }
    });

    return res.status(200).json(voteRecord);
  }
  catch(error){
    console.log(error);
    res.status(500).json({Message : "Internal server error"});
  }
});

module.exports = router;