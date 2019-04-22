const Controller = require('egg').Controller

class basisInfo extends Controller {
    async getBasisInfo() {
        const { ctx } = this
        const { year, semester, weekNum, weekday } = await ctx.service.timeInfoOperation.getTimeInfo()
        // todo 接入王铭的service
        const lessons = []
        ctx.body = { year, semester, weekNum, weekday, lessons }
    }
}

module.exports = basisInfo
