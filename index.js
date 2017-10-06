var express = require('express');
var app = express();

var requestIp = require('request-ip');

var lobbyPositions = {};
var lobbyCapacity = {};
var ipToEntryKey = {};

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

function allowedAccess (IP, lobbyID, player) {
  if (ipToEntryKey[IP + player] === lobbyID + player)
  {
    return true;
  }
  return false;
}

function parseCookies (request) {
    var list = {},
        rc = request.headers.cookie;

    rc && rc.split(';').forEach(function( cookie ) {
        var parts = cookie.split('=');
        list[parts.shift().trim()] = decodeURI(parts.join('='));
    });

    return list;
}

app.use(express.static(__dirname + '/static'));
app.set('views', __dirname + '/static/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res) {
  res.render('home');
});

app.get('/playAI', function(req, res) {
  res.render('index', {player: req.query.player});
});

app.get('/playFriend', function(req, res) {
  var player = req.query.player;
  var lobbyID = req.query.lobbyID;

  var IP = requestIp.getClientIp(req);

  if (player === 'b' || player === 'w')
  {
    if (!lobbyCapacity[lobbyID])
    {
      lobbyCapacity[lobbyID] = player;
      ipToEntryKey[IP + player] = lobbyID + player;
    }
    else if (lobbyCapacity[lobbyID] === 'w' && player === 'b' || lobbyCapacity[lobbyID] === 'b' && player === 'w')
    {
      lobbyCapacity[lobbyID] += player;
      ipToEntryKey[IP + player] = lobbyID + player;
    }
    else if (!allowedAccess(IP, lobbyID, player))
      player = 'spectator';
  }

  console.log(lobbyCapacity[lobbyID]);

  res.render('multi', {player: player, lobbyID: req.query.lobbyID});
});

io.on('connection', function(socket) {
  console.log('a user connected');

  socket.on('disconnect', function() {
    console.log('user disconnected');
  });

  socket.on(moveSignal, function(info) {
    lobbyPositions[info.lobbyID] = info.pgn;
    io.emit(moveSignal, info);
  });

  socket.on('request position', function(info) {
    io.emit('load position', {lobbyID: info.lobbyID, pgn: lobbyPositions[info.lobbyID], player: info.player});
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

});

http.listen(3000, function() {
  console.log('listening on *:3000');
});

