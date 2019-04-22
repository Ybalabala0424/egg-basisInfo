
module.exports = app => {
    const { INTEGER, DATE, BOOLEAN } = app.Sequelize

    const ConfigInfo = app.model.define('configInfo', {
        id: {
            type: INTEGER,
            primaryKey: true,
            allowNull: false,
            unique: true,
            autoIncrement: true,
            comment: '主键id'
        },
        // 使用标识符
        using: {
            type: BOOLEAN,
            comment: '使用标识符'
        },
        // 学年
        year: {
            type: INTEGER,
            comment: '学年'
        },
        // 学期
        semester: {
            type: INTEGER,
            comment: '学期'
        },
        // 开学时间
        study_begin: {
            type: DATE,
            comment: '开学时间'
        },
        created_at: DATE,
        updated_at: DATE,
    }, {
        tableName: 'configInfo',
        // underscored: false,
    })

    return ConfigInfo
}
