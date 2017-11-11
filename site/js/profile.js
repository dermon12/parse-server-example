var xmlHttp = new XMLHttpRequest();
xmlHttp.open( "GET", "https://back-seat.herokuapp.com/token", false ); // false for synchronous request
xmlHttp.send( null );
var r = xmlHttp.responseText;
alert(r)
var user = JSON.parse(r);
alert(user);
window.onload = function() {
  var url = "https://back-seat.herokuapp.com/parse/files/BSId/" + user.profileImage.toString();
  document.body.style.backgroundImage = "url('" + url + "')";
}
