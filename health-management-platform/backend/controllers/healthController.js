const HealthData = require('../models/HealthData');
const moment = require('moment');

class HealthController {
  // 添加或更新健康数据
  static async upsertHealthData(req, res) {
    try {
      const { record_date, weight, steps, sleep_hours, heart_rate, blood_pressure_systolic, blood_pressure_diastolic } = req.body;
      
      const data = {
        record_date: record_date || moment().format('YYYY-MM-DD'),
        weight,
        steps,
        sleep_hours,
        heart_rate,
        blood_pressure_systolic,
        blood_pressure_diastolic
      };

      await HealthData.upsert(req.user.id, data);

      res.json({
        success: true,
        message: '健康数据保存成功'
      });
    } catch (error) {
      console.error('保存健康数据失败:', error);
      res.status(500).json({ error: '保存健康数据失败' });
    }
  }

  // 获取指定日期的健康数据
  static async getHealthDataByDate(req, res) {
    try {
      const { date } = req.query;
      const targetDate = date || moment().format('YYYY-MM-DD');

      const data = await HealthData.getByDate(req.user.id, targetDate);

      res.json({
        success: true,
        data: data || {}
      });
    } catch (error) {
      console.error('获取健康数据失败:', error);
      res.status(500).json({ error: '获取健康数据失败' });
    }
  }

  // 获取指定日期范围的健康数据
  static async getHealthDataByRange(req, res) {
    try {
      const { start_date, end_date } = req.query;
      
      if (!start_date || !end_date) {
        return res.status(400).json({ error: '请提供开始和结束日期' });
      }

      const data = await HealthData.getByDateRange(req.user.id, start_date, end_date);

      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('获取健康数据失败:', error);
      res.status(500).json({ error: '获取健康数据失败' });
    }
  }

  // 获取最近的健康数据
  static async getRecentHealthData(req, res) {
    try {
      const { limit = 7 } = req.query;

      const data = await HealthData.getRecent(req.user.id, parseInt(limit));

      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('获取最近健康数据失败:', error);
      res.status(500).json({ error: '获取最近健康数据失败' });
    }
  }

  // 获取健康数据统计
  static async getHealthStats(req, res) {
    try {
      const { start_date, end_date } = req.query;
      
      const defaultEndDate = moment().format('YYYY-MM-DD');
      const defaultStartDate = moment().subtract(30, 'days').format('YYYY-MM-DD');

      const stats = await HealthData.getStats(
        req.user.id,
        start_date || defaultStartDate,
        end_date || defaultEndDate
      );

      res.json({
        success: true,
        data: stats || {}
      });
    } catch (error) {
      console.error('获取健康统计失败:', error);
      res.status(500).json({ error: '获取健康统计失败' });
    }
  }

  // 生成健康报告
  static async generateHealthReport(req, res) {
    try {
      const { period = 'week' } = req.query; // week, month, year
      
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
        case 'year':
          startDate = now.clone().subtract(365, 'days').format('YYYY-MM-DD');
          endDate = now.format('YYYY-MM-DD');
          break;
        default:
          startDate = now.clone().subtract(7, 'days').format('YYYY-MM-DD');
          endDate = now.format('YYYY-MM-DD');
      }

      const [healthData, stats] = await Promise.all([
        HealthData.getByDateRange(req.user.id, startDate, endDate),
        HealthData.getStats(req.user.id, startDate, endDate)
      ]);

      // 生成图表数据
      const chartData = {
        weight: healthData.filter(d => d.weight).map(d => ({
          date: d.record_date,
          value: parseFloat(d.weight)
        })),
        steps: healthData.filter(d => d.steps).map(d => ({
          date: d.record_date,
          value: parseInt(d.steps)
        })),
        sleep: healthData.filter(d => d.sleep_hours).map(d => ({
          date: d.record_date,
          value: parseFloat(d.sleep_hours)
        }))
      };

      const report = {
        period,
        start_date: startDate,
        end_date: endDate,
        stats,
        chart_data: chartData,
        summary: {
          total_records: stats.record_count || 0,
          avg_weight: stats.avg_weight ? parseFloat(stats.avg_weight).toFixed(1) : null,
          avg_steps: stats.avg_steps ? parseInt(stats.avg_steps) : null,
          avg_sleep: stats.avg_sleep ? parseFloat(stats.avg_sleep).toFixed(1) : null
        }
      };

      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      console.error('生成健康报告失败:', error);
      res.status(500).json({ error: '生成健康报告失败' });
    }
  }
}

module.exports = HealthController;