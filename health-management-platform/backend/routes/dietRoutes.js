const express = require('express');
const router = express.Router();
const DietController = require('../controllers/dietController');
const { authenticateToken } = require('../middleware/auth');

// 所有饮食路由都需要认证
router.use(authenticateToken);

// 添加饮食记录
router.post('/records', DietController.addDietRecord);

// 获取指定日期的饮食记录
router.get('/records', DietController.getDietRecordsByDate);

// 获取指定日期范围的饮食记录
router.get('/records/range', DietController.getDietRecordsByRange);

// 删除饮食记录
router.delete('/records/:id', DietController.deleteDietRecord);

// 搜索食物
router.get('/foods/search', DietController.searchFood);

// 获取所有食物
router.get('/foods', DietController.getAllFoods);

// 获取饮食分析报告
router.get('/analysis', DietController.getDietAnalysis);

module.exports = router;