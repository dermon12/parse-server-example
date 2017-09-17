
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
            var pushData =  "new recorded message arrived!";
	    sendPushNotificationToUserByMobile(id, pushData);	
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

function sendPushNotificationToUserByMobile(mobile, pushData) {
	   //Get value from Ticket Object
                  //Set push query
                  var pushQuery = new Parse.Query(Parse.Installation);
                  pushQuery.equalesto("deviceType","android");

                  //Send Push message
                  Parse.Push.send({
                                  where: pushQuery,
                                  data: {
                                  alert: pushData,
                                  sound: "default"
                                  }
                                  },{
				  useMasterKey: true,
                                  success: function(){
                                  response.success('true');
                                  },
                                  error: function (error) {
                                  response.error(error);
                                  }
                 });
		};
