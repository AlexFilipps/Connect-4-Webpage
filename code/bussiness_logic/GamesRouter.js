let games = require("./Games.js");
let users = require("./Users.js");
const express = require('express');

let router = express.Router();

//------------------------------------------------------------------------
//------------------------------------------------------------------------
//----------------------GET REQUESTS -------------------------------------
//------------------------------------------------------------------------
//------------------------------------------------------------------------
router.get("/getGameStatus/:gameID*", getGameStatus);
router.get("/moves/:gameID*", getMoves);
router.get("/chat/:gameID*", getChat);
router.get("/getForfeit/:gameID*", getForfeit);
router.get("", getGames);
router.get("*", (req, res, next) => {next("Games Router received a GET request that it cannot handle!");});

function getGameStatus(req, res, next){
    let gameData = games.getGameById(req.params.gameID);
    
    if(gameData == null){
        res.status(404).send("-1"); //game not found
        return;
    }
    
    //see if user is authorized to see this game status
    if(gameData.privacy === "friends-only"){
        if(req.session.playerID == null){
            res.status(403).send("-2"); //not authorized to view game status
            return;
        }
        
        if(req.session.playerID != gameData.user1 && 
          req.session.playerID != gameData.user2){
            let isFriend = false;
            let friends = users.getUserById(gameData.user1).friendsList;
            
            for(let i = 0; i < friends.length; i++){
                if(friends[i] === req.session.playerID){
                    isFriend = true;
                }
            }
            
            
            let friends2 = users.getUserById(gameData.user2).friendsList;
            
            if(friends2 != null){
                for(let i = 0; i < friends2.length; i++){
                    if(friends2[i] === req.session.playerID){
                        isFriend = true;
                    }
                }
            }
            
            if(!isFriend){
                console.log("...was true");
                res.status(403).send("-2"); //not a friend? not authorized
                return;
            }
        }
    }
    
    if(gameData.privacy === "private"){
        if(req.session.playerID == null){
            res.status(403).send("-2"); //not authorized to view game status
            return;
        }
        
        if(req.session.playerID != gameData.user1 && 
          req.session.playerID != gameData.user2){
            //its possible in this case that the game is a gameChallenge that user2 has
            //not accepted. Here they should still be authorized, but user2 wont have
            //them as their ID just yet.
            
            if(gameData.user2 != "none"){
                res.status(403).send('-2'); //not authorized to view game status
                return;
            }
            
            let user1 = users.getUserById(gameData.user1);
            let isAuthorized = false;
            //loop all user1 friends, for each friend check their gameRequests, if any game
            //request matches this gameID, compare that friend's ID to the person who is making
            //this request's ID, if they match then they are authorized to view game status.
            
            for(let i = 0; i < user1.friendsList.length; i++){
                let currFriend = users.getUserById(user1.friendList[i]);
                for(let j = 0; j <  currFriend.gameRequests.length; j++){
                    if(currFriend.gameRequests[i] === req.params.gameID){
                        if(user1.friendList[i] === req.session.playerID){
                            isAuthorized = true;
                        }else{
                            res.status(403).send('-2'); //not authorized
                            return;
                        }
                    }
                }
            }
            
            if(!isAuthorized){
                res.status(403).send("-2");
                return;
            }
        }
    }
    
    if(gameData.winner === "cancelled"){
        res.status(200).send("4"); //game request was denied, game was cancelled.
        return;
    }
    
    if(gameData.moves != ""){
        if(gameData.winner === ""){
            res.status(200).send("1"); //game is being played, no winner/tie announced
            return;
        }else{
            res.status(200).send("0"); //game is finished, winner/tie has been announced
            return;
        }
    }
    
    if(gameData.user2 === "none"){
        res.status(200).send("2"); //waiting for second player to join
        return;
    }
    
    res.status(200).send("3"); //game has started, but players have not made a move yet.
}

function getGames(req, res, next){
    res.status(200).send(games.getGamesForDavid(req.query.player, req.query.active, req.query.detail));
}

function getMoves(req, res, next){
    let selectedGame = games.getGameById(req.params.gameID);
    if(selectedGame == null){
        next("game was not found!");
        return;
    }
    
    let data = selectedGame.moves;
    res.status(200).send(data);
}

function getChat(req, res, next){
    let selectedGame = games.getGameById(req.params.gameID);
    if(selectedGame == null){
        next("game was not found!");
        return;
    }
    
    let data = selectedGame.chat;
    res.status(200).send(data);
}

