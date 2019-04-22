/**
 * @author 小糖
 * @date 2019/2/12
 * @Description: UserController
 */
const Controller = require('egg').Controller

class UserController extends Controller {

    /**
     * 返回给前端的用户信息
     * @returns {Promise<void>}
     */
    async getUserInfo() {
        this.ctx.body = {
            user_info: this.service.user.user.filtrateUserInfo()
        }
    }
}

module.exports = UserController
