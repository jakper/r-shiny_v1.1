$(document).ready(function(){
  if ($('html').attr('class')=='shiny-busy') {
    setTimeout(function() {
      if ($('html').attr('class')=='shiny-busy') {
        $('img#loading').show()
      }
    }, 1000)
  } else {
    $('img#loading').hide();
  }
});
