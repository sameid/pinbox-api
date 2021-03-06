var fs 			 = require('fs');
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
var crypto = require('crypto');
var server = require('../server');
var notify = require('../notify');

var MessageSchema   = new Schema({
	sender: {},
	content: String,
	created: Date,
	hash: String,
	thread: String
});

var MessageModel = mongoose.model('Message', MessageSchema);

var ThreadModel = require('./thread').model;


exports.createMessage = function(req, res) {

	var messageInstance = new MessageModel();

	messageInstance.hash = crypto.createHash('md5').update(req.body.sender + (new Date).toString()).digest("hex");
	

	messageInstance.content = req.body.content;
	messageInstance.created = new Date();
	messageInstance.thread = req.body.thread_hash;

	messageInstance.sender = {
		hash:req.body.sender_hash,
		name:req.body.sender_name
	}
	
	ThreadModel.findOne({'hash':req.body.thread_hash}, function(err, threadInstance){
		if (err)res.send(err);
		if (threadInstance){
			console.log(threadInstance);
			threadInstance.last = messageInstance.created;
			threadInstance.lm = messageInstance;
			threadInstance.save(function(err){
				if(err)res.send(err);
			});

			messageInstance.save(function(err){
				if (err)res.send(err);

				var regIds = new Array();
				threadInstance.pins.forEach(function(_pin){
					if (_pin != req.body.sender_hash){
						if(server.regId_map[_pin]){
							// server.conn_map[_pin].write(JSON.stringify(messageInstance));
							
							regIds.push(server.regId_map[_pin]);

						}
						else {
							//push notification?
						}
					}
				});
				// notify.notify(messageInstance, regIds);

				res.json({
					messageObj:messageInstance,
					message: 'Message Sent.',
					success:true
				});
				//do some push notification here...
			});
		}
		else {
			res.json({
				message:'Thread does not exist',
				success:false
			})
		}
		
	});

	

}

exports.findAllMessagesByThreadHash = function (req, res){
	MessageModel
		.find()
		.where('thread').equals(req.params.thread_hash)
		.sort('created')
		.select('content sender hash created thread')
		.exec(function(err, messages){
			if(err)res.send(err);
			res.json({messages:messages, success:true});
		});

}

// exports.readAllMessagesForPin = function(req, res){
// 	MessageModel
// 		.find()
// 		.where('recipient').equals(req.params.pin_hash)
// 		.sort('-created')
// 		.select('content recipient sender hash created')
// 		.exec(function(err, messages){
// 			if(err)res.send(err);
// 			res.json({messages:messages, success:true});
// 		});
// }

exports.readAllMessages = function(req, res) {
	MessageModel.find(function(err, messages) {
		if (err)res.send(err);

		res.json(messages);
	});
}

exports.readMessage = function(req, res) {
	MessageModel.findOne({'hash':req.params.message_hash}, function(err, messageInstance) {
		if (err)
			res.send(err);
		res.json({data:messageInstance, success:true});
	});
}

exports.deleteMessage = function(req, res) {
	MessageModel.remove({
		_id: req.params.message_hash
	}, function(err, messageInstance) {
		if (err)
			res.send(err);

		res.json({ message: 'Successfully deleted' });
	});
}



//CRUD

