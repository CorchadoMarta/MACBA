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

    $(function(){
			var email = $("#email");
			var name = $("#name");

			function validate(field){
				if(field.val().length === 0){
					field.removeClass().addClass("error");
					field.next().removeClass().addClass("icon-warning-sign");
				}else{
					field.removeClass().addClass("success");
					field.next().removeClass().addClass("icon-ok");
				}
				return field;
			}

			$('input').blur(function(){
				validate($(this));
			});

			$("button").on("click" , function(){
				validate(email);
				validate(name);
				if($(email).val().length === 0 || $(name).val().length === 0)
					$(this).removeClass().addClass("submit-error");
				else{
					$(this).removeClass().addClass("submit-success");
				}
				window.setTimeout(function(){
					console.log("done");
					$("button").removeClass();
				}, 3000)
				return false;
			});

    });
    // display the first div by default.
    $("#accordion div").first().css('display', 'block');
    // Get all the links.
    var link = $("#accordion a");
    // On clicking of the links do something.
    link.on('click', function(e) {
      e.preventDefault();
      var a = $(this).attr("href");
      $(a).slideDown('fast');
      //$(a).slideToggle('fast');
      $("#accordion div").not(a).slideUp('fast');
      $(".crossRotate").toggleClass('active');
    });
});

jQuery(document).ready(function ($) {

  $('#checkbox').change(function(){
    setInterval(function () {
        moveRight();
    }, 3000);
  });

	var slideCount = $('#slider ul li').length;
	var slideWidth = $('#slider ul li').width();
	var slideHeight = $('#slider ul li').height();
	var sliderUlWidth = slideCount * slideWidth;

	$('#slider').css({ width: slideWidth, height: slideHeight });

	$('#slider ul').css({ width: sliderUlWidth, marginLeft: - slideWidth });

    $('#slider ul li:last-child').prependTo('#slider ul');

    function moveLeft() {
        $('#slider ul').animate({
            left: + slideWidth
        }, 200, function () {
            $('#slider ul li:last-child').prependTo('#slider ul');
            $('#slider ul').css('left', '');
        });
    };

    function moveRight() {
        $('#slider ul').animate({
            left: - slideWidth
        }, 200, function () {
            $('#slider ul li:first-child').appendTo('#slider ul');
            $('#slider ul').css('left', '');
        });
    };

    $('a.control_prev').click(function () {
        moveLeft();
    });

    $('a.control_next').click(function () {
        moveRight();
    });

});
