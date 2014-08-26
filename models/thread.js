var fs 			 = require('fs');
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
var crypto = require('crypto');

var ThreadSchema   = new Schema({
	pins:[String],
	created: {
		type:Date, 
		default: Date.now
***REMOVED***

	hash: String,
	last: {
		type:Date,
		default: Date.now
***REMOVED***
	lm: {***REMOVED***
***REMOVED***);

var ThreadModel = mongoose.model('Thread', ThreadSchema);
var PinModel = require('./pin').model;

exports.model = ThreadModel;

exports.createThread = function(req, res) {
	var pin_list = JSON.parse(req.body.pin_hashes);
	ThreadModel
		.findOne({ "$and": [ 
    		{ "pins": { "$all": pin_list ***REMOVED*** ***REMOVED***,
    		{ "pins": { "$size": pin_list.length ***REMOVED*** ***REMOVED***
		]***REMOVED***)
		.exec(function(err, thread){
			if (err)res.send(err);
			if(thread){
				res.json({
					thread:thread,
					message:'Thread Already Existed',
					success:true
			***REMOVED***);	
		***REMOVED***
			else {
				var threadInstance = new ThreadModel();
				threadInstance.hash = crypto.createHash('md5').update((new Date).toString()).digest("hex");
				threadInstance.pins = pin_list; 
				threadInstance.save(function(err){
					if (err)res.send(err);
					res.json({
						thread:threadInstance,
						message: 'Thread Created.',
						success:true
				***REMOVED***)
			***REMOVED***);
		***REMOVED***
	***REMOVED***);

	
***REMOVED***

exports.addPinToThread = function(req, res){
	ThreadModel.findOne({'hash':req.params.thread_hash***REMOVED***, function(err, threadInstance){
		if(err)res.send(err);
		if(!threadInstance)res.json({message:'Thread Hash does not exist', success:false***REMOVED***);

		PinModel.findOne({'pin':req.body.pin_name***REMOVED***, function(err, pinInstance){
			if(err)res.send(err);
			if(!pinInstance)res.json({message:'Pin Hash does not exist', success:false***REMOVED***);

			threadInstance.pins.push(pinInstance.hash);
			threadInstance.save(function(err){
				if(err)res.send(err);

				res.json({
					message:'Pin has been added to Thread',
					success:true
			***REMOVED***);
		***REMOVED***);
	***REMOVED***)
***REMOVED***);
***REMOVED***

exports.readThreads = function(req, res){
	ThreadModel
	.find()
	.sort('-last')
	.where('pins').in([req.params.pin_hash])
	.exec(function(err, threads){
		if (err) res.send(err);
		res.json({threads: threads, success:true***REMOVED***);
***REMOVED***);
***REMOVED***

exports.findPinNamesByThreadHash = function (req, res){
	ThreadModel.findOne({'hash': req.params.thread_hash***REMOVED***, function(err, threadInstance){
		if (err)res.send(err);
		PinModel
			.find()
			.where('hash').in(threadInstance.pins)
			.select('pin hash')
			.exec(function (err, pins){
				if (err)res.send(err);
				var names = [];
				pins.forEach(function(pin){
					if (req.params.pin_hash != pin.hash)names.push(pin.pin);
			***REMOVED***)
				res.json({pins: names, success:true***REMOVED***);
		***REMOVED***);
***REMOVED***);
***REMOVED***

exports.readThread = function(req, res) {
	ThreadModel.findOne({'hash':req.params.thread_hash***REMOVED***, function(err, threadInstance) {
		if (err)
			res.send(err);
		res.json({data:threadInstance, success:true***REMOVED***);
***REMOVED***);
***REMOVED***

exports.deleteThread = function(req, res) {
	ThreadModel.remove({
		_id: req.params.thread_hash
***REMOVED*** function(err, threadInstance) {
		if (err)
			res.send(err);

		res.json({ message: 'Successfully deleted' ***REMOVED***);
***REMOVED***);
***REMOVED***



//CRUD

