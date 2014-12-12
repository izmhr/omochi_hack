var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/controller', function(req, res){
  res.sendFile(__dirname + '/controller.html');
});

app.get('/light', function(req, res){
  res.sendFile(__dirname + '/light.html');
});

var count = 0;  // 人数
var lightlist = {};

io.on('connection', function(socket){
  count++;
  console.log('a user connected: ' + count);

  socket.on('disconnect', function(){
    console.log(socket.rooms);
    count--;
    console.log('user disconnected: ' + count);
  });

  // from light
  socket.on('make light', function(data){
    var lightname = data.value;
    if(!lightlist[lightname]){
      console.log('no such light');
      lightlist[lightname] = 1;
      socket.join(lightname);
    } else {
      console.log('already exist');
      socket.emit('light already exist', {msg: 'the light name is already exist'});
    }
  });

  socket.on('destroy light', function(data){
    var lightname = data.value;
    console.log('destroy light');
    delete lightlist[lightname];
    console.log(lightlist);

    io.to(socket.rooms[1]).emit('destroyed');
  });

  // from controller
  socket.on('join light', function(data){
    var lightname = data.value;
    if(!lightlist[lightname]){
      console.log('no such light');
    } else {
      console.log('find light');
      socket.join(lightname);
    }
  });

  socket.on('leave light', function(){
    console.log("leave:", socket.rooms[1]);
    socket.leave(socket.rooms[1]);
  });

  socket.on('chat message', function(msg){
    // console.log(socket.rooms);
    var room = socket.rooms[1]; // 0 is default, 1 is the first.
    io.to(room).emit('chat message', msg);
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
