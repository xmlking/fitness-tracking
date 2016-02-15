"use strict";
var influx = require('influx');
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3010;

var influxdb = influx({
    host : 'localhost',
    port: 8086,
    username: 'collectd',
    password: 'collectd123',
    database : 'iotdb'
});

// influxdb.query('SELECT * FROM cpu WHERE time > now() - 5h', done)

app.use(express.static('public'));
app.get('/', function(req, res) {
 res.sendFile(__dirname + '/public/index.html');
});

app.get('/subscribers', function(req, res) {
    io.of('/iot').clients( (error, clients)=> {
        res.json(
            clients
                .filter((client) => {
                    return io.of('/iot').sockets[client].subscriber != undefined
                })
                .map((client) => {
                    return {id:io.of('/iot').sockets[client].id, subscriber: io.of('/iot').sockets[client].subscriber}
                })
        );
    })
});

io.of('/iot').on('connection', (socket) => {

    console.log('new connection: ' + socket.id);

    //For Admin UI to join a subscriber room
    socket.on('join', (newRoom) => {
        console.log("socket.rooms",socket.rooms);
        let oldRooms = Object.keys(socket.rooms).filter((aRoom) => {return aRoom != socket.id});
        oldRooms.forEach((oldRoom) => {
            console.log("leaving  ",oldRoom);
            socket.leave(oldRoom)
        });
        console.log("joining  ",newRoom);
        socket.join(newRoom)
    });

    socket.on('subscribe', (subscriber) => {
        console.log('subscribe...', subscriber);
        console.log('subscribe...:socket.id:', socket.id);
        socket.subscriber = subscriber;
        socket.broadcast.emit('subscribed', subscriber);
    });

    const unsubscribed = () => {
        socket.broadcast.emit('unsubscribed', socket.subscriber);
        socket.subscriber = null;
    };

    socket.on('unsubscribe', unsubscribed);

    socket.on('disconnect', () => {
        console.log('Got disconnect!', socket.id);
        unsubscribed()
    });

    const done =  (err, response) => {
        if(err){
            console.log(err)
        }
        //
    };

    socket.on('point', (point) => {
        //console.log('id', socket.id);
        //console.log('rooms', socket.rooms);
        //console.log('subscriber', socket.subscriber);
        //console.log('point', point);
        influxdb.writePoint(socket.subscriber.type, point.values, {
            userid: socket.subscriber.userid,
            device: socket.subscriber.device,
            sensor: point.tags.sensor
        }, done);
        socket.broadcast.to(socket.id).emit('point', point);
    });

});

server.listen(port, () => {
    console.log('listening on *: ' + port);
});