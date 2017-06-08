$(function () {
	var socket = io();

	var messagesWith = {};

	var user = $('#user').html();
	var userImage ;

	var friends = {};

	$.get('/friends',function(data){
	  var fr = data.ob;
	  var rq = data.requests;

	  for(var i in fr){
		var li = makeLI(i,fr[i]);
		$('.lp').append(li);
	  }

	  for(var i= 0; i < rq.length; i++){
		var li = makeRE(rq[i]);
		$('.lr').append(li);
	  }


	  var src = user;
	  var userImg = document.createElement('img');
	  if(src != undefined){
		userImg.src = '/pictures/' +src+".png";
		userImg.width = 30;
		userImg.height = 30;
	  }

	});


	socket.on("new request",function(friend){
	  newRequestHandler(friend);
	});


	socket.on("friend connected",function(friend){
	  userConnectedHandler(friend);
	});


	socket.on("friend disconnected",function(friend){
	  userDisconnectedHandler(friend);
	});

	socket.on("user accept",function(friend){
	  userAcceptHandler(friend);
	});


	socket.on("chat message", function(msg){

	  $('.lm').append('<li>' +
						  '<div class="media">' +
						  '  <div class="media-left media-top"> ' +
						  '    <img width="30" height="30" src=' + "/pictures/" + msg.from  + ".png"+ ' class="media-object"> ' +
						  '  </div> ' +
						  '  <div class="media-body"> ' +
						  '    <p class="msg">' + msg.message +'</p> ' +
						  '  </div> ' +
						  '</div> ' +
						'</li>');
	});

	var selectedFriend;
	var selectedFriendIndex = -1;


	$('#send').click(function(){
	  console.log($("#tts").val().length);
	  if($('#tts').val().length == 0 || selectedFriend == undefined){
		return;
	  }else{

		$('.lm').append('<li>' +
							'<div class="media">' +
							'  <div class="media-body"> ' +
							'    <p class="msgr msg">' + $("#tts").val() +'</p> ' +
							'  </div> ' +
							'  <div class="media-right media-top"> ' +
							'    <img width="30" height="30" src= ' + "/pictures/" + user + ".png" + ' class="media-object" > ' +
							'  </div> ' +
							'</div> ' +
						  '</li>');
		socket.emit("chat message", {to : $('#nume').text(),
									 from : user,
									 message : $('#tts').val(),
									 date : new Date()});
		$("#tts").val("");
	  }
	});

	$('.lp').on("click",'.pb',function (){


		var clicked = $(this);
		var nume = $('#nume');
		nume.html(clicked.html());

		$(".lm").empty();

		if(messagesWith[clicked.html()] == undefined){
		  $.get('/messages/'+clicked.text(),function(data){
			messagesWith[clicked.text()] = data;
			console.log(data);

			for(var i = 0; i < data.length; i++){
			  if(data[i].from == user){
				$('.lm').append('<li>' +
									'<div class="media">' +
									'  <div class="media-body"> ' +
									'    <p class="msgr msg">' + data[i].message +'</p> ' +
									'  </div> ' +
									'  <div class="media-right media-top"> ' +
									'    <img width="30" height="30" src=' + "/pictures/" + data[i].from + ".png" +' class="media-object" > ' +
									'  </div> ' +
									'</div> ' +
								  '</li>');
			  }else{
				$('.lm').append('<li>' +
									'<div class="media">' +
									'  <div class="media-left media-top"> ' +
									'    <img width="30" height="30" src='+ "/pictures/" + data[i].from + ".png" +' class="media-object"> ' +
									'  </div> ' +
									'  <div class="media-body"> ' +
									'    <p class="msg">' + data[i].message +'</p> ' +
									'  </div> ' +
									'</div> ' +
								  '</li>');
			  }
			}
		  });
		}else{
		  var data = messagesWith[clicked.html()];
		  for(var i = 0; i < data.length; i++){
			if(data[i].from == user){
			  $('.lm').append('<li>' +
								  '<div class="media">' +
								  '  <div class="media-body"> ' +
								  '    <p class="msgr msg">' + data[i].message +'</p> ' +
								  '  </div> ' +
								  '  <div class="media-right media-top"> ' +
								  '    <img width="30" height="30" src=' + "/pictures/" + data[i].from + ".png" +' class="media-object" > ' +
								  '  </div> ' +
								  '</div> ' +
								'</li>');
			}else{
			  $('.lm').append('<li>' +
								  '<div class="media">' +
								  '  <div class="media-left media-top"> ' +
								  '    <img width="30" height="30" src=' + "/pictures/" + data[i].from + ".png" +' class="media-object" > ' +
								  '  </div> ' +
								  '  <div class="media-body"> ' +
								  '    <p class="msg">' + data[i].message +'</p> ' +
								  '  </div> ' +
								  '</div> ' +
								'</li>');
			}
		  }
		}

		if(selectedFriend != undefined && selectedFriendIndex == $("li.pb").index(clicked)){
		  selectedFriend.removeClass('active');
		  selectedFriend = undefined;
		  selectedFriendIndex = -1;
		  nume.html("");
		  return;
		}
		clicked.addClass('active');


		if(selectedFriend == undefined){
		  selectedFriend = clicked;
		  selectedFriendIndex = $("li.pb").index(clicked);
		}else{
		  selectedFriend.removeClass('active');
		  selectedFriend = clicked;
		  selectedFriendIndex = $("li.pb").index(clicked);

		}
	});

	$('.searchb').click(function(){
	  var name = $('.searchf').val();
	  $.get('/user/' + name, function(res){
		if(res.succ == true){
		  alert("request sent");
		}else{
		  alert('no such user!');
		}
	  });

	});


});

