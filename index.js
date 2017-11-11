// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require('express');
var session = require('express-session');
var Promise = require('promise');

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
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({secret: "Shh, its a secret!"}));
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
  if (req.body.spassword !== req.body.spasswordConf) {
    var err = new Error('Passwords do not match.');
    err.status = 400;
    res.send("passwords dont match");
    return next(err);
  }

  if (req.body.semail &&
    req.body.susername &&
    req.body.spassword &&
    req.body.spasswordConf) {

    var user = new Parse.User();
    user.set("username",  req.body.username);
    user.set("password",  req.body.password);
    user.set("email", req.body.email);

    // other fields can be set just like with Parse.Object
    user.set("phone", "415-392-0202");

    user.signUp(null, {
      success: function(user) {
        req.session.userId = user.getSessionToken();
        return res.redirect('/profile');
      },
      error: function(user, error) {
        return next(error);
      }
    });
  
  }
  else if (req.body.username && req.body.password) {
    Parse.User.logIn(req.body.username, req.body.password, {
    success: function(user) {
      //req.session.userId = user.getSessionToken();
      req.session.userId = user.getSessionToken();
      console.log("AAAAAAAAAAAAA" + req.session.userId);
      //return res.send('<h1>Name: </h1>' + user.get("username") + '<h2>Mail: </h2>' + user.get("email") + '<br><a type="button" href="/logout">Logout</a>')
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
    if (req.session.userId){
      res.sendFile(path.join(__dirname, '/site/profile.html'));
      //return res.send('<h1>Name: </h1>' + user.get("username") + '<h2>Mail: </h2>' + user.get("email") + '<br><a type="button" href="/logout">Logout</a>')
  } else {
            var err = new Error('Not authorized! Go back!');
            err.status = 400;
            return next(err);
  }
});


app.get('/logout', function (req, res, next) {
  if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});




// There will be a test page available on the /test path of your server url
// Remove this before launching your app
app.get('/test', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/test.html'));
});

app.get('/token', function(req, res) {
    Parse.User.enableUnsafeCurrentUser();
   Parse.User.become(req.session.userId).then(function (user) {
    return res.send(user);
}, function (error) {
    return res.redirect('/');
});
 });




app.get('/table', function(req, res) {
      function getSchool(req)
        {
          return new Promise(function(resolve,reject) {
              Parse.User.enableUnsafeCurrentUser();
               Parse.User.become(req.session.userId).then(function (user) {
                var userQuery = new Parse.Query("SchoolScores");
                userQuery.equalTo("SchoolID", user.get("SchoolID"));
                //Here you aren't directly returning a user, but you are returning a function that will sometime in the future return a user. This is considered a promise.
                return userQuery.first
                ({
                    success: function(userRetrieved)
                    {
                        //When the success method fires and you return userRetrieved you fulfill the above promise, and the userRetrieved continues up the chain.
                        resolve(userRetrieved);
                    },
                    error: function(error)
                    {
                        return reject(error);
                    }
                });
            }, function (error) {
                return reject(error);
            });
          });
        };
  
  
    getSchool(req).then
    (   
        //When the promise is fulfilled function(user) fires, and now we have our USER!
        function(school)
        {	
          res.send(school.get("SchoolScores"));
        }
        ,
        function(error)
        {
            res.send("");
        }
    );
  
 });


var port = process.env.PORT || 1337;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
    console.log('parse-server-example running on port ' + port + '.');
});

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);


