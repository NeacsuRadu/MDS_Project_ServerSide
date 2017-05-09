var express = require('express'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    bodyParser = require('body-parser'),
    flash = require('express-flash');


var app = express();


var http = require('http').Server(app);
var io = require('socket.io')(http);


io.on('connection', function(socket){

  console.log('avem un sobolan');

  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });

  socket.on('disconnect', function(){
    console.log('a iesit un sobolan');
  });


});


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


app.set('view engine', 'ejs');



// 1. secure user name and pass

var users = {
  "id123" : {id : 123, username : "x2009", password : "fuckriot12"},
  "id1" : {id : 1, username : "admin", password : "admin"}
};

// 2. configure passport-local to validate an incoming user and pw

passport.use(new LocalStrategy(
  function(username, password, done){
    for(userid in users){
      var user = users[userid];
      if(user.username == username){
        if(user.password == password){
          return done(null, user);
        }
      }
    }
      return done(null, false,{message : "Incorrect credentials." });
  }
));

// 3. serialize users

passport.serializeUser(function (user, done){
  if(users["id" + user.id]){
    done(null, "id" + user.id);
  }else{
    done(new Error("CANT_SERIALIZE_THIS_USER"));
  }
});

// 4. deserialize users

passport.deserializeUser(function (userId, done) {
  if(users[userId]){
    done(null, users[userId]);
  }else{
    done(new Error("that user does not exist"));
  }
});

app.get('/', authenticatedOrNot, function(req, res) {
  res.render('user.ejs', {name : req.user.username});
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


app.post("/login", passport.authenticate('local',{
    successRedirect: "/",
    failureRedirect : "/",
    succesFlash : { message :  "Welcome!" },
    failureFlash : true
}));



app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
});


function authenticatedOrNot(req, res, next){
  if(req.isAuthenticated()){
    next();
  }else{
    var error = req.flash("error");
    var form  = '';
    if(error && error.length) {
      form = error[0] + form;
    }

    res.render('login.ejs',{message : form});
  }
}

http.listen(8080);
