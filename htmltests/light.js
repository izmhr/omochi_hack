var canvas, stage;
var circle;
// var text;
var update = true;
var canvasHalfW, canvasHalfH;
var r;

function init()
{
  $(window).on('touchmove', function(e){
    e.preventDefault();
  });
  // get a reference to the canvas we'll be working with:
  canvas = document.getElementById("testCanvas");

  // create a stage object to work with the canvas. This is the top level node in the display list:
  stage = new createjs.Stage(canvas);

  // enable touch interactions if supported on the current device:
  createjs.Touch.enable(stage);

  // Create a new Text object:
  // text = new createjs.Text("Hello World!", "36px Arial", "#fff");
  // text.textAlign = 'center';
  // text.textBaseline = 'middle';

  circle = new createjs.Shape();
  r = 100;
  var g = circle.graphics.beginFill('#fff').drawCircle(canvasHalfW, canvasHalfH, r);

  circle.on('pressmove', function(e){
    r = (new Victor(e.stageX - canvasHalfW, e.stageY - canvasHalfH)).length();
    circle.graphics.clear().beginFill('#0ff').drawCircle(canvasHalfW, canvasHalfH, r);
    console.log(r);
    update = true;
  });

  // add the text as a child of the stage. This means it will be drawn any time the stage is updated
  // and that its transformations will be relative to the stage coordinates:
  stage.addChild(circle);
  // stage.addChild(text);

  createjs.Ticker.addEventListener("tick", tick);

  window.onresize = resize;
  resize();

  var socket = io();
  var lightname;

  $('#makelight input').focus();

  $('.menu').hide();
  $('#makelight').submit(function(){
    $('.setup').fadeOut();
    $('.menu').fadeIn();

    lightname = $('#l').val();
    // text.text = lightname;
    $('.menu h2').text(lightname);
    update = true;
    socket.emit('make light', {value: lightname});
    return false;
  });

  $('.menu #back').on('touchend', function(){
    $('.setup').fadeIn();
    $('.menu').fadeOut();
  });

  socket.on('chat message', function(msg){
    // $('#messages').append($('<li>').text(msg));
    var color = msg;
    var rgb = 'rgb(' + color[0] + ', ' + color[1] + ', ' + color[2] + ')';
    circle.graphics.clear().beginFill(rgb).drawCircle(canvasHalfW, canvasHalfH, r);
    update = true;
  });

  socket.on('bg change', function(data){
    var id = data;
    console.log('bg change');
    $('body').attr('id', id);
  });

  window.onbeforeunload = function(){
    socket.emit('destroy light', {value: lightname});
    alert('onunload');
  }
}

function resize() {
  canvas.width = window.innerWidth; //document.width is obsolete
  canvas.height = window.innerHeight; //document.height is obsolete
  canvasHalfW = canvas.width/2;
  canvasHalfH = canvas.height/2;

  // position the text on screen, relative to the stage coordinates:
  // text.x = canvasHalfW;
  // text.y = canvasHalfH;

  circle.graphics.clear().beginFill('#0ff').drawCircle(canvasHalfW, canvasHalfH, r);

  console.log(canvas.width + ", " + canvas.height);

  update = true;
}

function tick(event) {
  // this set makes it so the stage only re-renders when an event handler indicates a change has happened.
  if (update) {
    update = false; // only update once
    stage.update(event);
  }
}

$(init);