//Parse.initialize("BSId");
//Parse.serverURL = 'https://back-seat.herokuapp.com/parse'
//alert("ASDADA" + Parse.User.current());
var xmlHttp = new XMLHttpRequest();
xmlHttp.open( "GET", "https://back-seat.herokuapp.com/token", false ); // false for synchronous request
xmlHttp.send( null );
alert(xmlHttp.responseText);
/*Parse.User.become(xmlHttp.responseText).then(function (user) {
  alert(user.get("mobile"));
}, function (error) {
  // The token could not be validated.
});
*/
