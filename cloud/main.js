var http = require('http');

function add(a, b) {
    return a + b;
}

Parse.Cloud.define("UpdateClassFromSite", function(request, response) {

    //Example where an objectId is passed to a cloud function.
    var id = request.params.id;
    var school = request.params.school;
    var clas = request.params.clas;
    //When getUser(id) is called a promise is returned. Notice the .then this means that once the promise is fulfilled it will continue. See getUser() function below.
    getUser(id).then(
        //When the promise is fulfilled function(user) fires, and now we have our USER!
        function(user) {
            console.log("INUSER");
            if (user.get("SchoolID") != null) {

                var currentschool = user.get("SchoolID");
                var currentclas = user.get("class");
                var driversPoints = user.get("driversPoints");
                var score = driversPoints.reduce(add, 0);
                getSchool(Number(currentschool)).then(
                    //When the promise is fulfilled function(user) fires, and now we have our USER!
                    function(currentschool) {

                        var scoreslist = currentschool.get("SchoolScores");
                        scoreslist[currentclas] = Number(scoreslist[currentclas]) - Number(score);
                        currentschool.set("SchoolScores", scoreslist);
                        currentschool.save(null, {
                            useMasterKey: true
                        });
                        console.log("NEWWWWWWWWWWWCLASSSSSSSSSSS " + clas);
                        user.set("SchoolID", Number(school));
                        user.set("class", clas);
                        user.save(null, {
                            useMasterKey: true
                        });
                        Parse.Cloud.run('SetScore', {
                            id: Number(school),
                            class: clas,
                            scoretoadd: score
                        }).then(function(x) {
                            response.success(x);
                        });




                    },
                    function(error) {
                        response.error(error);
                    }
                );
            } else {
                var driversPoints = user.get("driversPoints");
                var score = driversPoints.reduce(add, 0);
                user.set("SchoolID", Number(school));
                user.set("class", clas);
                user.save(null, {
                    useMasterKey: true
                });
                Parse.Cloud.run('SetScore', {
                    id: Number(school),
                    class: clas,
                    scoretoadd: score
                }).then(function(x) {
                    response.success(x);
                });
            }
        },
        function(error) {
            console.log("INERROR");
            response.error(error);
        }
    );

});


Parse.Cloud.define("updateUserSite", function(request, response) {

    //Example where an objectId is passed to a cloud function.
    var id = request.params.user;
    var requestList = request.params.requestList;
    //When getUser(id) is called a promise is returned. Notice the .then this means that once the promise is fulfilled it will continue. See getUser() function below.
    getUser(id).then(
        //When the promise is fulfilled function(user) fires, and now we have our USER!
        function(user) {
            if (user == null) {
                response.success("there is 1");
            }
            var listrequest = user.get("requestList");
            if (user.get("userType") != "Driver") {
                response.success("there is 2");
            } else if (listrequest.includes(requestList)) {
                response.success("there is 3");
            } else {
                listrequest.push(requestList);
                user.set("requestList", listrequest);
                user.save(null, {
                    useMasterKey: true
                });
                response.success("success");
            }


        },
        function(error) {
            console.log("INERROR");
            response.error(error);
        }
    );

});



Parse.Cloud.define("updateUser", function(request, response) {

    //Example where an objectId is passed to a cloud function.
    var id = request.params.user;
    var requestList = request.params.requestList;
    //When getUser(id) is called a promise is returned. Notice the .then this means that once the promise is fulfilled it will continue. See getUser() function below.
    getUser(id).then(
        //When the promise is fulfilled function(user) fires, and now we have our USER!
        function(user) {


            user.set("requestList", requestList);
            user.save(null, {
                useMasterKey: true
            });
            var pushData = "התקבלה בקשת חברות חדשה!";
            var token = user.get("token");
            sendPushNotificationToUserByMobile(token, pushData);
            response.success("success");

        },
        function(error) {
            response.error(error);
        }
    );

});

