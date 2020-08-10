const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, getUser, getUsersInRoom, removeUser } = require('./utils/users')

const app = express()
const server = http.createServer(app) //This is done by the express library behind the scenes, anyway.
//SocketIO expects an http server, so we created it to be able to explicitly pass it.
const io = socketio(server)

//Uses the one that exists (depending on whether the project runs locally or on Heroku)
const port = process.env.PORT || 3000

//Define paths for Express config
const publicDirectoryPath = path.join(__dirname, '../public')


//Setup static directory to serve
app.use(express.static(publicDirectoryPath))

// app.get('', (reqShevo, resShevo) => {
//     resShevo.sendFile(publicDirectoryPath+ '/index.html') <- This page is sent by default, anyways.
// })

//Socket contains information about the new connection. It runs once per new connection (5 clients -> runs 5 times).

io.on('connection', (socket) => { 
    
    socket.on('join', ({ username, room }, callback) => {
        const {error, user} = addUser({id: socket.id, username, room})

        if (error) {
            return callback(error)
        }             

        socket.join(user.room)               
        console.log('New WebSocket connection')
        socket.emit('messageFromServer', generateMessage('Admin', `Welcome, ${user.username}!`))
        socket.broadcast.to(user.room).emit('messageFromServer', generateMessage('Admin', username + " has joined the room!"))
        io.to(user.room).emit('roomData', {
            room: user.room,
            usersList: getUsersInRoom(user.room)
        })
    })

    socket.on('sendMessageShevo', (messageFromClient, callback) => {
        //Get user by socket.id
        user = getUser(socket.id)

        if (!user) {
            return callback('User could not be found')
        }

        const filter = new Filter()

        if (filter.isProfane(messageFromClient)) {
            return callback('Profane language is not allowed...')
        }
        
        //io.to(room).emit('messageFromServer', generateMessage(messageFromClient))   
        io.to(user.room).emit('messageFromServer', generateMessage(user.username, messageFromClient))
        callback()  
    })

    socket.on('sendLocation', (location, callback) => {
        //Get user
        user = getUser(socket.id)

        if (!user) {
            return callback('User not found')
        }

        try{                       
            io.to(user.room).emit(
                'locationMessage',
                generateLocationMessage(user.username, `https://google.com/maps?q=${location.latitude},${location.longitude}`)
                )
            callback()
        } catch (error) {
            callback(error)
        }
    })
    
    //The events 'connection' and 'disconnect' are built-in in the socket.io library.
    socket.on('disconnect', () => {
        //First we check that the user was actually registered in the room.
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('messageFromServer', generateMessage('Admin', user.username + ' has disconnected.'))
            io.to(user.room).emit('roomData', {
                room: user.room,
                usersList: getUsersInRoom(user.room)
            })
        }       
        
    })
})



server.listen(port, () => {
    console.log('Server is up on port ' + port + "!")
})