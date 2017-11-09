function login() {
    var username = (document.getElementById("username").value);
    var password = (document.getElementById("password").value);
    
    
    
    var url = "https://back-seat.herokuapp.com/parse/functions/SetFactors";
    var params = "user=" + username + "&pass=" + password;
    http.open("POST", url, true);

    //Send the proper header information along with the request
    http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    http.setRequestHeader("Content-length", params.length);
    http.setRequestHeader("Connection", "close");

    http.onreadystatechange = function() {//Call a function when the state changes.
        if(http.readyState == 4 && http.status == 200) {
            alert(http.responseText);
        }
    }
    http.send(params);
    }