Parse.Cloud.define("login", function(request, response) {

    Parse.User.logIn(request.params.user, request.params.pass, {
        success: function(user) {
            response.success(user);
        },
        error: function(user, error) {
            response.error(error);
        }
    });


});




function getUser(userId) {
    var userQuery = new Parse.Query(Parse.User);
    userQuery.equalTo("mobile", userId);

    //Here you aren't directly returning a user, but you are returning a function that will sometime in the future return a user. This is considered a promise.
    return userQuery.first({
        success: function(userRetrieved) {
            //When the success method fires and you return userRetrieved you fulfill the above promise, and the userRetrieved continues up the chain.
            return userRetrieved;
        },
        error: function(error) {
            return error;
        }
    });
};

function getSchool(userId) {
    var userQuery = new Parse.Query("SchoolScores");
    userQuery.equalTo("SchoolID", userId);

    //Here you aren't directly returning a user, but you are returning a function that will sometime in the future return a user. This is considered a promise.
    return userQuery.first({
        success: function(userRetrieved) {
            //When the success method fires and you return userRetrieved you fulfill the above promise, and the userRetrieved continues up the chain.
            return userRetrieved;
        },
        error: function(error) {
            return error;
        }
    });
};


function getTDBHelper(name) {
    var DBQuery = new Parse.Query("DBHelper");
    DBQuery.equalTo("name", name);

    //Here you aren't directly returning a user, but you are returning a function that will sometime in the future return a user. This is considered a promise.
    return DBQuery.first({
        success: function(obj) {
            //When the success method fires and you return userRetrieved you fulfill the above promise, and the userRetrieved continues up the chain.
            return obj;
        },
        error: function(error) {
            return error;
        }
    });
};

Parse.Cloud.define("SetEmail", function(request, response) {

    //Example where an objectId is passed to a cloud function.
    var id = request.params.mobile;
    var email = request.params.email;
    //When getUser(id) is called a promise is returned. Notice the .then this means that once the promise is fulfilled it will continue. See getUser() function below.
    getUser(id).then(
        //When the promise is fulfilled function(user) fires, and now we have our USER!
        function(user) {
            user.set("email", email);
            user.save(null, {
                useMasterKey: true
            });
            response.success("success");
        },
        function(error) {
            response.error(error);
        }
    );

});


Parse.Cloud.define("addRec", function(request, response) {

    //Example where an objectId is passed to a cloud function.
    var id = request.params.user;
    var requestList = request.params.sentRecordedMessagesList;
    //When getUser(id) is called a promise is returned. Notice the .then this means that once the promise is fulfilled it will continue. See getUser() function below.
    getUser(id).then(
        //When the promise is fulfilled function(user) fires, and now we have our USER!
        function(user) {
            user.set("sentRecordedMessagesList", requestList);
            user.save(null, {
                useMasterKey: true
            });
            var from = user.get("fullName");
            var pushData = "התקבלה הודעה קולית חדשה!";
            var token = user.get("token");
            sendPushNotificationToUserByMobile(token, pushData);
            response.success("success");
        },
        function(error) {
            response.error(error);
        }
    );

});

