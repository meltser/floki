//setup Dependencies
var connect = require('connect')
    , util = require('util')
    , express = require('express')
    , port = (process.env.PORT || 8081);
var config = require('./config');
var Sequelize = require("sequelize");
/*var pg = require('pg');
var client = new pg.Client(config.conString);
client.connect(function (err) {
    if (err) {
        return console.error('could not connect to postgres', err);
    }
    return console.log("connected to db");
});*/

global.users = {};
var sql = new Sequelize(config.conString, {logging: false, dialect: 'postgres', sync: { force: true }});
global.User = sql.import(__dirname + "/models/User");
global.Torrent = sql.import(__dirname + "/models/Torrent");
User.hasMany(Torrent, {as: 'Torrents'});
Torrent.belongsTo(User, {as: 'User'});
User.sync();
Torrent.sync(/*{force: true}*/);

User.findAll().success(function(all) {
    for (var i = 0; i < all.length; ++i) {
        var user = all[i];
        users[user.token] = user;
    }
    Object.keys(users).forEach(function(key) {
        console.log(key);
    });
});

function isLoggedIn(req) {
    if (req.session && isValid(req.session.token)) {
        return true;
    }
    if (isValid(req.body.token)) {
        req.session.token = req.body.token;
        return true;
    }
    if (isValid(req.cookies.token)) {
        req.session.token = req.cookies.token;
        return true;
    }
    return false;
}

var authFilter = function (req, res, next) {
    if (/\/css|\/html|\/images|\/js/ig.exec(req.originalUrl) != null) {
    } else if (req.originalUrl.indexOf("login") != -1 || req.originalUrl == "/") {
//    } else if (req.method != "GET") {
    } else if (!isLoggedIn(req)) {
        res.statusCode = 500;
        return res.send('Auth failure');
    }

    next();
};

//Setup Express
global.server = express.createServer();
server.configure(function () {
    server.set('views', __dirname + '/views');
    server.set('view options', { layout: false });
    server.use(connect.bodyParser());
    server.use(express.cookieParser());
    server.use(express.session({ secret: "kuku shmuku"}));
    server.use(connect.static(__dirname + '/static'));
    server.use(authFilter);
    server.use(server.router);
});

//setup the errors
server.error(function (err, req, res, next) {
    console.log(err);
    if (err instanceof NotFound) {
        res.render('404.jade', { locals: {
            title: '404 - Not Found', description: '', author: '', analyticssiteid: 'XXXXXXX'
        }, status: 404 });
    } else {
        res.render('500.jade', { locals: {
            title: 'The Server Encountered an Error', description: '', author: '', analyticssiteid: 'XXXXXXX', error: err
        }, status: 500 });
    }
});
server.listen(port);

server.get('/', function (req, res) {
    if (req.session && isValid(req.session.token)) {
        res.redirect('/html/main.html')
        return;
    }

    if (req.cookies.rememberme == 1 && isValid(req.cookies.token)) {
        res.redirect('/html/main.html')
    } else {
        res.redirect('/html/login.html', 302)
    }
});

function isValid(token) {
    if (token == undefined || token == null) {
        return false;
    }
    return Object.prototype.hasOwnProperty.call(users, token);
}

server.post('/login/:hash', function (req, res) {
    var token = req.params.hash;
    var ret = isValid(token);
    console.log(token);
    if (ret && req.body.remember) {
        res.cookie('rememberme', '1', { maxAge: 7 * 24 * 60 * 60 * 1000, path: '/', httpOnly: true });
        res.cookie('token', token, { maxAge: 7 * 24 * 60 * 60 * 1000, path: '/', httpOnly: true }); // should be secure too
    }
    if (ret) {
        req.session.token = token;
    }
    res.send(ret);
});

require("./rest");

process.on('uncaughtException', function(err) {
    // handle the error safely
    console.log(err);
});

console.log('Listening on http://0.0.0.0:' + port);
