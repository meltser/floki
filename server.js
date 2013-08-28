//setup Dependencies
var connect = require('connect')
    , express = require('express')
    , port = (process.env.PORT || 8081);

function isLoggedIn(req) {
    return req.session && isValid(req.session.token);
}

var authFilter = function(req, res, next) {
    if (/\/css|\/html|\/images|\/js/ig.exec(req.originalUrl) != null) {
    } else if (req.originalUrl.indexOf("login") != -1 || req.originalUrl == "/") {
//    } else if (req.method != "GET") {
    } else if (!isLoggedIn(req)) {
        res.redirect('/html/login.html');
        return;
    }

    next();
}

//Setup Express
var server = express.createServer();
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

var tokens = {"f2e2a2c4-93f7-4483-9482-87d159c27862":"", "kuku":""};

///////////////////////////////////////////
//              Routes                   //
///////////////////////////////////////////

/////// ADD ALL YOUR ROUTES HERE  /////////

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
    return Object.prototype.hasOwnProperty.call(tokens, token);
}

server.post('/login/:hash', function (req, res) {
    var token = req.params.hash;
    var ret = isValid(token);
    if (ret && req.body.remember) {
        res.cookie('rememberme', '1', { maxAge: 900000, path: '/', httpOnly: true });
        res.cookie('token', token, { maxAge: 900000, path: '/', httpOnly: true }); // should be secure too
    }
    if (ret) {
        req.session.token = token;
    }
    res.send(ret);
});


//A Route for Creating a 500 Error (Useful to keep around)
server.get('/500', function (req, res) {
    throw new Error('This is a 500 Error');
});

//The 404 Route (ALWAYS Keep this as the last route)
server.get('/*', function (req, res) {
    throw new NotFound;
});

function NotFound(msg) {
    this.name = 'NotFound';
    Error.call(this, msg);
    Error.captureStackTrace(this, arguments.callee);
}


console.log('Listening on http://0.0.0.0:' + port);
