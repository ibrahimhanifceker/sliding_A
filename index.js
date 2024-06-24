var express = require('express');
var app = express();
var  serv = require('http').Server(app);

app.get('/', function(req,res){
    res.sendFile(__dirname + '/client/index.html');
});
app.use('/client', express.static(__dirname + '/client'));

serv.listen(process.env.PORT || 1453);

console.log('Server Started');

var Sockets = {};
var Players = {};

var Player = function(id){
    var self = {
        x:250,
        y:250,
        id:id,
        speed:10,
        right:false,
        down:false,
        left:false,
        up:false
    }
    self.updatePosition = function(){
        self.x += self.speed * self.right;
        self.x -= self.speed * self.left;
        self.y += self.speed * self.down;
        self.y -= self.speed * self.up;
    }
    return self;
}

var io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket){
    socket.id = Math.random();
    console.log('socket connection' + socket.id);
    Sockets[socket.id] = socket;

    var player = Player(socket.id);
    Players[socket.id] = player;

    socket.on('key_press', function(data){
        if(data.key == 'R'){
            player.right = data.is_pressed;
        }
        else if(data.key=='L'){
            player.left = data.is_pressed;
        }
        else if(data.key=='D'){
            player.down = data.is_pressed;
        }
        else if(data.key=='U'){
            player.up = data.is_pressed;
        }
    })

    socket.on('disconnect', function(){
        delete Sockets[socket.id];
        delete Players[socket.id];
    })
});

setInterval(function(){
    var pack = [];
    for(var i in Players){
        var player = Players[i];
        player.updatePosition();
        pack.push({
            x:player.x,
            y:player.y
        });
    }
    for(var i in Sockets){
        var socket = Sockets[i];
        socket.emit('New_Position', pack);
    }
}, 1000/50);
