const Service = require('egg').Service

class timeInfoOperation extends Service {
    async setTimeInfo() {
        const { app } = this
        let info
        try {
            info = await app.model.ConfigInfo.findOne({
                where: {
                    using: true,
                },
            })
        } catch (err) {
            throw this.ctx.helper.createError(new Error(`[更新时间信息配置]数据库查找失败: ${err.message}`))
        }
        const { year, semester, study_begin } = info
        const basisInfo = {
            year: year,
            semester: semester,
            study_begin: study_begin,
        }
        this.config.basisTime = basisInfo
    }

    async getTimeInfo() {
        const { ctx } = this
        const { year, semester, study_begin } = this.config.basisTime
        const today = new Date()
        const weekNum = await ctx.service.timeInfoOperation.computeWeekNum(today, study_begin)
        const weekday = today.getDay()
        return { year, semester, weekNum, weekday }
    }

    async computeWeekNum(today, study_begin) {
        const secondsDistance = Date.parse(today) - Date.parse(study_begin)
        const daysDistance = parseInt(secondsDistance / (24 * 60 * 60 * 1000), 1)
        let weekNum = parseInt(daysDistance / 7 + 1, 1)
        weekNum = weekNum > 0 ? weekNum : 1
        return weekNum

    }

}
module.exports = timeInfoOperation
