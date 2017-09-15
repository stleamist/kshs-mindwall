const language = require('@google-cloud/language');
const config = require('config');

const languageClient = language({
  projectId: config.get('google-cloud.projectId'),
  keyFilename: config.get('google-cloud.keyFilename')
});

function analyzeSentiment(content) {
	const type = language.v1.types.Document.Type.PLAIN_TEXT;
	const document = { content, type };
	
	return languageClient.analyzeSentiment({document: document});
}

module.exports = analyzeSentiment;