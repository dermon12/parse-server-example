
Parse.Cloud.define("updateUser", function(request, response) 
{
	
    //Example where an objectId is passed to a cloud function.
    var id = request.params.user;
	var requestList = request.params.requestList;
    //When getUser(id) is called a promise is returned. Notice the .then this means that once the promise is fulfilled it will continue. See getUser() function below.
    getUser(id).then
    (   
        //When the promise is fulfilled function(user) fires, and now we have our USER!
        function(user)
        {
			
		
		user.set("requestList", requestList);
		user.save(null, {useMasterKey:true});
		var pushData =  "התקבלה בקשת חברות חדשה!";
	    	var token = user.get("token");
	    	sendPushNotificationToUserByMobile(token, pushData);
            	response.success("success");

        }
        ,
        function(error)
        {
            response.error(error);
        }
    );

});

function getUser(userId)
{
    var userQuery = new Parse.Query(Parse.User);
    userQuery.equalTo("mobile", userId);

    //Here you aren't directly returning a user, but you are returning a function that will sometime in the future return a user. This is considered a promise.
    return userQuery.first
    ({
        success: function(userRetrieved)
        {
            //When the success method fires and you return userRetrieved you fulfill the above promise, and the userRetrieved continues up the chain.
            return userRetrieved;
        },
        error: function(error)
        {
            return error;
        }
    });
};

function getSchool(userId)
{
    var userQuery = new Parse.Query("SchoolScores");
    userQuery.equalTo("SchoolID", userId);

    //Here you aren't directly returning a user, but you are returning a function that will sometime in the future return a user. This is considered a promise.
    return userQuery.first
    ({
        success: function(userRetrieved)
        {
            //When the success method fires and you return userRetrieved you fulfill the above promise, and the userRetrieved continues up the chain.
            return userRetrieved;
        },
        error: function(error)
        {
            return error;
        }
    });
};




Parse.Cloud.define("addRec", function(request, response) 
{
	
    //Example where an objectId is passed to a cloud function.
    var id = request.params.user;
	var requestList = request.params.sentRecordedMessagesList;
    //When getUser(id) is called a promise is returned. Notice the .then this means that once the promise is fulfilled it will continue. See getUser() function below.
    getUser(id).then
    (   
        //When the promise is fulfilled function(user) fires, and now we have our USER!
        function(user)
        {
	    user.set("sentRecordedMessagesList", requestList);
	    user.save(null, {useMasterKey:true});
	    var from = user.get("fullName");
            var pushData =  "התקבלה הודעה קולית חדשה!";
	    var token = user.get("token");
	    sendPushNotificationToUserByMobile(token, pushData);	
	    response.success("success");
        }
        ,
        function(error)
        {
            response.error(error);
        }
    );

});

Parse.Cloud.define("updateFriends", function(request, response) 
{
	
    //Example where an objectId is passed to a cloud function.
    var id = request.params.user;
	var friendsList = request.params.friendsList;
	
    //When getUser(id) is called a promise is returned. Notice the .then this means that once the promise is fulfilled it will continue. See getUser() function below.
    getUser(id).then
    (   
        //When the promise is fulfilled function(user) fires, and now we have our USER!
        function(user)
        {
			if (typeof friendsList === 'string')
			{
			var waitingList = user.get("waitingList");
			waitingList.push(friendsList);
			user.set("waitingList", waitingList);
			var schoolid = user.get("SchoolID");
			var userclas = user.get("class");
			var toadd = request.params.scorestoadd;
			if (schoolid != null){
			Parse.Cloud.run('SetScore', { id: schoolid , class: userclas, scoretoadd: toadd});
			}
			user.save(null, {useMasterKey:true});
            response.success("success");
			
			}
			
			else
			{
			user.set("friendsList", friendsList);
			user.save(null, {useMasterKey:true});
            response.success("success");
			
			var driversPoints = user.get("driversPoints");
			driversPoints.push(0);
			user.set("driversPoints", pointsList);
			user.save(null, {useMasterKey:true});
            response.success("success");
			}
			
        }
        ,
        function(error)
        {
            response.error(error);
	    return error
        }
    );

});


