-- 创建数据库
CREATE DATABASE IF NOT EXISTS health_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE health_management;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    openid VARCHAR(50) UNIQUE NOT NULL,
    nickname VARCHAR(50),
    avatar_url VARCHAR(255),
    gender TINYINT DEFAULT 0 COMMENT '0-未知,1-男,2-女',
    age INT,
    height DECIMAL(5,2) COMMENT '身高(cm)',
    weight DECIMAL(5,2) COMMENT '体重(kg)',
    health_goal VARCHAR(50) COMMENT '健康目标',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 健康数据表
CREATE TABLE IF NOT EXISTS health_data (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    record_date DATE,
    weight DECIMAL(5,2),
    steps INT DEFAULT 0,
    sleep_hours DECIMAL(4,2),
    heart_rate INT,
    blood_pressure_systolic INT COMMENT '收缩压',
    blood_pressure_diastolic INT COMMENT '舒张压',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_date (user_id, record_date)
);

-- 食物数据库表
CREATE TABLE IF NOT EXISTS foods (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    unit VARCHAR(20) DEFAULT '100g',
    calories_per_unit DECIMAL(6,2) NOT NULL COMMENT '每单位卡路里',
    protein DECIMAL(5,2) DEFAULT 0 COMMENT '蛋白质(g)',
    carbs DECIMAL(5,2) DEFAULT 0 COMMENT '碳水化合物(g)',
    fat DECIMAL(5,2) DEFAULT 0 COMMENT '脂肪(g)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 饮食记录表
CREATE TABLE IF NOT EXISTS diet_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    food_id INT,
    food_name VARCHAR(100),
    amount DECIMAL(6,2) NOT NULL COMMENT '摄入量',
    total_calories DECIMAL(8,2) NOT NULL,
    meal_type ENUM('breakfast', 'lunch', 'dinner', 'snack') DEFAULT 'breakfast',
    record_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (food_id) REFERENCES foods(id)
);

-- 运动类型表
CREATE TABLE IF NOT EXISTS exercise_types (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    calories_per_minute DECIMAL(5,2) NOT NULL COMMENT '每分钟消耗卡路里',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 运动记录表
CREATE TABLE IF NOT EXISTS exercise_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    exercise_type_id INT,
    exercise_name VARCHAR(50),
    duration_minutes INT NOT NULL,
    calories_burned DECIMAL(8,2) NOT NULL,
    record_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_type_id) REFERENCES exercise_types(id)
);

-- 目标表
CREATE TABLE IF NOT EXISTS goals (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    goal_type ENUM('weight', 'steps', 'calories_intake', 'calories_burn', 'sleep') NOT NULL,
    target_value DECIMAL(8,2) NOT NULL,
    current_value DECIMAL(8,2) DEFAULT 0,
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 提醒表
CREATE TABLE IF NOT EXISTS reminders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    reminder_type ENUM('water', 'exercise', 'diet', 'sleep') NOT NULL,
    reminder_time TIME NOT NULL,
    message VARCHAR(255),
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 动态表
CREATE TABLE IF NOT EXISTS posts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    content TEXT NOT NULL,
    images JSON COMMENT '图片URL数组',
    likes_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 评论表
CREATE TABLE IF NOT EXISTS comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT,
    user_id INT,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 点赞表
CREATE TABLE IF NOT EXISTS likes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT,
    user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_post (user_id, post_id)
);

-- 插入基础食物数据
INSERT INTO foods (name, unit, calories_per_unit, protein, carbs, fat) VALUES
('米饭', '100g', 116, 2.6, 25.9, 0.3),
('面条', '100g', 109, 4.2, 22.1, 0.7),
('面包', '100g', 266, 8.3, 50.8, 3.1),
('鸡蛋', '1个(50g)', 76, 6.2, 0.1, 5.2),
('牛奶', '100ml', 54, 3.0, 3.4, 3.2),
('苹果', '100g', 52, 0.2, 13.8, 0.2),
('香蕉', '100g', 89, 1.1, 22.8, 0.2),
('鸡胸肉', '100g', 133, 19.4, 5.0, 5.0),
('牛肉', '100g', 125, 20.2, 2.0, 4.2),
('鱼肉', '100g', 104, 18.1, 0.0, 3.1);

-- 插入运动类型数据
INSERT INTO exercise_types (name, calories_per_minute) VALUES
('跑步', 10.0),
('快走', 5.0),
('游泳', 8.0),
('骑行', 7.0),
('瑜伽', 3.0),
('健身', 6.0),
('篮球', 8.5),
('羽毛球', 7.5),
('乒乓球', 4.0),
('爬山', 9.0);