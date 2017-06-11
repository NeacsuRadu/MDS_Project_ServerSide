
//-----------------------------------------------webserver includes ------------
var express = require('express'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    passport = require('passport'),
    mongodb = require('mongodb').MongoClient,
    LocalStrategy = require('passport-local').Strategy,
    bodyParser = require('body-parser'),
    flash = require('express-flash'),
    usersManager = require('./dbscript/mongodbmanager.js').usersManager,
    messagesManager = require('./dbscript/mongodbmanager.js').messagesManager,
    async = require('async'),
    fileUploader = require('express-fileupload'),
    fs = require('fs');


var url = 'mongodb://localhost:27017/test';

var usersConnected = {};


var db;
var users;
var messages;


var app = express();

//-----------------------------------------------webserver includes ------------


//-----------------------------------------------desktopserver inclused---------
var net = require('net');

var OFFLINE = 0;
var DESKTOP = 1;
var BROWSER = 2;

var SIGNIN 						= 1;
var REGISTER 					= 2;
var UPDATE_FRIENDS 				= 3;
var SEND_FRIEND_REQUEST 		= 4;
var SEND_FRIEND_REQUEST_ANSWER 	= 5;
var FRIEND_REQUEST 				= 6;
var FRIEND_REQUEST_FAILED 		= 7;
var SEND_MESSAGE 				= 8;
var RECEIVE_MESSAGE 			= 9;
var LOGOUT 						= 10;

var desktopClients = {};



//-----------------------------------------------desktopserver inclused---------

//---------------------------------------database waterfall --------------------

async.waterfall([
  (callback)=>{
    mongodb.connect(url, function(err, response){
    if(err){
      console.log("Avem o eroare:");
      console.log(err);
      return;
    }

    db = response;


    messages = db.collection('messages');
    users = db.collection('users');
    messagesManager.setMessages(messages);
    usersManager.setUsers(users)
        callback();
  });
},
  (callback)=>{

  }
],function(err,res){

});

//---------------------------------------database waterfall --------------------


var http = require('http').Server(app);
var io = require('socket.io')(http);

var connected = {};


//---------------------socket.io stuff -----------------------------------------
io.on('connection', function(socket){




    var index = socket.handshake.headers.cookie.indexOf('connect.sid=s%3A');
    index += 16;


    if(connected[socket.handshake.headers.cookie.substr(index,32)] == undefined){
      socket.disconnect();
      return;
    }

    connected[socket.handshake.headers.cookie.substr(index,32)].socket = socket;

    var user = connected[socket.handshake.headers.cookie.substr(index,32)];

    user.disconnect = false;

    tellMyFriendsImGone(user._id, true, BROWSER);




  socket.on('chat message', function(msg){

	console.log("Mesajul de la browser este" + JSON.stringify(msg));

    messagesManager.addMessages([msg],function(err,res){

      var userStatus = ifOnline(msg.to);
      if (userStatus.type == DESKTOP)
      {
        var respJson = getReceiveMessageJson();
        sendMessage(msg.to, JSON.stringify(respJson) + "\n", DESKTOP);
      }
      else if (userStatus.type == BROWSER)
      {
        userStatus.socket.emit("chat message", msg);
      }
    });

  });

  socket.on('disconnect', function(){
  user.disconnect = true;
	console.log("[id:]" + user._id);
  setTimeout(function(){
  	if(user.disconnect == true){
      tellMyFriendsImGone(user._id, false, BROWSER);
    	delete	connected[socket.handshake.headers.cookie.substr(index,32)];
      socket.disconnect();
    }
  }, 1000);


    console.log('a iesit un sobolan');
  });


});
//---------------------socket.io stuff -----------------------------------------

//------------------------use and set for express-------------------------------

app.use(flash());
app.use(session({
  secret : "very_secret_much_secure",
  resave : false,
  saveUninitialized : true,
  cookie : { secure : false }  // development => false
}));


app.use(cookieParser("very_secret_much_secure"));
app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.urlencoded({ extended : false }));
app.use(bodyParser.json());
app.use(fileUploader());

app.set('view engine', 'ejs');
//------------------------use and set for express-------------------------------


//-----------------------passport stuff-----------------------------------------
// 1. secure user name and pass

