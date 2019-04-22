const Service = require('egg').Service
const uuidv4 = require('uuid/v4')

class OauthService extends Service {

    async miniProAuthorization(user_id) {
        let ctx = this.ctx
        const {
            'x-wx-code': code,
            'x-wx-encrypted-data': encryptedData,
            'x-wx-iv': iv
        } = ctx.headers

        ctx.logger.debug('Auth: code: %s', code)


        ctx.logger.debug('Auth: encryptedData: %s, iv: %s', encryptedData, iv)

        // 获取 session key
        let pkg = await this._getSessionKey(code)

        const { openid, session_key } = pkg

        // 解密数据
        let decryptedData
        try {
            decryptedData = ctx.helper.aesDecrypt({
                type: 'aes-128-cbc',
                data: encryptedData,
                key: Buffer.from(session_key, 'base64'),
                iv: Buffer.from(iv, 'base64'),
                inputEncoding: 'base64'
            })
            decryptedData = JSON.parse(decryptedData)
        } catch (err) {
            throw ctx.helper.createError(new Error(`解密失败: ${err.message}`))
        }

        // 存储到数据库中
        const User = ctx.model.User.User
        const UserAssociation = ctx.model.User.UserAssociation
        await Promise.all([
            User.upsert({
                id: user_id,
                wechat_user_info: JSON.stringify(decryptedData)
            }, {
                where: {
                    id: user_id
                }
            }),
            UserAssociation.upsert({
                user_id: user_id,
                mini_pro_open_id: openid
            }, {
                where: {
                    user_id: user_id
                }
            })
        ])
        return decryptedData
    }

    /**
     * 微信小程序登录，code 换取 session
     * @param code
     * @returns {Promise<{session_key}|{openid}|Object|*>}
     */
    async _getSessionKey(code) {
        const appid = this.config.appId
        const appsecret = this.config.appSecret
        const ctx = this.ctx

        let res
        try {
            res = await ctx.helper.request({
                url: 'https://api.weixin.qq.com/sns/jscode2session',
                method: 'GET',
                needProxy: false,
                data: {
                    appid: appid,
                    secret: appsecret,
                    js_code: code,
                    grant_type: 'authorization_code'
                },
                dataType: 'json'
            })
        } catch (err) {
            throw ctx.helper.createError(new Error(`网络错误: ${err.message}`), this.app.errCode.OauthService.network_error)
        }
        if (res.data.errcode || !res.data.openid || !res.data.session_key) {
            throw ctx.helper.createError(new Error(`获取openid错误，请求返回:${JSON.stringify(res)}`), this.app.errCode.OauthService.code2session_error)
        } else {
            ctx.logger.info(`openid: ${res.openid}, session_key: ${res.session_key}`)
            return res.data
        }
    }

    async stuAuthorization(code) {
        const { ctx, config } = this
        const appType = ctx.query.from ? 'app' : 'web'
        let data = {
            grant_type: 'authorization_code',
            code: code,
            client_id: config.stu_oauth[appType].client_id,
            client_secret: config.stu_oauth[appType].client_secret
        }
        if (appType === 'web') {
            data.redirect_uri = config.stu_oauth.redirect_uri
        }
        let res = await ctx.helper.request({
            url: config.stu_oauth.authorization_url,
            method: 'POST',
            needProxy: false,
            data,
            dataType: 'json'
        })

        if (res.data.code !== '0') {
            throw ctx.helper.createError(new Error(res.data.message), res.data.code)
        }
        // 更新STU Token
        await this.updateUserAndStuToken(res.data)

        return res.data
    }

    /**
     * 更新用户信息及Oauth认证token
     * @param user 用户信息
     * @param accessToken
     * @param accessTokenExpiresAt
     * @param refreshToken
     * @param refreshTokenExpiresAt
     * @returns {Promise<void>}
     */
    async updateUserAndStuToken({ user, accessToken, accessTokenExpiresAt, refreshToken, refreshTokenExpiresAt }) {
        const ctx = this.ctx
        let User = ctx.model.User.User
        let StuOauthToken = ctx.model.User.StuOauthToken
        let UserAssociation = ctx.model.User.UserAssociation

        try {
            let userModel = await User.findOne({
                where: { id: user.id }
            })
            if (!userModel) {
                // 创建user和token
                userModel = await User.create({
                    ...user,
                    StuOauthToken: {
                        accessToken,
                        accessTokenExpiresAt,
                        refreshToken,
                        refreshTokenExpiresAt
                    },
                    UserAssociation: { user_id: user.id }
                }, {
                    include: [
                        { model: StuOauthToken },
                        { model: UserAssociation }
                    ]
                })
            } else {
                await Promise.all([
                    User.update(user, {
                        where: { id: user.id }
                    }),
                    StuOauthToken.upsert({
                        accessToken,
                        accessTokenExpiresAt,
                        refreshToken,
                        refreshTokenExpiresAt,
                        user_id: user.id
                    }, {
                        where: { user_id: user.id }
                    })])
            }
        } catch (e) {
            throw ctx.helper.createError(e, this.app.errCode.OauthService.updateStuToken_error)
        }
    }

