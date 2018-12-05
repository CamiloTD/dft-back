const PORT = 8000;

const cors = require('cors');
const express = require('express');
const expressSession = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const socket_io = require('socket.io');
const { requestToken, accessToken, verifyCredentials, statuses, timeline } = require('./twitter-api');
const db = require('./db');
const { Session } = db;

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());
app.use(expressSession({
    secret: "JustAVeryLongSecret",
    resave: false,
    saveUninitialized: true
}));

app.get('/oauth_request', async (rq, rs) => {
    try {
        let token = await requestToken();
        
        let session = await Session.create({
            secret: token.secret,
            token: null,
            verify: null,
            user: null
        });

        rs.json({
            url: `https://api.twitter.com/oauth/authenticate?oauth_token=${token.token}`,
            token: session._id
        });
    } catch (exc) {
        rs.status(500).send(exc);
    }
});

app.post('/connect', async (rq, rs) => {
    let session = await Session.findOne({ _id: rq.body.token });
    
    try {
        let { token, secret } = await accessToken(rq.body.oauth_token, session.secret, rq.body.oauth_verify);
        let user = await verifyCredentials(token, secret);

        await Session.findOneAndUpdate({ _id: rq.body.token }, {
            token: token,
            verify: secret,
            user: user.id
        });

        rs.json(user);

    } catch (exc) {
        console.log(exc);
        rs.status(500).send(exc);
    }
});

app.get('/tweets', async (rq, rs) => {
    let session = await Session.findOne({ _id: rq.query.token });

    try {

        let data = await timeline("user_timeline", {
            user_id: session.id,
            count: 100
        }, session.token, session.verify);

        rs.json(data);
    } catch (exc) {
        console.log(exc);
        rs.status(500).send(exc);
    }
});

app.post('/tweet', async (rq, rs) => {
    let session = await Session.findOne({ _id: rq.body.token });
    try {
        rs.json(await statuses("update", {
            status: rq.body.status
        }, session.token, session.verify))
    } catch (exc) {
        console.log(exc);
        rs.status(500).send(exc);
    }
});

app.post('/disconnect', async (rq, rs) => {
    try {
        rs.json(await Session.remove({ _id: rq.query.token }));
    } catch (exc) {
        console.log(exc);
        rs.status(500).send(exc);
    }
})

module.exports = new Promise((done) => {
    console.log("Connecting to database...");
    db.then(() => {
        console.log("Connection sucessfully...");
        app.listen(PORT, () => {
            console.log("App started sucessfully at 0.0.0.0:8000");
            done();
        })
    });
});