Parse.Cloud.define("updateWait", function(request, response) 
{
	
    //Example where an objectId is passed to a cloud function.
    var id = request.params.user;
	var toput = request.params.toput;
    //When getUser(id) is called a promise is returned. Notice the .then this means that once the promise is fulfilled it will continue. See getUser() function below.
    getUser(id).then
    (   
        //When the promise is fulfilled function(user) fires, and now we have our USER!
        function(user)
        {
			var waitingList = user.get("waitingList");
			waitingList.add(toput);
			user.set("waitingList", waitingList);
			user.save(null, {useMasterKey:true});
            response.success("success");
        }
        ,
        function(error)
        {
            response.error(error);
        }
    );

});



Parse.Cloud.define("DeleteSentRequest", function(request, response) 
{
	
    //Example where an objectId is passed to a cloud function.
    var id = request.params.user;
    var thisphone = request.params.thisp;
    //When getUser(id) is called a promise is returned. Notice the .then this means that once the promise is fulfilled it will continue. See getUser() function below.
    getUser(id).then
    (   
        //When the promise is fulfilled function(user) fires, and now we have our USER!
        function(user)
        {	
		var requestlist = user.get("sentRequestList");
		var index = requestlist.indexOf(thisphone);
		if (index >= 0) {
		  requestlist.splice( index, 1 );
		}
		user.set("sentRequestList", requestlist);
		user.save(null, {useMasterKey:true});
            	response.success("success");

        }
        ,
        function(error)
        {
            response.error(error);
        }
    );

});

Parse.Cloud.define("SetScore", function(request, response) 
{
	
    //Example where an objectId is passed to a cloud function.
    var id = request.params.id;
    var clas = request.params.class;
    var score = request.params.scoretoadd;
    //When getUser(id) is called a promise is returned. Notice the .then this means that once the promise is fulfilled it will continue. See getUser() function below.
    getSchool(id).then
    (   
        //When the promise is fulfilled function(user) fires, and now we have our USER!
        function(school)
        {	
		var scoreslist = school.get("SchoolScores");
		if (clas in scoreslist)
		{
			var x = scoreslist[clas];
			score = (Number(x) + Number(score)).toString();
		}		
		scoreslist[clas] = Number(score);
		school.set("SchoolScores", scoreslist);
		school.save(null, {useMasterKey:true});
            	response.success("success");

        }
        ,
        function(error)
        {
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
			icon: "your_icon_name",
			body: pushData,
			sound: "default"
		    },
		});
		var recipients = gcm.IRecipient = { to: id };
		sender.sendNoRetry(message, recipients, (err, response) => {
		    if (err) console.error(err);
		    else console.log(response);
		});
	                
 		};


Parse.Cloud.define("SetFactors", function(request, response) {
  var query = new Parse.Query(Parse.User);
  query.equalTo("userType", "Driver")
    .find()
    .then((results) => {
      for (let i = 0; i < results.length; ++i) {
        var currentUser = results[i];
        var todayDistance = currentUser.get("todayTraveledDistance");
	 
        if (todayDistance > 0) {
            var todayTouches = currentUser.get("todayTouches");
            var lastTouchestoKm = currentUser.get("lastTouchesToKM");
            var todayTouchesToKm = todayTouches / todayDistance;
	    if (todayTouchesToKm > 0) {
            currentUser.set("lastTouchesToKM", todayTouchesToKm );
	    }
            if (lastTouchestoKm  > -1){
      	
	    var nextfactor = calculateFactor(lastTouchestoKm, todayTouchesToKm);
            currentUser.set("Factor", nextfactor );
            }
        } 
        
        currentUser.set("todayTouches", 0);
        currentUser.set("todayTraveledDistance", 0.0);
        currentUser.save(null, {useMasterKey:true});
        //TOODO : reset to 0 all today's values
        
          
      }
      response.success("success");
    })
    .catch(() =>  {
      response.error("Failed");
    });
});

function calculateFactor(lastTouchesToKm, todayTouchesToKm) {
            var diff = lastTouchesToKm- todayTouchesToKm;
            if (diff <= 0 ) {
                   return 0;
            }
             
            else {
                var factor = diff / lastTouchesToKm * 100.0;
                return factor;
            }
};