//done by database now :D

// 2. configure passport-local to validate an incoming user and pw

passport.use(new LocalStrategy(
  function(username, password, done){

    console.log("adasdas");
      var user ;
      usersManager.findUser({_id: username},function(err,res){
        user = res[0];

        if(user == undefined){
            console.log("[wrong]")
            done(null, false,{message : "Incorrect credentials." });
        }else{

        if(user._id == username){
          if(user.pw == password){
            usersConnected[username] = user;
            done(null, user);
          }else {
            done(null, false,{message : "Incorrect credentials." });
          }
        }else{
          done(null, false,{message : "Incorrect credentials." });
        }
        }

      });

      console.log("nu");
  }
));

// 3. serialize users

passport.serializeUser(function (user, done){

  if(usersConnected[user._id]){
    done(null, user._id);
  }else{

      done(new Error("CANT_SERIALIZE_THIS_USER"));
    }
});

// 4. deserialize users

passport.deserializeUser(function (userId, done) {
  if(usersConnected[userId]){
    done(null, usersConnected[userId]);
  }else{
    done(new Error("that user does not exist"));
  }
});
//-----------------------passport stuff-----------------------------------------


//-----------------------express requests       --------------------------------
app.get('/', authenticatedOrNot, function(req, res) {

  console.log(req.sessionID);

  connected[req.sessionID] = req.user;
  console.log(req.sessionID + '\n' + req.sessionID.length);
  res.render(__dirname+'/views/user.ejs', {name : req.user._id});
});

/*
app.get("/login", function (req, res){
  var error = req.flash("error");
  var form  = '';
  if(error && error.length) {
    form = error[0] + form;
  }

  res.render('login.ejs',{message : form});

});
*/

app.get("/messages/:nume",authenticatedOrNot,function(req,resp){
  var nume = req.params.nume;
  var user = connected[req.sessionID]._id;
  console.log(nume);
  console.log(user);
  messagesManager.getMessages({to: user,from : nume}, function(err,res){
    console.log(res);
    resp.send(res);
  });
});

app.get("/friends",authenticatedOrNot,function(req,resp){
  var user = connected[req.sessionID]._id;
  usersManager.findUser({_id:user},function(err,res){

    console.log(res[0]);

    var sends = res[0].friends;
    var obi = {
      ob : {},
      requests : res[0].requests
    };

    for(var i = 0; i < sends.length; i++){
      obi.ob[sends[i]] = false;

	  var status = isOnline(sends[i]);

	  if(status.type != OFFLINE){
		  obi.ob[sends[i]] = true;
	  }

    }


    resp.send(obi);
  });
});

app.get("/user/:nume",function(req,resp){
  var name =  req.params.nume;
  usersManager.checkName(name,function(err,res){
    if(res.found == 0){
      resp.send({succ : false,connected: false});
    }else{
    /*  usersManager.makeFriends(connected[req.sessionID]._id,name,function(err,res){
        if(err){
          console.log(err);
        }else{
          usersManager.findUser({_id : connected[req.sessionID]._id}, function(err,res){
            console.log(res);
            usersManager.findUser({_id : name},function(err,res){
              console.log(res);
            });
          });
        }
      })*/



      var conn = false;


      usersManager.addRequest(name,connected[req.sessionID]._id,function(err,res){
        if(err){
          console.log(err);
        }else{
          var status = isOnline(name);
          if(status.type == BROWSER){
            addFriendRequest(name, connected[req.sessionID]._id, BROWSER);
          }else if(status.type == DESKTOP){
            var resp = getFriendRequestMessage(connected[req.sessionID]._id);
            sendMessage(name, JSON.stringify(resp) + "\n", DESKTOP);
            addFriendRequest(name, connected[req.sessionID]._id, DESKTOP);
          }
        }
      });


      resp.send({succ : true,connected : conn});
    }
  });
});

app.get("/check/:name",function(req,res){
  usersManager.checkName(req.params.name,function(err,resp){
    if(err) res.send({found :0});
    res.send({found:resp.found});
  })
})

app.get("/js/user.js", function(req,res) {
  res.sendFile(__dirname +"/views/js/user.js");
});

app.get("/js/login.js", function(req,res) {
  res.sendFile(__dirname +"/views/js/login.js");
});

