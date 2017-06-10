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




  for(var id in connected){
    var friends = connected[id].friends;
    for(var i = 0; i < friends.length; i++){
      if(friends[i] == user._id){
        connected[id].socket.emit("friend connected",friends[i]);
      }
    }
  }


  socket.on('chat message', function(msg){

    messagesManager.addMessages([msg],function(err,res){

      for(var id in connected){

        if(connected[id]._id == msg.to){
          connected[id].socket.emit("chat message",msg);

        }
      }
    });

  });

  socket.on('disconnect', function(){


    for(var id in connected){
      var friends = connected[id].friends;
      for(var i = 0; i < friends.length; i++){
        if(friends[i] == user._id){
          connected[id].socket.emit("friend disconnected",friends[i]);
        }
      }
    }

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
      for(var id in connected){
        if(connected[id]._id == sends[i]){
          obi.ob[sends[i]] = true;
        }
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
          for(var id in connected){
            if(connected[id]._id == name){
              conn = true;
              console.log("emit la " + connected[id]._id);
              connected[id].requests.push(connected[req.sessionID]._id);
              connected[id].socket.emit("new request",connected[req.sessionID]._id);
            }
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

app.get("/user.js", function(req,res) {
  res.sendFile(__dirname +"/views/js/user.js");
});

app.get("/login.js", function(req,res) {
  res.sendFile(__dirname +"/views/js/login.js");
});

app.get("/register.js", function(req,res) {
  res.sendFile(__dirname +"/views/js/register.js");
});

app.get("/StyleUser.css", function(req,res) {
  res.sendFile(__dirname +"/views/css/StyleUser.css");
});

app.get("/StyleRegister.css", function(req,res) {
  res.sendFile(__dirname +"/views/css/StyleRegister.css");
});

app.get("/StyleLogin.css", function(req,res) {
  res.sendFile(__dirname +"/views/css/StyleLogin.css");
});


app.get("/peisaj.jpg", function(req,res) {
  res.sendFile(__dirname +"/views/images/peisaj.jpg");
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


        for(var id in connected){
          if(connected[id]._id == name){
            connected[id].socket.emit("user decline",connected[req.sessionID]._id);
          }
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

        for(var id in connected){
          if(connected[id]._id == name){
            con = true;
            connected[id].socket.emit("user accept",connected[req.sessionID]._id);
            connected[id].friends.push(connected[req.sessionID]._id);
          }
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
    failureFlash : true
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
      form = error[0] + form;
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
  return false;
}


//-----------------------helper functions --------------------------------------

http.listen(9090);

// ------------------------------------------------------------------------------

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

			tellMyFriendsImGone(username, false);

			delete desktopClients[username];
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
				if (userStatus != OFFLINE)
				{
					addFriend(username_to, username_from, userStatus);
					var respJson = getUpdateFriendsMessage(username_from, true);
					sendMessage(username_to, JSON.stringify(respJson) + "\n", userStatus);
				}
				var respJson = getUpdateFriendsMessage(username_to, userStatus != OFFLINE);
				sendMessage(username_from, JSON.stringify(respJson) + "\n", DESKTOP);
			}
			else 
			{
				// nothing momentan, trebuie sa facem un pop-up sau ceva in client :) 
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
		return DESKTOP;
	}
	return OFFLINE;
}

function sendMessage(username, message, type)
{
	if (type == DESKTOP)
	{
		desktopClients[username].socket.write(message);
	}
	else if (type == BROWSER)
	{
		// send message to browser client, george need to to this :) hi george
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
		// add friend to the browser client, george need to do this  :) hi george
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
					if (desktopClients[friendsArray[index]] != undefined)
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


				tellMyFriendsImGone(username, true);

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

function tellMyFriendsImGone(username, online)
{
	var friendsArray = desktopClients[username].friends;

	for (var index = 0; index < friendsArray.length; index++)
	{
		if (desktopClients[friendsArray[index]] != undefined)
		{
			var respJson = getUpdateFriendsMessage(username, online);
			desktopClients[friendsArray[index]].socket.write(JSON.stringify(respJson) + "\n");
		}
	}
}

function getUpdateFriendsMessage(username, online)
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
				if (userStatus != OFFLINE) 
				{
					respJson = getFriendRequestFailedMessage();
					sendMessage( username_from, JSON.stringify(respJson) + "\n", userStatus);
				}
			}
			else
			{
				usersManager.addRequest(username_to, username_from, function(err, res){});
				var userStatus = isOnline(username_to);
				if (userStatus != OFFLINE)
				{
					respJson = getFriendRequestMessage(username_from);
					addFriendRequest(username_to, username_from, userStatus);
					sendMessage(username_to, JSON.stringify(respJson) + "\n", userStatus);
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
