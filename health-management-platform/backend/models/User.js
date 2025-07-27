const { pool } = require('../config/database');

class User {
  // 根据openid查找用户
  static async findByOpenid(openid) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE openid = ?',
      [openid]
    );
    return rows[0];
  }

  // 根据ID查找用户
  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  // 创建新用户
  static async create(userData) {
    const { openid, nickname, avatar_url, gender } = userData;
    const [result] = await pool.execute(
      'INSERT INTO users (openid, nickname, avatar_url, gender) VALUES (?, ?, ?, ?)',
      [openid, nickname || '', avatar_url || '', gender || 0]
    );
    return result.insertId;
  }

  // 更新用户信息
  static async update(id, userData) {
    const fields = [];
    const values = [];
    
    Object.keys(userData).forEach(key => {
      if (userData[key] !== undefined && key !== 'id') {
        fields.push(`${key} = ?`);
        values.push(userData[key]);
      }
    });

    if (fields.length === 0) return false;

    values.push(id);
    const [result] = await pool.execute(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  }

  // 获取用户基本信息
  static async getProfile(id) {
    const [rows] = await pool.execute(
      'SELECT id, nickname, avatar_url, gender, age, height, weight, health_goal, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  }
}

module.exports = User;