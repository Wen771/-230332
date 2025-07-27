const app = getApp()
const util = require('../../utils/util')

Page({
  data: {
    userInfo: {},
    todayDate: '',
    healthGoal: '',
    bmi: null,
    todaySteps: 0,
    todayWeight: null,
    todayCalories: 0,
    todayExercise: 0,
    todaySleep: null,
    chartData: []
  },

  onLoad() {
    this.checkLogin()
    this.setData({
      todayDate: util.getTodayString()
    })
  },

  onShow() {
    if (app.globalData.hasLogin) {
      this.loadData()
    }
  },

  checkLogin() {
    if (!app.globalData.hasLogin) {
      wx.redirectTo({
        url: '/pages/login/login'
      })
      return
    }
    
    this.setData({
      userInfo: app.globalData.userInfo
    })
  },

  async loadData() {
    try {
      app.showLoading('加载中...')
      
      await Promise.all([
        this.loadTodayData(),
        this.loadWeekTrend()
      ])
      
      app.hideLoading()
    } catch (error) {
      app.hideLoading()
      console.error('加载数据失败:', error)
    }
  },

  async loadTodayData() {
    try {
      const today = util.getTodayString()
      
      // 获取今日健康数据
      const healthData = await app.request({
        url: '/health/data',
        data: { date: today }
      })

      // 获取今日饮食数据
      const dietData = await app.request({
        url: '/diet/records',
        data: { date: today }
      })

      // 获取今日运动数据
      const exerciseData = await app.request({
        url: '/exercise/records',
        data: { date: today }
      })

      // 计算BMI
      const userInfo = app.globalData.userInfo
      let bmi = null
      if (userInfo.height && userInfo.weight) {
        bmi = util.calculateBMI(userInfo.weight, userInfo.height)
      }

      this.setData({
        healthGoal: userInfo.health_goal || '设定你的健康目标',
        bmi: bmi,
        todaySteps: healthData.data?.steps || 0,
        todayWeight: healthData.data?.weight || null,
        todayCalories: dietData.data?.stats?.total_calories || 0,
        todayExercise: exerciseData.data?.stats?.total_duration || 0,
        todaySleep: healthData.data?.sleep_hours || null
      })
    } catch (error) {
      console.error('加载今日数据失败:', error)
    }
  },

  async loadWeekTrend() {
    try {
      const endDate = util.getTodayString()
      const startDate = util.getDaysAgoString(6)
      
      const healthData = await app.request({
        url: '/health/data/range',
        data: { start_date: startDate, end_date: endDate }
      })

      this.setData({
        chartData: healthData.data || []
      })

      // 绘制图表
      this.drawChart()
    } catch (error) {
      console.error('加载趋势数据失败:', error)
    }
  },

  drawChart() {
    const ctx = wx.createCanvasContext('trendChart', this)
    const canvasWidth = 320
    const canvasHeight = 200
    const padding = 40
    const chartWidth = canvasWidth - padding * 2
    const chartHeight = canvasHeight - padding * 2

    // 清空画布
    ctx.clearRect(0, 0, canvasWidth, canvasHeight)

    if (this.data.chartData.length === 0) {
      ctx.setFontSize(14)
      ctx.setFillStyle('#999')
      ctx.fillText('暂无数据', canvasWidth / 2 - 30, canvasHeight / 2)
      ctx.draw()
      return
    }

    // 绘制体重趋势线
    const weights = this.data.chartData.map(item => item.weight).filter(w => w)
    if (weights.length > 1) {
      const maxWeight = Math.max(...weights)
      const minWeight = Math.min(...weights)
      const weightRange = maxWeight - minWeight || 1

      ctx.setStrokeStyle('#1aad19')
      ctx.setLineWidth(2)
      ctx.beginPath()

      this.data.chartData.forEach((item, index) => {
        if (item.weight) {
          const x = padding + (index / (this.data.chartData.length - 1)) * chartWidth
          const y = padding + chartHeight - ((item.weight - minWeight) / weightRange) * chartHeight
          
          if (index === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }
      })

      ctx.stroke()
    }

    // 绘制坐标轴标签
    ctx.setFontSize(10)
    ctx.setFillStyle('#666')
    this.data.chartData.forEach((item, index) => {
      const x = padding + (index / (this.data.chartData.length - 1)) * chartWidth
      const date = new Date(item.record_date)
      const label = `${date.getMonth() + 1}/${date.getDate()}`
      ctx.fillText(label, x - 15, canvasHeight - 10)
    })

    ctx.draw()
  },

  // 页面跳转方法
  goToHealth() {
    wx.switchTab({
      url: '/pages/health/health'
    })
  },

  goToDiet() {
    wx.switchTab({
      url: '/pages/diet/diet'
    })
  },

  goToExercise() {
    wx.switchTab({
      url: '/pages/exercise/exercise'
    })
  },

  addHealthData() {
    wx.navigateTo({
      url: '/pages/health/health'
    })
  },

  addDiet() {
    wx.navigateTo({
      url: '/pages/diet/add/add'
    })
  },

  addExercise() {
    wx.navigateTo({
      url: '/pages/exercise/add/add'
    })
  },

  viewReport() {
    wx.navigateTo({
      url: '/pages/report/report'
    })
  },

  onPullDownRefresh() {
    this.loadData().finally(() => {
      wx.stopPullDownRefresh()
    })
  }
})