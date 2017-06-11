	var submituser = false;
	var submitpw1 = false;
	var submitpw2 = false;
	var imaget = false;

	$(function () {
		var _URL = window.URL || window.webkitURL;
		var ok = false;


			$("#username").focusout(function(ev){
				var name = $("#username").val();
				if(name.length < 5){
					$("#userF").addClass("has-error");
					$("#helpBlock2").text("Username should be atleast 5 characters long");
					submituser = false;
					return;
				}else{
					$("#userF").removeClass("has-error");
					$("#userF").addClass("has-success");
					$("#helpBlock2").html("&nbsp");
					submituser = true;
				}
				$.get("/check/"+name,function(data){
					if(data.found == 1){
						$("#userF").addClass("has-error");
						$("#helpBlock2").text("Username already in use");
						submituser = false;
					}else{
						$("#userF").removeClass("has-error");
						$("#userF").addClass("has-success");
						$("#helpBlock2").html("&nbsp");
						submituser = true;
					}
				})

			});

			$("#password").focusout(function(ev){
				var pw = $("#password").val();
				if(pw.length < 6){
					$("#userP").addClass("has-error");
					$("#helpBlock3").text("Password should be atleast 6 characters long");
					submitpw1 = false;
				}else{
					$("#userP").removeClass("has-error");
					$("#userP").addClass("has-success");
					$("#helpBlock3").html("&nbsp");
					submitpw1 = true;
				}
			});


				$("#password2").focusout(function(ev){
					var pw = $("#password2").val();
					console.log(pw + "...." + $("#password").val());
					if(pw != $("#password").val()){
						$("#userP1").addClass("has-error");
						$("#helpBlock4").text("Passwords should be the same");
						submitpw2 = false;
					}else{
						$("#userP1").removeClass("has-error");
						$("#userP1").addClass("has-success");
						$("#helpBlock4").html("&nbsp");
						submitpw2 = true;
					}
				});


			$("#uploadForm").submit(function( event ) {


				if(!submituser || !submitpw1 || !submitpw2 || !imaget){
					$("#subm").addClass("has-error");
					$("#helpBlock6").text("Something is wrong with your form");
					event.preventDefault();
					return;
				}




				document.getElementById('password').value = document.getElementById('password').value.hashCode();

			});



		$("#image").change(()=>{
			var image;
			var fileInput = $(this).find("input[type=file]")[0],
				 file = fileInput.files && fileInput.files[0];
			if (file) {

					image = new Image();

					image.onload = function() {


							if(this.width > 800 || this.height > 800){
								$("#imag").addClass("has-error");
								$("#helpBlock5").text("Image too large");
								imaget = false;
							}else if(file.size > 400 *1024){
								$("#imag").addClass("has-error");
								$("#helpBlock5").text("Image too big");
								imaget = false;
							}else{
								imaget = true;
								$("#imag").removeClass("has-error");
								$("#imag").addClass("has-success");
								$("#helpBlock5").html("&nbsp");
							}
					};
					image.width = 30;
					image.height = 30;
					image.src = _URL.createObjectURL(file);
					$("#img").empty();
					$("#img").append(image);

			}
		});
	});

	String.prototype.hashCode = function() {
  var hash = 0, i, chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};
