App({
  globalData: {
    userInfo: null,
    token: null,
    baseUrl: 'http://localhost:3000/api', // 后端API地址
    hasLogin: false
  },

  onLaunch() {
    console.log('App Launch');
    this.checkLogin();
  },

  onShow() {
    console.log('App Show');
  },

  onHide() {
    console.log('App Hide');
  },

  // 检查登录状态
  checkLogin() {
    const token = wx.getStorageSync('token');
    const userInfo = wx.getStorageSync('userInfo');
    
    if (token && userInfo) {
      this.globalData.token = token;
      this.globalData.userInfo = userInfo;
      this.globalData.hasLogin = true;
      
      // 验证token有效性
      this.verifyToken();
    }
  },

  // 验证token
  verifyToken() {
    wx.request({
      url: `${this.globalData.baseUrl}/user/check-token`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${this.globalData.token}`
      },
      success: (res) => {
        if (res.statusCode !== 200) {
          this.logout();
        }
      },
      fail: () => {
        this.logout();
      }
    });
  },

  // 登录
  login(code, userInfo) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${this.globalData.baseUrl}/user/login`,
        method: 'POST',
        data: {
          code: code,
          userInfo: userInfo
        },
        success: (res) => {
          if (res.statusCode === 200 && res.data.success) {
            const { token, user } = res.data.data;
            
            this.globalData.token = token;
            this.globalData.userInfo = user;
            this.globalData.hasLogin = true;
            
            // 存储到本地
            wx.setStorageSync('token', token);
            wx.setStorageSync('userInfo', user);
            
            resolve(res.data);
          } else {
            reject(res.data.error || '登录失败');
          }
        },
        fail: (error) => {
          reject(error);
        }
      });
    });
  },

  // 退出登录
  logout() {
    this.globalData.token = null;
    this.globalData.userInfo = null;
    this.globalData.hasLogin = false;
    
    wx.removeStorageSync('token');
    wx.removeStorageSync('userInfo');
    
    // 跳转到登录页
    wx.redirectTo({
      url: '/pages/login/login'
    });
  },

  // 通用请求方法
  request(options) {
    return new Promise((resolve, reject) => {
      const defaultOptions = {
        url: `${this.globalData.baseUrl}${options.url}`,
        method: options.method || 'GET',
        data: options.data || {},
        header: {
          'Content-Type': 'application/json',
          ...options.header
        }
      };

      // 添加认证头
      if (this.globalData.token) {
        defaultOptions.header['Authorization'] = `Bearer ${this.globalData.token}`;
      }

      wx.request({
        ...defaultOptions,
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data);
          } else if (res.statusCode === 401) {
            // token过期，重新登录
            this.logout();
            reject('登录已过期');
          } else {
            reject(res.data.error || '请求失败');
          }
        },
        fail: (error) => {
          reject(error);
        }
      });
    });
  },

  // 显示错误消息
  showError(message) {
    wx.showToast({
      title: message,
      icon: 'none',
      duration: 2000
    });
  },

  // 显示成功消息
  showSuccess(message) {
    wx.showToast({
      title: message,
      icon: 'success',
      duration: 2000
    });
  },

  // 显示加载
  showLoading(title = '加载中...') {
    wx.showLoading({
      title: title,
      mask: true
    });
  },

  // 隐藏加载
  hideLoading() {
    wx.hideLoading();
  }
});