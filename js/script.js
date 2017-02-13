$(document).ready(function(){
  $("#menu").hide();
  $(".hambur").click(function() {
    $("#menu").slideToggle( "slow", function() {
    $(".hambur").hide();
    });
  });
});
