var mongodb = require('mongodb').MongoClient,
    assert = require('assert');


var usersManager = function(){};
var messagesManager = function(){};
var initializer = function(){};


   // messages are stored as:


   /*
    {
        _id     : --- default (given by the database)
        to      : --- string  (name of the receiving user)
        from    : --- string  (name of the sender user)
        message : --- string  (actual message)
        date    : --- Date object
    }
   */


      // !!!!! Important !!!!!

      // checks about the existence of the from and to users, as well as
      // the potential empty messages should be made before the function caslls




    // users are stored as:

    // !!!!! Important !!!!!

    // checks about the username and password constraints should be made by
    // the server before every function call


    /*
     {
         _id     : --- string  (this is the name of the user!!! -- it is used as
                                id for simplicity and for the unique constraint)
         pw      : --- string  (the password)
         friends : --- array!   (string reprezenting friends)
     }
    */


/*
    messages.insertOne({to : "nu", from : "da", message : "abc" , date : new Date("October 13, 2014 11:13:01")});

    messages.insertOne({to : "nu", from : "da", message : "abc" , date : new Date("October 13, 2014 11:13:02")});

            messages.insertOne({to : "da", from : "nu", message : "abc" , date : new Date("October 13, 2014 11:13:03")});

                messages.insertOne({to : "da", from : "nu", message : "abc" , date : new Date("October 13, 2014 11:13:04")});

                    messages.insertOne({to : "da", from : "nu", message : "abc" , date : new Date("October 13, 2014 11:13:05")});

                        messages.insertOne({to : "da", from : "nu", message : "abc" , date : new Date("October 13, 2014 11:13:06")});

                            messages.insertOne({to : "da", from : "nu", message : "abc" , date : new Date("October 13, 2014 11:13:06")});

  messages.find({}).sort({date : -1}).toArray(function(err,res){
    console.log("crescator");
    console.log(res);
  });

    messages.find({}).sort({date : 1}).toArray(function(err,res){
      console.log("descrescator: ")
      console.log(res);
    });


var um = new usersManager();
var mm = new messagesManager();

mm.getMessages({to : "da",from: "nu"},function(err,res){
  console.log(res);
});

messages.find({}).toArray(function(err,res){
  console.log("descrescator: ")
  console.log(res);
});
*/

usersManager.prototype.setUsers = function(users){
  this.users = users;
}


messagesManager.prototype.setMessages = function(messages){
  this.messages = messages;
}

usersManager.prototype.checkName = function(name, callback){
  this.users.find({_id : name}).toArray(function(err,res){
      if(err){
        callback(err,{found : 0});
      }else{
        if(res[0]){
          callback(err,{found : 1});
        }else{
          callback(err,{found : 0});
        }
      }
  });
}

usersManager.prototype.addRequest = function(user,name,callback){

  this.users.update({_id : user},{$addToSet : {requests : name}},(err,res) =>{
    callback(err,res);
  });

}


usersManager.prototype.makeFriends = function(user,name,callback){

  this.users.update({_id : user},{$addToSet : {friends : name}},(err,res) =>{
    this.users.update({_id : name},{$addToSet : {friends : user}},function(err,res){
      callback(err,res);
    });
  });
}

usersManager.prototype.addUser = function(user, callback){
  this.users.insertOne({_id : user.name,
                    pw : user.pw,
                    friends : [],
                    requests : []}, function(err, res){
                                      if(err){
                                        callback(err,res);
                                      }else{
                                        callback(err,res);
                                      }
                                    });
}

usersManager.prototype.findUser = function(user, callback){
  this.users.find(user).toArray( function(err, res){
    if(err){
      callback(err,res);
    }else{
      callback(err,res);
    }
  });
}

// antet = {
//  from : "username of the client",
//  to : "username of the conversation partener"
//  }

// res will have the form of a message object.
// this function will only return

messagesManager.prototype.getNthSetOfMessages = function(antet,nth,callback){
  if(nth < 0  || nth == undefined, isNaN(nth)){
    callback({error : "bad_nth",
              message: "bad set index provided (undefined , < 0 , or NaN)"
              },[]);
  }
  this.messages.find({$or : [antet,{to : antet.from, from: antet.to}]})
          .skip(nth*30).sort({date : 1})
          .limit(30)
          .toArray( function(err, res){
                    if(err){
                      callback(err,res);
                    }else{
                      callback(err,res);
                    }
                  });
}

messagesManager.prototype.getMessages = function(antet,callback){
  this.getNthSetOfMessages(antet,0,callback);
}

messagesManager.prototype.addMessages = function(messagesToAdd, callback){
  this.messages.insertMany(messagesToAdd,function(err, res){
    if(err){
      callback(err,res);
    }if(messagesToAdd.length != res.insertedCount){
      callback({error:'could_not_insert',
                message: "could not insert every item. Maybe the database is full"
                },res);
    }else{
      callback(err,res);
    }
  });
}


exports.usersManager = new usersManager();
exports.messagesManager = new messagesManager();
exports.initializer = new initializer();
