/*
* create by candychuang on 2019/1/20
*/

module.exports = app => {
    const { STRING, JSON } = app.Sequelize

    let User = app.model.define('User', {
        id: {
            type: STRING(32),
            primaryKey: true,
            allowNull: false,
            unique: true,
        },
        // 微信用户信息
        wechat_user_info: {
            type: JSON
        },
        // 汕头大学用户信息
        stu_user_info: {
            type: JSON
        }
    }, {
        tableName: 'user',
        // underscored: false,
    })

    User.associate = function () {
        User.StuOauthToken = User.hasOne(app.model.User.StuOauthToken)
        User.UserAssociation = User.hasOne(app.model.User.UserAssociation)
        User.StuLoginKey = User.hasOne(app.model.User.StuLoginKey)
    }

    return User
}
