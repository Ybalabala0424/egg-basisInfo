/*
* create by candychuang on 2019/1/19
*/

let errCode = {
    OauthController: {
        code: '1001',
        no_user_id: '01',
        state_not_match: '02'
    },
    OauthService: {
        code: '2001',
        network_error: '01',
        code2session_error: '02',
        updateStuToken_error: '03',
        refreshLoginState_no_session: '04',
        refreshLoginState_invalid_refresh_key: '05',
    },
    UserService: {
        code: '2002',
        syncUserInfo_error: '01',
        updateUserInfo_error: '02'
    },
    LoginStateAuthMiddleware: {
        code: '3001',
        no_skey: '01',   // 登录态失效，请求中没带skey
        not_find_session: '02',   // 登录态失效，查找不到session
        invalid_skey: '03',   // 登录态失效，skey无效
    },

}

module.exports = errCode
