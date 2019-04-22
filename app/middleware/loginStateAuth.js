module.exports = options => {
    return async function loginStateAuth(ctx, next) {

        let skey = ctx.header.skey
        const app = ctx.app

        // 没有skey
        if (!skey) {
            throw ctx.helper.createError('登录态失效，请求中没带skey', app.errCode.LoginStateAuthMiddleware.no_skey)
        }
        // 查询skey
        const StuLoginKey = ctx.model.User.StuLoginKey
        const User = ctx.model.User.User
        let session = await StuLoginKey.findOne({
            where: { skey },
            include: [User]
        })

        if (!session) {
            throw ctx.helper.createError(new Error('登录态失效，查找不到session'), app.errCode.LoginStateAuthMiddleware.invalid_skey)
        }
        session = session.toJSON()
        let user = session.User
        let wechat_user_info = user.wechat_user_info ? JSON.parse(user.wechat_user_info) : {}
        let stu_user_info = user.stu_user_info ? JSON.parse(user.stu_user_info) : {}
        user.user_info = Object.assign({}, wechat_user_info, stu_user_info)

        // 设置用户
        ctx.user = Object.assign({}, wechat_user_info, stu_user_info)
        ctx.user.id = user.id
        // 设置日志的userId
        ctx.userId = user.id

        // skey过期
        if (!session.skey || new Date() > session.skeyExpiresAt) {
            throw ctx.helper.createError(new Error('登录态失效，skey无效'), app.errCode.LoginStateAuthMiddleware.invalid_skey)
        }

        // skey有效
        await next()
    }
}
