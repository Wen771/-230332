const { pool } = require('../config/database');

class HealthData {
  // 添加或更新健康数据
  static async upsert(userId, data) {
    const { record_date, weight, steps, sleep_hours, heart_rate, blood_pressure_systolic, blood_pressure_diastolic } = data;
    
    const [result] = await pool.execute(
      `INSERT INTO health_data 
       (user_id, record_date, weight, steps, sleep_hours, heart_rate, blood_pressure_systolic, blood_pressure_diastolic) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       weight = COALESCE(VALUES(weight), weight),
       steps = COALESCE(VALUES(steps), steps),
       sleep_hours = COALESCE(VALUES(sleep_hours), sleep_hours),
       heart_rate = COALESCE(VALUES(heart_rate), heart_rate),
       blood_pressure_systolic = COALESCE(VALUES(blood_pressure_systolic), blood_pressure_systolic),
       blood_pressure_diastolic = COALESCE(VALUES(blood_pressure_diastolic), blood_pressure_diastolic)`,
      [userId, record_date, weight, steps, sleep_hours, heart_rate, blood_pressure_systolic, blood_pressure_diastolic]
    );
    return result;
  }

  // 获取用户指定日期的健康数据
  static async getByDate(userId, date) {
    const [rows] = await pool.execute(
      'SELECT * FROM health_data WHERE user_id = ? AND record_date = ?',
      [userId, date]
    );
    return rows[0];
  }

  // 获取用户指定日期范围的健康数据
  static async getByDateRange(userId, startDate, endDate) {
    const [rows] = await pool.execute(
      'SELECT * FROM health_data WHERE user_id = ? AND record_date BETWEEN ? AND ? ORDER BY record_date ASC',
      [userId, startDate, endDate]
    );
    return rows;
  }

  // 获取用户最近的健康数据
  static async getRecent(userId, limit = 7) {
    const [rows] = await pool.execute(
      'SELECT * FROM health_data WHERE user_id = ? ORDER BY record_date DESC LIMIT ?',
      [userId, limit]
    );
    return rows;
  }

  // 获取用户健康数据统计
  static async getStats(userId, startDate, endDate) {
    const [rows] = await pool.execute(
      `SELECT 
        COUNT(*) as record_count,
        AVG(weight) as avg_weight,
        AVG(steps) as avg_steps,
        AVG(sleep_hours) as avg_sleep,
        AVG(heart_rate) as avg_heart_rate,
        MAX(steps) as max_steps,
        MIN(weight) as min_weight,
        MAX(weight) as max_weight
       FROM health_data 
       WHERE user_id = ? AND record_date BETWEEN ? AND ?`,
      [userId, startDate, endDate]
    );
    return rows[0];
  }
}

module.exports = HealthData;