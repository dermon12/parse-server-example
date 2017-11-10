// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var Parse = require('parse/node');
Parse.initialize("BSId");
Parse.serverURL = 'http://back-seat.herokuapp.com/parse'

var path = require('path');

var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

var api = new ParseServer({
  databaseURI: databaseUri || 'mongodb://dermon12:yxuwbr3p0k12@ds111124.mlab.com:11124/heroku_ssbqc52n',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || 'myAppId',
  masterKey: process.env.MASTER_KEY || '', //Add your master key here. Keep it secret!
  serverURL: process.env.SERVER_URL || 'https://back-seat.herokuapp.com/',  // Don't forget to change to https if needed
  verbose: true,
  liveQuery: {
    classNames: ["Posts", "Comments"] // List of classes to support for query subscriptions
  },
  push: {
    android: {
      senderId: '413497295606',
      apiKey: 'AIzaSyAKDwdIROZUChQBXESs4D_JxeW84FVCMdI' 
    }
  }
});
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

var app = express();

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));
app.use('/site', express.static(path.join(__dirname, '/site')));
// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);

// Parse Server plays nicely with the rest of your web routes
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/site/index.html'));
   

});

app.post('/', function (req, res, next) {
  // confirm that user typed same password twice
  if (req.password !== req.body.passwordConf) {
    var err = new Error('Passwords do not match.');
    err.status = 400;
    res.send("passwords dont match");
    return next(err);
  }

  if (req.body.email &&
    req.body.username &&
    req.body.password &&
    req.body.passwordConf) {

    var user = new Parse.User();
    user.set("username",  req.body.username);
    user.set("password",  req.body.password);
    user.set("email", req.body.email);

    // other fields can be set just like with Parse.Object
    user.set("phone", "415-392-0202");

    user.signUp(null, {
      success: function(user) {
        return res.redirect('/profile');
      },
      error: function(user, error) {
        return next(error);
      }
    });

  } else if (req.body.logemail && req.body.logpassword) {
    Parse.User.logIn("myname", "mypass", {
    success: function(user) {
      return res.redirect('/profile');
    },
    error: function(user, error) {
        var err = new Error('Wrong email or password.');
        err.status = 401;
        return next(err);
    }
  });
  } else {
    var err = new Error('All fields required.');
    err.status = 400;
    return next(err);
  }
}) 


// GET route after registering
app.get('/profile', function (req, res, next) {
  var currentUser = Parse.User.current();
  if (currentUser) {
      return res.send('<h1>Name: </h1>' + currentUser.get("username") + '<h2>Mail: </h2>' + currentUser.get("email") + '<br><a type="button" href="/logout">Logout</a>')
  } else {
          var err = new Error('Not authorized! Go back!');
          err.status = 400;
          return next(err);
  }
});


app.get('/logout', function (req, res, next) {
  Parse.User.logOut().then(() => {
    return res.redirect('/');
  });
});



// There will be a test page available on the /test path of your server url
// Remove this before launching your app
app.get('/test', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/test.html'));
});

var port = process.env.PORT || 1337;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
    console.log('parse-server-example running on port ' + port + '.');
});

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);
