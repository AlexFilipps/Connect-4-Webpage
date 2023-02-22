ClassicConnect4Game.startNewGame();
setMouseEvents(); 
//this is commented out, because we are no longer 
//loading game history using url parameters, we will use ajax 
//to request game history from the server.

var offersDraw = false;
var hasWon = false;

function loadGame(firstArg){
//    let parameters = location.search.substring(1).split("&");
//    let temp = parameters[0].split("=");
//    let firstArg = temp[1];
//    game.initNewGame();
//    
//    if(firstArg === "")
//        return;
//    
//    let history = [];
//    
//    for(let i = 0; i < firstArg.length; i += 2){
//        if(i+1 >= firstArg.length){
//            history.push([ Number(firstArg[i]) ])
//            break;
//        }
//        history.push([ Number(firstArg[i]), Number(firstArg[i+1]) ])
//    }
//    
//    console.log(firstArg);
//    console.log(history);
//    
//    displayHistory(history);
//    
//    for(let i = 0; i < history.length; i++){
//        for(let j = 0; j< history[i].length; j++){
//            makeMoveHTML(history[i][j]);
//        }
//    }
}

function setMouseEvents(){
    let currStr = "";
    for(let i = 0; i < 7; i++){
        for(let j = 0; j < 7; j++){
            currCell = "cell" + i + "" + j;
            document.getElementsByClassName(currCell)[0].onmouseover = 
                function(){mouseOver(this);};
            document.getElementsByClassName(currCell)[0].onmouseout = 
                function(){mouseOff(this);};
            document.getElementsByClassName(currCell)[0].onclick = 
                function(){cellClicked(this);};
        }
    }
}

function mouseOver(imageElement){
//    console.log('game.currPlayer');
//    console.log(game.currPlayer);
//    console.log('viewerColour');
//    console.log(viewerColour);
//    console.log(game);
    if(game.currPlayer != viewerColour){
        return;
    }
    
    let col = imageElement.className[4];
    
    if(game.currPlayer == 'R'){
        document.getElementsByClassName("cell" + col + "6")[0].src = "/img/red_chip.png";
    }else{
        document.getElementsByClassName("cell" + col + "6")[0].src = "/img/blue_chip.png";
    }
    
}

function mouseOff(imageElement){
    let col = imageElement.className[4];
    document.getElementsByClassName("cell" + col + "6")[0].src = "/img/boardArrow.png";
}

function cellClicked(imageElement){
//    console.log("clicked!");
//    console.log("this: " + cell.className);
    console.log("Playing col: " + imageElement.className[4]);
//    makeMoveHTML(Number(imageElement.className[4]));
    makeMoveXML(Number(imageElement.className[4]));
}

function resetAllBoardArrows(){
    for(let i = 0; i < 7; i++){
        document.getElementsByClassName("cell" + i + "6")[0].src = "/img/boardArrow.png";
    }
}



//---------------------------------------------------
//----------------------NEW--------------------------
//---------------------------------------------------


function makeMoveXML(col){
    req = new XMLHttpRequest();
    req.onreadystatechange = function() {
        if(this.readyState==4 && this.status==200){
//            var snd = new Audio("/sounds/chip_drop.wav"); // buffers automatically when created
//            snd.play();
//            resetAllBoardArrows();
        }
    }
    let gameID = location.pathname.split("/")[3].split("?")[0];
    req.open("PUT", "/games/makeMove");
    req.send("gameID=" + gameID + "&move=" + col);
}



function reconstructGame(firstArg){
    game.initNewGame();
    
    if(firstArg === "")
        return;
    
    currMoves = firstArg;
    let history = [];
    
    for(let i = 0; i < firstArg.length; i += 2){
        if(i+1 >= firstArg.length){
            history.push([ Number(firstArg[i]) ])
            break;
        }
        history.push([ Number(firstArg[i]), Number(firstArg[i+1]) ])
    }
    
    displayHistory(history);
    
    for(let i = 0; i < history.length; i++){
        for(let j = 0; j< history[i].length; j++){
            makeMoveHTML(history[i][j]);
        }
    }
}

//---------------------------------------------------
//----------------------NEW--------------------------
//---------------------------------------------------






