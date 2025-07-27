const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

// 微信登录
router.post('/login', UserController.wechatLogin);

// 需要认证的路由
router.use(authenticateToken);

// 获取用户信息
router.get('/profile', UserController.getProfile);

// 更新用户信息
router.put('/profile', UserController.updateProfile);

// 检查token有效性
router.get('/check-token', UserController.checkToken);

module.exports = router;