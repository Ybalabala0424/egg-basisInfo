/*
* create by candychuang on 2019/1/20
*/

module.exports = app => {
    const { STRING, DATE } = app.Sequelize

    const StuOauthToken = app.model.define('StuOauthToken', {
        user_id: {
            primaryKey: true,
            type: STRING(32)
        },
        // Oauth 凭证
        accessToken: {
            type: STRING(128),
            allowNull: false,
        },
        // access_token过期时间
        accessTokenExpiresAt: {
            type: DATE,
            allowNull: false,
        },
        // 凭证
        refreshToken: {
            type: STRING(128),
            allowNull: false,
            unique: true,
        },
        // refresh_token过期时间
        refreshTokenExpiresAt: {
            type: DATE,
            allowNull: false,
        },
    }, {
        tableName: 'stu_oauth_token',
        // underscored: false,
    })

    StuOauthToken.associate = function () {
        StuOauthToken.User = StuOauthToken.belongsTo(app.model.User.User, {
            foreignKey: 'user_id',
        })
    }
    return StuOauthToken
}

