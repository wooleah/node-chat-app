var socket = io();

socket.on('connect', function () {
  console.log('Connected to server');

});

socket.on('disconnect', function () {
  console.log('disconnected from server');
});

socket.on('newMessage', function(message){
  var formattedTime = moment(message.createdAt).format('h:mm a');
  console.log('Got new message', message);
  var li = $('<li></li>');
  li.text(`${message.from} ${formattedTime}: ${message.text}`);
  $('#messages').append(li);
});

socket.on('newLocationMessage', function(message){
  var formattedTime = moment(message.createdAt).format('h:mm a');
    var li = $('<li></li>');
    var a = $('<a target="_blank">My current location</a>');
    li.text(`${message.from} ${formattedTime}: `);
    a.attr('href', message.url);
    li.append(a);
    $('#messages').append(li);
});

$('#message-form').on('submit', function(e){//event argument
  e.preventDefault();
  var messageTextbox = $('[name=message]')
  socket.emit('createMessage', {
    from: 'User',
    text: messageTextbox.val()
  }, function(){
    //acknowledgement
    messageTextbox.val('');
  });
});

var locationButton = $('#send-location');
locationButton.on('click', function(){
  if(!navigator.geolocation){
    return alert('Geolocation not supported by your browser');
  }else{

    locationButton.attr('disabled', 'disabled').text('Sending Location...');

    navigator.geolocation.getCurrentPosition(function(position){
      locationButton.removeAttr('disabled').text('Send Location');
      socket.emit('createLocationMessage', {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      });
  }
  , function(){
      locationButton.removeAttr('disabled').text('Send Location');
      alert('Unable to fetch location');
    });
  }
});
