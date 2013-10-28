module.exports = function(sequelize, DataTypes) {
    return sequelize.define("Torrent", {
        hash: { type: DataTypes.STRING(255), allowNull: false, validate: { notNull: true, notEmpty: true } },
        name: { type: DataTypes.STRING(1024), allowNull: false, validate: { notNull: true, notEmpty: true } },
        trackers: { type: DataTypes.TEXT, allowNull: true },
        state: { type: DataTypes.INTEGER, defaultValue: 0, allowNull: false, validate: { notNull: true, notEmpty: true } },
        size: { type: DataTypes.BIGINT, defaultValue: 0, allowNull: false, validate: { notNull: true, notEmpty: true } },
        downloaded: { type: DataTypes.BIGINT, defaultValue: 0, allowNull: false, validate: { notNull: true, notEmpty: true } }
    }, { underscored: true, tableName: 'torrents' })
};