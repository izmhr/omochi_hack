function init(){
  console.log(window.innerWidth);
  if(window.innerWidth > 480) {
    var $youtube = $('iframe');
    $youtube.width(480);
    $youtube.height(270);
    console.log('width over 480');
  }
};

$(init);