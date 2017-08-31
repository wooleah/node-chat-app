var socket = io();

socket.on('connect', function () {
  console.log('Connected to server');

  socket.emit('createMessage', {
    from: 'Aleah',
    text: 'Hello from client'
  });
});

socket.on('disconnect', function () {
  console.log('disconnected from server');
});

socket.on('newMessage', function(message){
  console.log('Got new message', message);
});
