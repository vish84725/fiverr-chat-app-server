const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const mongoose = require('mongoose');
const config = require('./config/database');


const app = express();
const port = 3000;
const users = require('./routes/users');
const chat = require('./routes/chat');
const socketio = require('./socketio');  


//MongoDB
mongoose.connect(config.database, { 
    useNewUrlParser: true,
    useUnifiedTopology: true
});
//On connection
mongoose.connection.on('connected', () => {
    console.log('Connected to database ' + config.database);
});
//If error
mongoose.connection.on('error', (err) => {
    console.log('Database error  ' + config.database);
});

//CORS
app.use(cors());
//Body Parser
app.use(bodyParser.json());

//Passport 
app.use(passport.initialize());
app.use(passport.session());

//JWT
require('./config/passport')(passport);

//Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

//Users
app.use('/users', users);
app.use('/chat', chat);

//Start Server
server = app.listen(process.env.PORT || 3000, () => {
    console.log('Server Started');
});

//socket.io
const io = require('socket.io').listen(server);

socketio(io);  

//ROUTES

//Index Route
app.get('/', (req, res) => {
    res.send('Nothing to see here <br> for now... <br>');
});


/*app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});*/
