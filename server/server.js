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

        socket.join(params.room);
        users.removeUser(socket.id);
        users.addNewUser(socket.id,params.name,params.room);
        
        io.to(params.room).emit('updateUserList',users.getUserList(params.room));
        socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat app!'));
        socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', `${params.name} has joined`));
        callback();
    });

    socket.on('createMessage',(newMessage,callback)=>{
        console.log('createMessage',newMessage);
       io.emit('newMessage',generateMessage(newMessage.from,newMessage.text));
       callback();
    });

    socket.on('sendLocation', (coords) => {
        io.emit('newLocationMessage', generateLocationMessage('Admin', coords.lat,coords.lng));
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