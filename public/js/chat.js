var socket = io();

function scrollToBottom(){
  //Selectors
  var messages = $('#messages');
  var newMessage = messages.children('li:last-child');
  //Heights
  var clientHeight = messages.prop('clientHeight'); //jQuery alternative (cross-browser)
  var scrollTop = messages.prop('scrollTop');
  var scrollHeight = messages.prop('scrollHeight');
  var newMessageHeight = newMessage.innerHeight();
  var lastMessageHeight = newMessage.prev().innerHeight();

  if(clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight){
    messages.scrollTop(scrollHeight);
    // messages.stop().animate({scrollTop:scrollHeight}, 1000);
    // return false;
  }
};

//CONNECT
socket.on('connect', function () {
  // console.log('Connected to server');
  var params = $.deparam(window.location.search);
  socket.emit('join', params, function(err){
    if(err){
      alert(err);
      window.location.href = '/';
    }else{
      console.log('No error');
    }
  });
});

//DISCONNECT
socket.on('disconnect', function () {
  console.log('disconnected from server');
});

//UPDATE USER LIST
socket.on('updateUserList', function(users){
  var ol = $('<ol></ol>');

  users.forEach(function(user){
    ol.append($('<li></li>').text(user));
  });
  $('#users').html(ol);

  //CHATROOM - NUMBER OF PEOPLE
  var currentPeople = $('#current-people').children('span');
  var currentPeopleNum = users.length;
  currentPeople.html(`<a class="ui grey circular label">${currentPeopleNum}</a>`);

  socket.emit('keepCurrentUserMark');
});

//ADD ICON TO CURRENT USER
socket.on('showCurrentUser', function(user){
  var username = user.name;
  $(`#users li:contains('${username}')`).html(`${username} <i title="This is you!" class="fa fa-user-circle-o" aria-hidden="true"></i>`);
});


//DETECT TYPING - CLIENT
var timer = null;
var typingFlag = false;

var timeout = function(){
  typingFlag = false;
  socket.emit('typing', false);
}

// Typing event is sent only when user presses non-enter key
$('#message-form').keypress(function(e){
  if(e.which !== 13){
    if(typingFlag === false){
      typingFlag = true;
      socket.emit('typing', true);
    }else{
      clearTimeout(timer);
      timer = setTimeout(timeout, 700);
    }
  }
});

socket.on('typingMessage', function(data){
  var user = data.user;
  var typing = data.typing;

  if(typing){
    if($(`.${user.name}typingMessage`).length === 0){
      $('#messages').append(`<li class="${user.name}typingMessage"><a class="ui ${user.color} tiny label inactiveLink">${user.name} is typing ...</a></li>`);
      timer = setTimeout(timeout, 700);
    }
  }else{
    $(`.${user.name}typingMessage`).remove();
  }
});
//DETECT TYPING - END

//NEW MESSAGE
socket.on('newMessage', function(message){
  var formattedTime = moment(message.createdAt).format('h:mm a');
  var template = $('#message-template').html();
  var html = Mustache.render(template, {
    text: message.text,
    from: `<a class="ui ${message.color} small label inactiveLink">${message.from}</a>`,
    createdAt: formattedTime
  });
  //remove typing message
  $(`.${message.from}typingMessage`).remove();
  clearTimeout(timer);
  timer = setTimeout(timeout, 0);

  $('#messages').append(html);
  scrollToBottom();
});

//NEW LOCATION MESSAGE
socket.on('newLocationMessage', function(message){
  var formattedTime = moment(message.createdAt).format('h:mm a');
  var template = $('#location-message-template').html();
  var html = Mustache.render(template, {
    from: `<a class="ui ${message.color} small label inactiveLink">${message.from}</a>`,
    createdAt: formattedTime,
    url: message.url
  });
  //remove typing message
  $(`.${message.from}typingMessage`).remove();
  clearTimeout(timer);
  timer = setTimeout(timeout, 0);

  $('#messages').append(html);
  scrollToBottom();
});

//SEND BUTTON ACTION
$('#message-form').on('submit', function(e){//event argument
  e.preventDefault();
  var messageTextbox = $('[name=message]')
  socket.emit('createMessage', {
    text: messageTextbox.val()
  }, function(){
    //acknowledgement
    messageTextbox.val('');
  });
});

//SEND LOCATION BUTTON ACTION
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

// CHATROOM - LEAVE BUTTON
var leaveButton = $('.chat__leave');
leaveButton.on('click', function(){
  if(confirm('Leave the room?')){
    window.location.href = '/';
  }
});
