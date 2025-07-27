const express = require('express');
const router = express.Router();

// 导入各模块路由
const userRoutes = require('./userRoutes');
const healthRoutes = require('./healthRoutes');
const dietRoutes = require('./dietRoutes');
const exerciseRoutes = require('./exerciseRoutes');

// 注册路由
router.use('/api/user', userRoutes);
router.use('/api/health', healthRoutes);
router.use('/api/diet', dietRoutes);
router.use('/api/exercise', exerciseRoutes);

// 根路径
router.get('/', (req, res) => {
  res.json({
    message: '健康管理平台API',
    version: '1.0.0',
    endpoints: {
      user: '/api/user',
      health: '/api/health',
      diet: '/api/diet',
      exercise: '/api/exercise'
    }
  });
});

module.exports = router;