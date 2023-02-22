//This handler is responsible for all requests relating to user data
//for example: creating users, getting/setting user data
let users = require("./Users.js");
const express = require('express');

let router = express.Router();





//------------------------------------------------------------------------
//------------------------------------------------------------------------
//----------------------GET REQUESTS -------------------------------------
//------------------------------------------------------------------------
//------------------------------------------------------------------------
router.get("/search", searchUsers);
router.get("/getRequests", getUserRequests);
router.get("/:user", getUser);
router.get("", searchUsersForDavid);
router.get("*", (req, res, next) => {next("User Router received a GET request that it cannot handle!");});

function getUser(req, res, next){
    if(users.getUserByUsername(req.params.user) == null){
        console.log("here");
        res.status(404).send("user not found!");
        return;
    }
    
    res.status(200).send(users.getUserByUsernameForDavid(req.params.user));
}

function searchUsersForDavid(req, res, next){
    res.status(200).send(users.searchUsersByStrForDavid(req.query.name));
}

function searchUsers(req, res, next){
    res.status(200).send(JSON.stringify(users.searchUsersByStr(req.query.queryStr)));
}

function getUserRequests(req, res, next){
    if(req.session.playerID == null){
        res.status(403).send("not logged in!");
        return;
    }
    
    res.status(200).send(JSON.stringify(users.getUserRequests(req.session.playerID)));
}

//--------------------------------------------------------------------------
//--------------------------------------------------------------------------
//----------------------END OF GET REQUESTS --------------------------------
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------









//------------------------------------------------------------------------
//------------------------------------------------------------------------
//----------------------POST REQUESTS -------------------------------------
//------------------------------------------------------------------------
//------------------------------------------------------------------------
router.post("/sendFriendRequest", sendFriendRequest);
router.post("*", (req, res, next) => {next("User Router received a POST request that it cannot handle!");});

function sendFriendRequest(req, res, next){
    let playerID = req.session.playerID;
    
    if(playerID == null) { 
        res.status(401).send("not logged in!");       
        return;
    }
    
    let friendID = req.reqData.friendID;
    if(friendID == null){
        res.status(400).send("missing friend's ID!");
        return;
    }
    
    result = users.sendFriendRequest(playerID, friendID);
    
    if(result){
        res.status(201).send("friend request sent!");
        return;
    }else{
        res.status(400).send("friend request already sent!");
        return;
    }
    
}
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------
//----------------------END OF POST REQUESTS --------------------------------
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------





//------------------------------------------------------------------------
//------------------------------------------------------------------------
//----------------------PUT REQUESTS -------------------------------------
//------------------------------------------------------------------------
//------------------------------------------------------------------------
router.put("/acceptFriendRequest", acceptFriendRequest);
router.put("/editProfile*", editProfile);
router.put("*", (req, res, next) => {next("User Router received a PUT request that it cannot handle!");});

function acceptFriendRequest(req, res, next){
    let playerID = req.session.playerID;
    
    if(playerID == null) { 
        res.status(401).send("not logged in!");       
        return;
    }
    
    let friendID = req.reqData.friendID;
    if(friendID == null){
        res.status(400).send("missing friend's ID!");
        return;
    }
    
    result = users.acceptFriendRequest(friendID, playerID);
    
    if(result){
        res.status(201).send("friend request accepted!");
        return;
    }else{
        res.status(400).send("friend request can't be accepted, because a request was never made.");
        return;
    }
    
}

function editProfile(req, res, next){
    users.updateProfileSettings(req.reqData, req.session.playerID);
    res.status(200).send("Profile updated");
}
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------
//----------------------END OF PUT REQUESTS --------------------------------
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------






//------------------------------------------------------------------------
//------------------------------------------------------------------------
//----------------------DELETE REQUESTS -------------------------------------
//------------------------------------------------------------------------
//------------------------------------------------------------------------
router.delete("/denyFriendRequest/:friendID*", denyFriendRequest);
router.delete("/friend/:friendID*", removeFriend);
router.delete("*", (req, res, next) => {next("Users Router received a DELETE request that it cannot handle!");});

function denyFriendRequest(req, res, next){
    let playerID = req.session.playerID;
    
    if(playerID == null) { 
        res.status(401).send("not logged in!");       
        return;
    }
    
    if(users.getUserById(req.params.friendID) == null){
        res.status(400).send("bad friend ID!");
        return;
    }
    
    let result = users.denyFriendRequest(req.params.friendID, playerID);
    
    if(result){
        res.status(201).send(result);
    }else{
        res.status(400).send("friend request was never sent!");
    }
}

function removeFriend(req, res, next){
    let playerID = req.session.playerID;
    
    if(playerID == null) { 
        res.status(401).send("not logged in!");       
        return;
    }
    
    if(users.getUserById(req.params.friendID) == null){
        res.status(400).send("bad friend ID!");
        return;
    }
    
    users.removeFriend(req.params.friendID, playerID);
    res.status(201).send("Person removed from friend list");
}
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------
//----------------------END OF DELETE REQUESTS --------------------------------
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------

module.exports = router;
