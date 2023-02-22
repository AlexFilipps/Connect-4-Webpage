function sendMessage(){
    if (document.getElementById("playerChat").value != ""){
        //var msg = new Message("Me", document.getElementById("playerChat").value);
        //document.getElementById("playerChat").value = "";
        //document.getElementsByClassName("chatMenu")[0].innerHTML += msg.buildMessage();
        
        let message = document.getElementById("playerChat").value;
        document.getElementById("playerChat").value = "";
    
        req = new XMLHttpRequest();
        
        req.open("PUT", "/games/sendMessage/" + gameID);
        req.send("message=" + message);
    }
}