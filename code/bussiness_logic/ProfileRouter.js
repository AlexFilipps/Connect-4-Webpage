//This handler is responsible for all requests relating to the profile page of the website
//for example: serving html of the profile page and editing it based on who's id was given
let users = require("./Users.js");
let games = require("./Games.js");
const express = require('express');

let router = express.Router();

//------------------------------------------------------------------------
//------------------------------------------------------------------------
//----------------------GET REQUESTS -------------------------------------
//------------------------------------------------------------------------
//------------------------------------------------------------------------
router.get("/profilePic/:playerID", serveProfilePic);
router.get("/:playerID*", serveProfilePage);
router.get("*", (req, res, next) => {next("Profile Router received a GET request that it cannot handle!");});

function serveProfilePic(req, res, next){
    let user = users.getUserById(req.params.playerID);
    
    if(user == null){
        res.status(404).send("user not found!");
        return;
    }

    let path =__dirname;
    path = path.replace("bussiness_logic", '');
    
    res.status(200).sendFile(path + "/public/img/profilePics/profilePic" + user.profilePic + ".png");
}
function serveProfilePage(req, res, next){
    let ownerData = users.getUserById(req.params.playerID);
    let viewerData = users.getUserById(req.session.playerID);
    
    if ((req.params.playerID == null) || (ownerData == null)){
        next("user data cannot be found!");
        return;
    }
    
    
    let activeGames = formatActiveGames(req.params.playerID, req.session.playerID);
    let matchHistory = formatMatchHistory(req.params.playerID, req.session.playerID);
    let friendsList = formatFriendsList(ownerData);
    let profileStats = users.getUserStatistics(req.params.playerID);
    
    //check if the requesting user has permissions to see the specified account
    let isFriend = false;
    let hasAccess = false;
    let isOwner = false;
    let addingFriends = true;
    
    if(req.session.playerID === req.params.playerID){
        isOwner = true;
        hasAccess = true;
    }
    else if(ownerData.privacy === "public"){
        hasAccess = true;
    }
    else if((ownerData.privacy === "friends-only") && (req.session.playerID != null)){
        for(var i = 0; i < ownerData.friendsList.length; i++){
            if(req.session.playerID === ownerData.friendsList[i]){
                hasAccess = true;
            }
        }
    }
    
    for(var i = 0; i < ownerData.friendsList.length; i++){
        if(req.session.playerID === ownerData.friendsList[i]){
            isFriend = true;
        }
    }
    
    
    if(!req.session.loggedin){
    res.render("pages/profile.ejs", 
            {playerID:null, gameIDs:[],  fName:ownerData['fName'], profileID:req.params.playerID,
            lName:ownerData['lName'], username:ownerData['username'],
            email:ownerData['email'], privacy:ownerData['privacy'], activeGames, matchHistory, friendsList,
            enemyIDs:[], hasAccess, isOwner, profileStats, addingFriends, friendsList:[], isFriend
            });
        return;
    }
    
    let enemyIDs = users.getIDsOfAllOpponents(req.session.playerID);

    //serve the html for the profile specified by the id at req.params.playerID 
    //we will need a Check later to see if the request was made by the owner in order to allow more functionality for ones own profile
    res.render("pages/profile.ejs", 
            {playerID:req.session.playerID, gameIDs:viewerData.activeGames,  fName:ownerData['fName'], profileID:req.params.playerID,
            lName:ownerData['lName'], username:ownerData['username'],
            email:ownerData['email'], privacy:ownerData['privacy'], activeGames, matchHistory, friendsList,
            enemyIDs, hasAccess, isOwner, profileStats, addingFriends, isFriend
            });
}

function formatActiveGames(ownerID, viewerID){
    let activeGames = [];
    let gameIDs = users.getActiveGamesByPrivacy(ownerID, viewerID);
    let enemyIDs = [];
    
    for(let i = 0; i < gameIDs.length; i++){
        let currGame = games.getGameById(gameIDs[i]);
        let currGameIndex = [];
        
        if(currGame.user1 == ownerID){
            //odd number of moves made, means it's red's turn
            if(currGame.moves.length % 2 == 0){
                currGameIndex.push('Your Turn');
            }else{
                currGameIndex.push('Not Your Turn');
            }
            
            currGameIndex.push('R');
            currGameIndex.push(users.getUserById(currGame.user2).username);
            enemyIDs.push(currGame.user2);
        }else{
            //even number of moves made, means it's red's turn
            if(currGame.moves.length % 2 == 0){
                currGameIndex.push('Not Your Turn');
            }else{
                currGameIndex.push('Your Turn');
            }
            
            currGameIndex.push('B');
            currGameIndex.push(users.getUserById(currGame.user1).username);
            enemyIDs.push(currGame.user1);
        }
        currGameIndex.push(gameIDs[i]);
        activeGames.push(currGameIndex);
    }
    
    return activeGames;
}
function formatMatchHistory(ownerID, viewerID){
    let oldGames = users.getMatchHistoryByPrivacy(ownerID, viewerID);
    let matchHistory = [];
    
    for(let i = 0; i < oldGames.length; i++){
        let currGame = games.getGameById(oldGames[i]);
        let currGameIndex = [];
        
        if(currGame.user1 == ownerID){
            //odd number of moves made, means it's red's turn
            if(currGame.winner == 'B'){
                currGameIndex.push('Loss :(');
            }else{
                currGameIndex.push('Win!');
            }
            
            currGameIndex.push('R');
            currGameIndex.push(users.getUserById(currGame.user2).username);
        }else{
            //even number of moves made, means it's red's turn
            if(currGame.winner != 'B'){
                currGameIndex.push('Loss :(');
            }else{
                currGameIndex.push('Win!');
            }
            
            currGameIndex.push('B');
            currGameIndex.push(users.getUserById(currGame.user1).username);
        }
        currGameIndex.push(oldGames[i]);
        matchHistory.push(currGameIndex);
    }
    
    return matchHistory;
}
function formatFriendsList(ownerData){
    let friendIDs = ownerData.friendsList;
    let friendsList = [];
    
    for(let i = 0; i < friendIDs.length; i++){
        let currFriend = users.getUserById(friendIDs[i]);
        let currFriendIndex = [];
        
        currFriendIndex.push(friendIDs[i]);
        currFriendIndex.push(currFriend.username);
        currFriendIndex.push(currFriend.online);
        friendsList.push(currFriendIndex);
    }
    
    return friendsList;
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
router.post("*", (req, res, next) => {next("Profile Router received a POST request that it cannot handle!");});
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
router.put("*", (req, res, next) => {next("Profile Router received a PUT request that it cannot handle!");});
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
router.delete("*", (req, res, next) => {next("Profile Router received a DELETE request that it cannot handle!");});
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------
//----------------------END OF DELETE REQUESTS --------------------------------
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------


module.exports = router;