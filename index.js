// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require('express');
var session = require('express-session');
var fileUpload = require('express-fileupload');

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
app.use(fileUpload());
// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);

// Parse Server plays nicely with the rest of your web routes
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/site/index.html'));
   

});

app.post('/updateimg', function (req, res, next) {
  Parse.User.enableUnsafeCurrentUser();
  Parse.User.become(req.session.userId).then(function (user) {
          let sampleFile = req.files.file;
          var str = JSON.stringify(sampleFile.data);
          console.log("STRRRRRR " + sampleFile.data);
          var file = new Parse.File("profileImage.png", sampleFile.data.data);
          console.log("STARTNUUUUUUUUUUUUUUUUUUUUU");
          file.save().then(function() {
            user.put("profileImage", file);
          user.save(null, {useMasterKey:true});
          return res.send("success");
          }, function(error) {
           return res.redirect('/');
          });
        });
    }, function (error) {
      return res.redirect('/');
    });



// GET route after registering
app.post('/updateclass', function (req, res, next) {
  Parse.User.enableUnsafeCurrentUser();
  Parse.User.become(req.session.userId).then(function (user) {
        var userschool = req.body.school;
        var userclas = req.body.class + "," + req.body.number;
        var userid = user.get("mobile");
    
        Parse.Cloud.run('UpdateClassFromSite', { id: userid, school : userschool, clas : userclas }).then(function(response) {
          console.log("RESPONSEEEEEEEEEEEEEEEEEEE " + response);
        if (response == "success")
        {
          return res.send("success");
        }
          else
          {
            return res.send("fail");
          }
        });
    }, function (error) {
      return res.redirect('/');
    });
  
  
  
});


app.post('/', function (req, res, next) {
  // confirm that user typed same password twice
  if (req.body.spassword !== req.body.spasswordConf) {
    return res.send("!הסיסמאות אינן תואמות");
    var err = new Error('Passwords do not match.');
    err.status = 400;
    return next(err);
  }

  if (req.body.semail &&
    req.body.susername &&
    req.body.spassword &&
    req.body.spasswordConf) {

    var user = new Parse.User();
    user.set("username",  req.body.susername);
    user.set("password",  req.body.spassword);
    user.set("email", req.body.semail);

    // other fields can be set just like with Parse.Object
    user.set("fullName", req.body.susername);
    user.set("mobile", req.body.smobile);
    user.set("userType", "Player");
    user.set("friendsList", new Array());
    
    user.set("driversPoints", new Array());
    user.set("token","");
    
    var userQuery = new Parse.Query(Parse.User);
    userQuery.equalTo("mobile", req.body.smobile);
    userQuery.first({
      success: function(object) {
        console.log("AAAAAAAAAAAAAAA" + object);
        if (typeof object === "undefined"){
         user.signUp(null, {
            success: function(user) {
                req.session.userId = user.getSessionToken();
                return res.redirect('/profile');
              },
              error: function(user, error) {
                return res.send(error.message);
                return next(error);
              }
            }); 

        }
       else{
        res.send("!משתמש תפוס.... בחר מספר אחר"); 
       }
       
      },
      error: function(error) {
             return next(error);
      }
    });
  
  }
  else if (req.body.username && req.body.password) {
    Parse.User.logIn(req.body.username, req.body.password, {
    success: function(user) {
      //req.session.userId = user.getSessionToken();
      req.session.userId = user.getSessionToken();
      //return res.send('<h1>Name: </h1>' + user.get("username") + '<h2>Mail: </h2>' + user.get("email") + '<br><a type="button" href="/logout">Logout</a>')
      return res.redirect('/profile');
    },
    error: function(user, error) {
      return res.send('!שם משתמש או סיסמא אינם נכונים');
        var err = new Error('Wrong email or password.');
        err.status = 401;
        return next(err);
    }
  });
  } else {
    return rese.send("!כל השדות נדרשים");
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
      
     Parse.User.enableUnsafeCurrentUser();
     Parse.User.become(req.session.userId).then(function (user) {
           var userQuery = new Parse.Query("SchoolScores");
            userQuery.equalTo("SchoolID", user.get("SchoolID"));
            userQuery.first({
              success: function(object) {
                if (typeof object === "undefined"){
                  res.send("");
                }
                else{
                  
                  res.send(object.get("SchoolScores"));
                }
              },
              error: function(error) {
                res.send("");
              }
            });
      }, function (error) {
          res.send("");
      });
 
  
 });



var port = process.env.PORT || 1337;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
    console.log('parse-server-example running on port ' + port + '.');
});

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);

