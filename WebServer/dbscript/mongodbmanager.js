var mongodb = require('mongodb').MongoClient,
    assert = require('assert');

var url = 'mongodb://localhost:27017/test';

var db;
var users;
var messages;

mongodb.connect(url, function(err, response){
  if(err){
    console.log("Avem o eroare:");
    console.log(err);
    return;
  }
  db = response;


   messages = db.collection('messages');

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



   users = db.collection('users');


    // users are stored as:

    // !!!!! Important !!!!!

    // checks about the username and password constraints should be made by
    // the server before every function call


    /*
     {
         _id     : --- string  (this is the name of the user!!! -- it is used as
                                id for simplicity and for the unique constraint)
         pw      : --- string  (the password)
         friends : --- array   (string reprezenting friends)
     }
    */

    /*

    messages.insertOne({to : "da", from : "nu", message : "abc" , date : new Date("October 13, 2014 11:13:01")});

        messages.insertOne({to : "da", from : "nu", message : "abc" , date : new Date("October 13, 2014 11:13:02")});

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

*/

  addMessages([{to : "da", from : "nu", message : "abc" , date : new Date("October 13, 2014 11:13:01")},{to : "da", from : "nu", message : "abc" , date : new Date("October 13, 2014 11:13:01")},{to : "da", from : "nu", message : "abc" , date : new Date("October 13, 2014 11:13:01")}],
function(err,res){
  if(err){
    console.log(err);
  }else{
    console.log(res);
  }
});

messages.find({}).toArray(function(err,res){
  console.log("descrescator: ")
  console.log(res);
});

});

var usersManager = funtion(){};
var messagesManager = function(){};

usersManager.prototype.checkName = function(name, callback){
  users.find({_id : name}).toArray(function(err,res){
      if(err){
        callback(err);
        return;
      }else{
        if(res[0]){
          callback({found : 1});
        }else{
          callback({found : 0});
        }
      }
  });
}

usersManager.prototype.addUser = function(user, callback){
  users.insertOne(user, function(err, res){
    if(err){
      callback(err,res);
    }else{
      callback(err,res);
    }
  });
}

usersManager.prototype.findUser = function(user, callback){
  users.find(user).toArray( function(err, res){
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
    callback({error : "bad_nth", message: "bad set index provided (undefined , < 0 , or NaN)"},[]);
  }
  messages.find(antet).skip(nth*30).sort({date : -1}).limit(30).toArray( function(err, res){
    if(err){
      callback(err,res);
    }else{
      callback(err,res);
    }
  });
}

messagesManager.prototype.getMessages = function(antet,callback){
  getNthSetOfMessages(antet,0,callback);
}

messagesManager.prototype.addMessages = function(messagesToAdd, callback){
  messages.insertMany(messagesToAdd,function(err, res){
    if(err){
      callback(err,res);
    }if(messagesToAdd.length != res.insertedCount){
      callback({error:'could_not_insert', message: "could not insert every item. Maybe the database is full",res})
    }else{
      callback(err,res);
    }
  });
}


exports.usersManager = new usersManager();
exports.messagesManager = new messagesManager();
