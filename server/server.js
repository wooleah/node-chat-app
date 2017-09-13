const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const {generateMessage, generateLocationMessage} = require('./utils/message');
const {isRealString, isValidURL} = require('./utils/validation');
const {Users} = require('./utils/users');
const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
const app = express();
var server = http.createServer(app);
var io = socketIO(server);
var users = new Users();

app.use(express.static(publicPath));

io.on('connection', (socket) => {//individual socket
  console.log('New user connected');

  socket.on('join', (params, callback) => {
    //room name is case-insensitive
    params.room = params.room.toLowerCase();
    //validate params
    if(!isRealString(params.name) || !isRealString(params.room)){
      return callback('Name and room name are required.');
      //if the data is invalid, code will stop here
    }
    socket.join(params.room);
    users.removeUser(socket.id);
    users.addUser(socket.id, params.name, params.room);


    io.to(params.room).emit('updateUserList',users.getUserList(params.room));
    socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat app'));
    socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', `${params.name} has joined`));
    callback();
  });

  socket.on('createMessage', (message, callback) => {
    // console.log('Got new message', message);
    var user = users.getUser(socket.id);
    if(user && isRealString(message.text)){
      if(isValidURL(message.text)){
        //error
        message.text = message.text.replace(/!(((f|ht)tp(s)?://)[-a-zA-Zа-яА-Я()0-9@:%_+.~#?&;//=]+)!i/g, '<a href="$1">$1</a>');
      }
      io.to(user.room).emit('newMessage', generateMessage(user.name, message.text));
    }
    callback();
  });

  socket.on('createLocationMessage', (coords) => {
    var user = users.getUser(socket.id);
    if(user){
      io.to(user.room).emit('newLocationMessage', generateLocationMessage(user.name, coords.latitude, coords.longitude));
    }
  });

  socket.on('disconnect', () => {
    // console.log('User disconnected');
    var user = users.removeUser(socket.id);

    if(user){
      io.to(user.room).emit('updateUserList', users.getUserList(user.room));
      io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left`));
    }
  });
}); //listen for a new connection

server.listen(port, () => { //this calls http.createServer()
  console.log(`server is listening to port ${port}`);
});
