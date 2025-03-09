// services/user.js
const api = require('./api');
const config = require('../config/config');

// 用户相关API
const UserService = {
  // 登录
  login: (code) => {
    return api.post('/user/login', { code });
  },
  
  // 获取用户信息
  getUserInfo: () => {
    return api.get('/user/info');
  },
  
  // 更新用户信息
  updateUserInfo: (userInfo) => {
    return api.put('/user/info', userInfo);
  },
  
  // 获取用户设置
  getUserSettings: () => {
    return api.get('/user/settings');
  },
  
  // 更新用户设置
  updateUserSettings: (settings) => {
    return api.put('/user/settings', settings);
  }
};

module.exports = UserService; 