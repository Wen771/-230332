const { pool } = require('../config/database');

class ExerciseRecord {
  // 添加运动记录
  static async create(userId, recordData) {
    const { exercise_type_id, exercise_name, duration_minutes, calories_burned } = recordData;
    
    const [result] = await pool.execute(
      'INSERT INTO exercise_records (user_id, exercise_type_id, exercise_name, duration_minutes, calories_burned) VALUES (?, ?, ?, ?, ?)',
      [userId, exercise_type_id, exercise_name, duration_minutes, calories_burned]
    );
    return result.insertId;
  }

  // 获取指定日期的运动记录
  static async getByDate(userId, date) {
    const [rows] = await pool.execute(
      `SELECT er.*, et.calories_per_minute 
       FROM exercise_records er
       LEFT JOIN exercise_types et ON er.exercise_type_id = et.id
       WHERE er.user_id = ? AND DATE(er.record_time) = ?
       ORDER BY er.record_time ASC`,
      [userId, date]
    );
    return rows;
  }

  // 获取指定日期范围的运动记录
  static async getByDateRange(userId, startDate, endDate) {
    const [rows] = await pool.execute(
      `SELECT er.*, et.calories_per_minute 
       FROM exercise_records er
       LEFT JOIN exercise_types et ON er.exercise_type_id = et.id
       WHERE er.user_id = ? AND DATE(er.record_time) BETWEEN ? AND ?
       ORDER BY er.record_time ASC`,
      [userId, startDate, endDate]
    );
    return rows;
  }

  // 获取指定日期的运动统计
  static async getDailyStats(userId, date) {
    const [rows] = await pool.execute(
      `SELECT 
        DATE(record_time) as date,
        SUM(duration_minutes) as total_duration,
        SUM(calories_burned) as total_calories_burned,
        COUNT(*) as exercise_count
       FROM exercise_records 
       WHERE user_id = ? AND DATE(record_time) = ?
       GROUP BY DATE(record_time)`,
      [userId, date]
    );
    return rows[0];
  }

  // 删除运动记录
  static async delete(id, userId) {
    const [result] = await pool.execute(
      'DELETE FROM exercise_records WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows > 0;
  }

  // 获取所有运动类型
  static async getAllExerciseTypes() {
    const [rows] = await pool.execute(
      'SELECT * FROM exercise_types ORDER BY name'
    );
    return rows;
  }

  // 根据运动类型计算消耗热量
  static async calculateCalories(exerciseTypeId, durationMinutes) {
    const [rows] = await pool.execute(
      'SELECT calories_per_minute FROM exercise_types WHERE id = ?',
      [exerciseTypeId]
    );
    
    if (rows.length === 0) return 0;
    
    return rows[0].calories_per_minute * durationMinutes;
  }
}

module.exports = ExerciseRecord;