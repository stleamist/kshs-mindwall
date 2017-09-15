const express = require('express');
const Message = require('../schema/messageSchema.js');
const analyzeSentiment = require('../google-cloud/analyzeSentiment.js');
const convert = require('color-convert');
const hangul = require('hangul-js');

var router = express.Router();

router.get('/', async function(req, res, next) {
	Message.find({}, function(err, docs) {
		res.send(docs);
	});
	
});

router.post('/', async function(req, res, next) {
	console.log(req.body)
	// 요청 데이터
	let data = {
		text: req.body.text,
		typingCount: req.body.typingCount,
		duration: req.body.duration,
		position: [req.body.position[0], req.body.position[1]]
	}
	console.log(req.body)
	
	// 구글 클라우드 자연어 API
	
	const analyses = await analyzeSentiment(data.text);
	const sentiment = analyses[0].documentSentiment;
	
	let fixedSentiment = {
		score: sentiment.score.toFixed(1),
		magnitude: sentiment.magnitude.toFixed(1)
	}
	
	// 색상, 크기
	let scale = getScale(data);
	
	// 데이터베이스 저장
	
	let messageObject = {
		text: data.text,
		typingCount: data.typingCount,
		duration: data.duration,
		position: data.position,
		sentiment: fixedSentiment,
		scale: scale
	}
	
	let message = Message(messageObject);
	message.save().then(function() {
		res.send(message);
	});
});

function getScale(data) {
	let finalTypingCount = hangul.disassemble(data.text).length;
	let scale = (data.duration / finalTypingCount) + 1;
	scale = Math.max(1, Math.min(scale, 2));
	return scale;
}

module.exports = router;