const app = getApp()

Page({
  data: {
    userInfo: null,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },

  onLoad() {
    // 检查是否已经登录
    if (app.globalData.hasLogin) {
      this.redirectToIndex()
      return
    }

    // 检查是否支持getUserInfo
    if (wx.getUserInfo) {
      wx.getUserInfo({
        success: res => {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          this.setData({
            userInfo: res.userInfo
          })
        }
      })
    }
  },

  getUserInfo(e) {
    if (e.detail.userInfo) {
      this.setData({
        userInfo: e.detail.userInfo
      })
    } else {
      wx.showToast({
        title: '获取用户信息失败',
        icon: 'none'
      })
    }
  },

  doLogin() {
    if (!this.data.userInfo) {
      wx.showToast({
        title: '请先获取用户信息',
        icon: 'none'
      })
      return
    }

    wx.showLoading({
      title: '登录中...'
    })

    // 获取登录凭证
    wx.login({
      success: (res) => {
        if (res.code) {
          // 调用后端登录接口
          app.login(res.code, this.data.userInfo)
            .then(() => {
              wx.hideLoading()
              app.showSuccess('登录成功')
              this.redirectToIndex()
            })
            .catch((error) => {
              wx.hideLoading()
              app.showError(error)
            })
        } else {
          wx.hideLoading()
          app.showError('获取登录凭证失败')
        }
      },
      fail: () => {
        wx.hideLoading()
        app.showError('微信登录失败')
      }
    })
  },

  redirectToIndex() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  }
})