//----------------------------------------------------------------------------------------------
// Module dependencies
//----------------------------------------------------------------------------------------------
// Express.io, combination of express and socket.io
var express = require('express.io'); 
var app = module.exports = express();
app.http().io();
// Serve-favicon, module to display favicon
var favicon = require('serve-favicon'); 
app.use(favicon(__dirname + '/public/img/favicon.ico'));
// Redis, database module
var redis = require('redis')
redisClient = redis.createClient();
// Standard stuff
app.configure(function(){
	  app.use(express.bodyParser());
	  app.use(app.router);
	});
var http = require('http');
var path = require('path');

//----------------------------------------------------------------------------------------------
// Queue
//----------------------------------------------------------------------------------------------
var queue = require('./modules/queue');
queue.initialize();
queue.process();

//----------------------------------------------------------------------------------------------
// Routes
//----------------------------------------------------------------------------------------------
var index = require('./routes');
var result = require('./routes/result');
var pi = require('./routes/pi');

//----------------------------------------------------------------------------------------------
// Express - All environments
//----------------------------------------------------------------------------------------------
app.set('port', process.env.PORT || 44444);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

//----------------------------------------------------------------------------------------------
// Development only
//----------------------------------------------------------------------------------------------

if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//----------------------------------------------------------------------------------------------
// Error handling if we are unable to connect to redis
//----------------------------------------------------------------------------------------------

redisClient.on("error", function (err) {
	console.log("Redis server cannot be reached.");
	});

//----------------------------------------------------------------------------------------------
// Create server and listen to port
//----------------------------------------------------------------------------------------------

app.listen(app.get('port'), function(){
   console.log("Express server listening on port " + app.get('port'));
});

//----------------------------------------------------------------------------------------------
// Socket routes
//----------------------------------------------------------------------------------------------

//Joins a room
app.io.route('join', function(req) {
	console.log('Client joined room ' + req.data);
	result.callback(req);
	pi.callback(req);
})

// Leaves a room
app.io.route('leave', function(req) {
    req.io.leave(req.data);
})

//##############################################################################################
// Display landing page
//##############################################################################################
app.get('/', index.display);

//##############################################################################################
//Display result of run
//##############################################################################################

//app.post('/upload', index.upload);

//app.get('/show', index.show)

app.get('/upload', index.upload)


//##############################################################################################
//Display result of run
//##############################################################################################
app.get('/:jobname', result.display);
//app.get('/r/:result', result.display);