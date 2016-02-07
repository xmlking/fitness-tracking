var influx = require('influx');
var express = require('express');
var app = express();
app.use(express.static('public')); 
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3010;

var influxdb = influx({
    host : 'localhost',
    port: 8086,
    username: 'collectd',
    password: 'collectd123',
    database : 'iotdb'
});

var done = function (err, results) {
  //console.log(results)
};
// influxdb.query('SELECT * FROM cpu WHERE time > now() - 5h', done)
 

app.get('/', function(req, res) {
 res.sendFile(__dirname + '/public/index.html');
});


io.of('/iot').on('connection', function(socket) {
    console.log('new connection ' + socket);

    socket.on('data', function(data) {
        //console.log(data);
        influxdb.writePoint('iot', data.values, data.tags, done);
        socket.broadcast.emit('data', data);
    });

    socket.on('disconnect', function(msg) {
       console.log(msg);
    });            
});

http.listen(port, function() {
    console.log('listening on *: ' + port);
});