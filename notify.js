var Environment = require('./config').ENVIRONMENT;

var gcm = require('node-gcm-service');
var sender = new gcm.Sender();
sender.setAPIKey(Environment.gcm.key);

exports.notify = function(message, regIds){
	var message = new gcm.Message();
	message.addNewKeyValue('message',message.sender.sender.name + ": " + message.content);
	message.addNewKeyValue('title','New message' );
	message.timeToLive = 3000;

	sender.sendMessage(message.toString(), regIds, true, function(err, data) {
    	if (!err) console.log(data);
    	else console.log(err);
***REMOVED***);
***REMOVED***

