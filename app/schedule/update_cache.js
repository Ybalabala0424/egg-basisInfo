const Subscription = require('egg').Subscription

class UpdateCache extends Subscription {
    // 通过schedule属性来设置定时任务的执行间隔等配置
    static get schedule() {
        return {
            interval: '30s', // 30s间隔
            type: 'worker', // 任意一个worker执行
            immediate: true,
        }
    }

    async subscribe() {
        // todo error输出
        // todo 已完成 setUniformInfo命名
        try {
            await this.service.timeInfoOperation.setTimeInfo()
        } catch (err) {
            console.log('[ update_cache ]error')
            throw this.ctx.helper.createError(new Error(`[定时任务]定时任务更新时间配置失败: ${err.message}`))
        }

    }
}

module.exports = UpdateCache
