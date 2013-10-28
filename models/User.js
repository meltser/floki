module.exports = function(sequelize, DataTypes) {
    return sequelize.define("User", {
        name: DataTypes.STRING(50),
        token: { type: DataTypes.STRING, allowNull: false, validate: { notNull: true, notEmpty: true } },
        admin: { type: DataTypes.BOOLEAN, defaultValue: false }
    },
    {
        underscored: true, tableName: 'users',
        instanceMethods: {
            mergeTorrents: function(latestTorrents) {
                return 'foo'
            }
        }
    })
};