    /**
     * 生成skey 和 refresh_key
     * @param user_id
     * @returns {Promise<{skey: *, skeyExpiresAt: (*|string), refresh_key: *, refreshKeyExpiresAt: (*|string)}>}
     */
    async generateSkeyAndRefreshKey(user_id) {
        let ctx = this.ctx
        let skeyExpiresAt = new Date(Date.now() + this.config.loginKey.skeyExpiresTime)
        let refreshKeyExpiresAt = new Date(Date.now() + this.config.loginKey.refreshKeyExpiresTime)
        let loginKeys = {
            skey: uuidv4(),
            skeyExpiresAt: ctx.helper.dateFormat(skeyExpiresAt),
            refresh_key: uuidv4(),
            refreshKeyExpiresAt: ctx.helper.dateFormat(refreshKeyExpiresAt)
        }
        let StuLoginKey = ctx.model.User.StuLoginKey
        await StuLoginKey.create({
            user_id,
            skey: loginKeys.skey,
            skeyExpiresAt: skeyExpiresAt,
            refresh_key: loginKeys.refresh_key,
            refreshKeyExpiresAt: refreshKeyExpiresAt
        })
        return loginKeys
    }

    /**
     * 利用refresh_key刷新课程表登录凭证
     * @param refresh_key
     * @returns {Promise<{user_id: (*|StuLoginKey.user_id|{type}|StuOauthToken.user_id|{type, primaryKey}|UserAssociation.user_id), loginKeys: {skey: *, skeyExpiresAt: (*|string), refresh_key: *, refreshKeyExpiresAt: (*|string)}}>}
     */
    async refreshLoginState(refresh_key) {
        let ctx = this.ctx
        const { StuLoginKey } = ctx.model.User

        // 查询refresh_key所在的秘钥表
        let session = await StuLoginKey.findOne({
            where: { refresh_key }
        })

        // 检查秘钥是否存在
        if (!session) {
            throw ctx.helper.createError(new Error('登录态失效，refresh_key无效'), this.app.errCode.OauthService.refreshLoginState_no_session)
        }
        session = session.toJSON()

        // 设置日志userId
        const user_id = session.user_id
        ctx.userId = session.user_id

        // refresh_key过期
        if (!session.refresh_key || new Date() > session.refreshKeyExpiresAt) {
            throw ctx.helper.createError(new Error('登录态失效，refresh_key无效'), this.app.errCode.OauthService.refreshLoginState_invalid_refresh_key)
        }

        // 重新生成课程表登录凭证
        let loginState = await this.service.user.oauth.generateSkeyAndRefreshKey(session.user_id)
        return { user_id, loginState }

    }


    /**
     * 到开放平台拉取汕大用户信息
     * @param user_id
     * @returns {Promise<void>}
     */
    // async getStuUserInfo(user_id) {
    //     const ctx = this.ctx
    //     const StuOauthToken = ctx.model.User.StuOauthToken
    //
    //     // 查询账号的Token
    //     let token = await StuOauthToken.findOne({
    //         where: { id: user_id }
    //     })
    //     ctx.helper.request({
    //         url: '{{baseUrl}}/user/info'
    //     })
    // }

    /**
     * 根据客户端类型，组装Oauth需要的数据
     * @param from
     * @returns {*}
     */
    generateOauthData(from) {
        const stu_oauth_config = this.config.stu_oauth
        const state = uuidv4()
        switch (true) {
            case from === 'ios':
            case from === 'android':
            case from === 'mini':
                return {
                    state,
                    client_id: stu_oauth_config.app.client_id,
                    redirect_uri: stu_oauth_config.redirect_uri,
                    oauth_url: stu_oauth_config.authorize_uri + '?response_type=code' +
                        '&client_id=' + stu_oauth_config.app.client_id +
                        '&state=' + state +
                        '&scope=*' +
                        '&from=' + from,
                    scope: '*'
                }
            default:
                return {
                    state,
                    client_id: stu_oauth_config.web.client_id,
                    redirect_uri: stu_oauth_config.redirect_uri,
                    oauth_url: stu_oauth_config.authorize_uri + '?response_type=code' +
                        '&client_id=' + stu_oauth_config.web.client_id +
                        '&redirect_uri=' + stu_oauth_config.redirect_uri +
                        '&state=' + state +
                        '&scope=*' +
                        '&from=' + from,
                    scope: '*'
                }
        }
    }


    async getStuToken(user_id, arg_from) {
        const { ctx, app, config } = this
        const { StuOauthToken } = ctx.model.User

        const token = await StuOauthToken.findOne({
            where: {
                user_id
            }
        })
        // 判断accessToken是否有效，这里规定过期时间前60s的为有效，因为还有预留服务器计算和通信的时间
        if (!token && (Date.now() + 60 * 1000) > token.accessTokenExpiresAt) {

            return { token, is_refresh: false }

        } else {

            // token不存在或过期，需要重新刷新token
            let from = arg_from
            if (!from) {
                if (['android', 'ios', 'mini'].includes(ctx.header.from)) {
                    from = 'app'
                } else {
                    from = 'web'
                }
            }

            // 请求刷新token
            const res = await ctx.helper.request({
                url: app.api.oauth_refresh_token,
                data: {
                    grant_type: 'refresh_token',
                    refresh_token: token.refreshToken,
                    access_token: token.accessToken,
                    client_id: config.stu_oauth[from].client_id,
                    client_secret: config.stu_oauth[from].client_secret,
                },
                needProxy: false
            })
            await this.service.user.oauth.updateUserAndStuToken(res.data)
            return { token: res.data, is_refresh: true }
        }
    }

}

module.exports = OauthService
