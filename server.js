const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const botName = 'ChatCord Bot';

//Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

// Run when a client connects
io.on('connection', socket => {
    socket.on('joinRoom', ({ username, room }) => {
        const user = userJoin(socket.id ,username, room);    

        socket.join(user.room);

        //welcome current user
        socket.emit('message', 
        formatMessage(botName,'Welcome to Chatcord!')); // for only that user

        //Brodcast when a user connects
        socket.broadcast.to(user.room).emit('message', 
        formatMessage(botName,`${user.username} has joined the chat`)); // everyone except the user

        //send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });


    });

    
    

    //Listen for chatMessage
    socket.on('chatMesssage', (msg) => {
        const user = getCurrentUser(socket.id);
        // console.log(msg);
        io.to(user.room).emit('message',formatMessage(user.username, msg));
    });

    //Runs when client disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        if(user) {
            io.to(user.room).emit('message', formatMessage(botName,`${user.username} has left the chat`)); //for everybody
        };
        
        //send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });
});

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`server running in port ${PORT}`));