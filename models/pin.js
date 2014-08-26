var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
var fs 			 = require('fs');
var crypto = require('crypto');

var PinSchema   = new Schema({
	hash: String,
	pin: String,
	password: String,
	pic: {
		data: Buffer,
		contentType: String
***REMOVED***
***REMOVED***);

var PinModel = mongoose.model('Pin', PinSchema);

exports.schema = PinSchema;

exports.model = PinModel;

exports.createPin = function(req, res) {
	var pinInstance = new PinModel();		// create a new instance of the member model
	pinInstance.hash = crypto.createHash('md5').update(req.body.pin + (new Date).toString()).digest("hex");
	pinInstance.pin = req.body.pin;
	pinInstance.password = crypto.createHash('md5').update(req.body.password).digest("hex");

	pinInstance.pic.data = fs.readFileSync('./assets/'+Math.floor(Math.random() * 6) +'.jpg');
	pinInstance.pic.contentType = 'image/jpg';

	pinInstance.save(function(err) {
		if (err){
			res.json({
				message: err,
				success: false
		***REMOVED***);
	***REMOVED***
		res.json({ message: 'pin created!', success:true , pin:pinInstance ***REMOVED***);
***REMOVED***);
***REMOVED***;

exports.findPicByHash = function (req,res){
	PinModel.findOne({'hash':req.params.pin_hash***REMOVED***, function (err, pinInstance) {
        if (err) return next(err);
        res.contentType(pinInstance.pic.contentType);
        res.send(pinInstance.pic.data);
    ***REMOVED***);
***REMOVED***


exports.addPicToPin = function(req, res){

	console.log(req.files);
	PinModel.findOne({hash: req.params.pin_hash***REMOVED***, function(err, pinInstance) {
		if (err)
			res.send(err);

		pinInstance.pic.data = fs.readFileSync(req.files.pic.path);
		pinInstance.pic.contentType = req.files.pic.mimetype;

		pinInstance.save(function(err) {
			if (err){
				res.json({
					message: err,
					success: false
			***REMOVED***);
		***REMOVED***
			res.json({ message: 'pic added to pin!', success:true ***REMOVED***);
	***REMOVED***);
***REMOVED***);
***REMOVED***

exports.readAllPins = function(req, res){
	var re = new RegExp(req.params.search_term, 'i');
	PinModel
	.find()
	.where('pin').regex(re)
	.limit(5)
	.select('pin hash ')
	.exec(function(err, pinInstances){
		if(err)res.send(err);
		unsalted = [];
		pinInstances.forEach(function(pinInstance){
			unsalted.push({
				hash: pinInstance.hash,
				pin: pinInstance.pin
		***REMOVED***)
	***REMOVED***)
		res.json(unsalted);
***REMOVED***);
***REMOVED***

exports.readPin = function(req, res) {
	PinModel.findOne({hash: req.params.pin_hash***REMOVED***, function(err, pin) {
		if (err)
			res.send(err);
		res.json(pin);
***REMOVED***);
***REMOVED***;


exports.deletePin = function(req, res) {
	PinModel.remove({
		hash: req.params.pin_hash
***REMOVED*** function(err, pin) {
		if (err)
			res.send(err);

		res.json({ message: 'Successfully deleted pin' ***REMOVED***);
***REMOVED***);
***REMOVED***;

exports.authenticate = function (pin, password, done){
    pass = crypto.createHash('md5').update(password).digest("hex");
    PinModel.findOne({'pin':pin***REMOVED***,function (err, item){
    	if (err){ 
    		return done(err);
    ***REMOVED***
    	else if (item){
    		if (pass == item.password){
    			return done (null, {pin :{
    				hash: item.hash,
    				pic: item.pic,
    				name: item.pin
    		***REMOVED*** message:"Successfully signed in", success:true***REMOVED***);
    	***REMOVED***
    		else done (null, false, {message: 'Incorrect Password', success:false ***REMOVED***);
    ***REMOVED***
    	else return done(null, false, {message:'Pin doesn\'t exist.', success:false ***REMOVED***);
    ***REMOVED***);
***REMOVED***;

exports.serialize = function (obj, done){
    done (null, obj.pin.hash);
***REMOVED***;

exports.deserialize = function (hash, done){
	PinModel.findOne({'hash': hash***REMOVED***, function (err, item){
		done(err, item);
***REMOVED***);
***REMOVED***;
