var xmlHttp = new XMLHttpRequest();
xmlHttp.open( "GET", "https://back-seat.herokuapp.com/token", false ); // false for synchronous request
xmlHttp.send( null );
var r = xmlHttp.responseText;
var user = JSON.parse(r);
window.onload = function() {
  document.getElementsByClassName("textincont")[0].innerText  = "Welcome " + user.fullName;
  document.getElementsByClassName("totalscore")[0].innerText += " " + user.driversPoints.reduce((a, b) => a + b, 0) + " נקודות";
  if(user.profileImage != null){
  var url = user.profileImage.url.replace("http","https");
    document.getElementsByClassName("photo")[0].style.backgroundImage = "url('" + url + "')";
  }
  else{
    var url = "https://animal-id.info/img/no-user.jpg";
    document.getElementsByClassName("photo")[0].style.backgroundImage = "url('" + url + "')";
  }
  settable();
  createfriendslist();
}

function createfriendslist(){
      var friends = user.friendsList;
      for (let i = 0; i < friends.length; ++i) {
        var friendnum = friends[i];
        $.get("https://back-seat.herokuapp.com/getuser?num=" + friendnum, function(data, status){
              var friend = data;
              if(friend.profileImage)
              {
              add(friend.fullName, user.driversPoints[i], friend.profileImage.url, friend.mobile, friend.fullName);
              }
              else
              {
                add(friend.fullName, user.driversPoints[i], null, friend.mobile, friend.fullName);
              }
    	});
        
      }

        
//add("יוסי המלך", 55);
//add("מולי המלך",97, "https://cloud.netlifyusercontent.com/assets/344dbf88-fdf9-42bb-adb4-46f01eedd629/84bf361e-9a4b-42eb-be68-f2d58fe7e385/11-dithering-bug-opt-small.png");
  
}

function settable(){
var table = document.getElementById("Scorer");
  xmlHttp.open( "GET", "https://back-seat.herokuapp.com/table", false ); // false for synchronous request
  xmlHttp.send( null );
  var r = xmlHttp.responseText;
  var scores = JSON.parse(r);
  var items = Object.keys(scores).map(function(key) {
      return [key, scores[key]];
  });

  // Sort the array based on the second element
  items.sort(function(first, second) {
      return second[1] - first[1];
  });
  var calsses = ["ד","ה","ו","ז","ח"];
  for (var key in items) {
    var row = table.insertRow(-1);
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var splited = items[key][0].split(",");
    cell1.innerHTML = calsses[splited[0]-4] + splited[1];
    cell2.innerHTML = items[key][1]; 
  }
}



function add (name, points,url, mobile, name){
if (url == null)
{
 url = "https://animal-id.info/img/no-user.jpg"; 
}
  else{
    url = url.replace("http","https");
  }
document.getElementById("shadow").innerHTML += ` <div class="col-sm-10">
         <button class="fa fa-microphone microphone" data-mobile="` + mobile + `" data-name="` + name + `" style="font-size:48px;color:red"></button>
        <div class="col-sm-1" style="float: right;">
          <img src="` + url + `" class="img-circle" width="60px" height = "60px">
        </div>
        <div class="col-sm-11" align="right">
          <h4><a href="#">` + name + `</a></h4>
          <p><a href="#" dir="rtl">` + points + ` נקודות מנהג זה</a></p>
        </div>
        <div class="col-sm-2">
          <br>
        </div>
      </div>
      <div class="clearfix"></div>
      <hr />`
}
