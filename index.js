// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require('express');
var session = require('express-session');
var fileUpload = require('express-fileupload');
var http = require('http');
var fs = require('fs'),
    cloudconvert = new (require('cloudconvert'))('Z85SN4oBLhTP6ia7inhxr00iSq7nFfTFJzseKNZnbW_HX1y97fooef8efsOLVapTBbme7Df2KVjYLKsNDOYwCg');
const stream = require("stream");

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
  },
publicServerURL: 'http://back-seat.herokuapp.com/parse/',
  appName: 'BackSeat',
  emailAdapter: {
    module: 'parse-server-mailgun',
    options: {
      // The address that your emails come from
      fromAddress: 'backseat@backseat.com',
      // Your domain from mailgun.com
      domain: 'sandbox6d5903f6f99a4ba9b54011b012537a46.mailgun.org',
      // Your API key from mailgun.com
      apiKey: 'key-872918c8b24167dad1d49346ac27da04',
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

app.get('/getuser', function (req, res, next) {
	  Parse.User.enableUnsafeCurrentUser();
	  Parse.User.become(req.session.userId).then(function (user) {
		  var numtoget =  req.param('num');
		  var userQuery = new Parse.Query(Parse.User);
		  userQuery.equalTo("mobile", numtoget);
		  userQuery.first({
			success: function(object) {
			  return res.send(object);
		  },
		  error: function(error) {
				 return res.redirect('/');
		  }
		});
	});
});


app.post('/sendsms', function (req, res, next) {
	
	// perform real send
	var userQuery = new Parse.Query(Parse.User);
    userQuery.equalTo("mobile", req.body.smobile);
    userQuery.first({
      success: function(object) {
        console.log("AAAAAAAAAAAAAAA" + object);
        if (typeof object === "undefined"){
		var num =  req.body.smobile;
	var SMSVer = Parse.Object.extend("SMSVer");
	var code = Math.floor(1000 + Math.random() * 9000);
	// Create a new instance of that class.
	console.log("HEREEEEEEEEEEEE");
	http.get("http://www.smscenter.co.il/pushsms.asp?UserName=eyaloo&Password=7feb578e1d66845552a94fed240578ba&Sender=BackSeat&ToPhoneNumber=" + num + "&Message=Your Verify Code : " + code);
	console.log("THEREEEEE");
	var ver = new SMSVer();
	ver.set("mobile", num);
	ver.set("code", code);

	ver.save(null, {
	  success: function(gameScore) {
		  res.send("SENT");
	  },
	  error: function(gameScore, error) {
		  res.send("התרחשה שגיאה.. נא לנסות שוב במועד מאוחר יותר!");
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
	
});






app.get('/addfriend', function (req, res, next) {
  Parse.User.enableUnsafeCurrentUser();
  Parse.User.become(req.session.userId).then(function (user) {
    var playertoadd = user.get("mobile");
    var driveraddto =  req.param('num');
    var sentrequestlist = user.get("sentRequestList");
    var friendslist = user.get("friendsList");
    if(sentrequestlist.includes(driveraddto) || friendslist.includes(driveraddto)){
      return res.send("עבור משתמש זה נשלחה בקשת חברות או שהוא כבר קיים ברשימת החברים שלך");
    }
    else{
      Parse.Cloud.run('updateUserSite', { user: driveraddto, requestList : playertoadd}).then(function(response) {
        console.log("RESSSSSSSSSSSSSS " + response);
        if (response == "success")
        {
          sentrequestlist.push(driveraddto);
          user.set("sentRequestList",sentrequestlist);
          user.save();
          return res.send("!בקשת חברות נשלחה בהצלחה");
        }
          else
          {
            return res.send("!משתמש זה אינו קיים במערכת");
          }
        });

    }
    }, function (error) {
      return res.redirect('/');
    });
});

app.post('/sendreq', function (req, res, next) {
	var toset = req.body.mobile;
	var userphone = "";
  	  console.log("reqqqqq" + JSON.stringify(req.body));
	    Parse.User.enableUnsafeCurrentUser();
	   Parse.User.become(req.session.userId).then(function (user) {
	    userphone = user.get("mobile");
	}, function (error) {
	    return res.redirect('/');
	});
	var userQuery = new Parse.Query(Parse.User);
		  userQuery.equalTo("mobile", toset);
		  userQuery.first({
			success: function(object) {
			  let buf = req.files.file.data;
			  var ab = new ArrayBuffer(buf.length);
				
			  var view = new Uint8Array(ab);
			  for (var i = 0; i < buf.length; ++i) {
			      view[i] = buf[i];
			  }
			  var array = Array.from(view)
			  fs.writeFile('rec.mov', buf, (err) => {
			  if (err){ 
				  console.log("THE ERROR IS HEREEE ");
				  throw err;
				   
				  }
			  console.log('It\'s saved!');
			  var stream = fs.createReadStream('rec.mov')
				.pipe(cloudconvert.convert({
				    "inputformat": "mov",
				    "outputformat": "mp4",
				    "input": "upload",
				    "save": true
				}))
			.pipe(fs.createWriteStream('rec.mp4'));
			  stream.on('finish', function () { 
				  	
					  var result = getByteArray('rec.mp4')
					  console.log("RESULTTT " + result);
					  var file = new Parse.File("rec.mov", result);
					  file.save().then(function() {
						var sentrecord = object.get("sentRecordedMessagesList");
						  console.log("BEFOREEE " + JSON.stringify(sentrecord));
						  console.log("DRIVERRRRRRRRRRRRR " + toset);
						sentrecord[userphone] = file;
						  console.log("AFTERRRRR " + JSON.stringify(sentrecord));
						  Parse.Cloud.run('addRec', { user: toset, sentRecordedMessagesList:sentrecord }).then(function(response) {
							//return res.send("OK");	
							  return res.redirect('/profile');
							});
					  }, function(error) {
					    console.log("ERRRORRRRRRRRRRRRRRRRRRRR " + error);
					   return res.redirect('/');
					  });
				  });
			  
			  
			  });
				  
				  
				},function(error) {
					    console.log("ERRRORRRRRRRRRRRRRRRRRRRR " + error);
					   return res.redirect('/');
			  }
	  
    });
	
});

function getByteArray(filePath){
    let fileData = fs.readFileSync(filePath).toString('hex');
    let result = [];
    for (var i = 0; i < fileData.length; i+=2)
      result.push('0x'+fileData[i]+''+fileData[i+1]);

    return result;
}

app.post('/updateimg', function (req, res, next) {
  console.log("IMGGGGGGGG " + JSON.stringify(req.body));
  var t0
  Parse.User.enableUnsafeCurrentUser();
  Parse.User.become(req.session.userId).then(function (user) {
          let buf = req.files.file.data;
          var ab = new ArrayBuffer(buf.length);
          var view = new Uint8Array(ab);
          for (var i = 0; i < buf.length; ++i) {
              view[i] = buf[i];
          }
          var array = Array.from(view)
          var file = new Parse.File("profileImage.png", array);
          file.save().then(function() {
            user.set("profileImage", file);
            console.log("AFTERPUTTTTTTTTTTT " + file);
          user.save();
          return res.redirect('/profile');
          }, function(error) {
            console.log("ERRRORRRRRRRRRRRRRRRRRRRR " + error);
           return res.redirect('/');
          });
        });
    }, function (error) {
      console.log("ERRRORRRRRRRRRRRRRRRRRRRR " + error);
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

function verifycode(number, code, _callback){
	var verquery = new Parse.Query("SMSVer");
    verquery.equalTo("mobile", number);
    verquery.equalTo("code", parseInt(code));
    verquery.first({
      success: function(object) {
	      if (typeof object === "undefined"){
		    _callback(false);         
	      }
	      else{
		      _callback(true);   
		  object.destroy({
			  success: function(myObject) {
				  console.log("SEND TRUEEEEEEEEE");
			  },
			  error: function(myObject, error) {
			    // The delete failed.
			    // error is a Parse.Error with an error code and message.
			  }
			});
	      }
	      
      },
      error: function(error) {
		_callback(false);   
             return next(error);
      }
    });
	
}


app.post('/', function (req, res, next) {
  // confirm that user typed same password twice
  if (req.body.spassword !== req.body.spasswordConf) {
    return res.send("!הסיסמאות אינן תואמות");
    var err = new Error('Passwords do not match.');
    err.status = 400;
    return next(err);
  }

  if (
    req.body.susername &&
    req.body.spassword &&
    req.body.spasswordConf) {

    var user = new Parse.User();
    user.set("username",  req.body.susername);
    user.set("password",  req.body.spassword);

    // other fields can be set just like with Parse.Object
    user.set("fullName", req.body.susername);
    user.set("mobile", req.body.smobile);
    user.set("userType", "Player");
    user.set("friendsList", new Array());
    user.set("sentRequestList", new Array());
    user.set("driversPoints", new Array());
    user.set("waitingList", new Array());
    user.set("token","");
    user.set("IWANT",new Array());
    
    var userQuery = new Parse.Query(Parse.User);
    userQuery.equalTo("mobile", req.body.smobile);
    userQuery.first({
      success: function(object) {
        console.log("AAAAAAAAAAAAAAA" + object);
        if (typeof object === "undefined"){
		    verifycode(req.body.smobile,req.body.scode, function(ver) {
        				console.log("VERRR " + typeof ver);
					if(ver) {
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
					res.send("WRONG"); 
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
	    if (user.get("userType") == "Driver")
	    {
		    return res.send('!האפליקציה רק לשחקנים... בינתיים');
	    }
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

app.get('/whatsthesms', function (req, res, next) {
	var numtoget =  req.param('num');
	  var userQuery = new Parse.Query("SMSVer");
	  userQuery.equalTo("mobile", numtoget);
	  userQuery.first({
		success: function(object) {
		if(object != null){
		  var code = object.get("code");
		  return res.send(code.toString());
		}
		else{
			return res.send('אין מספר כזה....');
		}
	  },
	  error: function(error) {
			 return res.redirect('/');
	  }
	});
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
                  res.send("{}");
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

