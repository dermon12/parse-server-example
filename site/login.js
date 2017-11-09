function login() {
    var username = (document.getElementById("username").value);
    var password = (document.getElementById("password").value);
    
    var Parse = require('parse');
    Parse.initialize("BSId");
    Parse.serverURL = 'http://back-seat.herokuapp.com/'
    alert(username);
    alert(Parse);
    Parse.User.logIn(username, password, {
      success: function(user) {
        alert(user);
      },
      error: function(user, error) {
        alert(error);
      }
    });

    
}
