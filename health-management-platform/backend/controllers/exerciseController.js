const ExerciseRecord = require('../models/ExerciseRecord');
const moment = require('moment');

class ExerciseController {
  // 添加运动记录
  static async addExerciseRecord(req, res) {
    try {
      const { exercise_type_id, exercise_name, duration_minutes } = req.body;
      
      if (!exercise_name || !duration_minutes) {
        return res.status(400).json({ error: '运动名称和时长不能为空' });
      }

      // 计算消耗热量
      let calories_burned = 0;
      if (exercise_type_id) {
        calories_burned = await ExerciseRecord.calculateCalories(exercise_type_id, duration_minutes);
      } else {
        // 如果没有exercise_type_id，用户需要手动输入消耗热量
        calories_burned = req.body.calories_burned || 0;
      }

      const recordData = {
        exercise_type_id,
        exercise_name,
        duration_minutes: parseInt(duration_minutes),
        calories_burned: parseFloat(calories_burned)
      };

      const recordId = await ExerciseRecord.create(req.user.id, recordData);

      res.json({
        success: true,
        message: '运动记录添加成功',
        data: { id: recordId, calories_burned }
      });
    } catch (error) {
      console.error('添加运动记录失败:', error);
      res.status(500).json({ error: '添加运动记录失败' });
    }
  }

  // 获取指定日期的运动记录
  static async getExerciseRecordsByDate(req, res) {
    try {
      const { date } = req.query;
      const targetDate = date || moment().format('YYYY-MM-DD');

      const records = await ExerciseRecord.getByDate(req.user.id, targetDate);
      const stats = await ExerciseRecord.getDailyStats(req.user.id, targetDate);

      res.json({
        success: true,
        data: {
          records,
          stats: stats || {
            total_duration: 0,
            total_calories_burned: 0,
            exercise_count: 0
          }
        }
      });
    } catch (error) {
      console.error('获取运动记录失败:', error);
      res.status(500).json({ error: '获取运动记录失败' });
    }
  }

  // 获取指定日期范围的运动记录
  static async getExerciseRecordsByRange(req, res) {
    try {
      const { start_date, end_date } = req.query;
      
      if (!start_date || !end_date) {
        return res.status(400).json({ error: '请提供开始和结束日期' });
      }

      const records = await ExerciseRecord.getByDateRange(req.user.id, start_date, end_date);

      res.json({
        success: true,
        data: records
      });
    } catch (error) {
      console.error('获取运动记录失败:', error);
      res.status(500).json({ error: '获取运动记录失败' });
    }
  }

  // 删除运动记录
  static async deleteExerciseRecord(req, res) {
    try {
      const { id } = req.params;

      const success = await ExerciseRecord.delete(parseInt(id), req.user.id);

      if (!success) {
        return res.status(404).json({ error: '记录不存在或无权限删除' });
      }

      res.json({
        success: true,
        message: '运动记录删除成功'
      });
    } catch (error) {
      console.error('删除运动记录失败:', error);
      res.status(500).json({ error: '删除运动记录失败' });
    }
  }

  // 获取所有运动类型
  static async getAllExerciseTypes(req, res) {
    try {
      const exerciseTypes = await ExerciseRecord.getAllExerciseTypes();

      res.json({
        success: true,
        data: exerciseTypes
      });
    } catch (error) {
      console.error('获取运动类型失败:', error);
      res.status(500).json({ error: '获取运动类型失败' });
    }
  }

  // 获取运动分析报告
  static async getExerciseAnalysis(req, res) {
    try {
      const { period = 'week' } = req.query;
      
      let startDate, endDate;
      const now = moment();
      
      switch (period) {
        case 'week':
          startDate = now.clone().subtract(7, 'days').format('YYYY-MM-DD');
          endDate = now.format('YYYY-MM-DD');
          break;
        case 'month':
          startDate = now.clone().subtract(30, 'days').format('YYYY-MM-DD');
          endDate = now.format('YYYY-MM-DD');
          break;
        default:
          startDate = now.clone().subtract(7, 'days').format('YYYY-MM-DD');
          endDate = now.format('YYYY-MM-DD');
      }

      const records = await ExerciseRecord.getByDateRange(req.user.id, startDate, endDate);

      // 按日期分组统计
      const dailyStats = {};
      records.forEach(record => {
        const date = moment(record.record_time).format('YYYY-MM-DD');
        if (!dailyStats[date]) {
          dailyStats[date] = {
            date,
            total_duration: 0,
            total_calories_burned: 0,
            exercise_count: 0
          };
        }
        
        dailyStats[date].total_duration += parseInt(record.duration_minutes);
        dailyStats[date].total_calories_burned += parseFloat(record.calories_burned);
        dailyStats[date].exercise_count += 1;
      });

      // 按运动类型统计
      const exerciseTypeStats = {};
      records.forEach(record => {
        const exerciseName = record.exercise_name;
        if (!exerciseTypeStats[exerciseName]) {
          exerciseTypeStats[exerciseName] = {
            name: exerciseName,
            total_duration: 0,
            total_calories: 0,
            count: 0
          };
        }
        
        exerciseTypeStats[exerciseName].total_duration += parseInt(record.duration_minutes);
        exerciseTypeStats[exerciseName].total_calories += parseFloat(record.calories_burned);
        exerciseTypeStats[exerciseName].count += 1;
      });

      const chartData = Object.values(dailyStats);
      const exerciseTypes = Object.values(exerciseTypeStats);
      
      const totalDuration = records.reduce((sum, record) => sum + parseInt(record.duration_minutes), 0);
      const totalCalories = records.reduce((sum, record) => sum + parseFloat(record.calories_burned), 0);
      const avgDailyDuration = chartData.length > 0 ? (totalDuration / chartData.length).toFixed(0) : 0;

      res.json({
        success: true,
        data: {
          period,
          start_date: startDate,
          end_date: endDate,
          chart_data: chartData,
          exercise_types: exerciseTypes,
          summary: {
            total_duration: totalDuration,
            total_calories_burned: parseFloat(totalCalories.toFixed(2)),
            avg_daily_duration: parseFloat(avgDailyDuration),
            total_records: records.length,
            total_days: chartData.length
          }
        }
      });
    } catch (error) {
      console.error('获取运动分析失败:', error);
      res.status(500).json({ error: '获取运动分析失败' });
    }
  }
}

module.exports = ExerciseController;