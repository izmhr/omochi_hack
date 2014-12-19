function init()
{
  $(window).on('touchmove', function(e){
    e.preventDefault();
  });

  $('.color_wheel img').on('touchmove', function(event){
    // event.preventDefault();
    if(!this.canvas){
      this.canvas = $('<canvas />')[0];
      this.canvas.width = this.width;
      this.canvas.height = this.height;
      this.canvas.getContext('2d').drawImage(this, 0, 0, this.width, this.height);
    }

    console.log(event);
    var t = event.originalEvent.changedTouches[0];
    var wheelShiftX = t.target.x - t.target.width/2;
    var wheelShiftY = t.target.y - t.target.height/2;
    var pixelData = this.canvas.getContext('2d').getImageData(t.clientX - wheelShiftX, t.clientY - wheelShiftY, 1, 1).data;

    $('.output').html('R: ' + pixelData[0] + '<br>G: ' + pixelData[1] + '<br>B: ' + pixelData[2] + '<br>A: ' + pixelData[3] + '<br>x: ' + t.pageX + '<br>y: ' + t.pageY);
  });
}

$(init);