var socket = io();

socket.on('connect', function () {
    console.log('Connected to server!!');
    
});

socket.on('disconnect', function () {
    console.log('Disconnected from the server');

});

socket.on('newMessage', function (message) {
    var formattedTime = moment(message.createdAt).format('h:mm a');
    console.log('New messagge', message);
    var li = $('<li></li>');
    li.text(`${message.from} ${formattedTime}: ${message.text}`);

    $('#messages').append(li);
});

socket.on('newLocationMessage', function (message) {
    var formattedTime = moment(message.createdAt).format('h:mm a');
    var li = $('<li></li>');
    var a =$('<a target="_blank">My Current Location</a>');

    li.text(`${message.from} ${formattedTime}: `);
    a.attr('href',message.url);
    li.append(a);
    $('#messages').append(li);
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