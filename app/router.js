/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
    const { router, controller } = app
    const loginStateAuth = app.middleware.loginStateAuth()

    router.get('/', controller.home.index)

    router.get('/user/get_oauth_data', controller.user.oauth.getOauthData)

    // https://www.tapd.cn/37183998/markdown_wikis/view/#1137183998001000068
    router.get('/user/stu_login', controller.user.oauth.stuLogin)

    // https://www.tapd.cn/37183998/markdown_wikis/view/#1137183998001000069
    // router.get('/user/mini_pro_login', controller.user.oauth.miniProLogin)

    // https://www.tapd.cn/37183998/markdown_wikis/view/#1137183998001000070
    router.post('/user/refresh_login_state', controller.user.oauth.refreshLoginState)

    // https://www.tapd.cn/37183998/markdown_wikis/view/#1137183998001000073
    router.post('/user/info', loginStateAuth, controller.user.user.getUserInfo)

    router.get('/basisInfo', controller.basisInfo.getBasisInfo)
}
