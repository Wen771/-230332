# 个人健康管理平台

一个基于微信小程序的个人健康管理平台，包含用户管理、健康数据记录、饮食管理、运动管理、健康报告分析等功能。

## 项目结构

```
health-management-platform/
├── backend/                 # 后端服务 (Node.js + Express + MySQL)
│   ├── config/             # 配置文件
│   ├── controllers/        # 控制器
│   ├── middleware/         # 中间件
│   ├── models/            # 数据模型
│   ├── routes/            # 路由
│   ├── utils/             # 工具类
│   ├── uploads/           # 文件上传目录
│   ├── app.js             # 主服务器文件
│   └── package.json       # 依赖配置
├── frontend/              # 前端小程序
│   ├── pages/             # 页面
│   ├── components/        # 组件
│   ├── utils/             # 工具类
│   ├── images/           # 图片资源
│   ├── app.js            # 小程序主文件
│   ├── app.json          # 小程序配置
│   └── app.wxss          # 全局样式
├── database/             # 数据库
│   └── init.sql          # 数据库初始化脚本
└── docs/                 # 文档
```

## 核心功能模块

### 1. 用户管理模块
- 微信授权登录
- 用户个人信息管理（姓名、性别、年龄、身高、体重等）
- 用户健康目标设置

### 2. 健康数据记录模块
- 记录每日健康数据（体重、步数、睡眠时间、心率、血压等）
- 支持手动输入或设备同步
- 提供按日期查询健康数据的功能

### 3. 饮食管理模块
- 记录每日饮食（食物名称、摄入量、卡路里等）
- 提供食物数据库搜索
- 计算每日摄入总热量
- 支持按餐次分类记录

### 4. 运动管理模块
- 记录运动情况（运动类型、时长、消耗卡路里等）
- 提供运动类型选择及热量消耗计算
- 运动数据统计分析

### 5. 健康报告与分析模块
- 生成健康报告（每日/每周/每月汇总）
- 数据可视化展示（体重变化曲线、热量摄入与消耗对比图等）
- 健康评分和建议

### 6. 目标与提醒模块
- 设定健康目标（目标体重、每日步数、热量上限等）
- 提供提醒功能（饮食记录、运动提醒、喝水提醒等）

### 7. 社区与分享模块
- 用户动态发布
- 点赞和评论功能
- 分享健康报告

## 技术栈

### 后端
- **Node.js** - 运行环境
- **Express** - Web框架
- **MySQL** - 数据库
- **JWT** - 身份认证
- **bcryptjs** - 密码加密
- **moment** - 日期处理
- **axios** - HTTP客户端
- **multer** - 文件上传

### 前端
- **微信小程序** - 前端框架
- **Canvas** - 图表绘制
- **微信API** - 登录、用户信息等

## 数据库设计

### 核心表结构

1. **users (用户表)**
   - id, openid, nickname, avatar_url, gender, age, height, weight, health_goal

2. **health_data (健康数据表)**
   - id, user_id, record_date, weight, steps, sleep_hours, heart_rate, blood_pressure

3. **foods (食物数据库表)**
   - id, name, unit, calories_per_unit, protein, carbs, fat

4. **diet_records (饮食记录表)**
   - id, user_id, food_id, food_name, amount, total_calories, meal_type

5. **exercise_types (运动类型表)**
   - id, name, calories_per_minute

6. **exercise_records (运动记录表)**
   - id, user_id, exercise_type_id, exercise_name, duration_minutes, calories_burned

7. **goals (目标表)**
   - id, user_id, goal_type, target_value, current_value, start_date, end_date

8. **reminders (提醒表)**
   - id, user_id, reminder_type, reminder_time, message, is_enabled

## 安装和部署

### 1. 环境准备
- Node.js 14+
- MySQL 8.0+
- 微信开发者工具

### 2. 后端部署

```bash
# 进入后端目录
cd backend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，配置数据库和微信小程序信息

# 初始化数据库
mysql -u root -p < ../database/init.sql

# 启动服务
npm start
# 或开发模式
npm run dev
```

### 3. 前端部署

1. 使用微信开发者工具打开 `frontend` 目录
2. 配置小程序 AppID
3. 修改 `app.js` 中的 `baseUrl` 为后端服务地址
4. 编译并预览

### 4. 配置说明

#### 后端环境变量 (.env)
```env
# 数据库配置
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=health_management

# JWT密钥
JWT_SECRET=your_jwt_secret_key

# 微信小程序配置
WECHAT_APPID=your_wechat_appid
WECHAT_SECRET=your_wechat_secret

# 服务器配置
PORT=3000
NODE_ENV=development
```

## API接口文档

### 用户相关
- `POST /api/user/login` - 微信登录
- `GET /api/user/profile` - 获取用户信息
- `PUT /api/user/profile` - 更新用户信息

### 健康数据
- `POST /api/health/data` - 添加/更新健康数据
- `GET /api/health/data` - 获取指定日期健康数据
- `GET /api/health/data/range` - 获取日期范围健康数据
- `GET /api/health/report` - 生成健康报告

### 饮食管理
- `POST /api/diet/records` - 添加饮食记录
- `GET /api/diet/records` - 获取饮食记录
- `DELETE /api/diet/records/:id` - 删除饮食记录
- `GET /api/diet/foods/search` - 搜索食物
- `GET /api/diet/analysis` - 饮食分析报告

### 运动管理
- `POST /api/exercise/records` - 添加运动记录
- `GET /api/exercise/records` - 获取运动记录
- `DELETE /api/exercise/records/:id` - 删除运动记录
- `GET /api/exercise/types` - 获取运动类型
- `GET /api/exercise/analysis` - 运动分析报告

## 前后端交互流程

### 1. 用户登录流程
1. 小程序调用 `wx.login()` 获取 code
2. 小程序获取用户信息（头像、昵称等）
3. 发送 code 和用户信息到后端
4. 后端通过微信接口验证 code，获取 openid
5. 查找或创建用户记录
6. 生成 JWT token 返回给小程序
7. 小程序存储 token，后续请求携带 token

### 2. 数据同步流程
1. 小程序定期同步微信运动步数
2. 用户手动录入健康数据
3. 数据提交到后端API
4. 后端验证并存储数据
5. 返回处理结果给小程序

### 3. 报告生成流程
1. 小程序请求健康报告
2. 后端查询相关时间段数据
3. 计算统计指标和趋势
4. 生成图表数据
5. 返回报告数据给小程序展示

## 开发说明

### 前端开发规范
- 使用ES6+语法
- 组件化开发，提高代码复用性
- 统一的样式规范和UI组件
- 错误处理和用户友好提示

### 后端开发规范
- RESTful API设计
- 统一的响应格式
- 完整的错误处理
- 数据校验和安全防护
- 日志记录和监控

### 数据库规范
- 统一的命名规范
- 适当的索引优化
- 数据完整性约束
- 定期备份策略

## 扩展功能

### 计划中的功能
1. 更多图表类型和数据可视化
2. 智能健康建议和AI分析
3. 社区功能完善（关注、私信等）
4. 第三方设备数据同步
5. 健康数据导出功能
6. 家庭成员健康管理

### 技术优化
1. 缓存机制优化
2. 数据库查询优化
3. 小程序性能优化
4. 服务器负载均衡
5. CDN静态资源加速

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目。

## 联系方式

如有问题，请通过 GitHub Issues 联系。