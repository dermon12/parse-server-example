var xmlHttp = new XMLHttpRequest();
xmlHttp.open( "GET", "https://back-seat.herokuapp.com/token", false ); // false for synchronous request
xmlHttp.send( null );
var r = xmlHttp.responseText;
var user = JSON.parse(r);
window.onload = function() {
  document.getElementsByClassName("w3-jumbo")[0].innerText  = "Welcome " + user.fullName;
  if(user.profileImage){
  var url = user.profileImage.url;
    document.getElementsByClassName("w3-container w3-center")[0].style.backgroundImage = "url('" + url + "')";
  }
  settable();
}

function settable(){
var table = document.getElementById("myTable");
  xmlHttp.open( "GET", "https://back-seat.herokuapp.com/table", false ); // false for synchronous request
  xmlHttp.send( null );
  var r = xmlHttp.responseText;
  var scores = JSON.parse(r);
  var items = Object.keys(scores).map(function(key) {
      return [key, scores[key]];
  });

  // Sort the array based on the second element
  items.sort(function(first, second) {
      return second[1] - first[1];
  });
  var calsses = ["ד","ה","ו","ז","ח"];
  for (var key in items) {
    var row = table.insertRow(-1);
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var splited = items[key][0].split(",");
    cell1.innerHTML = calsses[splited[0]-4] + splited[1];
    cell2.innerHTML = items[key][1]; 
  }
}
