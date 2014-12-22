var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname + '/htmltests'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/html/index.html');
});

app.get('/controller', function(req, res){
  res.sendFile(__dirname + '/html/controller.html');
});

app.get('/light', function(req, res){
  res.sendFile(__dirname + '/html/light.html');
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
    var ret = {};
    if(socket.rooms[1] == lightname){
      // 今使っている部屋の名前おもう一度入れたらそのまま何もしない
      ret.res = 'self';
    }else if(!lightlist[lightname]){
      console.log('no such light');
      lightlist[lightname] = 1;
      ret.res = true;
      ret.lightname = lightname;
      socket.join(lightname);
    } else {
      ret.res = false;
      console.log('already exist');
    }
    socket.emit('make light result', ret);
  });

  socket.on('destroy light', function(data){
    var lightname = data.value;
    console.log('destroy light');
    delete lightlist[lightname];
    console.log(lightlist);

    io.to(socket.rooms[1]).emit('destroyed');
  });

  // from controller
  socket.on('connect light', function(data){
    var lightname = data.value;
    var ret = {};
    if(socket.rooms[1] == lightname){
      // 今使っている部屋にもう一度繋ごうとしたら何もしない
      ret.res = 'self';
    }else if(!lightlist[lightname]){
      // 使っていない
      ret.res = false;
      console.log('no such light');
    } else {
      ret.res = true;
      ret.lightname = lightname;
      console.log('find light');
      if(socket.rooms.length == 2){
        console.log('reduce light');
        socket.leave(socket.rooms[1]);
      }
      socket.join(lightname);
    }
    socket.emit('connectresult', ret);
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

  socket.on('bg change', function(data){
    var room = socket.rooms[1];
    console.log('bg change');
    io.to(room).emit('bg change', data);
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
