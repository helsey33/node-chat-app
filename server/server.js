const path = require('path');
const http =require('http');
const socketIO = require('socket.io');
const express = require('express');

const publicPath = path.join(__dirname,'../public');
const port = process.env.PORT || 3000;
var app = express();
var server = http.createServer(app);
var io = socketIO(server);

app.use(express.static(publicPath));

io.on('connection',(socket)=>{
    console.log('New User connected');

    

    socket.on('createMessage',(newMessage)=>{
        console.log('createMessage',newMessage);
        io.emit('newMessage',{
            from:newMessage.from,
            text:newMessage.text,
            createdAt:new Date().getTime()
        })
    })

    socket.on('disconnect',()=>{
        console.log('User disconnected');
    })
})



server.listen(port,()=>{
    console.log(`Server is up on port ${port}`);
})