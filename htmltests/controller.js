function init()
{
  $(window).on('touchmove', function(e){
    e.preventDefault();
  });

  // var bgs_height = $('body').height() - $('.header').height();
  // $('.bgs').height(bgs_height);

  $('#joinlight input').focus();

  var socket = io();

  $('.color_wheel').on('touchmove', function(event){
    // event.preventDefault();
    if(!this.canvas){
      this.canvas = $('<canvas />')[0];
      this.canvas.width = this.width;
      this.canvas.height = this.height;
      this.canvas.getContext('2d').drawImage(this, 0, 0, this.width, this.height);
      // var color_wheel = new Image();
      // color_wheel.src = 'assets/cw_600.png';

      // thiz = this;

      // color_wheel.onload = function(){
      //   thiz.canvas.getContext('2d').drawImage(color_wheel, 0, 0, thiz.width, thiz.height);
      //   console.log('wrote image');
      // };
    }

    console.log(event);
    var t = event.originalEvent.changedTouches[0];
    // var wheelShiftX = t.target.x - t.target.width/2;
    // var wheelShiftY = t.target.y - t.target.height/2;
    // console.log(t, wheelShiftX);
    // var pixelData = this.canvas.getContext('2d').getImageData(t.clientX - wheelShiftX, t.clientY - wheelShiftY, 1, 1).data;
    var pixelData = this.canvas.getContext('2d').getImageData(200, 200, 1, 1).data;

    $('.output').html('R: ' + pixelData[0] + '<br>G: ' + pixelData[1] + '<br>B: ' + pixelData[2] + '<br>A: ' + pixelData[3] + '<br>x: ' + t.pageX + '<br>y: ' + t.pageY);

    // Socket
    socket.emit('chat message', pixelData);
    return false;
  });

$('.header').hide();
$('#back').on('touchend', function() {
  $('.setup').fadeIn();
  $('.header').fadeOut();
});

$('#backhome').submit(function(){
  return true;
});

$('.bg_candidate').on('touchend', function(event){
  var type = this.id;
  console.log('bg change' + type);
  socket.emit('bg change', type);
  return false;
});

$('#newinput').submit(function(){
  socket.emit('chat message', $('#m').val());
  $('#m').val('');
  return false;
});

$('#joinlight').submit(function(){
  $('.setup').fadeOut();
  $('.header').fadeIn();

  var lightname = $('#l').val();
  $('#lightname').text(lightname);
  socket.emit('join light', {value: lightname});
  return false;
});

  // socket.on('chat message', function(msg){
  //   $('#messages').append($('<li>').text(msg));
  // });

socket.on('destroyed', function(){
  $('#messages').append($('<li>').text('target light is destroyed'));
  socket.emit('leave light');
});
}

$(init);