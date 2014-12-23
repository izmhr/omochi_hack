function init()
{
  $(window).on('touchmove mousemove', function(e){
    e.preventDefault();
  });

  // var bgs_height = $('body').height() - $('.header').height();
  // $('.bgs').height(bgs_height);

  $('#joinlight input').focus();

  var socket = io();

  // タブレットの場合
  $('.color_wheel').on('touchmove', function(event){
    // event.preventDefault();
    if(!this.canvas){
      this.canvas = $('<canvas />')[0];
      this.canvas.width = this.clientWidth;
      this.canvas.height = this.clientHeight;
      var color_wheel = new Image();
      color_wheel.src = 'assets/cw_600.png';

      thiz = this;

      color_wheel.onload = function(){
        thiz.canvas.getContext('2d').drawImage(color_wheel, 0, 0, thiz.clientWidth, thiz.clientHeight);
        console.log('wrote image');
      };
    }

    var t = event.originalEvent.changedTouches[0];
    // console.log(t);
    var wheelShiftX = t.target.offsetLeft - t.target.offsetWidth/2;
    var wheelShiftY = t.target.offsetTop - t.target.offsetHeight/2;
    var pixelData = this.canvas.getContext('2d').getImageData(t.clientX - wheelShiftX, t.clientY - wheelShiftY, 1, 1).data;

    $('.output').html('R: ' + pixelData[0] + '<br>G: ' + pixelData[1] + '<br>B: ' + pixelData[2] + '<br>A: ' + pixelData[3] + '<br>x: ' + t.pageX + '<br>y: ' + t.pageY);

    // Socket
    socket.emit('chat message', pixelData);
    return false;
  });

  // PCの場合
  var $wheel = $('.color_wheel');
  $wheel.on('mousemove', function(event){
    // event.preventDefault();
    if(!this.canvas){
      this.canvas = $('<canvas />')[0];
      this.canvas.width = this.clientWidth;
      this.canvas.height = this.clientHeight;
      var color_wheel = new Image();
      color_wheel.src = 'assets/cw_600.png';

      thiz = this;

      color_wheel.onload = function(){
        thiz.canvas.getContext('2d').drawImage(color_wheel, 0, 0, thiz.clientWidth, thiz.clientHeight);
        console.log('wrote image');
      };
    }

    var pixelData = this.canvas.getContext('2d').getImageData(event.clientX - $wheel.offset().left, event.clientY - $wheel.offset().top, 100, 1, 1).data;
    $('.output').html('R: ' + pixelData[0] + '<br>G: ' + pixelData[1] + '<br>B: ' + pixelData[2] + '<br>A: ' + pixelData[3] + '<br>x: ' + event.clientX + '<br>y: ' + event.clientY);

    // // Socket
    socket.emit('chat message', pixelData);
    return false;
  });

  $('.header').hide();
  $('#back').on('click', function() {
    $('.setup').fadeIn();
    $('.header').fadeOut();
  });
  $('#auto').on('click', function() {
    console.log('auto');
    socket.emit('auto');
  })

  $('#backhome').submit(function(){
    return true;
  });

  $('.bg_candidate').on('click', function(event){
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

  $('.msg').hide();
  $('#connectlight').submit(function(){
    var lightname = $('#l').val();
    if(lightname == ''){
      $('.msg').text('PLEASE INPUT OMOCHI NAME').fadeIn(200).delay(2000).fadeOut();
      return false;
    }
    socket.emit('connect light', {value: lightname});
    return false;
  });

  socket.on('connectresult', function(ret){
    if(ret.res == 'self'){
      $('.setup').fadeOut();
      $('.header').fadeIn();   
    }else if(ret.res == true) {
      $('#lightname').text(ret.lightname);
      $('.setup').fadeOut();
      $('.header').fadeIn();
    } else {
      $('.msg').text('NO SUCH OMOCHI HERE').fadeIn(200).delay(2000).fadeOut();
    }
  });

  socket.on('destroyed', function(){
    console.log('connected light is destroyed');
    $('.setup').fadeIn();
    $('.header').fadeOut();
    socket.emit('leave light');
  });
}

$(init);