Parse.Cloud.define("updateFriends", function(request, response) {

    //Example where an objectId is passed to a cloud function.
    var id = request.params.user;
    var friendsList = request.params.friendsList;

    //When getUser(id) is called a promise is returned. Notice the .then this means that once the promise is fulfilled it will continue. See getUser() function below.
    getUser(id).then(
        //When the promise is fulfilled function(user) fires, and now we have our USER!
        function(user) {
            if (typeof friendsList === 'string') {
                var waitingList = user.get("waitingList1");
                if (waitingList != null) {
                    waitingList.push(friendsList);
                    user.set("waitingList1", waitingList);
                }

                var number = friendsList.substring(0, 10);;
                var pointstoad = friendsList.slice(-1);
                var drivers = user.get("friendsList");
                var pointslist = user.get("driversPoints");
                pointslist[drivers.indexOf(number)] = parseInt(pointslist[drivers.indexOf(number)]) + parseInt(pointstoad);
                user.set("driversPoints", pointslist);
                var schoolid = user.get("SchoolID");
                var userclas = user.get("class");
                var toadd = request.params.scorestoadd;
                var rand = Math.floor(Math.random() * 5000) + 0;
                if (schoolid != null) {
                    setTimeout(function() {
                        Parse.Cloud.run('SetScore', {
                            id: schoolid,
                            class: userclas,
                            scoretoadd: toadd
                        });
                    }, rand);

                }
                user.save(null, {
                    useMasterKey: true
                });
                response.success("success");

            } else {
                user.set("friendsList", friendsList);
                user.save(null, {
                    useMasterKey: true
                });
                response.success("success");

                var driversPoints = user.get("driversPoints");
                if(driversPoints.length < friendsList.length){
                    driversPoints.push(0);
                }
                user.set("driversPoints", driversPoints);
                user.save(null, {
                    useMasterKey: true
                });
                response.success("success");
            }

        },
        function(error) {
            response.error(error);
            return error
        }
    );

});


Parse.Cloud.define("updateWait", function(request, response) {

    //Example where an objectId is passed to a cloud function.
    var id = request.params.user;
    var toput = request.params.toput;
    //When getUser(id) is called a promise is returned. Notice the .then this means that once the promise is fulfilled it will continue. See getUser() function below.
    getUser(id).then(
        //When the promise is fulfilled function(user) fires, and now we have our USER!
        function(user) {
            var waitingList = user.get("waitingList");
            waitingList.add(toput);
            user.set("waitingList", waitingList);
            user.save(null, {
                useMasterKey: true
            });
            response.success("success");
        },
        function(error) {
            response.error(error);
        }
    );

});



Parse.Cloud.define("DeleteSentRequest", function(request, response) {

    //Example where an objectId is passed to a cloud function.

    //When getUser(id) is called a promise is returned. Notice the .then this means that once the promise is fulfilled it will continue. See getUser() function below.
    getUser(id).then(
        //When the promise is fulfilled function(user) fires, and now we have our USER!
        function(user) {
            var requestlist = user.get("sentRequestList");
            var index = requestlist.indexOf(thisphone);
            if (index >= 0) {
                requestlist.splice(index, 1);
            }
            user.set("sentRequestList", requestlist);
            user.save(null, {
                useMasterKey: true
            });
            response.success("success");

        },
        function(error) {
            response.error(error);
        }
    );

});

Parse.Cloud.define("SetScore", function(request, response) {
    //Example where an objectId is passed to a cloud function.
    var id = request.params.id;
    var clas = request.params.class;
    var score = request.params.scoretoadd;
    //When getUser(id) is called a promise is returned. Notice the .then this means that once the promise is fulfilled it will continue. See getUser() function below.
    getSchool(id).then(
        //When the promise is fulfilled function(user) fires, and now we have our USER!
        function(school) {
            var scoreslist = school.get("SchoolScores");
            if (clas in scoreslist) {
                var x = scoreslist[clas];
                score = (Number(x) + Number(score)).toString();
            }
            scoreslist[clas] = Number(score);
            school.set("SchoolScores", scoreslist);
            school.save(null, {
                useMasterKey: true
            });
            response.success("success");

        },
        function(error) {
            response.error(error);
        }
    );

});


Parse.Cloud.define("SendAcceptMsgPush", function(request, response) {
    var sendto = request.params.sendto;
    var from_name = request.params.from;
        getUser(sendto).then(
        //When the promise is fulfilled function(user) fires, and now we have our USER!
        function(user) {
            var token = user.get("token");
            var pushdata = from_name + " אישר את ההקלטה שלך!";
            sendPushNotificationToUserByMobile(token,pushdata);
            response.success("success");
        },
        function(error) {
            console.log("INERROR");
            response.error(error);
        }
    );
    
});


