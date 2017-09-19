const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const linkifyHtml = require('linkifyjs/html');

const {generateMessage, generateLocationMessage} = require('./utils/message');
const {isRealString} = require('./utils/validation');
const {Users} = require('./utils/users');
const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
const app = express();
var server = http.createServer(app);
var io = socketIO(server);
var users = new Users();

app.use(express.static(publicPath));

//CONNECTION
io.on('connection', (socket) => {//individual socket
  console.log('New user connected');
  // console.log(users.getRoomList());
  io.emit('updateRoomList', users.getRoomList());

  //RECEIVING JOIN EVENT
  socket.on('join', (params, callback) => {
    //room name is case-insensitive
    params.room = params.room.toLowerCase();
    //validate params
    if(!isRealString(params.name) || !isRealString(params.room)){
      return callback('Name and room name are required.');
      //if the data is invalid, code will stop here
    }
    //check if there is a client in given room with a same name
    if(users.getUserList(params.room).includes(params.name)){
      return callback('Same name already exists in that room!');
    }
    //make sure username is not Admin
    if(params.name === 'Admin'||params.name ==='admin'){
      return callback('You cannot be an Admin.');
    }
    //username and roomname cannot include special characters
    var format = /[!@?#&+=$]/;
    var checkSpecialChar = (str) => {
      return format.test(str);
    }
    if(checkSpecialChar(params.name)) {
      return callback('Your username contains illegal characters.');
    }
    if(checkSpecialChar(params.room)) {
      return callback('Your roomname contains illegal characters.');
    }

    //username and roomname cannot be more than 20 characters long
    if(params.name.length > 20 || params.room.length > 20){
      console.log(params.name.length);
      return callback('Username and roomname cannot be more than 20 characters.');
    }

    //one of 12 colors will be chosen from messageColorArr
    const messageColorArr = ['red', 'orange', 'yellow', 'olive', 'green', 'teal', 'blue', 'violet', 'purple', 'pink', 'brown', 'grey', 'black'];
    const randomNum = Math.floor(Math.random()*12);
    const randomColor = messageColorArr[randomNum];

    socket.join(params.room);
    users.removeUser(socket.id);
    //first user to make room becomes roomowner
    var roomOwnership = false;
    if(!users.getRoomList().includes(params.room)){
      roomOwnership = true;
    }
    users.addUser(socket.id, params.name, params.room, randomColor, roomOwnership);
    users.addRoom(params.room);

    // console.log(users.getRoomList());

    io.emit('updateRoomList', users.getRoomList());
    io.to(params.room).emit('updateUserList',users.getUserList(params.room));

    //Add icon to current user(socket)
    socket.on('keepCurrentUserMark', () => {
      socket.emit('showCurrentUser', users.getUser(socket.id));
    });

    socket.emit('newMessage', generateMessage('Admin', `Welcome to the chat app, ${params.name}.`, 'red'));
    socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', `${params.name} has joined`, 'red'));
    callback();
  });

  //RECEIVING MESSAGE EVENT
  socket.on('createMessage', (message, callback) => {
    // console.log('Got new message', message);
    var user = users.getUser(socket.id);
    //validating user & message
    if(user && isRealString(message.text)){
      message.text = linkifyHtml(message.text, {defaultProtocol: 'https'});
      io.to(user.room).emit('newMessage', generateMessage(user.name, message.text, user.color));
    }
    callback();
  });

  //RECEIVING LOCATION MESSAGE EVENT
  socket.on('createLocationMessage', (coords) => {
    var user = users.getUser(socket.id);
    if(user){
      io.to(user.room).emit('newLocationMessage', generateLocationMessage(user.name, coords.latitude, coords.longitude, user.color));
    }
  });

//DETECT TYPING
  socket.on('typing', (typing) => {
    var user = users.getUser(socket.id);
    if(user){
        socket.broadcast.to(user.room).emit('typingMessage', {user, typing});
    }
  });

  //DISCONNECTING
  socket.on('disconnect', () => {
    console.log('User disconnected');
    var user = users.removeUser(socket.id);

    if(user){
      io.of('/').in(user.room).clients((err, clients) => {
        if(err) throw error;
        if(clients.length < 1){
          users.removeRoom(user.room);
          // console.log(users.getRoomList());
          io.emit('updateRoomList', users.getRoomList());
        }
      });
      io.to(user.room).emit('updateUserList', users.getUserList(user.room));
      io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left`, 'red'));
    }
  });
});

server.listen(port, () => {
  console.log(`server is listening to port ${port}`);
});
