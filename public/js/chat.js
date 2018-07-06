var socket = io();

function scrollToBottom(){
    var messages = $('#messages');
    var newMessage = messages.children('li:last-child')

    var clientHeight = messages.prop('clientHeight');
    var scrollTop = messages.prop('scrollTop');
    var scrollHeight = messages.prop('scrollHeight');
    var newMessageHeight = newMessage.innerHeight();
    var lastMessageHeight =  newMessage.prev().innerHeight();

    if(clientHeight+scrollTop+newMessageHeight+lastMessageHeight >= scrollHeight){
        messages.scrollTop(scrollHeight);
    }
}

socket.on('connect', function () {
    console.log('Connected to server!!');
    
});

socket.on('disconnect', function () {
    console.log('Disconnected from the server');

});

socket.on('newMessage', function (message) {
    var formattedTime = moment(message.createdAt).format('h:mm a');
    var template = $('#message-template').html();
   var html = Mustache.render(template,{
       text:message.text,
       from:message.from,
       createdAt:formattedTime
   });
   
   $('#messages').append(html);
    scrollToBottom();
});

socket.on('newLocationMessage', function (message) {
    var formattedTime = moment(message.createdAt).format('h:mm a');
   var html = Mustache.render($('#location-message-template').html(),{
       from:message.from,
       url:message.url,
       createdAt:formattedTime
   });
    $('#messages').append(html);
    scrollToBottom();
})

$('#message-form').on('submit',function(e){
    e.preventDefault();

    var messageTextBox = $('[name=message]');

    socket.emit('createMessage',{
        from:'User',
        text: messageTextBox.val()
    },function(){
        messageTextBox.val('');
    });
});

var locationButton = $('#send-location');
locationButton.on('click',function(){
    if(!navigator.geolocation){
        return alert('Geolocation not supported by your browser');
    }
    locationButton.attr('disabled','disabled').text('Sending location...');
    navigator.geolocation.getCurrentPosition(function(position){
        socket.emit('sendLocation',{
            lat:position.coords.latitude,
            lng:position.coords.longitude
        });
        locationButton.removeAttr('disabled').text('Send Location');
    },function(){
        alert('Unable to fetch position');
        locationButton.removeAttr('disabled').text('Send Location');
    })
});