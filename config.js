module.exports = {
    conString: process.env.HEROKU_POSTGRESQL_COBALT_URL || "postgres://igor:igor@localhost:5432/floki"
};

global.TorrentStatus = {
    STARTED: 1,
    CHECKING: 2,
    CHECKED: 8,
    ERROR: 16,
    PAUSED: 32,
    QUEUED: 64,
    LOADED: 128
};