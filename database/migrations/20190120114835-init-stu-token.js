module.exports = {
    up: async (queryInterface, Sequelize) => {
        /*
          Add altering commands here.
          Return a promise to correctly handle asynchronicity.

          Example:
          return queryInterface.createTable('users', { id: Sequelize.INTEGER });
        */
        const { DATE, STRING, JSON } = Sequelize

        // 用户表
        await queryInterface.createTable('user', {
            id: {
                type: STRING(20),
                primaryKey: true,
                allowNull: false,
                unique: true,
                comment: '用户id'
            },
            // 微信用户信息
            wechat_user_info: {
                type: JSON,
                comment: '微信用户信息JSON'
            },
            // stu 用户信息
            stu_user_info: {
                type: JSON,
                comment: '汕头大学用户信息JSON'
            },
            created_at: DATE,
            updated_at: DATE,
        })

        // 课程表 Oauth 凭证表
        await queryInterface.createTable('stu_oauth_token', {
            // 用户id
            user_id: {
                type: STRING(20),
                references: {
                    model: 'user',
                    key: 'id'
                },
                allowNull: false,
                primaryKey: true,
                onUpdate: 'cascade',
                onDelete: 'cascade'
            },
            // Oauth 凭证
            accessToken: {
                type: STRING(128),
                allowNull: false,
                unique: true,
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
            created_at: DATE,
            updated_at: DATE,
        })

        // 课程表登录秘钥表
        await queryInterface.createTable('stu_login_key', {
            // 用户id
            user_id: {
                type: STRING(20),
                references: {
                    model: 'user',
                    key: 'id'
                },
                allowNull: false,
                onUpdate: 'cascade',
                onDelete: 'cascade'
            },
            // 登录秘钥
            skey: {
                type: STRING(40),
                primaryKey: true,
                allowNull: false,
                unique: true,
            },
            // 登录秘钥过期时间
            skeyExpiresAt: {
                type: DATE,
                allowNull: false,
            },
            // 刷新秘钥
            refresh_key: {
                type: STRING(40),
                allowNull: false,
                unique: true,
            },
            // 刷新秘钥过期时间
            refreshKeyExpiresAt: {
                type: DATE,
                allowNull: false,
            },
            created_at: DATE,
            updated_at: DATE,
        })

        // 授权码表
        await queryInterface.createTable('user_association', {
            // 用户id
            user_id: {
                type: STRING(20),
                references: {
                    model: 'user',
                    key: 'id'
                },
                unique: true,
                onUpdate: 'cascade',
                onDelete: 'cascade'
            },
            mini_pro_open_id: {
                type: STRING(100),
                comment: '小程序openid',
                unique: true,
            },
            official_accounts_open_id: {
                type: STRING(100),
                comment: '公众号openid',
                unique: true,
            },
            union_id: {
                type: STRING(100),
                comment: '微信开放平台unionid',
                unique: true,
            },
            created_at: DATE,
            updated_at: DATE,
        }, {
            indexes: [
                {
                    name: 'mini_pro_open_id_index',
                    unique: true,
                    method: 'BTREE',
                    fields: ['mini_pro_open_id']
                },
                {
                    name: 'official_accounts_open_id_index',
                    unique: true,
                    method: 'BTREE',
                    fields: ['official_accounts_open_id']
                },
                {
                    name: 'union_id_index',
                    unique: true,
                    method: 'BTREE',
                    fields: ['union_id']
                },
            ]
        })
    },

    down: async (queryInterface, Sequelize) => {
        /*
          Add reverting commands here.
          Return a promise to correctly handle asynchronicity.
        */

        // 顺序不能改变，因为有外键，要先删除有外键依赖的表
        await queryInterface.dropTable('stu_oauth_token')
        await queryInterface.dropTable('stu_login_key')
        await queryInterface.dropTable('user_association')
        await queryInterface.dropTable('user')
    }
}
