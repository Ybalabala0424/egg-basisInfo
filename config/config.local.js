/*
* create by candychuang on 2019/1/20
*/

/**
 * stu Oauth 配置
 */
exports.stu_oauth = {
    authorize_uri: 'http://localhost:7001/oauth/authorize',
    redirect_uri: 'http://localhost:7002/user/stu_login',
    client_id: 'stu',
    client_secret: 'stu-secret',
    authorization_url: 'http://localhost:7001/oauth/token',
}

/**
 *  Mysql 配置
 * @type {{dialect: string, host: string, port: number, database: string, username: string, password: string, timezone: string, exclude: string, operatorsAliases: boolean}}
 */
exports.sequelize = {
    dialect: 'mysql',
    host: 'cdb-7g2jy6qr.gz.tencentcdb.com',
    port: 10053,
    database: 'syllabus-backend_dev',
    username: 'candy',
    password: 'Candy666a',
    timezone: '+08:00',
    exclude: 'OauthServerModel.js',
    operatorsAliases: false // 不写会报错
}


exports.oauth_base_url = 'http://localhost:7001'

