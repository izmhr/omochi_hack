var express = require('express');
var app = express();
var http = require('http').Server(app);

var favicon = require('serve-favicon');
var io = require('socket.io')(http);

app.use(express.static(__dirname + '/static'));
app.use(favicon(__dirname + '/static/assets/favicon.ico'));

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
var lightlist = [];

io.on('connection', function(socket){
  count++;
  console.log('a user connected: ' + count);

  socket.on('disconnect', function(event){
    console.log(socket.id);
    for(var i = 0; i < lightlist.length; i++){
      if(lightlist[i].id == socket.id) {
        destroylight(socket);
      }
    }
    count--;
    console.log('user disconnected: ' + count);
  });

  // from light
  socket.on('make light', function(data){
    var lightname = data.value;
    var ret = {};
    if(socket.rooms[1] == lightname){
      // 今使っている部屋の名前をいれたら、何もしない
      console.log('self room');
      ret.res = 'self';
      ret.lightname = lightname;
    } else {
      if(lightlist.length >= 1){
        var found = false;
        var i = 0;
        for( i = 0; i < lightlist.length; i++) {
          if(lightlist[i].name === lightname) {
            //すでに存在していたら
            ret.res = false;
            console.log('already exist');
            found = true;
            break;
          }
        }
        if(i == lightlist.length && !found) {
          // 全部検索したが同名のライトが作られていなかったら
          console.log('unique light name');
          ret.res = true;
          ret.lightname = lightname;
          makelight(socket, lightname);
        }
      } else {
        // ライトが一個も作られていなかったら
        console.log('first light');
        ret.res = true;
        ret.lightname = lightname;
        makelight(socket, lightname);
      }
    }
    // } else if (!lightlist[socket.id]){
    //   console.log('no such light');
    //   lightlist[socket.id] = lightname;
    //   ret.res = true;
    //   ret.lightname = lightname;
    //   if(socket.rooms.length == 2) {
    //     var leaveLightName = socket.rooms[1];
    //     // delete lightlist[leaveLightName];
    //     // socket.leave(leaveLightName);
    //     destroylight(socket);
    //   }
    //   socket.join(lightname);
    // } else {
    //   ret.res = false;
    //   console.log('already exist');
    // }
    console.log(lightlist);
    socket.emit('make light result', ret);
  });

  function makelight(socket, lightname){
    lightlist.push({id:socket.id, name:lightname});
    if(socket.rooms.length == 2){
      destroylight(socket);
    }
    socket.join(lightname);
  };

  socket.on('destroy light', function(data){
    var lightname = data.value;
    destroylight(socket);
  });

  function destroylight(socket) {
    var destroyedLightName = '';
    console.log('destroy light');
    for(var i = 0; i < lightlist.length; i++ ){
      if( lightlist[i].id == socket.id ){
        var destroyedLightName = lightlist[i].name;
        lightlist.splice(i,1);
        socket.leave(destroyedLightName);
        break;
      }
    }
    // var lightname = lightlist[socket.id];
    // delete lightlist[socket.id];
    // socket.leave(lightname);

    console.log(lightlist);

    // コントローラに教えてあげる
    io.to(destroyedLightName).emit('destroyed');
  };

  // socket.on('light dis', function(){
  //   console.log('★light dis★');
  // });

  // socket.on('light reconnect', function(){
  //   console.log('★light reconnect★');
  // });

  // from controller
  socket.on('connect light', function(data){
    var lightname = data.value;
    var ret = {};
    if(socket.rooms[1] == lightname){
      // 今使っている部屋にもう一度繋ごうとしたら何もしない
      ret.res = 'self';
    } else {
      var i = 0;
      for( ; i < lightlist.length; i++ ){
        if( lightlist[i].name === lightname ) {
          ret.res = true;
          ret.lightname = lightname;
          console.log('find light');
          if(socket.rooms.length == 2) {
            // この回線で既に別のライトに繋いで居たら、そっちとはお別れする
            var leaveLightName = socket.rooms[1];
            socket.leave(leaveLightName);
          }
          socket.join(lightname);
          break;
        }
      }
      if( i == lightlist.length ) {
        console.log('no such light');
        ret.res = false;
      }
    }
    // }else if(!lightlist[lightname]){
    //   // 使っていない
    //   ret.res = false;
    //   console.log('no such light');
    // } else {
    //   ret.res = true;
    //   ret.lightname = lightname;
    //   console.log('find light');
    //   if(socket.rooms.length == 2){
    //     // console.log('reduce light');
    //     var leaveLightName = socket.rooms[1];
    //     // delete lightlist[leaveLightName];
    //     socket.leave(leaveLightName);
    //   }
    //   socket.join(lightname);
    // }
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

  socket.on('auto', function(){
    var room = socket.rooms[1];
    io.to(room).emit('auto');
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
