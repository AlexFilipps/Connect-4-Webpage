var navBarDisplaying = false;
var activeGames = "";

function toggleNavBar(){
    let allNavButtons = document.getElementsByClassName("navBarItem");
    var visib = '';
    
    if(!navBarDisplaying){
        visib = "visible";
    }else{
        visib = "hidden";
    }
    
    for(let i = 0; i < allNavButtons.length; i++){
        allNavButtons[i].style.visibility = visib;
    }
    
    navBarDisplaying = !navBarDisplaying;
    document.getElementById("navToggleButton").style.visibility = "visible";
}


//stopped implementation when I ran into local client cookie problems, will review later
function addActiveGame(){
    console.log("addActiveGame called!");
    activeGames += "<img src='img/navBar/profile_chip.png' class='footerItems'>"
    document.getElementById("activeGames").innerHTML = activeGames;
}

//this is cookie code that I know should work, but for some reason I am
//having trouble getting cookies to work from a local client
//function getCookieValue(cookieName){
//    let cookieObject = decodeURIComponent(document.cookie);
//    let cookies = cookieObject.split(';');
//    let currIndex = -1;
//    
//    //loop over the cookies and find our cookie!
//    for(let i = 0; i < cookies.length; i++){
//        currIndex = cookies[i].indexOf(cookieName);
//        
//        if(currIndex != -1){
//            return cookies[i].substr(currIndex + cookieName.length + 1);
//        }
//    }
//}