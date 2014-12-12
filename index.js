var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

var count = 0;  // 人数
var roomlist = {};

io.on('connection', function(socket){
  count++;
  console.log('a user connected: ' + count);

  socket.on('disconnect', function(){
    count--;
    console.log('user disconnected: ' + count);
  });

  socket.on('enter', function(enterdata){
    var roomname = enterdata.value;
    if(!roomlist[roomname]){
      console.log('no such room');
      roomlist[roomname] = 1;
    } else {
      console.log('already exist');
      roomlist[roomname]++;
    }
    socket.join(roomname);
  });

  socket.on('chat message', function(msg){
    // console.log(socket.rooms);
    var room = socket.rooms[1];
    io.to(room).emit('chat message', msg);
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
