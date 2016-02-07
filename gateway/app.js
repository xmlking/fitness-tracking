var influx = require('influx');
var express = require('express');
var app = express();
app.use(express.static('public')); 
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3010;

var client = influx({
  host : 'localhost',
  database : 'mydb'
})

var done = function (err, results) {
  //console.log(results)
};
// client.query('SELECT * FROM cpu WHERE time > now() - 5h', done)
 

app.get('/', function(req, res) {
 res.sendFile(__dirname + '/public/index.html');
});


io.of('/iot').on('connection', function(socket) {
    console.log('new connection ' + socket);
    var hrTags = { user:'sumo', device:'mband', sensor:'hr' };
    var stTags = { user:'sumo', device:'mband', sensor:'st' };

    socket.on('heartRate', function(hr) {
        //console.log(hr);
        var value = parseInt(hr);
        client.writePoint('iot', {value: value}, hrTags, done);
        socket.broadcast.emit('heartRate', hr);
    });

    socket.on('skinTemp', function(st) {
        //console.log(st);
        var value = parseInt(st);
        client.writePoint('iot', {value: value}, stTags, done);
        socket.broadcast.emit('skinTemp', value * 9 / 5 + 32);
    });
    
    socket.on('disconnect', function(msg) {
       console.log(msg);
    });            
});

http.listen(port, function() {
    console.log('listening on *: ' + port);
});