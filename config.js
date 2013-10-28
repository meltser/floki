module.exports = {
    conString: process.env.HEROKU_POSTGRESQL_COBALT_URL || "postgres://igor:igor@localhost:5432/floki"
};