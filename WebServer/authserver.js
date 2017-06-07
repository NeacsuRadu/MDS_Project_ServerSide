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

  console.log(socket);

  var index = socket.handshake.headers.cookie.indexOf('connect.sid=s%3A');
  index += 16;

  connected[socket.handshake.headers.cookie.substr(index,32)].socket = socket;

  var user = connected[socket.handshake.headers.cookie.substr(index,32)];
  console.log(socket.handshake.headers.cookie.substr(index,32));

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
    //delete connected[socket.handshake.headers.cookie.substr(16,32)];

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

      var user ;
      usersManager.findUser({_id: username},function(err,res){
        user = res[0];

        if(user == undefined){
            return done(null, false,{message : "Incorrect credentials." });
        }else{

        if(user._id == username){
          if(user.pw == password){
            usersConnected[username] = user;
            return done(null, user);
          }
        }

        }

      });


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
  usersConnected[req.user._id].session = req.sessionID;
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

    var sends = res[0].friends;
    var ob = {};

    for(var i = 0; i < sends.length; i++){
      ob[sends[i]] = false;
      for(var id in connected){
        if(connected[id]._id == sends[i]){
          ob[sends[i]] = true;
        }
      }
    }


    resp.send(ob);
  });
});

app.get("/user/:nume",function(req,resp){
  var name =  req.params.nume;
  usersManager.checkName(name,function(err,res){
    if(res.found == 0){
      resp.send({succ : false});
    }else{
      usersManager.makeFriends(connected[req.sessionID]._id,name,function(err,res){
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
      })
      resp.send({succ : true});
    }
  });
});

app.get("/register", function(req,res){
    res.sendFile(__dirname +"/views/register.html");
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

    console.log(req.files);

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
//-----------------------helper functions --------------------------------------

http.listen(9090);
