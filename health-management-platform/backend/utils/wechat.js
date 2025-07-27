const axios = require('axios');

class WechatUtil {
  // 根据code获取用户的openid和session_key
  static async getOpenidByCode(code) {
    try {
      const response = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
        params: {
          appid: process.env.WECHAT_APPID,
          secret: process.env.WECHAT_SECRET,
          js_code: code,
          grant_type: 'authorization_code'
        }
      });

      const { openid, session_key, errcode, errmsg } = response.data;

      if (errcode) {
        throw new Error(`微信API错误: ${errcode} - ${errmsg}`);
      }

      return { openid, session_key };
    } catch (error) {
      console.error('获取openid失败:', error);
      throw error;
    }
  }

  // 获取访问令牌
  static async getAccessToken() {
    try {
      const response = await axios.get('https://api.weixin.qq.com/cgi-bin/token', {
        params: {
          grant_type: 'client_credential',
          appid: process.env.WECHAT_APPID,
          secret: process.env.WECHAT_SECRET
        }
      });

      const { access_token, errcode, errmsg } = response.data;

      if (errcode) {
        throw new Error(`微信API错误: ${errcode} - ${errmsg}`);
      }

      return access_token;
    } catch (error) {
      console.error('获取access_token失败:', error);
      throw error;
    }
  }

  // 发送模板消息（可用于提醒功能）
  static async sendTemplateMessage(openid, templateId, data, page = '') {
    try {
      const accessToken = await this.getAccessToken();
      
      const response = await axios.post(
        `https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=${accessToken}`,
        {
          touser: openid,
          template_id: templateId,
          page: page,
          data: data
        }
      );

      return response.data;
    } catch (error) {
      console.error('发送模板消息失败:', error);
      throw error;
    }
  }
}

module.exports = WechatUtil;