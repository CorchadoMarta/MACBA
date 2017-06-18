$(document).ready(function() {
  $('.menu-burguer2').click(function() {
    $('.nav-menu').toggleClass('nav-menu-visible');
      if ($('.menu-burguer2').hasClass('open')) {
        $('.menu-burguer2').removeClass('open');
      } else {
        $('.menu-burguer2').addClass('open');
      }
  });
});
