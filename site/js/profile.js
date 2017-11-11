//Parse.initialize("BSId");
//Parse.serverURL = 'https://back-seat.herokuapp.com/parse'
//alert("ASDADA" + Parse.User.current());
var xmlHttp = new XMLHttpRequest();
xmlHttp.open( "GET", "https://back-seat.herokuapp.com/token", false ); // false for synchronous request
xmlHttp.send( null );
var user = JSON.parse(xmlHttp.responseText);
window.onload = function() {
  alert(user.profileImage);
  var url = "https://back-seat.herokuapp.com/parse/files/BSId/" + user.profileImage;
  alert(String(url));
  document.body.style.backgroundImage = "url('" + url + "')";
}
/*Parse.User.become(xmlHttp.responseText).then(function (user) {
  alert(user.get("mobile"));
}, function (error) {
  // The token could not be validated.
});
*/