app.get("/js/register.js", function(req,res) {
  res.sendFile(__dirname +"/views/js/register.js");
});

app.get("/css/StyleUser.css", function(req,res) {
  res.sendFile(__dirname +"/views/css/StyleUser.css");
});

app.get("/css/StyleRegister.css", function(req,res) {
  res.sendFile(__dirname +"/views/css/StyleRegister.css");
});

app.get("/css/StyleLogin.css", function(req,res) {
  res.sendFile(__dirname +"/views/css/StyleLogin.css");
});


app.get("/css/images/peisaj.jpg", function(req,res) {
  res.sendFile(__dirname +"/views/css/images/peisaj.jpg");
});




app.get("/register", function(req,res){
    res.sendFile(__dirname +"/views/register.html");
});


app.get("/decline/:name",authenticatedOrNot,function(req,resp){
    var name = req.params.name;
    console.log("dec");
    console.log(connected[req.sessionID]._id + "..." + name);
    if(!requestExists(connected[req.sessionID]._id,name)){
        resp.send({error : "No such request!"});
        return;
    }else{
        usersManager.deleteRequest(connected[req.sessionID]._id,name,function(err,res){
          if(err){
            console.log(err);
            resp.send({error : err});
          }
        });


		var status = isOnline(name);

		if(status.type == DESKTOP){

		}else if(status.type == BROWSER){
			status.socket.emit("user decline",connected[req.sessionID]._id);

		}


        resp.send({
        });

      }


});


app.get("/make/:name",authenticatedOrNot,function(req,resp){
    var name = req.params.name;
    console.log(connected[req.sessionID]._id + "..." + name);
    if(!requestExists(connected[req.sessionID]._id,name)){
        resp.send({error : "No such request!"});
        return;
    }else{

        usersManager.makeFriends(connected[req.sessionID]._id,name,function(err,res){
          if(err){
            console.log(err);
            resp.send({error : err});
          }
          else{


        usersManager.deleteRequest(connected[req.sessionID]._id,name,function(err,res){
          if(err){
            console.log(err);
          }

        });


        var con = false;

        connected[req.sessionID].friends.push(name);

        var status = isOnline(name);

        if(status.type == DESKTOP){
          addFriend(name,connected[req.sessionID]._id,DESKTOP);
		  var respp = getUpdateFriendsMessage(connected[req.sessionID]._id, true);
		  sendMessage(name, JSON.stringify(respp) + "\n", DESKTOP);
          con = true;
        }else if(status.type == BROWSER){
          addFriend(name,connected[req.sessionID]._id,BROWSER);
          conn = true;
        }

      }

      resp.send({
        connected : con
      });

    })
  }


});

app.get("/pictures/:name",function(req,res){


res.sendFile(__dirname + '/pictures/' + req.params.name );


});

app.get("/images/red.png",function(req,res){


res.sendFile(__dirname + '/images/red.png');


});



app.get("/images/green.png",function(req,res){


res.sendFile(__dirname + '/images/green.png');


});

app.post("/register",function(req,res){
    var us = {};
    console.log("body");
    console.log(req.body);
    us.name = req.body.username;
    us.pw = req.body.password;
    console.log("pw");
    console.log(req.body.password);

    if (req.files){

    // The name of the input field (i.e. "image") is used to retrieve the uploaded file
        var sampleFile = req.files.image;
        var extI = sampleFile.mimetype.indexOf('/') + 1;
        var ext = sampleFile.mimetype.substr(extI);

        us.picture = __dirname +'/pictures/' + us.name + ".png" ;
        console.log("ajung");
      fs.writeFile(us.picture,sampleFile.data,'binary',req.files.data,function(err,res){
        if(err){
          console.log("error write");
        }
      })


      }




    usersManager.checkName(us.name,function(err,resp){
      if(resp.found == 0){
        usersManager.addUser(us,function(err,resp){
          if(err){
            console.log(err);
          }else{
            console.log(us);
            res.redirect('/');
          }

        });
      }else{
        res.redirect('/register');
      }
    });

});

app.post("/login", passport.authenticate('local',{
    successRedirect: "/",
    failureRedirect : "/",
    succesFlash : { message :  "Welcome!" },
    failureFlash : { message : "Incorrect credentials" }
}));

