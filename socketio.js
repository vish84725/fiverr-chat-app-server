const users = require('./routes/users');
const chat = require('./routes/chat');
const conversation = require('./models/conversation');
const message = require('./models/message');
const activities = require('./models/activities');
const { on } = require('./models/conversation');
let onlineUsers = [];

exports = module.exports = function (io) {

// USER STATUS LOGS START


io.sockets.on('connection', (socket) => {

    console.log(' SOCKET ID ON SERVER ' + socket.id);
    socket.on('userdata', (user) =>{
      console.log('userdata',user);
      socket.username = user.username;
      socket.name = user.name;

      if(user && user.username){
        let isUserAlreadyExist = onlineUsers.find(u => u == user.username);
        console.log('alreadyExistUsewr',isUserAlreadyExist,onlineUsers);
        if(!isUserAlreadyExist){
          onlineUsers.push(user.username);
          console.log('push user');
        }
        io.sockets.emit('UserIsOnline', onlineUsers);
      }
      console.log('User ' + socket.username + ' ( ' + socket.name + ', id: ' + socket.id + ' ) ' + ' has CONNECTED');

      socket.on('disconnect', () => {
        console.log('111111',onlineUsers);
        onlineUsers = onlineUsers.filter(u => u != socket.username);
        io.sockets.emit('UserIsOffline', user.username);
        console.log('User ' + socket.username + ' ( ' + socket.name +  ', id: ' + socket._id + ' ) ' + ' has DISCONNECTED',onlineUsers);
      });
    });

// USER STATUS LOGS END
    
//  CHATROOM Routines start

    socket.on('join', (data) => {
      socket.join(data.room);
      console.log('User ' + socket.username + 
      ' ( ' + socket.name +  ', id: ' + socket.id + ' ) ' + ' has JOINED ROOM  ' + data.room);
      let rooms = Object.keys(socket.rooms);
      console.log(rooms);
    });

    socket.on('leave', (data) => {
      socket.leave(data.room);
      console.log('User ' + socket.username + ' ( ' + socket.name +  ', id: ' + socket._id + ' ) ' + ' has LEFT ROOM  ' + data.room);
    });

    // socket.on('new message', (conversation) => {
    //   io.sockets.in(conversation).emit('refresh messages', conversation);
    // });

//  CHATROOM Routines end


// DIRECT MESSAGE Routines start

    socket.on('message', (message) => {
      message = JSON.parse(message);
      console.log('User ' + message.username + ' ( ' + message.name + ',  id: ' + socket.id + ' ) ' + 'has sent a message: ' + message.message + ' in ROOM : ' + message.conversation_id );
      io.sockets.in(message.conversation_id).emit('new message', message);

      io.in(message.conversation_id).clients((error, clients) => {
        if (error) throw error;
        console.log('CLIENTS : ' + clients + ' in this CHATROOM : ' + message.conversation_id);
      })
    });

    socket.on('activity_agent', async (data) => {
      const reporter = data;
       let newactivities = new activities(reporter);
       await newactivities.save();
    });

    
    socket.on('log_out', async (userName) => {
      onlineUsers = onlineUsers.filter(u => u != userName);
      io.sockets.emit('UserIsOffline', userName);
    });

  });


// DIRECT MESSAGE Routines end
}