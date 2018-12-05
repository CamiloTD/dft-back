const Config = require('./config.json');
const Twitter = require('node-twitter-api');
const { promisify } = require('util');

const twitter = new Twitter({
    consumerKey: Config.API_KEY,
    consumerSecret: Config.API_SECRET,
    access_token_key: '715283188298289153-9hSvCAKi0RdQVUbBUkuBOROWfYwLQjj',
    access_token_secret: 'YpPuPaTAxa0IJRuhnHqLAxUqtEUYgHjKPt21WqCtYmtJq'  ,
    callback: Config.CALLBACK_URL
});

let _promisify = (f) => promisify(f.bind(twitter)); 

exports.requestToken = () =>
    new Promise((done, err) =>
        twitter.getRequestToken((error, token, secret) => error? err(error) : done({ token, secret }))
    )
exports.accessToken = (token, secret, verifier) =>
    new Promise((done, err) =>
        twitter.getAccessToken(token, secret, verifier, (error, token, secret) => error? err(error) : done({ token, secret }))
    )

exports.verifyCredentials = _promisify(twitter.verifyCredentials);
exports.statuses = _promisify(twitter.statuses)
exports.timeline = _promisify(twitter.getTimeline);