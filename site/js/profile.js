//Parse.initialize("BSId");
//Parse.serverURL = 'https://back-seat.herokuapp.com/parse'
//alert("ASDADA" + Parse.User.current());
var xmlHttp = new XMLHttpRequest();
xmlHttp.open( "GET", "https://back-seat.herokuapp.com/token", false ); // false for synchronous request
xmlHttp.send( null );
var user = JSON.parse(xmlHttp.responseText);
window.onload = function() {
  document.getElementById("Name").innerHTML = user.fullName;
  document.getElementById("Mail").innerHTML = user.email;
}
/*Parse.User.become(xmlHttp.responseText).then(function (user) {
  alert(user.get("mobile"));
}, function (error) {
  // The token could not be validated.
});
*/
