class Message{
    constructor(user, content){
        this.user = user;
        this.content = content;
    }
    
    buildMessage(){
        return this.user + ": " + this.content + "<br>"
    }
}