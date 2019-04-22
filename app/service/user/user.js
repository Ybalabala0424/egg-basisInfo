/**
 * @author 小糖
 * @date 2019/2/12
 * @Description: UserService
 */
const Service = require('egg').Service

class UserService extends Service {

    /**
     * 过滤用户信息，用于返回给前端
     * @param filter 需要返回的字段
     * @returns {Promise<void>}
     */
    filtrateUserInfo(filter = ['id', 'nickName', 'avatarUrl']) {
        let ctx = this.ctx
        let user_info = {}
        if (ctx.user) {
            filter.forEach(index => {
                user_info[index] = ctx.user[index]
            })
        }
        return user_info
    }

    /**
     * 到开放平台同步用户信息
     */
    async syncUserInfo(user_id) {
        const { ctx, app } = this


        const { token, is_refresh } = await this.service.user.oauth.getStuToken(user_id)
        if (!is_refresh) {
            // accessToken有效，无刷新，需要同步用户信息，并保存
            let res
            try {
                res = await ctx.helper.request({
                    url: app.api.oauth_get_user_info,
                    header: {
                        Authorization: `Bearer ${token.accessToken}`
                    },
                    method: 'GET',
                    needProxy: false
                })
            } catch (e) {
                throw ctx.helper.createError(e, this.app.errCode.UserService.syncUserInfo_error)
            }
            try {
                const User = ctx.model.User.User
                await User.update({
                    id: res.data.user.id,
                    stu_user_info: res.data.user.info
                }, {
                    where: { id: res.data.user.id }
                })
            } catch (e) {
                throw ctx.helper.createError(e, this.app.errCode.UserService.updateUserInfo_error)
            }
        }


    }

}

module.exports = UserService
