var game;

class ClassicConnect4Game{
    constructor(){
        this.initNewGame();
//        console.log("New Connect 4 Game Object Created!");
    }
    
    initNewGame(){
        this.winner = null;
        this.gameIsResigned = false;
        this.gameBoard = [];
        this.turnHistory = [];
        this.currPlayer = 'R';
        this.gameOver = false;
        this.rWantsToDraw = false;
        this.bWantsToDraw = false;
        
        for(let i = 0; i < 7; i++){
            this.gameBoard.push(new Array(6).fill(' '));
        }
    }
    
    makeMove(col){ //returns the row chip lands in. -1 if invalid move
//        console.log("Making a new move!");
        
        if(col < 0 || col > 6 || this.gameOver)
            return -1;
        
        if(this.gameBoard[col][5] != ' ')
            return -1;
        
        //draw offers only last 1 turn.
        if(this.rWantsToDraw && this.currPlayer != 'R')
            this.rWantsToDraw = false;
        
        if(this.bWantsToDraw && this.currPlayer != 'B')
            this.bWantsToDraw = false;
        
        
        if(this.currPlayer == 'R'){
            this.turnHistory.push([col])
        }else{
            this.turnHistory[this.turnHistory.length-1].push(col);
        }
        
        let row = 0;
        for(let i = 5; i >= 0; i--){
            if(this.gameBoard[col][i] != ' '){
                this.gameBoard[col][i+1] = this.currPlayer;
                row = i+1;
                break;
            }
            
            if(i == 0){
                this.gameBoard[col][i] = this.currPlayer;
                row = i;
            }
        }
        
        if(this.checkVictoryCondition(col, row)){
//            console.log(this.currPlayer + " WINS!");
            this.gameOver = true;
            this.winner = this.currPlayer;
            return row;
        }else if(this.checkTie()){
//            console.log("TIE REACHED!");
            this.gameOver = true;
            this.winner = 'T'; //T for tie
            return row;
        }
        
        if(this.currPlayer == 'R'){
            this.currPlayer = 'B';
        }else{
            this.currPlayer = 'R';
        }
        
//        console.log("Finished making a move!");
//        
//        console.log("here is board...");
//        let myStr = '';
//        for(let i = 5; i >= 0; i--){
//            for(let j = 0; j < 7; j++){
//                if(game.gameBoard[j][i] == ' '){
//                    myStr += '_';
//                }else{
//                    myStr += game.gameBoard[j][i];
//                }
//            }
//            myStr += '\n';
//        }
//        console.log(myStr);
        
        return row;
    }
    
    checkVictoryCondition(col, row){
//        console.log("Checking the victory condition...");
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

                    if(game.gameBoard[currX][currY] == this.currPlayer){
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
    
    checkTie(){
        for(let i = 0; i < 7; i++){
            if(this.gameBoard[i][5] == ' ')
                return false;
        }
        return true;
    }
    
    resign(player){
        if(this.gameOver)
            return false;
        
        this.gameOver = true;
        
        if(player == 'B'){
            this.winner = 'R';
        }else{
            this.winner = 'B';
        }
        
        this.gameIsResigned = true;
        
        return true;
    }
    
    offerDraw(player){
        if(this.gameOver)
            return -1;
        
        if(player == 'R')
            this.rWantsToDraw = true;
        else
            this.bWantsToDraw = true;
        
        if(this.rWantsToDraw && this.bWantsToDraw){
            this.gameOver = true;
            this.winner = 'D'; //D for draw
            return 1;
        }
        
        return 0;
    }
    
    static startNewGame(){
//        console.log("New game started!");
        game = new ClassicConnect4Game();
    }
}




