const path = require('path');
const http =require('http');
const socketIO = require('socket.io');
const express = require('express');

var {generateMessage,generateLocationMessage} = require('./utils/message');
const {isRealString} = require('./utils/validation');
const {Users} = require('./utils/users');

const publicPath = path.join(__dirname,'../public');
const port = process.env.PORT || 3000;
var app = express();
var server = http.createServer(app);
var io = socketIO(server);
var users = new Users();

app.use(express.static(publicPath));

io.on('connection',(socket)=>{
    console.log('New User connected');

    
    
    socket.on('join',(params,callback)=>{
        
        if(!isRealString(params.name) || !isRealString(params.room)){
           return callback('Name and roomname are required!');
        }
        var room = params.room.toUpperCase();
        socket.join(room);
        users.removeUser(socket.id);
        users.addNewUser(socket.id,params.name,room);
        
        io.to(room).emit('updateUserList',users.getUserList(room));
        socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat app!'));
        socket.broadcast.to(room).emit('newMessage', generateMessage('Admin', `${params.name} has joined`));
        callback();
    });

    socket.on('createMessage',(newMessage,callback)=>{
       var user = users.getUser(socket.id);
       
       if(user && isRealString(newMessage.text)){
           io.to(user.room).emit('newMessage', generateMessage(user.name, newMessage.text));
       }
       
       callback();
    });

    socket.on('sendLocation', (coords) => {
        var user = users.getUser(socket.id);
        
        if(user){
            io.to(user.room).emit('newLocationMessage', generateLocationMessage(user.name, coords.lat, coords.lng));
        }
       
    });

    socket.on('disconnect',()=>{
        console.log('User disconnected');
        var user = users.removeUser(socket.id);
       if(user){
           io.to(user.room).emit('updateUserList', users.getUserList(user.room));
           io.to(user.room).emit('newMessage',generateMessage('Admin',`${user.name} has left.`))
       }
    });
});




server.listen(port,()=>{
    console.log(`Server is up on port ${port}`);
})