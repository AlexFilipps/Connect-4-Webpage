var menuDisplaying = false;

function toggleDisplayMenu(id){
    if(menuDisplaying){
        document.getElementById(id).style.visibility = "hidden";
        
        if((window.location.href).indexOf("/profile") != -1){
                document.getElementById("pictureRadioButtons").style.visibility = "visible";
        }
    }else{
        document.getElementById(id).style.visibility = "visible";
        
        if((window.location.href).indexOf("/profile") != -1){
                document.getElementById("pictureRadioButtons").style.visibility = "hidden";
        }
    }

    menuDisplaying = !menuDisplaying;
}