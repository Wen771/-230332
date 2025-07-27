// 格式化日期
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

// 格式化日期为YYYY-MM-DD格式
const formatDate = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  return `${year}-${formatNumber(month)}-${formatNumber(day)}`
}

// 格式化时间为HH:MM格式
const formatTimeOnly = date => {
  const hour = date.getHours()
  const minute = date.getMinutes()

  return `${formatNumber(hour)}:${formatNumber(minute)}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

// 获取今天的日期字符串
const getTodayString = () => {
  return formatDate(new Date())
}

// 获取指定天数前的日期字符串
const getDaysAgoString = (days) => {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return formatDate(date)
}

// 计算两个日期之间的天数差
const getDaysDiff = (date1, date2) => {
  const time1 = new Date(date1).getTime()
  const time2 = new Date(date2).getTime()
  return Math.abs(Math.ceil((time1 - time2) / (1000 * 60 * 60 * 24)))
}

// 计算BMI
const calculateBMI = (weight, height) => {
  if (!weight || !height) return null
  const heightInMeters = height / 100
  const bmi = weight / (heightInMeters * heightInMeters)
  return Math.round(bmi * 10) / 10
}

// 获取BMI状态
const getBMIStatus = (bmi) => {
  if (!bmi) return '未知'
  if (bmi < 18.5) return '偏瘦'
  if (bmi < 24) return '正常'
  if (bmi < 28) return '偏胖'
  return '肥胖'
}

// 格式化数字，保留指定小数位
const formatNumber2 = (num, decimal = 1) => {
  if (num === null || num === undefined) return '--'
  return parseFloat(num).toFixed(decimal)
}

// 格式化大数字（如步数）
const formatLargeNumber = (num) => {
  if (!num) return '0'
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toString()
}

// 防抖函数
const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// 节流函数
const throttle = (func, limit) => {
  let inThrottle
  return function() {
    const args = arguments
    const context = this
    if (!inThrottle) {
      func.apply(context, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// 深拷贝
const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime())
  if (obj instanceof Array) return obj.map(item => deepClone(item))
  if (typeof obj === 'object') {
    const clonedObj = {}
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
}

// 生成随机ID
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// 校验手机号
const validatePhone = (phone) => {
  const phoneReg = /^1[3-9]\d{9}$/
  return phoneReg.test(phone)
}

// 校验邮箱
const validateEmail = (email) => {
  const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailReg.test(email)
}

// 获取性别文本
const getGenderText = (gender) => {
  switch (gender) {
    case 1: return '男'
    case 2: return '女'
    default: return '未知'
  }
}

// 获取餐次文本
const getMealTypeText = (mealType) => {
  switch (mealType) {
    case 'breakfast': return '早餐'
    case 'lunch': return '午餐'
    case 'dinner': return '晚餐'
    case 'snack': return '加餐'
    default: return '未知'
  }
}

// 获取周几
const getWeekDay = (date) => {
  const weekDays = ['日', '一', '二', '三', '四', '五', '六']
  const day = new Date(date).getDay()
  return `周${weekDays[day]}`
}

// 获取友好的时间描述
const getFriendlyTime = (dateStr) => {
  const date = new Date(dateStr)
  const now = new Date()
  const today = formatDate(now)
  const yesterday = formatDate(new Date(now.getTime() - 24 * 60 * 60 * 1000))
  const targetDate = formatDate(date)

  if (targetDate === today) {
    return '今天 ' + formatTimeOnly(date)
  } else if (targetDate === yesterday) {
    return '昨天 ' + formatTimeOnly(date)
  } else {
    return targetDate + ' ' + formatTimeOnly(date)
  }
}

module.exports = {
  formatTime,
  formatDate,
  formatTimeOnly,
  getTodayString,
  getDaysAgoString,
  getDaysDiff,
  calculateBMI,
  getBMIStatus,
  formatNumber: formatNumber2,
  formatLargeNumber,
  debounce,
  throttle,
  deepClone,
  generateId,
  validatePhone,
  validateEmail,
  getGenderText,
  getMealTypeText,
  getWeekDay,
  getFriendlyTime
}