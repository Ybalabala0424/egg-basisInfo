/*
* create by candychuang on 2019/1/20
*/


module.exports = app => {
    const { STRING } = app.Sequelize

    const UserAssociation = app.model.define('UserAssociation', {
        user_id: {
            primaryKey: true,
            type: STRING(32),
            unique: true,
        },
        mini_pro_open_id: {
            type: STRING(100),
            unique: true,
        },
        official_accounts_open_id: {
            type: STRING(100),
            unique: true,
        },
        union_id: {
            type: STRING(100),
            unique: true,
        },
        // created_at: DATE,
        // updated_at: DATE,
    }, {
        tableName: 'user_association',
        // underscored: false,
    })

    UserAssociation.associate = function () {
        UserAssociation.User = UserAssociation.belongsTo(app.model.User.User, {
            foreignKey: 'user_id'
        })
    }
    return UserAssociation
}