const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
const app = express();
var server = http.createServer(app);
var io = socketIO(server);

app.use(express.static(publicPath));

io.on('connection', (socket) => {//individual socket
  console.log('New user connected');

  socket.emit('newMessage', {
    from: 'Woojae',
    text: 'Hello from server',
    createdAt: 1230
  });

  socket.on('createMessage', (message) => {
    message.createdAt = 1231;
    console.log('Got new message', message);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
}); //listen for a new connection

server.listen(port, () => { //this calls http.createServer()
  console.log(`server is listening to port ${port}`);
});
