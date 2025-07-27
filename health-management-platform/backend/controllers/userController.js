const User = require('../models/User');
const WechatUtil = require('../utils/wechat');
const { generateToken } = require('../middleware/auth');

class UserController {
  // 微信登录
  static async wechatLogin(req, res) {
    try {
      const { code, userInfo } = req.body;

      if (!code) {
        return res.status(400).json({ error: '登录code不能为空' });
      }

      // 通过code获取openid
      const { openid } = await WechatUtil.getOpenidByCode(code);

      // 查找或创建用户
      let user = await User.findByOpenid(openid);
      
      if (!user) {
        // 创建新用户
        const userData = {
          openid,
          nickname: userInfo?.nickName || '',
          avatar_url: userInfo?.avatarUrl || '',
          gender: userInfo?.gender || 0
        };
        
        const userId = await User.create(userData);
        user = await User.findById(userId);
      } else if (userInfo) {
        // 更新用户信息
        await User.update(user.id, {
          nickname: userInfo.nickName,
          avatar_url: userInfo.avatarUrl,
          gender: userInfo.gender
        });
        user = await User.findById(user.id);
      }

      // 生成token
      const token = generateToken(user.id);

      res.json({
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            nickname: user.nickname,
            avatar_url: user.avatar_url,
            gender: user.gender,
            age: user.age,
            height: user.height,
            weight: user.weight,
            health_goal: user.health_goal
          }
        }
      });
    } catch (error) {
      console.error('微信登录失败:', error);
      res.status(500).json({ error: '登录失败' });
    }
  }

  // 获取用户信息
  static async getProfile(req, res) {
    try {
      const user = await User.getProfile(req.user.id);
      
      if (!user) {
        return res.status(404).json({ error: '用户不存在' });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('获取用户信息失败:', error);
      res.status(500).json({ error: '获取用户信息失败' });
    }
  }

  // 更新用户信息
  static async updateProfile(req, res) {
    try {
      const { nickname, age, height, weight, health_goal, gender } = req.body;
      
      const updateData = {};
      if (nickname !== undefined) updateData.nickname = nickname;
      if (age !== undefined) updateData.age = age;
      if (height !== undefined) updateData.height = height;
      if (weight !== undefined) updateData.weight = weight;
      if (health_goal !== undefined) updateData.health_goal = health_goal;
      if (gender !== undefined) updateData.gender = gender;

      const success = await User.update(req.user.id, updateData);
      
      if (!success) {
        return res.status(400).json({ error: '更新失败' });
      }

      const updatedUser = await User.getProfile(req.user.id);
      
      res.json({
        success: true,
        message: '更新成功',
        data: updatedUser
      });
    } catch (error) {
      console.error('更新用户信息失败:', error);
      res.status(500).json({ error: '更新用户信息失败' });
    }
  }

  // 检查token有效性
  static async checkToken(req, res) {
    try {
      const user = await User.getProfile(req.user.id);
      
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('检查token失败:', error);
      res.status(500).json({ error: '检查token失败' });
    }
  }
}

module.exports = UserController;