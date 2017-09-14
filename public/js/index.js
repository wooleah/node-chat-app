var socket = io();

socket.on('connect', function(){
  console.log('connected!');
  //UPDATE ROOM LIST - index.html
  socket.on('updateRoomList', function(rooms){
    var ol = $('<ol></ol>');
    rooms.forEach(function(room){
      ol.append($('<li></li>').text(room));
    });
    $('#rooms').html(ol);
  });
});
