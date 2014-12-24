var canvas, stage;
var circle;
var update = true;
var canvasHalfW, canvasHalfH;
var r;
var rgb = 'rgb(0, 255, 255)';
var auto = true;
var hsv = {h: 0, s: 255, v: 255};

// 背景グラデーションに関する
var bgtimer;
var bgmax = 5;
var currentBGNo = 1;
var nextBGNo = 2;
var $currentBG = $('#bg' + currentBGNo);
var $nextBG = $('#bg' + nextBGNo);
var bgChangeInterval = 30000;
var bgGradationTime = 4000;

function init()
{
  $(window).on('touchmove mousemove', function(e){
    e.preventDefault();
  });
  // get a reference to the canvas we'll be working with:
  canvas = document.getElementById("testCanvas");

  // create a stage object to work with the canvas. This is the top level node in the display list:
  stage = new createjs.Stage(canvas);

  // enable touch interactions if supported on the current device:
  createjs.Touch.enable(stage);

  circle = new createjs.Shape();
  r = 100;
  var g = circle.graphics.beginFill('#fff').drawCircle(canvasHalfW, canvasHalfH, r);

  circle.on('pressmove', function(e){
    r = Math.sqrt( (e.stageX - canvasHalfW) * (e.stageX - canvasHalfW) + (e.stageY - canvasHalfH) * (e.stageY - canvasHalfH));
    circle.graphics.clear().beginFill(rgb).drawCircle(canvasHalfW, canvasHalfH, r);
    console.log(r);
    update = true;
  });

  // add the text as a child of the stage. This means it will be drawn any time the stage is updated
  // and that its transformations will be relative to the stage coordinates:
  stage.addChild(circle);

  createjs.Ticker.addEventListener("tick", tick);
  createjs.Ticker.setFPS(30);

  window.onresize = resize;
  resize();

  var socket = io();
  var lightname = '';

  $('#makelight input').focus();

  $('.menu').hide();
  $('.msg').hide();
  $('#makelight').submit(function(){
    var _lightname = $('#l').val();
    if(_lightname == ''){
      $('.msg').text('PLEASE INPUT OMOCHI NAME').fadeIn(200).delay(2000).fadeOut();
      return false;
    }
    socket.emit('make light', {value: _lightname});
    return false;
  });

  socket.on('make light result', function(ret){
    if(ret.res == 'self') {
      lightname = ret.lightname;
      $('.setup').fadeOut();
      $('.menu').fadeIn();
    }else if(ret.res == true){
      lightname = ret.lightname;
      $('.setup').fadeOut();
      $('.menu').fadeIn();
      $('.menu h2').text(lightname);
      update = true;
    } else {
      $('.msg').text('THE NAME IS ALREADY USED').fadeIn(200).delay(2000).fadeOut();
    }
  });

  $('.menu #back').on('click', function(){
    $('.setup').fadeIn();
    $('.menu').fadeOut();
  });

  socket.on('chat message', function(msg){
    auto = false;
    var color = msg;
    rgb = 'rgb(' + color[0] + ', ' + color[1] + ', ' + color[2] + ')';
    circle.graphics.clear().beginFill(rgb).drawCircle(canvasHalfW, canvasHalfH, r);
    update = true;
  });

  socket.on('bg change', function(id){
    console.log('bg change');

    $currentBG = $nextBG;

    // 現在と同じ物を使おうとした場合は何もしない
    if($nextBG.selector === ('#' + id)) return;
    $nextBG = $('#' + id);

    console.log($nextBG.selector);
    
    clearTimeout(bgtimer);
    $nextBG.css({opacity: 1.0, 'z-index': -2});
    $currentBG.css({opacity: 1.0, 'z-index': -1});
    $currentBG.transition({opacity: 0.0});
  });

  socket.on('auto', function(){
    auto = true;
    update = true;
    clearTimeout(bgtimer);
    setupBGGradation();
    setTimeout(startBGGradation, 1000);
  });

  window.onpagehide = destroylight;
  window.onbeforeunload = destroylight;

  function destroylight(){
    socket.emit('destroy light', {value: lightname});
  }

  setupBGGradation();
  setTimeout(startBGGradation, bgChangeInterval);
}

function resize() {
  canvas.width = window.innerWidth; //document.width is obsolete
  canvas.height = window.innerHeight; //document.height is obsolete
  canvasHalfW = canvas.width/2;
  canvasHalfH = canvas.height/2;

  circle.graphics.clear().beginFill('#0ff').drawCircle(canvasHalfW, canvasHalfH, r);

  console.log(canvas.width + ", " + canvas.height);

  update = true;
}

function tick(event) {
  // this set makes it so the stage only re-renders when an event handler indicates a change has happened.
  if (update) {
    update = false; // only update once
    colorGradation();
    // bgRotate(event);
    stage.update(event);
  }
}

function colorGradation() {
  if(auto){
    update = true;
    // console.log('color update');
    hsv.h += 1;
    if(hsv.h == 360) hsv.h = 0;
    var _RGB = HSVtoRGB(hsv.h, hsv.s, hsv.v);
    rgb = 'rgb(' + _RGB.r + ', ' + _RGB.g + ', ' + _RGB.b + ')';
    circle.graphics.clear().beginFill(rgb).drawCircle(canvasHalfW, canvasHalfH, r);
  }
}

function setupBGGradation() {
  var $bg = $('#bg1').css({opacity: 1.0, 'z-index': -1});
  currentBGNo = 1;
  nextBGNo = 2;
  for( var i = 2; i <= bgmax; i++ ) {
    $bg = $('#bg' + i);
    $bg.css({opacity: 0.0, 'z-index': -2});
  }
}

function startBGGradation() {
  console.log('bg gradation loop: current=' + currentBGNo + ' next=' + nextBGNo);
  $currentBG = $('#bg' + currentBGNo);
  $nextBG = $('#bg' + nextBGNo);

  $nextBG.css({opacity: 1.0, 'z-index': -2});
  $currentBG.css({opacity: 1.0, 'z-index': -1});
  $currentBG.transition({opacity: 0, duration: bgGradationTime});

  currentBGNo += 1;
  nextBGNo += 1;
  if(currentBGNo > bgmax) {
    currentBGNo = 1;
  } else if ( currentBGNo == bgmax ) {
    nextBGNo = 1;
  }

  bgtimer = setTimeout(startBGGradation, bgChangeInterval);
}

var bgdeg = 0;

function bgRotate(event) {
  update = true;
  bgdeg += event.delta/400;
  if(bgdeg >= 360) bgdeg -= 360;
  $('.bgwrap').css({
    transform: 'rotate(' + bgdeg + ')'
  });
}

$(init);