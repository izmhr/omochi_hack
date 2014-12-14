var canvas, stage;
var circle, text;
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
  text = new createjs.Text("Hello World!", "36px Arial", "#777");
  text.textAlign = 'center';
  text.textBaseline = 'middle';

  circle = new createjs.Shape();
  r = 100;
  var g = circle.graphics.beginFill('#0ff').drawCircle(canvasHalfW, canvasHalfH, r);

  circle.on('pressmove', function(e){
    r = (new Victor(e.stageX - canvasHalfW, e.stageY - canvasHalfH)).length();
    circle.graphics.clear().beginFill('#0ff').drawCircle(canvasHalfW, canvasHalfH, r);
    console.log(r);
    update = true;
  });

  // add the text as a child of the stage. This means it will be drawn any time the stage is updated
  // and that its transformations will be relative to the stage coordinates:
  stage.addChild(circle);
  stage.addChild(text);

  createjs.Ticker.addEventListener("tick", tick);

  window.onresize = resize;
  resize();
}

function resize() {
  canvas.width = window.innerWidth; //document.width is obsolete
  canvas.height = window.innerHeight; //document.height is obsolete
  canvasHalfW = canvas.width/2;
  canvasHalfH = canvas.height/2;

  // position the text on screen, relative to the stage coordinates:
  text.x = canvasHalfW;
  text.y = canvasHalfH;

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