app.get("/ejs.js", function(req,res){
  res.sendFile(__dirname +"/scripts/ejs.min.js");
});

app.get("/login.js",function(req,res){
  res.sendFile(__dirname +"/scripts/login.js");
});

app.get("/login.html",function(req,res){
  res.sendFile(__dirname +"/views/login.html");
});

app.get("/logout", function(req, res){
    req.logout();
    console.log("[DELETE]")
    delete usersConnected[connected[req.sessionID]._id];

    res.redirect("/");
});
//-----------------------express requests       --------------------------------



//-----------------------helper functions --------------------------------------
function authenticatedOrNot(req, res, next){
  if(req.isAuthenticated()){
    next();
  }else{
    var error = req.flash("error");
    var form  = '';
    if(error && error.length) {
      form = "Incorrect credentials!";
      console.log("{form} " + form);
      console.log(error);
    }

    res.render(__dirname +"/views/login.ejs",{m : form});
  }
}

//check if a request from user1 to user2 exists;
function requestExists(user2,user1){

  for(var id in connected){
    if(connected[id]._id == user2){
      var reqs = connected[id].requests;
      console.log(user2 + ":" + reqs);
      for(var i = 0; i < reqs.length; i++){
        console.log(reqs[i] + "...." + user1);
        if(reqs[i] == user1){
          console.log("asdasdsadasdsadsad");
          return true;
        }
      }
    }
  }

  console.log(user2 + "   user 1 : " + user1);

  if(desktopClients[user2] != undefined){
	  console.log("radu suge pula");
    var reqs = desktopClients[user2].requests;
    for(var i = 0; i < reqs.length; i++){
      if(reqs[i] == user1){
        return true;
      }
    }
  }

  return false;
}


//-----------------------helper functions --------------------------------------

http.listen(9090);

// ------------------------------------------------------------------------------



net.createServer(function (socket){
    socket.name = socket.remoteAddress + ":" + socket.remotePort;
    console.log("New client connected " + socket.name );

    socket.on("data", function (data){
        var json = JSON.parse(data.toString());
		console.log(data.toString());

		var type = json.type;
        if (type == SIGNIN)
        {
            var username = json.data.username;
			var password = json.data.password;
			console.log("New sign in attempt with credentials: " + username + " and " + password);
            var jsonResp = checkCredentials(username, password, socket, function(respJson)
			{
				console.log(respJson);
				socket.write(JSON.stringify(respJson) + "\n");
			});
		}
		else if (type == REGISTER)
		{
			var username = json.data.username;
			var password = json.data.password;
			var firstname = json.data.firstname;
			var lastname = json.data.lastname;
			console.log("New register attempt with username: " + username );
			var jsonResp = registerUser(username, password, function(respJson)
			{
				console.log(respJson);
				socket.write(JSON.stringify(respJson) + "\n");
			});
		}
		else if (type == LOGOUT)
		{
			console.log("logout");
			var username = json.data.username;

			if (desktopClients[username] != undefined)
			{
				tellMyFriendsImGone(username, false, DESKTOP);
				delete desktopClients[username];
			}
		}
		else if (type == SEND_FRIEND_REQUEST)
		{
			var username_from = json.data.from;
			var username_to = json.data.to;
			console.log("Friend request sent from: " + username_from + " to: " + username_to);

			sendFriendRequest(username_from, username_to);
		}
		else if (type == SEND_FRIEND_REQUEST_ANSWER)
		{
			var username_from = json.data.from;
			var username_to = json.data.to;
			var accept = json.data.accept;
			console.log("Friend request answer from: " + username_from + " to:" + username_to + " accept: " + accept);

			usersManager.deleteRequest(username_from, username_to, function(err, resp) {} );

			if (accept == true)
			{
				addFriend(username_from, username_to, DESKTOP);
				usersManager.makeFriends(username_from, username_to, function(err, res) {} );

				var userStatus = isOnline(username_to);
				if (userStatus.type == DESKTOP)
				{
					addFriend(username_to, username_from, userStatus.type);
					var respJson = getUpdateFriendsMessage(username_from, true);
					sendMessage(username_to, JSON.stringify(respJson) + "\n", userStatus);
				}
				else if (userStatus.type == BROWSER)
				{
					addFriend(username_to, username_from, userStatus.type);
					userStatus.socket.emit("user accept", username_from);
				}
				var respJson = getUpdateFriendsMessage(username_to, userStatus != OFFLINE);
				sendMessage(username_from, JSON.stringify(respJson) + "\n", DESKTOP);
			}
			else
			{
				var userStatus = isOnline(username_to);
				if (userStatus.type == DESKTOP)
				{
					console.log("user declined : " + username_from);
				}
				else if (userStatus.type == BROWSER)
				{
					userStatus.socket.emit("user decline", username_from);
				}
			}
		}
		else if (type == SEND_MESSAGE)
		{
			var username_from = json.data.from;
			var username_to = json.data.to;
			var message = json.data.message;

			json.data.date = new Date();
			console.log("Mesajul de la desktop este " + JSON.stringify(json));

			console.log("Sending message from: " + username_from + " to: " + username_to + " message: " + message);

			messagesManager.addMessages([json.data], function(err, res){} );

			var userStatus = isOnline(username_to);
			if (userStatus.type == DESKTOP)
			{
				var respJson = getReceiveMessageJson(username_from, username_to, message);
				sendMessage(username_to, JSON.stringify(respJson) + "\n", userStatus);
			}
			else if (userStatus.type == BROWSER)
			{
				userStatus.socket.emit("chat message", json.data);
			}
		}

    });

    socket.on("end", function (){
        console.log("Client disconnected " + socket.name);
    });

	socket.on("close", function(had_error){
        console.log("Client disconnected " + socket.name);
	});

	socket.on("error", function(error){
		console.log(error);
	});

}).listen(43210);