function sendPushNotificationToUserByMobile(id, pushData) {
    //Get value from Ticket Object		  	 
    //Set push query
    console.log(pushData)
    var gcm = require("node-gcm");
    var sender = new gcm.Sender("AIzaSyCYV5hIJpk7RaoXUnQf98eRMM8Psaez3a4");
    var message = new gcm.Message({
        notification: {
            title: "BackSeat",
            icon: "icon",
            body: pushData,
            sound: "default"
        },
    });
    var recipients = gcm.IRecipient = {
        to: id
    };
    sender.sendNoRetry(message, recipients, (err, response) => {
        if (err) console.error(err);
        else console.log(response);
    });

};

Parse.Cloud.define("SendSms", function(request, response) {
    var mobile = request.params.mobile;
    var randomCode = request.params.randomCode;
    http.get("http://www.smscenter.co.il/pushsms.asp?UserName=eyaloo&Password=7feb578e1d66845552a94fed240578ba&Sender=BackSeat&ToPhoneNumber=" + mobile + "&Message=Your Verify Code : " + randomCode);
    response.success("success");
});

Parse.Cloud.define("SetFactors", function(request, response) {
    var d = new Date();
    var i = 0;
    var pushtiming = {};
    var query = new Parse.Query(Parse.User);
    query.equalTo("userType", "Driver")
        .find()
        .then((results) => {
            for (let i = 0; i < results.length; ++i) {
                var currentUser = results[i];
                //if (currentUser.get("mobile") != "0526526510") {
                //    continue;
                //}
                var todayDistance = currentUser.get("todayTraveledDistance");

                if (todayDistance > 0) {
                    var todayTouches = currentUser.get("todayTouches");
                    var lastTouchestoKm = currentUser.get("lastTouchesToKM");
                    var todayTouchesToKm = todayTouches / todayDistance;
                    var rehabData = currentUser.get("rehabData");
                    if(rehabData == null){
                        rehabData = {};
                    }
                    rehabData[d.getTime()] = todayTouchesToKm;
                    currentUser.set("rehabData", rehabData);
                    currentUser.set("lastTouchesToKM", todayTouchesToKm);
                    currentUser.set("todayTouches", 0);
                    currentUser.set("todayTraveledDistance", 0.0);
                    if (lastTouchestoKm > -1) {

                        var nextfactor = calculateFactor(lastTouchestoKm, todayTouchesToKm);
                        currentUser.set("Factor", nextfactor);
                        currentUser.set("todayTouches", 0);
                        currentUser.set("todayTraveledDistance", 0.0);

                        var driverslist = currentUser.get("friendsList");
                        var timeoutcounter = 0;
                        if (nextfactor >= 10) {
                            for (let j = 0; j < driverslist.length; ++j) {
                                console.log("HEYYYYYYYY " + driverslist[j]);
                                var toadd = parseInt((nextfactor / 10), 10);
                                if (toadd >= 10) {
                                    toadd = 9;
                                }
                                if (driverslist[j] in pushtiming) {
                                    pushtiming[driverslist[j]] = pushtiming[driverslist[j]] + toadd;
                                } else {
                                    pushtiming[driverslist[j]] = toadd;
                                }
                                timeout(timeoutcounter, driverslist[j], currentUser, nextfactor);
                                timeoutcounter = timeoutcounter + 1;
                            }
                        }
                    }
                    currentUser.save(null, {
                        useMasterKey: true
                    });
                }

                //TOODO : reset to 0 all today's values


            }
            getTDBHelper("pushtiming").then(
                function(obj) {
                    obj.set("pushtiming", pushtiming);
                    obj.save(null, {
                        useMasterKey: true
                    });
                    response.success("success");
                },
                function(error) {
                    response.error(error);
                }
            );
        })
        .catch(() => {
            response.error("Failed");
        });
});

