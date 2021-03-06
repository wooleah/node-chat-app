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
      // history.pushState(null, '', '/chat');

      console.log('No error');
    }
  });
});

//DISCONNECT
socket.on('disconnect', function () {
  console.log('disconnected from server');
  window.location.href = '/';
});

//UPDATE USER LIST
socket.on('updateUserList', function(users){
  var ol = $('<ol></ol>');

  users.forEach(function(user){
    ol.append($(`<li>${user.name}<a class="usercolor-icon inactiveLink ui ${user.color} mini circular label"></a></li>`));
  });
  $('#users').html(ol);

  //CHATROOM - NUMBER OF PEOPLE
  var currentPeople = $('#current-people').children('span');
  var currentPeopleNum = users.length;
  currentPeople.html(`<a class="ui grey circular label">${currentPeopleNum}</a>`);

  socket.emit('keepCurrentUserMark');
});

//ADD ICON, COLOR, AND KICKOUT ICON TO CURRENT USER INTERFACE
socket.on('showCurrentUser', function(userdata){
  var currentUser = userdata.currentUser;
  var usernames = userdata.allUsernames;
  var users = userdata.allUsers;
  var currentUsername = currentUser.name;
  //if the user is first on the list(meaning the user is roomowner)
  // alert(`${currentUsername} is the king!`);
  if(usernames[0] === currentUsername){
    users.forEach(function(user){
      //only add kickout icon to not currentUser
      console.log('user.name: ', user.name);
      console.log('currentUsername: ', currentUsername);
      if(!(user.name === currentUsername)){
        $(`#users li:contains('${user.name}')`).html(`${user.name}<a class="usercolor-icon inactiveLink ui ${user.color} mini circular label"></a><i title="Kick out this user" class="remove user icon"></i>`);
      }else{
        $(`#users li:contains('${currentUsername}')`).html(`${currentUsername}<i title="You are the king of this room!" class="star icon"></i><a title="This is your color" class="usercolor-icon inactiveLink ui ${currentUser.color} mini circular label"></a><i title="This is you!" class="fa fa-user-circle-o" aria-hidden="true"></i>`);
      }
    });
  }else{
    $(`#users li:contains('${currentUsername}')`).html(`${currentUsername}<a title="This is your color" class="usercolor-icon inactiveLink ui ${currentUser.color} mini circular label"></a><i title="This is you!" class="fa fa-user-circle-o" aria-hidden="true"></i>`);
  }
  //add currentUserIcon to currentUser
});


//DETECT TYPING - CLIENT
var timer = null;
var typingFlag = false;

var timeout = function(){
  typingFlag = false;
  socket.emit('typing', false);
}

// Typing event is sent only when user presses non-enter key
$('#message-form').keydown(function(e){
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
      var template = $('#typing-message-template').html();
      var html = Mustache.render(template, {
        from: `<a class="ui ${user.color} tiny label inactiveLink">${user.name}</a>`,
        username: user.name
      });
      $('#messages').append(html);
      // $('#messages').append(`<li class="${user.name}typingMessage"><a class="ui ${user.color} tiny label inactiveLink">${user.name} is typing ...</a></li>`);
      scrollToBottom();
      timer = setTimeout(timeout, 700);
    }
  }else{
    $('li').remove(`.${user.name}typingMessage`);
  }
});
//delete typingMessage when user leaves the room
socket.on('deleteTypingMessage', function(username){
  $('li').remove(`.${username}typingMessage`);
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
  $('li').remove(`.${message.from}typingMessage`);
  clearTimeout(timer);
  timer = setTimeout(timeout, 0);

  $('#messages').append(html);
  $('li').remove(`.${message.from}typingMessage`);
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
  $('li').remove(`.${message.from}typingMessage`);
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

//CHAT SIDEBAR - HIDE BUTTON
var hideSidebarButton = $('.chat__sidebar-hide i');
var chatSidebar = $('.chat__sidebar');
var sidebarStatus = true;
hideSidebarButton.on('click', function(){
  if(sidebarStatus){
    chatSidebar.css('width', '0');
    hideSidebarButton.removeClass('left');
    hideSidebarButton.addClass('right');
    sidebarStatus = false;
  }else{
    chatSidebar.css('width', '260');
    hideSidebarButton.removeClass('right');
    hideSidebarButton.addClass('left');
    sidebarStatus = true;
  }
});

//CHAT SIDEBAR - KICKOUT USER
$('#users').on('click','i.remove.user.icon', function(){
  var clickedUser = $(this).parent().text();
  socket.emit('kickout', clickedUser);
});
socket.on('kickoutMessage', function(){
  alert('You were kicked out.');
});
