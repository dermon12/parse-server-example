var xmlHttp = new XMLHttpRequest();
xmlHttp.open( "GET", "https://back-seat.herokuapp.com/token", false ); // false for synchronous request
xmlHttp.send( null );
var r = xmlHttp.responseText;
var user = JSON.parse(r);
window.onload = function() {
  var url = user.profileImage.url;
  document.getElementsByClassName("w3-container w3-center")[0].style.backgroundImage = "url('" + url + "')";
  document.getElementsByClassName("w3-jumbo")[0].innerText  = "Welcome " + user.fullName;
  settable();
}

function settable(){
var table = document.getElementById("myTable");
  xmlHttp.open( "GET", "https://back-seat.herokuapp.com/table", false ); // false for synchronous request
  xmlHttp.send( null );
  var r = xmlHttp.responseText;
  var scores = JSON.parse(r);
  var sortable = [];
for (var clas in scores) {
    sortable.push([clas, scores[clas]]);
}

sortable.sort(function(a, b) {
    return a[1] - b[1];
});
  
  for (var key in sortable.reverse()) {
    var row = table.insertRow(-1);
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    cell1.innerHTML = key[0];
    cell2.innerHTML = key [1]; 
  }
}
