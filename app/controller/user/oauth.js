/**
 * @author 小糖
 * @date 2019-03-20
 * @Description: OauthController
 */

const Controller = require('egg').Controller

class OauthController extends Controller {

    /**
     * 组装认证URL
     * @returns {Promise<void>}
     */
    async getOauthData() {
        const ctx = this.ctx
        ctx.validate({
            'from': 'string?'
        }, ctx.query)

        // 默认来源为web
        const from = ctx.query.from ? ctx.query.from : 'web'
        const oauthData = this.service.user.oauth.generateOauthData(from)

        // 设置session，用于Oauth重定向到后台时的state校对
        ctx.session.state = oauthData.state
        ctx.body = oauthData
    }

    /**
     * STU syllabus 授权码登录，code 换取 AccessToken
     * session中存储user_id，用于下一步授权微信登录绑定账号
     * @returns {Promise<void>}
     */
    async stuLogin() {
        const ctx = this.ctx
        const app = this.app
        ctx.validate({
            'code': 'string',
            'state': 'string',
            'from': 'string?'
        }, ctx.query)

        if (ctx.query.state !== ctx.session.state) {
            throw ctx.helper.createError(new Error(`stu Oauth state 不匹配 query: ${ctx.query.state} session: ${ctx.session.state}`), app.errCode.OauthController.state_not_match)
        }

        // code 换取 accessToken
        let { user } = await this.service.user.oauth.stuAuthorization(ctx.query.code)

        // 生成课程表登录凭证
        ctx.body = await this.service.user.oauth.generateSkeyAndRefreshKey(user.id)
    }

    /**
     * 小程序登录
     * 绑定汕大账号，并生成登录秘钥
     * @returns {Promise<void>}
     */
    async miniProLogin() {
        const ctx = this.ctx

        ctx.validate({
            'x-wx-code': 'string',
            'x-wx-encrypted-data': 'string',
            'x-wx-iv': 'string'
        }, ctx.header)

        let user_id = ctx.session.user_id
        if (!user_id) {
            throw ctx.helper.createError(new Error('no user_id'), this.app.errCode.OauthController.no_user_id)
        }
        ctx.userId = user_id
        ctx.logger.info(`user: ${user_id}`)

        // 解密用户信息
        await this.service.user.oauth.miniProAuthorization(user_id)

        // 生成课程表登录凭证
        ctx.body = await this.service.user.oauth.generateSkeyAndRefreshKey(user_id)
    }

    /**
     * 利用refresh_key刷新课程表登录凭证，并更新用户信息
     * @returns {Promise<void>}
     */
    async refreshLoginState() {
        const ctx = this.ctx

        ctx.validate({
            'refresh_key': 'string',
            'from': ['mini', 'android', 'ios', 'web']
        }, ctx.header)

        // 重新生成课程表登录凭证
        const { user_id, loginState } = await this.service.user.oauth.refreshLoginState(ctx.header.refresh_key)
        await this.service.user.user.syncUserInfo(user_id)
        ctx.body = loginState
    }
}

module.exports = OauthController
