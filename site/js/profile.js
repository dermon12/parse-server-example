Parse.initialize("BSId");
Parse.serverURL = 'http://back-seat.herokuapp.com/parse'
//alert("ASDADA" + Parse.User.current());
var xmlHttp = new XMLHttpRequest();
xmlHttp.open( "GET", "https://back-seat.herokuapp.com/token", false ); // false for synchronous request
xmlHttp.send( null );
alert(xmlHttp.responseText);