console.log("Server listening on 43210 port !!");

function isOnline (username) // common function
{
	if (desktopClients[username] != undefined)
	{
		return {type :  DESKTOP};
	}
	else
	{
		for(var id in connected)
		{
			if(connected[id]._id == username)
			{
				return {type : BROWSER, socket : connected[id].socket};
			}
		}
	}
	return {type : OFFLINE};
}

function sendMessage(username, message, type)
{
	if (type == DESKTOP)
	{
		desktopClients[username].socket.write(message);
	}
	else if (type == BROWSER)
	{

	}
}

function addFriendRequest(username_to, username_from, type)
{
	if (type == DESKTOP)
	{
		desktopClients[username_to].requests.push(username_from);
	}
	else if (type == BROWSER)
	{
    for(var id in connected){
      if(connected[id]._id == username_to){
        connected[id].requests.push(username_from);
        connected[id].socket.emit("new request", username_from);
      }
    }

	}
}

function addFriend(username, friend_username, type)
{
	if (type == DESKTOP)
	{
		desktopClients[username].friends.push(friend_username);
	}
	else if (type == BROWSER)
	{
    for(var id in connected){
      if(connected[id]._id == username){
        connected[id].socket.emit("user accept",friend_username);
        connected[id].friends.push(friend_username);
      }
    }
	}
}

function checkCredentials(username, password, socket, callback)
{
	var user;
	var resp = {};
	resp.type = SIGNIN;
	var respData = {};
    usersManager.findUser({_id: username},
		function(err,res)
		{
			user = res[0];
			if(user == undefined || user.pw != password)
			{
				respData.valid = false;
				resp.data = respData;
				callback(resp);
			}
			else
			{
				user.socket = socket;
				desktopClients[username] = user;

				var friendsArray = user.friends;
				var requestArray = user.requests;
				var jsonFriendsArray = [];
				var jsonRequestArray = [];
				for (var index = 0; index < friendsArray.length; index++)
				{
					var friend = {};
					friend.username = friendsArray[index];
					var userStatus = isOnline(friend.username);
					if (userStatus.type != OFFLINE)
					{
						friend.online = true;
					}
					else
					{
						friend.online = false;
					}
					jsonFriendsArray.push(friend);
				}


				for (var index = 0; index < requestArray.length; index++)
				{
					var request = {};
					request.username = requestArray[index];
					jsonRequestArray.push(request);
				}


				tellMyFriendsImGone(username, true, DESKTOP);

				respData.valid = true;
				respData.username = username;
				respData.friends = jsonFriendsArray;
				respData.requests = jsonRequestArray;
				resp.data = respData;
				callback(resp);
			}
		});
}

