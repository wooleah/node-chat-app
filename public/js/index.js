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

    var span = $('#available-room').children("span");
    var availableRoomNum = rooms.length;
    span.html(`<a class="ui tag tiny label">${availableRoomNum}</a>`);
  });
});