function makeLI(name,on){
  var imgAv = document.createElement('img');


  var logged = document.createElement('img');
  var col;

  if(on){
	col = "green";
  }else{
	col = "red";
  }

  logged.className += "loggedStatus";
  logged.src = '/images/' + col + ".png";
  logged.height = 10;
  logged.width = 10;


  imgAv.src = '/pictures/' +  name + ".png";

  imgAv.width = 30;
  imgAv.height = 30;
  var li = $('<li class="list-group-item pb">').append(imgAv).append(name).append(logged);

  return li;
}


$("body").on('click','.accept',function(ev){
  console.log("daa");
  var name = $(this).parent().text();
  console.log(name);
  $.get('/make/'+name,function(data){
	if(data.error) return;
	var li = makeLI(name,data.connected);
	$('.lp').append(li);
	$.each($(".lr li"),function(index,elem){

	  if($(elem).text() == name){
		$(elem).parent().remove();
	  }
	});
  });


});

function makeRE(name){
  var imgAv = document.createElement('img');

  imgAv.src = '/pictures/' +  name + ".png";

  imgAv.width = 30;
  imgAv.height = 30;
  var li = $('<li class="list-group-item pb">').append(imgAv).append(name).append('<button type="button" class="btn btn-default accept" aria-label="Left Align">' +
  '<span class="glyphicon glyphicon-ok" aria-hidden="true"></span>' +
  '</button>').append('<button type="button" class="btn btn-default decline" aria-label="Left Align">' +
  '<span class="glyphicon glyphicon-remove" aria-hidden="true"></span>' +
  '</button>');

  return li;
}

function userAcceptHandler(friend){
  var li = makeLI(friend,true);
  $('.lp').append(li);
}

function newRequestHandler(friend){
  console.log("da");
  var li = makeRE(friend);
  $('.lr').append(li);
}

function userConnectedHandler(friend){
  $.each($(".lp li"),function(index,elem){
	console.log($(elem).text());
	if($(elem).text() == friend){
	  $(elem).find(".loggedStatus").attr("src","/images/green.png");
	}
  });
}

function userDisconnectedHandler(friend){
  $.each($(".lp li"),function(index,elem){
	console.log($(elem).text());
	if($(elem).text() == friend){
	  $(elem).find(".loggedStatus").attr("src","/images/red.png");
	}
  });
}