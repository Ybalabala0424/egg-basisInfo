/*
* create by candychuang on 2019/1/20
*/

module.exports = app => {
    const { STRING, DATE } = app.Sequelize

    const StuLoginKey = app.model.define('StuLoginKey', {
        user_id: {
            type: STRING(32)
        },
        // Oauth 凭证
        skey: {
            type: STRING(40),
            primaryKey: true,
            allowNull: false,
        },
        // access_token过期时间
        skeyExpiresAt: {
            type: DATE,
            allowNull: false,
        },
        // 凭证
        refresh_key: {
            type: STRING(40),
            allowNull: false,
            unique: true,
        },
        // refresh_token过期时间
        refreshKeyExpiresAt: {
            type: DATE,
            allowNull: false,
        },
    }, {
        tableName: 'stu_login_key',
        // underscored: false,
    })

    StuLoginKey.associate = function () {
        StuLoginKey.User = StuLoginKey.belongsTo(app.model.User.User, {
            foreignKey: 'user_id',
        })
    }
    return StuLoginKey
}

