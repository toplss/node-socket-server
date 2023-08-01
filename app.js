// redis -clear
var express = require("express");
var app = express();
var http = require("http");
var server = http.createServer(app);

server.listen(3000, function( ) {
    console.log("Server Connected !!");
});

var io = require('socket.io').listen(server);
var redis = require('redis');
var fs = require('fs');

app.get("/", function(req, res) {
    res.sendFile(__dirname + "/index.html");
});

var store = redis.createClient();
var pub = redis.createClient();
var sub = redis.createClient();

sub.subscribe("chatting");

io.sockets.on('connection', function (client) {

  client.on('join', function(result) {
      client.leave(client.room);
      client.join(result);
      client.room = result;
  });

  sub.on("message", function (channel, message) {
    let messageData = { resultData : message , client : client.id };
    // client.send(messageData);
    console.log(client.room);
    io.sockets.in(client.room).emit('message', messageData);
  });

  client.on("message", function (msg) {
    console.log(msg);
    if(msg.type == "chat"){
      pub.publish("chatting",msg.message);
    }

    // else if(msg.type == "setUsername"){
    //   pub.publish("chatting","A new user in connected:" + msg.user);
    //   store.sadd("onlineUsers",msg.user);
    // }
  });

  client.on('disconnect', function () {
    // sub.quit();
    console.log("chatting","User is disconnected :" + client.id);
  });

  if (client.listenerCount('connect') > 1) {
    client.removeListener('connect', client);
  }
});
