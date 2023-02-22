//This file will contain all comunication between the server and 
//the database regarding users of the site(not yet implemented)



function getUserById(id){
    //returns the user object of the user with the given id
    return usersData[id];
}



function getIDsOfAllOpponents(playerID){
    let gameIDs = getUserActiveGames(playerID);
    let enemyIDs = [];

    for(let i =0; i < gameIDs.length; i++){
        let currGame = games.getGameById(gameIDs[i]);

        if(currGame.user1 == playerID){
            enemyIDs.push(currGame.user2);
        }else{
            enemyIDs.push(currGame.user1);
        }   
    }
    
    return enemyIDs;
}



function getUserByUsername(username){
    for (id in usersData){
        if(usersData[id].username === username){
            return usersData[id];
        }
    }
}



function getUserIDByUsername(username){
    for (id in usersData){
        if(usersData[id].username === username){
            return id;
        }
    }
}



function getUsers(){
    return usersData;
}



function getUserActiveGames(id){
    //return the list of active game ids for the specified user
    return getUserById(id)["activeGames"];
}



function getUserMatchHistory(id){
    //return the list of active game ids for the specified user
    return getUserById(id)["prevGames"];
}



function createUser(username, password){
    var lastId;
    for (id in usersData){
        lastId = id;
    }
    
    var newId = (Number(lastId) + 1).toString();
    var paddingSize = 8 - newId.length;
    newId = newId.padStart(paddingSize, "0");
    
    usersData[newId] = {
        "fName": "null",
        "lName": "null",
        "email": "null",
        "username": username,
        "password": password,
        "online": "True",
        "privacy": "public",
        "profilePic" : 1,
        "activeGames":  [],
        "prevGames": [],
        "friendsList": [],
        "friendRequests": [],
        "gameRequests": []
    };
    return newId;
}



function deleteUser(id){
    delete usersData[id];
}



function getActiveGamesByPrivacy(ownerID, viewerID){
    if(viewerID === ownerID){
        return getUserActiveGames(ownerID);
    }
    
    let friends = getUserById(ownerID).friendsList;
    let isFriend = false;
    for(var i = 0; i < friends.length; i++){
        if(friends[i] === viewerID){
            isFriend = true;
        }
    }
    
    let activeGames = getUserActiveGames(ownerID);
    let visibleGames = [];
    for(var i = 0; i < activeGames.length; i++){
        if((games.getGameById(activeGames[i]).privacy === "public") || 
        ((games.getGameById(activeGames[i]).privacy === "friends-only") && (isFriend))){
            visibleGames.push(activeGames[i]);
        }
    }
    return visibleGames;
}



function getMatchHistoryByPrivacy(ownerID, viewerID){
    if(viewerID === ownerID){
        return getUserMatchHistory(ownerID);
    }
    
    let friends = getUserById(ownerID).friendsList;
    let isFriend = false;
    for(var i = 0; i < friends.length; i++){
        if(friends[i] === viewerID){
            isFriend = true;
        }
    }
    
    let matchHistory = getUserMatchHistory(ownerID);
    let visibleGames = [];
    for(var i = 0; i < matchHistory.length; i++){
        if((games.getGameById(matchHistory[i]).privacy === "public") || 
        ((games.getGameById(matchHistory[i]).privacy === "friends-only") && (isFriend))){
            visibleGames.push(matchHistory[i]);
        }
    }
    return visibleGames;
}



function addToActive(playerID, gameID){
    usersData[playerID].activeGames.push(gameID);
}



function addToPrevious(playerID, gameID){
    usersData[playerID].prevGames.push(gameID);
}



function removeActive(playerID, gameID){
    if(usersData[playerID].activeGames.indexOf(gameID) == -1){
        console.log("attempting to remove a bad active gameID!");
        return;
    }
    usersData[playerID].activeGames.splice(
        usersData[playerID].activeGames.indexOf(gameID) ,1);
}



function removePrevious(playerID, gameID){
    if(usersData[playerID].activeGames.indexOf(gameID) == -1){
        console.log("attempting to remove a bad remove gameID!");
        return;
    }
    usersData[playerID].prevGames.splice(
        usersData[playerID].prevGames.indexOf(gameID) ,1);
}