function registerUser(username, password, callback)
{
	var respj = {};
	respj.type = REGISTER;
	var respData = {};
    usersManager.checkName(username,function(err, resp)
		{
			if(resp.found == 0)
			{
				var us = {};
				us.name = username;
				us.pw = password;
				usersManager.addUser(us, function(err,resp)
					{
						if(err)
						{
							respData.valid = false;
						}
						else
						{
							respData.valid = true;
						}
						respj.data = respData;
						callback(respj);
					});
			}
			else
			{
				respData.valid = false;
				respj.data = respData;
				callback(respj);
			}
		});
}

function tellMyFriendsImGone(username, online, type)
{
  if(type == DESKTOP)
  {
  	var friendsArray = desktopClients[username].friends;

  	for (var index = 0; index < friendsArray.length; index++)
  	{
		var userStatus = isOnline(friendsArray[index]);
		if (userStatus.type == DESKTOP)
		{
			var respJson = getUpdateFriendsMessage(username, online);
  			desktopClients[friendsArray[index]].socket.write(JSON.stringify(respJson) + "\n");
		}
		else if (userStatus.type == BROWSER)
		{
			if( online == true )
			{
				console.log("online " + username);
				userStatus.socket.emit("friend connected", username);
			}
			else
			{
				userStatus.socket.emit("friend disconnected", username);
			}
		}
  	}
  }else if(type == BROWSER){

      var user = undefined;

      /*friend connected username*/
      for(var id in connected){
        console.log(connected[id]._id + "...." +username);
		if(connected[id]._id == username){
          user = connected[id];
        }
      }
      if(user == undefined){
        console.log("[ERROR]( in tell my friends im gone | type = BROWSER ) : can't find " + username);
      }

      var arrayOfFriends = user.friends;
      for ( var index = 0; index < arrayOfFriends.length; index++ ){
        var friend = arrayOfFriends[index];
        var status = isOnline(friend);
        var type = status.type;
        if (type == DESKTOP){
          sendMessage(friend, JSON.stringify(getUpdateFriendsMessage(username, online)) + '\n', DESKTOP);
        }
        else if (type == BROWSER){
          if( online == true ){
            status.socket.emit("friend connected", username);
          }else{
            status.socket.emit("friend disconnected", username);
          }
        }
      }
  }
}

function getUpdateFriendsMessage(username, online, type)
{
	var resp = {};
	var respData = {};

	respData.username = username;
	respData.online = online;

	resp.type = UPDATE_FRIENDS;
	resp.data = respData;

	return resp;
}

function sendFriendRequest(username_from, username_to)
{

	usersManager.checkName(username_to, function(err, resp)
		{
			if(resp.found == 0)
			{
				var userStatus = isOnline(username_from);
				if (userStatus.type == DESKTOP)
				{
					respJson = getFriendRequestFailedMessage();
					sendMessage( username_from, JSON.stringify(respJson) + "\n", userStatus);
				}
			}
			else
			{
				usersManager.addRequest(username_to, username_from, function(err, res){});
				var userStatus = isOnline(username_to);
				if (userStatus.type == DESKTOP)
				{
					respJson = getFriendRequestMessage(username_from);
					addFriendRequest(username_to, username_from, userStatus.type);
					sendMessage(username_to, JSON.stringify(respJson) + "\n", userStatus.type);
				}
				else if (userStatus.type == BROWSER)
				{
					addFriendRequest(username_to, username_from, userStatus.type);

				}
			}
		});
}

function getFriendRequestMessage(username)
{
	var resp = {};
	var respData = {};
	respData.username = username;

	resp.type = FRIEND_REQUEST;
	resp.data = respData;

	return resp;
}

function getFriendRequestFailedMessage()
{
	var resp = {};
	resp.type = FRIEND_REQUEST_FAILED;

	return resp;
}

function getReceiveMessageJson(username_from, username_to, message)
{
	var resp = {};
	var respData = {};
	respData.from = username_from;
	respData.to = username_to;
	respData.message = message;

	resp.type = RECEIVE_MESSAGE;
	resp.data = respData;

	return resp;
}
