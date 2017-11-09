function login() {
    var username = (document.getElementById("username").value);
    var password = (document.getElementById("password").value);
    Parse.Cloud.run('login', { name: username , pass: password});
			}
}
