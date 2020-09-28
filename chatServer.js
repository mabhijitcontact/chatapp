const express = require('express');
const app = express();
const socketio = require('socket.io');
const port = process.env.PORT || 3665

app.use(express.static(__dirname + '/public'));

const expressServer = app.listen(port);
console.log('server running on port ' + port);
const io = socketio(expressServer);

let usersJoined = [];
let userInfo = {};
// io.on = io.of('/').on I have made entire things on root namespace
// app.get("/runningport", (req, res)=>{
//     res.json("")
// });

io.on('connection', (socket) => {
    let userName = socket.handshake.query.username;
    console.log(socket.client.conn.server.clientsCount + " ---- users connected socket id is : " + socket.id);
    if (socket.client.conn.server.clientsCount > 2) {
        io.sockets.connected[socket.id].emit('loginFailed', { text: 'Two Member already joined, sorry try again latter' });
        io.sockets.connected[socket.id].disconnect();
    } else {
        socket.emit('connectionConfirmation', { data: "Welcome to the socketio server" });
        console.log("Someone connected to the main namespace");
        userInfo = { socketID: socket.id, username: userName }
        usersJoined.push(userInfo);
    }



    socket.on('newMessageToServer', (msg) => {
        const fullMsg = {
            text: msg.text,
            time: Date.now(),
            username: userName,
            avatar: 'https://via.placeholder.com/30'
        }
        io.of('/').emit('newMessageToClients', fullMsg);
    });

    socket.on("leaveChatRequestFromClient", (socketID) => {
        console.log(socketID);
        io.sockets.connected[socketID.mySocketID].emit('leaveChatResponseFromClient', { text: "Successfully Disconnected" });
        io.sockets.connected[socketID.mySocketID].disconnect();
    });
});