function getUserStatistics(playerID){
    let stats = {totalGames:0, gamesWon:0, gamesLost:0, winRate:0};
    let gamesPlayed = getUserMatchHistory(playerID);
    
    
    
    stats.totalGames = gamesPlayed.length;
    
    for (let i = 0; i < gamesPlayed.length; i++){
        let curGame = games.getGameById(gamesPlayed[i]);
        if(curGame.winner === "R"){
            if(curGame.user1 === playerID){
                stats.gamesWon++;
            }
            else{
                stats.gamesLost++;
            }
        }
        else{
            if(curGame.user2 === playerID){
                stats.gamesWon++;
            }
            else{
                stats.gamesLost++;
            }
        }
    }
    
    stats.winRate = ((stats.gamesWon / stats.totalGames) * 100);
    
    
    
    return stats;
}



function updateProfileSettings(newSettings, playerID){
    usersData[playerID].fName = newSettings.fName;
    usersData[playerID].lName = newSettings.lName;
    usersData[playerID].username = newSettings.username;
    usersData[playerID].email = newSettings.email;
    usersData[playerID].privacy = newSettings.privacy;
    usersData[playerID].profilePic = newSettings.profilePic;
}



function sendFriendRequest(senderID, recipientID){
    if(usersData[recipientID].friendRequests.includes(senderID)){
        return false;
    }
    
    usersData[recipientID].friendRequests.push(senderID);
    return true;
}



function sendGameChallengeRequest(senderID, recipientID, privacyMode){
    /*
    loop over every game request that the recipient has and check all of them to see
    if any of those game requests came from the sender, if so do not allow the sender
    to create another game request.
    */
    if(usersData[recipientID] == null){
        return -1; //recipientID was bad
    }
    
    for(let i = 0; i < usersData[recipientID].gameRequests.length; i++){
        if(games.getGameById(usersData[recipientID].gameRequests[i]).user1 == senderID){
            return usersData[recipientID].gameRequests[i];
        }
    }
    
    let gameID = games.createGame(privacyMode, senderID); 
    
    usersData[recipientID].gameRequests.push(gameID);
    return gameID;
}



function acceptFriendRequest(senderID, recipientID){
    if(!usersData[recipientID].friendRequests.includes(senderID)){
        return false;
    }
    
    usersData[recipientID].friendRequests.splice(
        usersData[recipientID].friendRequests.indexOf(senderID), 1);
    
    usersData[recipientID].friendsList.push(senderID);
    usersData[senderID].friendsList.push(recipientID);
    
    return true;
}



function acceptGameChallengeRequest(senderID, recipientID){   
    //find the game request, so we can accept it.
    let gameID = -1;
    for(let i = 0; i < usersData[recipientID].gameRequests.length; i++){
        if(games.getGameById(usersData[recipientID].gameRequests[i]).user1 == senderID){
            gameID = usersData[recipientID].gameRequests[i];
        }
    }
    
    if(gameID == -1){
        return -1; //game request not found
    }
    
    usersData[recipientID].gameRequests.splice(
        usersData[recipientID].gameRequests.indexOf(gameID), 1);
    
    games.addUserToGame(gameID, recipientID);
    
    addToActive(senderID, gameID);
    addToActive(recipientID, gameID);
    
    return gameID;
}



function denyGameChallengeRequest(senderID, recipientID){   
    //find the game request, so we can deny it.
    let gameID = -1;
    for(let i = 0; i < usersData[recipientID].gameRequests.length; i++){
        if(games.getGameById(usersData[recipientID].gameRequests[i]).user1 == senderID){
            gameID = usersData[recipientID].gameRequests[i];
        }
    }
    
    if(gameID == -1){
        return false; //game request not found
    }
    
    usersData[recipientID].gameRequests.splice(
        usersData[recipientID].gameRequests.indexOf(gameID), 1);
    
    games.cancelGame(gameID);
    
    return true;
}



