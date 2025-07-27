const express = require('express');
const router = express.Router();
const HealthController = require('../controllers/healthController');
const { authenticateToken } = require('../middleware/auth');

// 所有健康数据路由都需要认证
router.use(authenticateToken);

// 添加或更新健康数据
router.post('/data', HealthController.upsertHealthData);

// 获取指定日期的健康数据
router.get('/data', HealthController.getHealthDataByDate);

// 获取指定日期范围的健康数据
router.get('/data/range', HealthController.getHealthDataByRange);

// 获取最近的健康数据
router.get('/data/recent', HealthController.getRecentHealthData);

// 获取健康数据统计
router.get('/stats', HealthController.getHealthStats);

// 生成健康报告
router.get('/report', HealthController.generateHealthReport);

module.exports = router;