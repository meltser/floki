server.post('/torrent', function (req, res) {
    if(!req.body.hasOwnProperty('name') ||
        !req.body.hasOwnProperty('hash') ||
        !req.body.hasOwnProperty('size') ||
        !req.body.hasOwnProperty('magnet')) {
        res.statusCode = 400;
        return res.send('Invalid request');
    }
    var user = users[req.session.token];
    if (user == undefined) {
        res.statusCode = 500;
        return res.send('Something went really wrong');
    }
    var status = req.body.status != undefined ? req.body.status : 0;
    Torrent.findOrCreate({ hash: req.body.hash, user_id: user.id },
        { hash: req.body.hash, name: req.body.name, status: status, size: req.body.size, magnet: req.body.magnet }).success(function(torrent, created) {
            console.log(created);
            if (!created) {
                torrent.status = status;
                torrent.size = req.body.size;
                torrent.save().error(function(err){ console.log(err); });
            }
    }).error(function(err){ console.log(err); });

    res.statusCode = 200;
    return res.send("OK");
});

server.post('/torrents', function (req, res) {
    var newTorrentsMap = {};
    for (var i = 0; i < req.body.torrents.length; i++) {
        var torrent = req.body.torrents[i];
        newTorrentsMap[torrent[0]] = torrent;
    }

    User.find({where: {token: req.session.token}}).success(function(user) {
        Torrent.findAll({user_id: user.id}).success(function(torrents) {
            var existingTorrentsMap = {};
            for (var i = 0; i < torrents.length; i++) {
                var torrent = torrents[i];
                existingTorrentsMap[torrent.hash] = torrent;
                if (newTorrentsMap[torrent.hash] == undefined) {
                    console.log(torrent.name + " should be deleted");
                    Torrent.destroy({hash: torrent.hash, user_id: user.id}).error(function(error) {
                        console.log("failed to update torrent: " + error);
                    });
                } else {
                    console.log(torrent.name + " should be updated");
                    Torrent.update({hash: torrent.hash, name: newTorrentsMap[torrent.hash][2], state: newTorrentsMap[torrent.hash][1], size: newTorrentsMap[torrent.hash][3], downloaded: newTorrentsMap[torrent.hash][5]},
                        {hash: torrent.hash, user_id: user.id}).error(function(error) {
                            console.log("failed to update torrent: " + error);
                        });
                }
            }
            for(var hash in newTorrentsMap) {
                var torrent = newTorrentsMap[hash];
                if (existingTorrentsMap[hash] == undefined) {
                    console.log(torrent[2] + " should be added");
                    var tmp = {hash: torrent[0], name: torrent[2], state: torrent[1], size: torrent[3], trackers: "", downloaded: torrent[5], user_id: user.id};
                    console.log(tmp);
                    Torrent.create(tmp).success(function(torrent) {
                        console.log("created " + torrent.name);
                    }).error(function(error) {
                            console.log("failed to save torrent: " + error.message);
                        });
                }
            }
        });
    });
    res.statusCode = 200;
    return res.send("OK");
});

server.post('/trackers', function (req, res) {
    User.find({where: {token: req.session.token}}).success(function(user) {
//        console.log(req.body);
        for (var i = 0; i < req.body.props.length; i++) {
            var props = req.body.props[i];
            Torrent.find({where: {user_id: user.id, hash: props.hash}}).success(function(torrent) {
                console.log(torrent.name + " " + props.trackers);
                torrent.updateAttributes({trackers: props.trackers}).error(function(error) {
                    console.log("failed to update torrent: " + error);
                });
            });
        }
    });

    res.statusCode = 200;
    return res.send("OK");
});

server.get('/me', function(req, res) {
    var user = users[req.session.token];
    if (user == undefined) {
        res.statusCode = 500;
        return res.send('Something went really wrong');
    }

    res.statusCode = 200;
    Torrent.findAll({user_id: user.id}).success(function(torrents) {
        return res.send(JSON.stringify(torrents));
    }).error(function(err){ console.log(err); });
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