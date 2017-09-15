var shortid = require('shortid');
var express = require('express');
var cookieParser = require('cookie-parser');
var app = express();

app.use(express.static(__dirname + '/static'));
app.set('views', __dirname + '/static/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

var http = require('http').Server(app);
var io = require('/usr/local/lib/node_modules/socket.io')(http);

var players = 2;

app.get('/', function(req, res) {
  res.render('home');
});

app.get('/playAI', function(req, res) {
  res.render('index', {myTinyURL: shortid.generate(), player: req.query.player});
});

app.get('/:id', function(req, res) {
  console.log("Memes" + req.params.id);
  res.render('multi', {numPlayers: req.params.id, player: req.query.player});
  console.log(players);
  players -= 1;
});

io.on('connection', function(socket) {
  console.log('a user connected');
  socket.on('disconnect', function() {
    console.log('user disconnected');
  });
  socket.on('chess position', function(position) {
    console.log('position: ' + position);
    io.emit('chess position', position);
  });
});

http.listen(3000, function() {
  console.log('listening on *:3000');
});

