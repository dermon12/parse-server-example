var xmlHttp = new XMLHttpRequest();
xmlHttp.open( "GET", "https://back-seat.herokuapp.com/token", false ); // false for synchronous request
xmlHttp.send( null );
var r = xmlHttp.responseText;
var user = JSON.parse(r);
window.onload = function() {
  var url = user.profileImage.url;
  document.getElementsByClassName("w3-container w3-center")[0].style.backgroundImage = "url('" + url + "')";
}
