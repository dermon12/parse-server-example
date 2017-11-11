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
  for (var key in p) {
    var row = table.insertRow(-1);
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    cell1.innerHTML = key;
    cell2.innerHTML = scores[key]; 
  }
}
