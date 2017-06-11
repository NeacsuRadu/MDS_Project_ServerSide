
  $("#log").submit(function(event){
    if($("#password").val() == "" || $("#username").val() == ""){
      $("#helpBlock6").text("Missing credentials!");
      event.preventDefault();
      return;
    }
    $("#password").val($("#password").val().hashCode());

  })

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