function timeout(i, usermobile, currentUser, nextfactor) {
    getUser(usermobile).then(
        //When the promise is fulfilled function(user) fires, and now we have our USER!
        function(user) {
            setTimeout(function() {
                var driversPoints = user.get("driversPoints");
                var friendsList = user.get("friendsList");
                var currentmobile = currentUser.get("mobile");
                var toadd = parseInt((nextfactor / 10), 10);
                if (toadd >= 10) {
                    toadd = 9;
                }
                var indexofmobile = friendsList.indexOf(currentmobile);
                if (indexofmobile > -1 && driversPoints.length > indexofmobile) {
                    driversPoints[indexofmobile] = driversPoints[indexofmobile] + toadd;
                    user.set("driversPoints", driversPoints);
                    user.save(null, {
                        useMasterKey: true
                    });
                    var schoolid = user.get("SchoolID");
                    var userclas = user.get("class");
                    if (schoolid != null) {
                        Parse.Cloud.run('SetScore', {
                            id: schoolid,
                            class: userclas,
                            scoretoadd: toadd
                        });
                    }
                    
                }
            }, 1000 * i);
        },
        function(error) {
            response.error(error);
        }
    );

}
Parse.Cloud.define("DailyPush", function(request, response) {
    var myDate = new Date();
    if (myDate.getDay() != 6) { // not at Yom Shabat
        getTDBHelper("pushtiming").then(
            function(obj) {
                var tosendict = obj.get("pushtiming");
                for (var key in tosendict) {
                    getUser(key).then(
                        //When the promise is fulfilled function(user) fires, and now we have our USER!
                        function(user) {
                            var mobile = user.get("mobile");
                            var points = tosendict[mobile];
                            var pushData = "התקבלו " + points.toString() + " נקודות חדשות מהנהגים שלך!";
                            var token = user.get("token");
                            sendPushNotificationToUserByMobile(token, pushData);
                        },
                        function(error) {
                            response.error(error);
                        }
                    );

                }

                obj.set("pushtiming", {});
                obj.save(null, {
                    useMasterKey: true
                });
                response.success("success");
            },
            function(error) {
                response.error(error);
            }
        );
    }
});

Parse.Cloud.define("IWANT", function(request, response) {
    var added = request.params.mobile;
    getUser(added).then(
        //When the promise is fulfilled function(user) fires, and now we have our USER!
        function(user) {
            var query = new Parse.Query(Parse.User);
            query.equalTo("userType", "Player")
                .find()
                .then((results) => {
                    for (let i = 0; i < results.length; ++i) {
                        var currentUser = results[i];
                        var wants = currentUser.get("IWANT");
                        if (wants != null) {
                            if (wants.indexOf(added) > -1 && currentUser.get("friendsList").indexOf(added) == -1) {

                                console.log(currentUser.get("mobile") + " wantsssssssssssssssss " + added);
                                var friendslist = currentUser.get("friendsList");
                                var driverspoints = currentUser.get("driversPoints");
                                var requestlist = currentUser.get("sentRequestList");
                                friendslist.push(added);
                                requestlist.push(added);
                                driverspoints.push(0);
                                currentUser.set("friendsList", friendslist);
                                currentUser.set("driversPoints", driverspoints);
                                currentUser.set("sentRequestList", requestlist);
                                currentUser.save(null, {
                                    useMasterKey: true
                                });
                                var friendslistDriver = user.get("friendsList");
                                friendslistDriver.push(currentUser.get("mobile"));
                                user.set("friendsList", friendslistDriver);
                                user.save(null, {
                                    useMasterKey: true
                                });

                            }
                        }
                    }
                })
                .catch(() => {
                    response.error("Failed");
                });

        },
        function(error) {
            console.log("INERROR");
            response.error(error);
        }
    );


    response.success("success");

});


function calculateFactor(lastTouchesToKm, todayTouchesToKm) {
    var diff = lastTouchesToKm - todayTouchesToKm;
    if (diff <= 0) {
        return 0;
    } else {
        var factor = diff / lastTouchesToKm * 100.0;
        return factor;
    }
};
