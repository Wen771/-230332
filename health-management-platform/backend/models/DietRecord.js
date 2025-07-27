const { pool } = require('../config/database');

class DietRecord {
  // 添加饮食记录
  static async create(userId, recordData) {
    const { food_id, food_name, amount, total_calories, meal_type } = recordData;
    
    const [result] = await pool.execute(
      'INSERT INTO diet_records (user_id, food_id, food_name, amount, total_calories, meal_type) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, food_id, food_name, amount, total_calories, meal_type]
    );
    return result.insertId;
  }

  // 获取指定日期的饮食记录
  static async getByDate(userId, date) {
    const [rows] = await pool.execute(
      `SELECT dr.*, f.unit, f.protein, f.carbs, f.fat 
       FROM diet_records dr
       LEFT JOIN foods f ON dr.food_id = f.id
       WHERE dr.user_id = ? AND DATE(dr.record_time) = ?
       ORDER BY dr.record_time ASC`,
      [userId, date]
    );
    return rows;
  }

  // 获取指定日期范围的饮食记录
  static async getByDateRange(userId, startDate, endDate) {
    const [rows] = await pool.execute(
      `SELECT dr.*, f.unit, f.protein, f.carbs, f.fat 
       FROM diet_records dr
       LEFT JOIN foods f ON dr.food_id = f.id
       WHERE dr.user_id = ? AND DATE(dr.record_time) BETWEEN ? AND ?
       ORDER BY dr.record_time ASC`,
      [userId, startDate, endDate]
    );
    return rows;
  }

  // 获取指定日期的营养统计
  static async getDailyStats(userId, date) {
    const [rows] = await pool.execute(
      `SELECT 
        DATE(record_time) as date,
        SUM(total_calories) as total_calories,
        COUNT(*) as meal_count,
        SUM(CASE WHEN meal_type = 'breakfast' THEN total_calories ELSE 0 END) as breakfast_calories,
        SUM(CASE WHEN meal_type = 'lunch' THEN total_calories ELSE 0 END) as lunch_calories,
        SUM(CASE WHEN meal_type = 'dinner' THEN total_calories ELSE 0 END) as dinner_calories,
        SUM(CASE WHEN meal_type = 'snack' THEN total_calories ELSE 0 END) as snack_calories
       FROM diet_records 
       WHERE user_id = ? AND DATE(record_time) = ?
       GROUP BY DATE(record_time)`,
      [userId, date]
    );
    return rows[0];
  }

  // 删除饮食记录
  static async delete(id, userId) {
    const [result] = await pool.execute(
      'DELETE FROM diet_records WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows > 0;
  }

  // 搜索食物
  static async searchFood(keyword) {
    const [rows] = await pool.execute(
      'SELECT * FROM foods WHERE name LIKE ? LIMIT 20',
      [`%${keyword}%`]
    );
    return rows;
  }

  // 获取所有食物
  static async getAllFoods() {
    const [rows] = await pool.execute(
      'SELECT * FROM foods ORDER BY name'
    );
    return rows;
  }
}

module.exports = DietRecord;