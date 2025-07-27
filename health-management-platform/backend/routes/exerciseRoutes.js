const express = require('express');
const router = express.Router();
const ExerciseController = require('../controllers/exerciseController');
const { authenticateToken } = require('../middleware/auth');

// 所有运动路由都需要认证
router.use(authenticateToken);

// 添加运动记录
router.post('/records', ExerciseController.addExerciseRecord);

// 获取指定日期的运动记录
router.get('/records', ExerciseController.getExerciseRecordsByDate);

// 获取指定日期范围的运动记录
router.get('/records/range', ExerciseController.getExerciseRecordsByRange);

// 删除运动记录
router.delete('/records/:id', ExerciseController.deleteExerciseRecord);

// 获取所有运动类型
router.get('/types', ExerciseController.getAllExerciseTypes);

// 获取运动分析报告
router.get('/analysis', ExerciseController.getExerciseAnalysis);

module.exports = router;