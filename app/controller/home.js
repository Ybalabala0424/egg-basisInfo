
const Controller = require('egg').Controller

class HomeController extends Controller {
    async index() {
        this.ctx.body = {
            msg: 'hello stu syllabus'
        }
    }
}

module.exports = HomeController
