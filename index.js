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

var io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket){
    socket.id = Math.random();
    console.log('socket connection' + socket.id);
    socket.x = 250;
    socket.y = 250;
    Sockets[socket.id] = socket;

    socket.on('disconnect', function(){
        delete Sockets[socket.id];
    })
});

setInterval(function(){
    var pack = [];
    for(var i in Sockets){
        var socket = Sockets[i];
        socket.x++;
        socket.y++;
        pack.push({
            x:socket.x,
            y:socket.y
        });
    }
    for(var i in Sockets){
        var socket = Sockets[i];
        socket.emit('New_Position', pack);
    }
}, 1000/25);
