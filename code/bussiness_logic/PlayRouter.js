//This handler is responsible for all requests relating to game data
//for example: creating games, joining ongoing games, viewing old games
let games = require("./Games.js");
let users = require("./Users.js");
const express = require('express');

let router = express.Router();




//------------------------------------------------------------------------
//------------------------------------------------------------------------
//----------------------GET REQUESTS -------------------------------------
//------------------------------------------------------------------------
//------------------------------------------------------------------------
router.get("/join/:gameID*", getJoinPage);
router.get("*", (req, res, next) => {next("Play Router received a GET request that it cannot handle!");});

function getJoinPage(req, res, next){    
    let gameToJoin = games.getGameById(req.params.gameID);
    let playerID = req.session.playerID;

    if(gameToJoin == null){
        console.log("INVALID GET /play REQUEST");
        next("cannot find game!");
        return;
    }

    if(playerID == null){
        console.log("NOT YET IMPLEMENTED guests!");
        next("NOT YET IMPLEMENTED guests!");
//            res.render("pages/play.ejs", 
//                    {playerID:null, gameIDs:[], enemyIDs:[] ,blueData, redData, gameToJoin});
        return;
    }

    let redData = users.getUserById(gameToJoin.user1);
    let gameIDs = users.getUserById(playerID).activeGames;
    let enemyIDs = users.getIDsOfAllOpponents(req.session.playerID);

    if(gameToJoin.user2 === "none"){
        res.render("pages/waiting.ejs", 
                {playerID, gameIDs, enemyIDs, redData, gameToJoin, friendsList:req.session.friendsList});
        return;
    }

    let blueData = users.getUserById(gameToJoin.user2);

    let viewerColour = ""; 
    if(gameToJoin.user1 === req.session.playerID){
        viewerColour = "R";
    }
    else if(gameToJoin.user2 === req.session.playerID){
        viewerColour = "B";
    }

    res.render("pages/play.ejs", 
            {playerID, gameIDs, enemyIDs, blueData, redData, gameToJoin, viewerColour, friendsList:req.session.friendsList});
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
router.post("*", (req, res, next) => {next("Play Router received a POST request that it cannot handle!");});
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
router.put("*", (req, res, next) => {next("Play Router received a PUT request that it cannot handle!");});
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
router.delete("*", (req, res, next) => {next("Play Router received a DELETE request that it cannot handle!");});
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------
//----------------------END OF DELETE REQUESTS --------------------------------
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------

module.exports = router;