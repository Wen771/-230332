const DietRecord = require('../models/DietRecord');
const moment = require('moment');

class DietController {
  // 添加饮食记录
  static async addDietRecord(req, res) {
    try {
      const { food_id, food_name, amount, meal_type } = req.body;
      
      if (!food_name || !amount) {
        return res.status(400).json({ error: '食物名称和摄入量不能为空' });
      }

      // 如果有food_id，从食物数据库获取热量信息
      let total_calories = 0;
      if (food_id) {
        const foods = await DietRecord.getAllFoods();
        const food = foods.find(f => f.id === food_id);
        if (food) {
          total_calories = (food.calories_per_unit * amount / 100).toFixed(2);
        }
      } else {
        // 如果没有food_id，用户需要手动输入卡路里
        total_calories = req.body.total_calories || 0;
      }

      const recordData = {
        food_id,
        food_name,
        amount: parseFloat(amount),
        total_calories: parseFloat(total_calories),
        meal_type: meal_type || 'breakfast'
      };

      const recordId = await DietRecord.create(req.user.id, recordData);

      res.json({
        success: true,
        message: '饮食记录添加成功',
        data: { id: recordId }
      });
    } catch (error) {
      console.error('添加饮食记录失败:', error);
      res.status(500).json({ error: '添加饮食记录失败' });
    }
  }

  // 获取指定日期的饮食记录
  static async getDietRecordsByDate(req, res) {
    try {
      const { date } = req.query;
      const targetDate = date || moment().format('YYYY-MM-DD');

      const records = await DietRecord.getByDate(req.user.id, targetDate);
      const stats = await DietRecord.getDailyStats(req.user.id, targetDate);

      res.json({
        success: true,
        data: {
          records,
          stats: stats || {
            total_calories: 0,
            meal_count: 0,
            breakfast_calories: 0,
            lunch_calories: 0,
            dinner_calories: 0,
            snack_calories: 0
          }
        }
      });
    } catch (error) {
      console.error('获取饮食记录失败:', error);
      res.status(500).json({ error: '获取饮食记录失败' });
    }
  }

  // 获取指定日期范围的饮食记录
  static async getDietRecordsByRange(req, res) {
    try {
      const { start_date, end_date } = req.query;
      
      if (!start_date || !end_date) {
        return res.status(400).json({ error: '请提供开始和结束日期' });
      }

      const records = await DietRecord.getByDateRange(req.user.id, start_date, end_date);

      res.json({
        success: true,
        data: records
      });
    } catch (error) {
      console.error('获取饮食记录失败:', error);
      res.status(500).json({ error: '获取饮食记录失败' });
    }
  }

  // 删除饮食记录
  static async deleteDietRecord(req, res) {
    try {
      const { id } = req.params;

      const success = await DietRecord.delete(parseInt(id), req.user.id);

      if (!success) {
        return res.status(404).json({ error: '记录不存在或无权限删除' });
      }

      res.json({
        success: true,
        message: '饮食记录删除成功'
      });
    } catch (error) {
      console.error('删除饮食记录失败:', error);
      res.status(500).json({ error: '删除饮食记录失败' });
    }
  }

  // 搜索食物
  static async searchFood(req, res) {
    try {
      const { keyword } = req.query;

      if (!keyword) {
        return res.status(400).json({ error: '搜索关键词不能为空' });
      }

      const foods = await DietRecord.searchFood(keyword);

      res.json({
        success: true,
        data: foods
      });
    } catch (error) {
      console.error('搜索食物失败:', error);
      res.status(500).json({ error: '搜索食物失败' });
    }
  }

  // 获取所有食物
  static async getAllFoods(req, res) {
    try {
      const foods = await DietRecord.getAllFoods();

      res.json({
        success: true,
        data: foods
      });
    } catch (error) {
      console.error('获取食物列表失败:', error);
      res.status(500).json({ error: '获取食物列表失败' });
    }
  }

  // 获取饮食分析报告
  static async getDietAnalysis(req, res) {
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

      const records = await DietRecord.getByDateRange(req.user.id, startDate, endDate);

      // 按日期分组统计
      const dailyStats = {};
      records.forEach(record => {
        const date = moment(record.record_time).format('YYYY-MM-DD');
        if (!dailyStats[date]) {
          dailyStats[date] = {
            date,
            total_calories: 0,
            breakfast_calories: 0,
            lunch_calories: 0,
            dinner_calories: 0,
            snack_calories: 0
          };
        }
        
        dailyStats[date].total_calories += parseFloat(record.total_calories);
        dailyStats[date][`${record.meal_type}_calories`] += parseFloat(record.total_calories);
      });

      const chartData = Object.values(dailyStats);
      const avgDailyCalories = chartData.length > 0 
        ? (chartData.reduce((sum, day) => sum + day.total_calories, 0) / chartData.length).toFixed(0)
        : 0;

      res.json({
        success: true,
        data: {
          period,
          start_date: startDate,
          end_date: endDate,
          chart_data: chartData,
          summary: {
            avg_daily_calories: parseFloat(avgDailyCalories),
            total_records: records.length,
            total_days: chartData.length
          }
        }
      });
    } catch (error) {
      console.error('获取饮食分析失败:', error);
      res.status(500).json({ error: '获取饮食分析失败' });
    }
  }
}

module.exports = DietController;