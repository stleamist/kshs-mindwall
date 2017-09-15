const mongoose = require('mongoose');
const config = require('config');

const url = config.get('mongodb.url');

global.db = mongoose.createConnection(url);
mongoose.Promise = global.Promise;


const Schema = mongoose.Schema;
	
const messageSchema = new Schema({
	text: String,
	typingCount: Number,
	duration: Number,
	position: Array,
	sentiment: {
		score: Number,
		magnitude: Number
	},
	scale: Number
});

const Message = global.db.model("message", messageSchema);

module.exports = Message;