
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , socketIO = require('socket.io')
  , util = require('util')
  , net = require('net')
  , spawn = require('child_process').spawn
  , fs = require('fs')
  , events = require('events');
  
var emitter = new events.EventEmitter(); 
  
var app = module.exports = express.createServer();

var io = socketIO.listen(app);

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'G2h3aBFjx56cHGecBfmg3LeK7sGmINsp' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

var spawns = [];
var servers = [];
var cap_file_path = __dirname + '/../libs/capistrano/tail.rb';
fs.readdir(__dirname + '/../config', function(err, files){
	files.forEach(function(file_name){
		if(file_name.match(/^.+\.rb$/) !== null){
			conf_file_name = file_name.replace(/\.rb$/, '');
			servers.push(conf_file_name);
			var tail = spawn('cap', ['-f', cap_file_path, 'tail', 'config=' + conf_file_name]);
			tail._server_name = conf_file_name;
			tail.stderr.on('data', function(data){
				console.log('err', data.toString());
			});
			tail.on('exit', function(data){
				console.log('exit', data.toString());
			});
			tail.stdout.on('data', function(tail_data){
				var sname = tail._server_name;
				emitter.emit('tail_stdout', {server: sname, msg: tail_data.toString()});
			});
			spawns.push(tail);
		}
	});
});

io.sockets.on('connection', function(socket){
	socket.emit('news', {id : socket.id});
	emitter.on('tail_stdout', function(data){
		socket.emit('tail', data);
	});
});


app.get('/', function(req, res){
	res.render('index', {
		title: 'Express',
		servers: servers
	}); 
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
