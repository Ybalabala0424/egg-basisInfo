module.exports = appInfo => {
    const config = exports = {}

    // 错误码登记表
    config.errCode = {
        APP_ERROR_CODE: '02',   // 应用错误码，错误码1-2位，其他为3-6位
        NOT_REGISTER_ERROR: '000000', // 未登记默认错误码
    }

    // 前端代理请求
    config.socketRequest = {
        url: 'http://localhost:7003/socket-proxy'
    }

    // use for cookie sign key, should change to your own and keep security
    config.keys = appInfo.name + 'Candy666a'

    // add your config here
    config.middleware = []

    // egg-syllabus-framework 中间件
    config.response = {
        ignore: [
            '/favicon.ico'
        ]
    }

    // 小程序wafer，登录授权相关
    config.appId = 'wx560f8ff50bb29424'
    config.appSecret = '92ad5b2f099081b4ce7754fe20dfdf30'
    /**
     * stu Oauth 配置
     */
    exports.stu_oauth = {
        authorize_uri: 'http://139.199.224.230:7001/oauth/authorize',
        redirect_uri: 'http://139.199.224.230:7002/user/stu_login',
        authorization_url: 'http://139.199.224.230:7001/oauth/token',
        web: {
            client_id: 'stu',
            client_secret: 'stu-secret',
        },
        app: {
            client_id: 'syllabus-app',
            client_secret: 'stu',
        }

    }

    /**
     *  Mysql 配置
     * @type {{dialect: string, host: string, port: number, database: string, username: string, password: string, timezone: string, exclude: string, operatorsAliases: boolean}}
     */
    config.sequelize = {
        dialect: 'mysql',
        host: 'cdb-7g2jy6qr.gz.tencentcdb.com',
        port: 10053,
        database: 'syllabus-backend',
        username: 'candy',
        password: 'Candy666a',
        timezone: '+08:00',
        exclude: 'OauthServerModel.js',
        operatorsAliases: false // 不写会报错
    }

    /**
     * Session 配置
     * @type {{key: string, maxAge: number, httpOnly: boolean, encrypt: boolean}}
     */
    config.session = {
        key: 'CANDY_TONG_SESSION',   // Session在Cookie中的键名
        maxAge: 5 * 60 * 1000, // 5分钟
        httpOnly: true,
        encrypt: true,
    }

    /**
     * skey 有效期、 refresh_key 有效期
     * @type {{skeyExpiresTime: number, refreshKeyExpiresTime: number}}
     */
    config.loginKey = {
        skeyExpiresTime: 3 * 24 * 60 * 60 * 1000,   // 3天
        refreshKeyExpiresTime: 30 * 24 * 60 * 60 * 1000,    // 30天
    }


    // oauth开放平台baseUrl
    config.oauth_base_url = 'http://139.199.224.230:7001'

    /**
     * basisTime 基础时间信息
     * @type {{year: null, semester: null, study_begin: null}}
     */
    config.basisTime = {
        year: null,
        semester: null,
        study_begin: null,
    }

    return config
}
