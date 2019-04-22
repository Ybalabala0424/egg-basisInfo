
module.exports = {
    up: async (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
        const { DATE, INTEGER, BOOLEAN } = Sequelize

        // 用户表
        await queryInterface.createTable('configInfo', {
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
        })
    },

    down: async (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
        await queryInterface.dropTable('configInfo')
    }
}
