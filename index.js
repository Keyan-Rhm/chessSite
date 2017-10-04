var express = require('express');
var cookieParser = require('cookie-parser');
var app = express();

var moveSignal = 'chess position';
var drawSignal = 'draw offer';
var acceptDraw = 'accepting draw';
var rejectDraw = 'rejecting draw';
var restartSignal = 'restart offer';
var acceptRestart = 'accepting restart';
var rejectRestart = 'rejecting restart';
var undoSignal = 'undo offer';
var acceptUndo = 'accepting undo';
var rejectUndo = 'rejecting undo';
var resignSignal = 'player resigned';

app.use(express.static(__dirname + '/static'));
app.set('views', __dirname + '/static/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

var http = require('http').Server(app);
var io = require('/usr/local/lib/node_modules/socket.io')(http);

app.get('/', function(req, res) {
  res.render('home');
});

app.get('/playAI', function(req, res) {
  res.render('index', {player: req.query.player});
});

app.get('/playFriend', function(req, res) {
  res.render('multi', {player: req.query.player, lobbyID: req.query.lobbyID});
  console.log(players);
});

io.on('connection', function(socket) {
  console.log('a user connected');

  socket.on('disconnect', function() {
    console.log('user disconnected');
  });

  socket.on(moveSignal, function(info) {
    io.emit(moveSignal, info);
  });

  socket.on('reqest position', function(info) {
    io.emit('request position', info);
  });

  socket.on(resignSignal, function (info) {
    io.emit(resignSignal, info);
  });

  socket.on(restartSignal, function (info) {
    io.emit('accept restart?', info);
  });

  socket.on(drawSignal, function (info) {
    io.emit('accept draw?', info);
  });

  socket.on('draw accepted', function (info) {
    io.emit('draw accepted', info);
  });

  socket.on('restart accepted', function (info) {
    io.emit('restart accepted', info);
  });

  socket.on('decline all', function(info) {
    io.emit('decline all', info);
  });

  socket.on('broadcast alert', function(info) {
    io.emit('broadcast alert', info);
  });

  socket.on('accept undo?', function (info) {
    io.emit('accept undo?', info);
  });

  socket.on('undo accepted', function (info) {
    io.emit('undo accepted', info);
  });

  socket.on('request position', function (info) {
    io.emit('request position', info);
  });

});

http.listen(3000, function() {
  console.log('listening on *:3000');
});

