function login() {
    var username = (document.getElementById("username").value);
    var password = (document.getElementById("password").value);
    
    var Parse = require('parse/node');
    alert(Parse);
    Parse.initialize("BSId");
    Parse.serverURL = 'http://back-seat.herokuapp.com/'

    Parse.User.logIn(username, password, {
      success: function(user) {
        alert(user);
      },
      error: function(user, error) {
        alert(error);
      }
    });

    
}
