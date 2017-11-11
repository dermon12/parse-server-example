var xmlHttp = new XMLHttpRequest();
xmlHttp.open( "GET", "https://back-seat.herokuapp.com/token", false ); // false for synchronous request
xmlHttp.send( null );
var r = xmlHttp.responseText;
var user = JSON.parse(r);
window.onload = function() {
  alert(user.profileImage.url);
  var url = user.profileImage.url;
  document.style.backgroundImage = "url('" + url + "')";
}
