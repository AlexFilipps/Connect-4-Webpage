
function displayHistory(hist){
    var newTable = "";
//    console.log(newTable);
    for(var i = 0; i < hist.length; i++){
        //append a new row
        newTable += "<tr><th style=\"user-select: none;\">" + (i+1) + ".</th>";
        for(var j = 0; j < hist[i].length; j++){
            //append entry to list
            if (j == 0){
                newTable += "<th style=\"color: red; user-select: none;\">R" + (hist[i][j] + 1) + "</th>";
            }
            else{
                newTable += "<th style=\"color: blue; user-select: none;\">B" + (hist[i][j] + 1) + "</th>";
            }
        }
        newTable += "</tr>";
//        console.log(newTable);
    }
    document.getElementById("historyTable").innerHTML = newTable;
}