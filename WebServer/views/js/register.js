	var submit = false;
	var imaget = false;

	$("#username").focusout(function(ev){
		var name = $("#username").val();
		$.get("/check/"+name,function(data){
			if(data.found == 1){
				alert("Name already in use");
				submit = false;
			}else{
				submit = true;
			}
		})

	});

	$("#uploadForm").submit(function( event ) {


		var username = document.getElementById('username').value;
		var pass = document.getElementById('password').value;
		var pass2 = document.getElementById('password2').value;
		if ( username=='' || pass =='' || pass2=='')
		{
			alert('All the fields are mandatory!');
			event.preventDefault();
			return;
		}

		if(username.length < 6 || pass.length < 6){
			alert("username and password should be at least 5 characters long");
			event.preventDefault();
			return;
		}

		if ( pass.localeCompare(pass2) !=0 )
		{
			alert('The passwords must match!');
			event.preventDefault();
			return;
		}

		if(submit == false)	{
			alert("Username already in use");
			event.preventDefault();
			return;
		}


		if(imaget == false){
			alert("something wrong with the image");
			event.preventDefault();
			return;
		}




		document.getElementById('password').value = pass.hashCode();
	});

	$(function () {
		var _URL = window.URL || window.webkitURL;
		var ok = false;
		$("#image").change(()=>{
			var image;
			var fileInput = $(this).find("input[type=file]")[0],
				 file = fileInput.files && fileInput.files[0];
			if (file) {

					image = new Image();

					image.onload = function() {


							if(this.width > 800 || this.height > 800){
								alert("Image too large");
								imaget = false;
							}else if(file.size > 4000 *1024){
								alert("Image too big");
								imaget = false;
							}
							console.log("asdadas");
							imaget = true;
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
