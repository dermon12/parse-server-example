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

  

app.get('/login', function (req, res) {
   // Prepare output in JSON format
  var user = req.query.username;
  var pass = req.query.password;
  Parse.User.logIn(user, pass, {
        success: function(user) {
          res.status(200).send(user);
        },
        error: function(user, error) {
          res.status(200).send("wrong username or password");
        }
      });
})




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
