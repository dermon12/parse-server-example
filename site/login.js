function login() {
    var username = (document.getElementById("username").value);
    var password = (document.getElementById("password").value);
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "https://back-seat.herokuapp.com/parse/functions/SetFactors", true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
        user: username,
        pass:password
    }));
    
    }