function makeMoveHTML(col){
    let currPlayer = game.currPlayer;
    let rowLandedOn = game.makeMove(col);
    
    if(rowLandedOn == -1){
        console.log("INVALID MOVE!");
    }else{
//        console.log(currPlayer + " lands on " + rowLandedOn)
        replaceTile(currPlayer, col, rowLandedOn);
        resetAllBoardArrows();
        displayHistory(game.turnHistory);
        
//        console.log("currPlayer");
//        console.log("currPlayer");
//        console.log(currPlayer)
        if(currPlayer != 'R'){
            document.getElementById("blueStatus").innerHTML = "<p style='user-select: none;'>Waiting...</p>";
            document.getElementById("redStatus").innerHTML = "<p style='user-select: none;'>Making Move...</p>";
        }else{
            document.getElementById("blueStatus").innerHTML = "<p style='user-select: none;'>Making Move...</p>";
            document.getElementById("redStatus").innerHTML = "<p style='user-select: none;'>Waiting...</p>";
        }
        
        if(offersDraw && (game.rWantsToDraw || game.bWantsToDraw)){
            offersDraw = false;
            
            if(game.rWantsToDraw){
                document.getElementById("redStatus").innerHTML += "<p style='user-select: none;'>OFFERED DRAW</p>";
            }else{
                document.getElementById("blueStatus").innerHTML += "<p style='user-select: none;'>OFFERED DRAW</p>";
            }
        }
    }
    
    if(game.winner != null && !game.gameIsResigned){
        if(game.winner == 'R'){
            document.getElementById("redStatus").innerHTML = "<p style='user-select: none;'>WINS!!!</p>";
            document.getElementById("blueStatus").innerHTML = "<p style='user-select: none;'>LOST :(</p>";
        }else{
            document.getElementById("blueStatus").innerHTML = "<p style='user-select: none;'>WINS!!!</p>";
            document.getElementById("redStatus").innerHTML = "<p style='user-select: none;'>LOST :(</p>";
        }
        
        if(!hasWon){
            if(viewerColour === game.winner){
                var snd = new Audio("/sounds/win.mp3"); // buffers automatically when created
                snd.play();
            }
            else if((viewerColour === "R") || (viewerColour === "B")){
                var snd = new Audio("/sounds/lose.mp3"); // buffers automatically when created
                snd.play();
            }
            hasWon = true;
        }
        
    }
    
    try{
        var snd = new Audio("/sounds/chip_drop.wav");
        snd.play();
    }catch(error){
        console.log("cannot play sound");
    }
    
//    console.log("here is board...");
//    let myStr = '';
//    for(let i = 5; i >= 0; i--){
//        for(let j = 0; j < 7; j++){
//            if(game.gameBoard[j][i] == ' '){
//                myStr += '_';
//            }else{
//                myStr += game.gameBoard[j][i];
//            }
//        }
//        myStr += '\n';
//    }
//    
//    console.log(myStr);
//    
//    console.log("here is current game history:")
//    console.log(game.turnHistory);
}

function replaceTile(currPlayer, col, row){
//    console.log("col:" + col + " row:" + row);
    var imageElement = document.getElementsByClassName("cell"+col+""+row)[0];
    
    if(currPlayer == 'R'){
        imageElement.src = "/img/boardRed.png";
    }else{
        imageElement.src = "/img/boardBlue.png";
    }
    
}

function resignHTML(loser){
    if(game.resign(loser)){
        if(game.winner == 'R'){
            document.getElementById("redStatus").innerHTML = "<p style='user-select: none;'>WINS!!!</p>";
            document.getElementById("blueStatus").innerHTML = "<p style='user-select: none;'>RESIGNED</p>";
        }else{
            document.getElementById("blueStatus").innerHTML = "<p style='user-select: none;'>WINS!!!</p>";
            document.getElementById("redStatus").innerHTML = "<p style='user-select: none;'>RESIGNED</p>";
        }
    }else{
        console.log("CANNOT RESIGN!");
    }
}

function drawHTML(){
    offersDraw = true;
    let retVal = game.offerDraw(game.currPlayer);
    console.log("Here is the return val of offerDraw: " + retVal);
    
    if(retVal == -1)
        return;
    
    let playerName = '';
    if(game.currPlayer == 'R'){
        playerName = "red";
    }else{
        playerName = "blue";
    }
    
    document.getElementById(playerName+"Status").innerHTML += "<p style='user-select: none;'>OFFERS A DRAW</p>";
}