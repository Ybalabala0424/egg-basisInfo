// app/extend/application.js
const API = Symbol('Application#api')

module.exports = {

    // api url配置
    get api() {
        // this 就是 app 对象，在其中可以调用 app 上的其他方法，或访问属性
        if (!this[API]) {
            let config = this.config
            this[API] = {
                oauth_get_user_info: config.oauth_base_url + '/user/info',
                oauth_refresh_token: config.oauth_base_url + '/oauth/token',
            }
        }
        return this[API]
    },
}