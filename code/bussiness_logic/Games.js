//This file will contain all comunication between the server and 
//the database regarding games(not yet implemented)



function getGameById(id){
    return gamesData[id];
}

function getGames(){
    return gamesData;
}

function addUserToGame(id, playerID){
    if(gamesData[id].user1 == "none"){
        gamesData[id].user1 = playerID;
    }else if(gamesData[id].user2 == "none"){
        gamesData[id].user2 = playerID;
    }
}

function findOpenGame(privacy, playerID){
    for(id in gamesData){
        if((gamesData[id].user2 === "none") && (gamesData[id].privacy === privacy)){
            return id;
        }
    }
    return "-1";
}

function createGame(privacy, playerID){
    var lastId;
    for (id in gamesData){
        lastId = id;
    }
    
    var newId = (Number(lastId) + 1).toString();
    newId = newId.padStart(7, "0");
    
    gamesData[newId] = {
        "user1": playerID,
        "user2": "none",
        "moves": "",
        "winner": "",
        "privacy": privacy,
        "chat": ""
    };
    return newId;
}

function makeNewMove(gameID, playerID, col){ //returns the row chip lands in. -1 if invalid move
    let game = getGameById(gameID);
    if(game == null){
        return false;
    }
    
    if(game.winner != "") {return false;}
    if(col < 0 || col > 6) {return false;}
    
    let currPlayer = "";
    if(game.user1 == playerID){
        currPlayer = 'R';
    }else{
        currPlayer = 'B';
    }
    
    let board = reconstructGame(game);
    
    if(board[col][5] != ' ') {return false;}
    
    let row = playMoveToBoard(board, currPlayer, col);
    game.moves += col;
    
    if(checkVictoryCondition(board, col, row)){
        //handle winning
        game.winner = currPlayer;
        users.removeActive(game.user1, gameID);
        users.removeActive(game.user2, gameID);
        users.addToPrevious(game.user1, gameID);
        users.addToPrevious(game.user2, gameID);
    }else if(checkTie(board)){ 
        //handle ties
        game.winner = "TIE";
        users.removeActive(game.user1, gameID);
        users.removeActive(game.user2, gameID);
        users.addToPrevious(game.user1, gameID);
        users.addToPrevious(game.user2, gameID);
    }
    
    return true;
}

function addMessage(gameID, message, playerID){
    let game = getGameById(gameID);
    if(game == null){
        return false;
    }
    
    let userName = users.getUserById(playerID);
    if(userName == null){
        return false;
    }
    
    userName = userName.username;
    
    game.chat += userName + ": " + message + "<br>";
    
    return true;
}

function cancelGame(gameID){
    //you can only cancel games that have not started!
    let game = getGameById(gameID);
    
    if(game == null){
        return false;
    }
    
    if(game.moves != ""){
        return false;
    }
    
    game.winner = "cancelled";
    return true;
}

function playMoveToBoard(board, currPlayer, col){ //keep this private
    let row = 0;
    for(let i = 5; i >= 0; i--){
        if(board[col][i] != ' '){
            board[col][i+1] = currPlayer;
            row = i+1;
            break;
        }

        if(i == 0){
            board[col][i] = currPlayer;
            row = i;
        }
    }

    return row;
}

function checkVictoryCondition(board, col, row){
    let currPlayer = board[col][row];
    let winConditions = [0,0,0,0];
    let xDeltas = [1, 1, 0, 1]
    let yDeltas = [-1, 1, -1, 0];
    let currDelta = -1;
    let currX = col;
    let currY = row;

    for(let i = 0; i < 4; i++){    
        for(let j = 0; j < 2; j++){
            currDelta *= -1;
            currX = col;
            currY = row;

            while(true){
                currX += xDeltas[i]*currDelta;
                currY += yDeltas[i]*currDelta;

                if(currX < 0 || currX > 6)
                    break;
                if(currY < 0 || currY > 5)
                    break;

                if(board[currX][currY] == currPlayer){
                    winConditions[i]++;
                }else{
                    break;
                }
            }
        }
    }


    for(let i = 0; i < 4; i++){
        if(winConditions[i] >= 3)
            return true;
    }

    return false;
}

function checkTie(board){
    for(let i = 0; i < 7; i++){
        if(board[i][5] == ' ')
            return false;
    }
    return true;
}

function reconstructGame(game){
    let board = [];
    let currPlayer = '';
    
    for(let i = 0; i < 7; i++){
        board.push(new Array(6).fill(' '));
    }
    
    for (let i = 0; i < game.moves.length; i++) {
        if(i % 2 == 0) {currPlayer = 'R';}
        else {currPlayer = 'B';}
        playMoveToBoard(board, currPlayer, game.moves.charAt(i));
    }
    
    return board;
}

function getGamesForDavid(player, active, detail){
    let g = [];
    for(id in gamesData){
        let game = {}
        
        game["player1"] = users.getUserById(gamesData[id].user1).username;
        game["player2"] = users.getUserById(gamesData[id].user2).username;
        
        if(gamesData[id].winner === ""){
            game["status"] = "in progress";
        }
        else{
            game["status"] = "completed";

            if(gamesData[id].winner === "R"){game["winner"] = game.player1;}
            else if(gamesData[id].winner === "B"){game["winner"] = game.player2;}

            game["turnsToComplete"] = gamesData[id].moves.length;

            if(gamesData[id].forfeited){game["forfeited"] = true;}
            else{game["forfeited"] = false;}
        }
        
        if(detail === "full"){
            game["moves"] = gamesData[id].moves;
        }
        
        
        let flag = true;
        if(active){
            if((active === "true") && (game.status === "completed")){
                flag = false;
            }
            else if((active === "false") && (game.status === "in progress")){
                flag = false;
            }
        }
        
        if(player){
            if((!(game.player1 === player)) && (!(game.player2 === player))){
                flag = false;
            }
        }
        
        if(flag){
            g.push(game);
        }
    }
    
    if(active){
        if(active === "true"){
            
        }
        else if(active === "false"){
            
        }
    }
    
    return g;
}

function resignGame(gameID, playerID){
    if(gamesData[gameID].winner === ""){
        if(playerID === gamesData[gameID].user1){
            gamesData[gameID].winner = "B";
            gamesData[gameID].forfeited = true;
            users.removeActive(gamesData[gameID].user1, gameID);
            users.removeActive(gamesData[gameID].user2, gameID);
            users.addToPrevious(gamesData[gameID].user1, gameID);
            users.addToPrevious(gamesData[gameID].user2, gameID);
        }
        else if (playerID === gamesData[gameID].user2){
            gamesData[gameID].winner = "R";
            gamesData[gameID].forfeited = true;
            users.removeActive(gamesData[gameID].user1, gameID);
            users.removeActive(gamesData[gameID].user2, gameID);
            users.addToPrevious(gamesData[gameID].user1, gameID);
            users.addToPrevious(gamesData[gameID].user2, gameID);
        }
    }
}

function getForfeit(gameID){
    
    if(gamesData[gameID].forfeited){
        if(gamesData[gameID].winner === "R"){
            return "B";
        }
        else if(gamesData[gameID].winner === "B"){
            return "R";
        }
    }
    return "-1";
}

module.exports = {
    getGameById,
    getGames,
    addUserToGame,
    findOpenGame,
    createGame,
    makeNewMove,
    addMessage,
    cancelGame,
    getGamesForDavid,
    resignGame,
    getForfeit
}

let users = require("./Users.js");
let gamesData = require("./GamesData.json");