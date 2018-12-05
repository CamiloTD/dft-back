const { model, Schema, connect } = require('mongoose');
const { DATABASE_CONNECTION_STRING } = require('./config.json');

let database = null;

exports = module.exports = connect(DATABASE_CONNECTION_STRING, { useNewUrlParser: true });

exports.Session = model('session', new Schema({
    token: String,
    verify: String,
    secret: String,
    user: String,
    createdAt: { type: Date, default: Date.now }
}));