function getForfeit(req, res, next){
    let loser = games.getForfeit(req.params.gameID);
    res.status(200).send(loser);
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
router.post("/createGame*", createGame);
router.post("/challengeFriend", challengeFriend);
router.post("*", (req, res, next) => {next("Games Router received a POST request that it cannot handle!");});

function createGame(req, res, next){
    if(!req.session.loggedin){
        res.status(403).send("User not logged in");
        return;
    }
    
    let data = games.findOpenGame(req.reqData.privacy, req.session.playerID);
    
    if(data === "-1"){
        data = games.createGame(req.reqData.privacy, req.session.playerID);
    }
    else{
        if(req.session.playerID != games.getGameById(data).user1){
            games.addUserToGame(data, req.session.playerID);
            users.addToActive(req.session.playerID, data);
            users.addToActive(games.getGameById(data).user1, data);
        }else{
            res.status(503).send(data);
            return;
        }
    }
    
    res.status(201).send(data);
}

function challengeFriend(req, res, next){
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
    
    let result = users.sendGameChallengeRequest(playerID, friendID, req.reqData.privacy);
    
    if(result != -1){
        res.status(201).send(result);
    }else{
        res.status(400).send("game request already sent!");
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
router.put("/acceptChallenge", acceptChallenge);
router.put("/makeMove", makeMove);
router.put("/sendMessage/:gameID*", sendMessage);
router.put("/resign", resignGame);
router.put("*", (req, res, next) => {next("Games Router received a PUT request that it cannot handle!");});

function acceptChallenge(req, res, next){
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
    
    let result = users.acceptGameChallengeRequest(friendID, playerID);
    
    if(result != -1){
        res.status(201).send(result);
    }else{
        res.status(400).send("game request was never sent!");
    }
}

function makeMove(req, res, next){
    let gameID = req.reqData.gameID;
	let move = req.reqData.move;
    let game = games.getGameById(gameID);
    
    if(game == null){
        res.status(404).send("game not found!");
        return;
    }
    
    if(move == null){
        res.status(403).send("move received was null!");
        return;
    }
    
    if(req.session.playerID == null){
        res.status(404).send("not logged in!");
        return;
    }
    
    if(game.user1 === req.session.playerID){
        if(game.moves.length % 2 != 0){
            res.status(403).send("not your turn!");
            return;
        }
    }else if(game.user2 === req.session.playerID){
        if(game.moves.length % 2 == 0){
            res.status(403).send("not your turn!");
            return;
        }
    }else{
        res.status(403).send("You are not a player");
        return;
    }
    
    let result = games.makeNewMove(gameID, req.session.playerID, Number(move));
    
    if(result){
        res.status(200).send(); 
        return;
    }else{
        res.status(403).send();
        return;
    }
}

function sendMessage(req, res, next){
    let gameID = req.params.gameID;
	let message = req.reqData.message;
    let game = games.getGameById(gameID);
    
    if(game === null){
        res.status(404).send("game not found!");
        return;
    }
    
    if(message === null){
        res.status(403).send("message received was null!");
        return;
    }
    
    if(req.session.playerID === null){
        res.status(404).send("not logged in!");
        return;
    }
    
    let result = games.addMessage(gameID, message, req.session.playerID);
    
    if(result){
        res.status(200).send(); 
        return;
    }else{
        res.status(403).send();
        return;
    }
}

function resignGame(req, res, next){
    games.resignGame(req.reqData.gameID, req.session.playerID);
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
router.delete("/denyChallenge/:friendID*", denyChallenge);
router.delete("*", (req, res, next) => {next("Games Router received a DELETE request that it cannot handle!");});

function denyChallenge(req, res, next){
    let playerID = req.session.playerID;
    
    if(playerID == null) { 
        res.status(401).send("not logged in!");       
        return;
    }
    
    if(users.getUserById(req.params.friendID) == null){
        res.status(400).send("bad friend ID!");
        return;
    }
    
    let result = users.denyGameChallengeRequest(req.params.friendID, playerID);
    
    if(result != -1){
        res.status(201).send(result);
    }else{
        res.status(400).send("game request was never sent!");
    }
}

//--------------------------------------------------------------------------
//--------------------------------------------------------------------------
//----------------------END OF DELETE REQUESTS --------------------------------
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------

module.exports = router;