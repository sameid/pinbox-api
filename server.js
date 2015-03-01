var Environment = require('./config').ENVIRONMENT;

var express	= require('express');

//Express Middleware
var session = require('express-session');
var bodyParser = require('body-parser');
var multer = require('multer');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');
var cors = require('cors');

//SockJS Dependencies
// var sockjs = require('sockjs');
// var S = require('string');

//Express
var app	= express();
var server = require('http').createServer(app);

// var echo = sockjs.createServer();
var regId_map = {};
exports.regId_map = regId_map;
// echo.on('connection', function(conn) {
//     conn.on('data', function(message) {
//     	var client = JSON.parse(message);
// 		console.log(client);
// 		if (client.init){
// 			conn_map[client.hash] = {
// 				socket: conn,
// 				regId: client.regId
// 			}
// 		}
// 		// console.log(message);
// 		// if (S(message).startsWith('pin:')){
// 		// 	var pin = S(message).chompLeft('pin:').s;
// 		// 	console.log('New socket connection with: ' + pin);
// 		// 	conn_map[pin] = conn;
// 		// }
//     });
//     conn.on('close', function() {

// 	});
// });

// echo.installHandlers(server, {prefix:'/echo'});

//Passport Session Libs
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var RedisStore = require('connect-redis')(session);

//Middleware Instantiation
app.use(multer({uploadDir:'./uploads'}));
app.use(bodyParser());
app.use(cookieParser());
app.use(morgan('tiny'));
app.use(cors());
app.use(session({
	saveUninitialized: true,
	resave: true,
    store: new RedisStore({
        host: Environment.redis.host, 
        port: Environment.redis.port
    }),
    secret: Environment.redis.secret,
    cookie: {
    	httpOnly: false
    }
}));
app.use(passport.initialize());
app.use(passport.session());

// CORS (Cross-Origin Resource Sharing) headers to support Cross-site HTTP requests
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

var port = process.env.PORT || 8080; // set our port

//DB Specific Handling
var mongoose = require('mongoose');
var pinHandler = require('./models/pin');
var messageHandler = require('./models/message');
var threadHandler = require('./models/thread');

var connection = mongoose.connect(Environment.mongo.connectString, function(err){
	if (err) console.log(err);
}); // connect to our database


//Passport Specific stuff
passport.use(new LocalStrategy(pinHandler.authenticate));
passport.serializeUser(pinHandler.serialize);
passport.deserializeUser(pinHandler.deserialize);

var auth = function (req, res, next) {

	// console.log(res);x
  if (req.isAuthenticated()) { next(); }
  else {
  	res.send("Your request was not authenticated, please login.");
  }
}

var router = express.Router();

router.get('/', function(req, res) {
	res.json({ message: 'PushPin API v0.0.1' });	
});

router.route('/pins')
	/*
		Type: 			POST
		Description: 	API Endpoint to create pin within the database.
		Required Body	pin, password
		Required Params	*
	*/
	.post(pinHandler.createPin)


router.route('/pins/:pin_hash')
	/*
		Type: 			 GET
		Description: 	 Get get a pin within the database.
		Required Body:	 *
		Required Params: pin_hash
	*/
	.get(pinHandler.readPin) //read a pin
	/*
		Type: 			 DELETE
		Description: 	 Delete a pin within the database.
		Required Body:   *
		Required Params: pin_hash
	*/
	.delete(auth, pinHandler.deletePin) //delete a pin
	.post(function (req, res){
		regId_map[req.params.pin_hash] = req.body.regId;
	});


router.route('/pins/:pin_hash/pic')
	/*
		Type: 			 POST
		Description: 	 Allows for upload of a Profile Pic to be attached to a pin
		Required Body:	 req.files.pic
		Required Params: pin_hash
	*/
	.post(pinHandler.addPicToPin); //add a profile pic to a pin

router.route('/pins/:pin_hash/pic')
	/*
		Type: 			 GET
		Description: 	 Endpoint for a displayable image of the a Pin Profile Pic
		Required Body:	 *
		Required Params: pin_hash
	*/
	.get(pinHandler.findPicByHash); //access pic on pin
	
router.route('/pins/:pin_hash/threads') //access all threads for a pin
	/*
		Type: 			 GET
		Description: 	 Get all the threads for a particular pin
		Required Body:	 *
		Required Params: pin_hash
	*/
	.get(threadHandler.readThreads);

router.route('/search/:search_term')
	.get(pinHandler.readAllPins);

// router.route('/messages/pin/:pin_hash')
// 	.get(auth, messageHandler.readAllMessagesForPin)

router.route('/threads')
	/*
		Type: 			 POST
		Description: 	 Create a new thread for a pin 
		Required Body:	 pin_hashes
		Required Params: *
	*/
	.post( threadHandler.createThread);//create a thread 

router.route('/threads/:thread_hash')
	/*
		Type: 			 GET
		Description: 	 Read a particular a thread
		Required Body:	 *
		Required Params: thread_hash
	*/
	.get(auth, threadHandler.readThread)

router.route('/threads/:thread_hash/addPin')
	/*
		Type: 			 POST
		Description: 	 Add a Pin to a thread
		Required Body:	 pin_name
		Required Params: thread_hash
	*/
	.post(threadHandler.addPinToThread);//create a thread 

router.route('/threads/:thread_hash/messages')
	/*
		Type: 			 GET
		Description: 	 get's all messages associated with a thread
		Required Body:	 *
		Required Params: thread_hash
	*/
	.get( messageHandler.findAllMessagesByThreadHash)

router.route('/threads/:thread_hash/pins/:pin_hash')
	/*
		Type: 			 GET
		Description: 	 get's all pins names associated with a thread
		Required Body:	 *
		Required Params: thread_hash
	*/
	.get( threadHandler.findPinNamesByThreadHash)


router.route('/messages')
	/*
		Type: 			 POST
		Description: 	 Create a new message
		Required Body:	 sender_hash, sender_name, content, thread_hash
		Required Params: *
	*/
	.post(messageHandler.createMessage)//create a message
	/*
		Type: 			 GET
		Description: 	 Get all messages
		Required Body:	 *
		Required Params: *
	*/
	.get(messageHandler.readAllMessages);//read all messages


router.route('/messages/:message_hash')
	/*
		Type: 			 GET
		Description: 	 Read a particular message
		Required Body:	 *
		Required Params: message_hash
	*/
	.get(auth, messageHandler.readMessage)//read a message
	/*
		Type: 			 DELETE
		Description: 	 Delete a particular message
		Required Body:	 *
		Required Params: message_hash
	*/
	.delete(auth,messageHandler.deleteMessage);//delete a message


router.route('/login')
	.post(function (req, res){
		passport.authenticate('local', function (err, user, info){
			
			if (err) return res.json(err);
			if (!user) return res.json(info);

			console.log(user);

			req.login(user, function (err){
				console.log(err)
				if (err) return res.json(err);
				return res.json(user);
			});

		})(req, res);
	});

router.route('/logout')
	.get(function (req,res){
		req.logout();
		res.json({success:true});
	});

// REGISTER OUR ROUTES -------------------------------
app.use('/api', router);


// START THE SERVER
// =============================================================================
server.listen(port);
console.log('-------------------------------------------------');
console.log('Pinbox API v0.0.1 Started.');
console.log('Listening on port: ' + port);
console.log('-------------------------------------------------');