function denyFriendRequest(senderID, recipientID){   
    //find the game request, so we can deny it.
    let rejectedID = -1;
    for(let i = 0; i < usersData[recipientID].friendRequests.length; i++){
        if(usersData[recipientID].friendRequests[i] === senderID){
            rejectedID = usersData[recipientID].friendRequests[i];
        }
    }
    
    if(rejectedID == -1){
        return false; //friend request not found
    }
    
    usersData[recipientID].friendRequests.splice(
        usersData[recipientID].friendsList.indexOf(rejectedID), 1);
    
    return true;
}



function searchUsersByStr(searchQuery){
    let users = [];
    let u = [];
    for (id in usersData){
        if(usersData[id].username.toUpperCase().includes(searchQuery.toUpperCase())){
            if(usersData[id].privacy === "public"){
                if(usersData[id].online){
                    u = [id, usersData[id].username, "Online"];
                }
                else{
                    u = [id, usersData[id].username, "Offline"];
                }
                users.push(u);
            }
        }
    }
    return users;
}



function searchUsersByStrForDavid(searchQuery){
    let users = {};
    let count = 0;
    for (id in usersData){
        if(usersData[id].username.toUpperCase().includes(searchQuery.toUpperCase())){
            if(usersData[id].privacy === "public"){
                users[count] = usersData[id];
                count++;
            }
        }
    }
    return users;
}



function getUserRequests(playerID){
    let gamesData = games.getGames();
    
    let friendReqs = usersData[playerID].friendRequests;
    let gameReqs = usersData[playerID].gameRequests;
    let reqs = [];
    let r = [];
    
    for(var i = 0; i < friendReqs.length; i++){
        r = [friendReqs[i], usersData[friendReqs[i]].username, 0];
        reqs.push(r);
    }

    for(var i = 0; i < gameReqs.length; i++){
        r = [gamesData[gameReqs[i]].user1, usersData[gamesData[gameReqs[i]].user1].username, 1, gameReqs[i]];
        reqs.push(r);
    }
    
    return reqs;
}



function removeFriend(friendID, userID){
    for(var i = 0; i < usersData[userID].friendsList.length; i++){
        if(usersData[userID].friendsList[i] === friendID){
            usersData[userID].friendsList.splice(i, 1);
        }
    }
    
    for(var i = 0; i < usersData[friendID].friendsList.length; i++){
        if(usersData[friendID].friendsList[i] === userID){
            usersData[friendID].friendsList.splice(i, 1);
        }
    }
}



function setOnline(playerID){
    usersData[playerID].online = "True";
}



function setOffline(playerID){
        usersData[playerID].online = "False";

}



function getUserByUsernameForDavid(username){
    let userID = "";
    for (id in usersData){
        if(usersData[id].username === username){
            userID = id;
        }
    }
    
    let userStats = getUserStatistics(userID);
    let u = {
        "username":username, 
        "gamesPlayed":userStats.totalGames, 
        "winRate":userStats.winRate,
        "currentGames":{}
    }
    
    let count = 0;
    for(var i = 0; i < usersData[userID].activeGames.length; i++){
        if(games.getGameById(usersData[userID].activeGames[i]).privacy === "public"){
            u.currentGames[count] = games.getGameById(usersData[userID].activeGames[i]);
            count++;
        }
    }
    
    return u;
}



module.exports = {
    getUserById,
    getIDsOfAllOpponents,
    getUserByUsername,
    getUserIDByUsername,
    getUserActiveGames,
    getUserMatchHistory,
    getUsers,
    createUser,
    deleteUser,
    getActiveGamesByPrivacy,
    getMatchHistoryByPrivacy,
    addToActive,
    addToPrevious,
    removeActive,
    removePrevious,
    getUserStatistics,
    updateProfileSettings,
    sendFriendRequest,
    sendGameChallengeRequest,
    acceptFriendRequest,
    acceptGameChallengeRequest,
    denyGameChallengeRequest,
    denyFriendRequest,
    searchUsersByStr,
    searchUsersByStrForDavid,
    getUserRequests,
    removeFriend,
    setOnline,
    setOffline,
    getUserByUsernameForDavid
}

let games = require("./Games.js");
let usersData = require("./UsersData.json");