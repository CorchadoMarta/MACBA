$(document).ready(function() {
  $('.menu-burguer2').click(function() {
    $('.nav-menu').toggleClass('nav-menu-visible');
      if ($('.menu-burguer2').contains('open')) {
        $('.menu-burguer2').classList.remove('open');
      } else {
        $('.menu-burguer2').classList.add('open');
      }
  });
});
