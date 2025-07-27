#!/bin/bash

echo "=== 健康管理平台后端启动脚本 ==="

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "错误: Node.js 未安装，请先安装 Node.js 14+"
    exit 1
fi

# 检查npm是否安装
if ! command -v npm &> /dev/null; then
    echo "错误: npm 未安装"
    exit 1
fi

# 检查.env文件是否存在
if [ ! -f ".env" ]; then
    echo "警告: .env 文件不存在，请根据 .env 示例配置环境变量"
    echo "数据库配置、JWT密钥、微信小程序配置等"
fi

echo "正在安装依赖..."
npm install

echo "正在启动服务器..."
npm start