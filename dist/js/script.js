$(document).ready(function(){

    $("#navToggle").click(function(e) {
        e.preventDefault();
        e.stopPropagation();

        $(".navbar ul").slideToggle( "slow");
    });

    $('.maps').click(function () {
    $('.maps iframe').css("pointer-events", "auto");
    });

    $( ".maps" ).mouseleave(function() {
      $('.maps iframe').css("pointer-events", "none");
    });
});
