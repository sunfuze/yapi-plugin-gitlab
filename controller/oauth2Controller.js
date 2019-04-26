const baseController = require('controllers/base.js');
const yapi = require('yapi.js');
const request = require('request-promise');

class oauth2Controller {
    constructor(ctx) {
        this.ctx = ctx;
    }

  async init(ctx) {
        this.$auth = true;
    }

    /**
     * oauth2 回调
     * @param ctx
     * @returns {Promise<void>}
     */
    async oauth2Callback(ctx) {
        // 获取code和state
        let oauthcode = ctx.request.query.code;
        if (!oauthcode) {
            return (ctx.body = yapi.commons.resReturn(null, 400, 'code不能为空'));
        }
        let ops = this.getOptions();
        // 通过code获取token
        let tokenpath = ops.tokenPath + '?client_id=' + ops.appId + '&client_secret=' +
            ops.appSecret + '&code=' + oauthcode + "&grant_type=authorization_code&redirect_uri=" + encodeURIComponent(ops.redirectUri);

        try {
            const {
                access_token
            } = await this.requestInfo(ops, tokenpath, 'post')
            ctx.redirect('/api/user/login_by_token?token=' + access_token);
        } catch (e) {
            ctx.body = {
                status_code: e.response && e.response.statusCode || 401,
                message: e.message
            }
        }
    }

    getOptions() {
        for (let i = 0; i < yapi.WEBCONFIG.plugins.length; i++) {
            if (yapi.WEBCONFIG.plugins[i].name === 'gitlab') {
                return yapi.WEBCONFIG.plugins[i].options;
            }
        }
        return null;
    }

    async requestInfo(ops, path, method) {
        return request[method]({
            uri: ops.host + path,
            json: true
        })
    }
}

module.exports = oauth2Controller;
