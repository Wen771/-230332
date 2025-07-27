# 健康管理平台部署指南

## 环境要求

### 服务器环境
- Node.js 14+ 
- MySQL 8.0+
- PM2 (生产环境推荐)

### 开发环境
- 微信开发者工具
- Git
- 代码编辑器（VS Code推荐）

## 后端部署

### 1. 克隆项目
```bash
git clone <repository-url>
cd health-management-platform
```

### 2. 安装依赖
```bash
cd backend
npm install
```

### 3. 数据库配置
```bash
# 登录MySQL
mysql -u root -p

# 执行初始化脚本
source ../database/init.sql
```

### 4. 环境变量配置
```bash
# 复制环境变量模板
cp .env.example .env

# 编辑配置文件
vim .env
```

配置内容示例：
```env
# 数据库配置
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=health_management

# JWT密钥 (建议使用强密码)
JWT_SECRET=your_jwt_secret_key_32_characters

# 微信小程序配置
WECHAT_APPID=wx1234567890abcdef
WECHAT_SECRET=1234567890abcdef1234567890abcdef

# 服务器配置
PORT=3000
NODE_ENV=production
```

### 5. 启动服务

#### 开发环境
```bash
npm run dev
```

#### 生产环境
```bash
# 使用PM2管理进程
npm install -g pm2
pm2 start app.js --name health-backend
pm2 save
pm2 startup
```

### 6. 验证服务
访问 `http://localhost:3000` 检查API是否正常响应。

## 前端部署

### 1. 微信小程序配置
1. 登录微信公众平台
2. 创建小程序，获取 AppID
3. 配置服务器域名（在小程序后台设置 request 合法域名）

### 2. 开发者工具配置
1. 下载并安装微信开发者工具
2. 导入项目（选择 `frontend` 目录）
3. 设置AppID
4. 修改 `app.js` 中的 `baseUrl` 为实际后端地址

### 3. 代码修改
```javascript
// frontend/app.js
globalData: {
  baseUrl: 'https://your-domain.com/api', // 修改为实际后端地址
  // ...
}
```

### 4. 上传发布
1. 在微信开发者工具中点击"上传"
2. 填写版本号和项目备注
3. 在微信公众平台提交审核
4. 审核通过后发布

## 生产环境优化

### 1. 服务器配置

#### Nginx配置 (推荐)
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # HTTPS重定向
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /uploads/ {
        alias /path/to/project/backend/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

#### PM2配置文件
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'health-backend',
    script: 'app.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
```

### 2. 数据库优化
```sql
-- 创建索引优化查询性能
CREATE INDEX idx_user_date ON health_data(user_id, record_date);
CREATE INDEX idx_diet_user_time ON diet_records(user_id, record_time);
CREATE INDEX idx_exercise_user_time ON exercise_records(user_id, record_time);

-- 定期清理旧数据（可选）
-- DELETE FROM health_data WHERE record_date < DATE_SUB(NOW(), INTERVAL 2 YEAR);
```

### 3. 安全配置

#### 防火墙配置
```bash
# 只开放必要端口
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw enable
```

#### 数据库安全
```bash
# MySQL安全配置
mysql_secure_installation

# 创建专用数据库用户
CREATE USER 'health_user'@'localhost' IDENTIFIED BY 'strong_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON health_management.* TO 'health_user'@'localhost';
FLUSH PRIVILEGES;
```

### 4. 监控和日志

#### 日志配置
```bash
# 创建日志目录
mkdir -p /var/log/health-platform

# Logrotate配置
cat > /etc/logrotate.d/health-platform << EOF
/var/log/health-platform/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 root root
    postrotate
        pm2 reloadLogs
    endscript
}
EOF
```

#### 监控脚本
```bash
#!/bin/bash
# monitor.sh - 简单的健康检查脚本

API_URL="http://localhost:3000/api"
LOG_FILE="/var/log/health-platform/monitor.log"

# 检查API响应
response=$(curl -s -o /dev/null -w "%{http_code}" $API_URL)

if [ $response -eq 200 ]; then
    echo "$(date): API健康检查通过" >> $LOG_FILE
else
    echo "$(date): API健康检查失败，响应码: $response" >> $LOG_FILE
    # 可以添加告警逻辑，如发送邮件或短信
fi
```

## 备份策略

### 1. 数据库备份
```bash
#!/bin/bash
# backup.sh

DB_NAME="health_management"
BACKUP_DIR="/backup/mysql"
DATE=$(date +%Y%m%d_%H%M%S)

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份数据库
mysqldump -u root -p$MYSQL_PASSWORD $DB_NAME > $BACKUP_DIR/health_${DATE}.sql

# 压缩备份文件
gzip $BACKUP_DIR/health_${DATE}.sql

# 删除7天前的备份
find $BACKUP_DIR -name "health_*.sql.gz" -mtime +7 -delete

echo "数据库备份完成: health_${DATE}.sql.gz"
```

### 2. 定时备份
```bash
# 添加到crontab
0 2 * * * /path/to/backup.sh
```

## 故障排除

### 1. 常见问题

#### 数据库连接失败
```bash
# 检查MySQL服务状态
systemctl status mysql

# 检查端口是否开放
netstat -tlnp | grep 3306

# 检查数据库配置
mysql -u root -p -e "SHOW DATABASES;"
```

#### API请求失败
```bash
# 检查Node.js进程
pm2 status

# 查看应用日志
pm2 logs health-backend

# 检查端口占用
netstat -tlnp | grep 3000
```

#### 小程序请求失败
1. 检查微信公众平台的服务器域名配置
2. 确认HTTPS证书是否有效
3. 查看微信开发者工具的调试信息

### 2. 性能监控

#### 安装监控工具
```bash
# 安装监控工具
npm install -g pm2-logrotate
pm2 install pm2-server-monit
```

#### 系统监控
```bash
# 查看系统资源使用情况
htop
iostat -x 1
free -h
df -h
```

## 升级指南

### 1. 备份数据
执行上述备份脚本

### 2. 更新代码
```bash
git pull origin main
cd backend
npm install
```

### 3. 数据库迁移
```bash
# 如果有数据库结构变更
mysql -u root -p health_management < migration.sql
```

### 4. 重启服务
```bash
pm2 restart health-backend
```

### 5. 验证升级
```bash
# 检查服务状态
pm2 status
curl http://localhost:3000/api
```

## 联系支持

如遇到部署问题，请：
1. 查看项目README文档
2. 检查issue列表
3. 提交新的issue并附上错误日志