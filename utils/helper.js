// utils/helper.js
const Constants = require('../config/constants');

const Helper = {
  /**
   * 显示提示信息
   * @param {string} title 提示内容
   * @param {string} icon 图标类型
   * @param {number} duration 持续时间
   */
  showToast: (title, icon = 'none', duration = 1500) => {
    wx.showToast({
      title,
      icon,
      duration
    });
  },

  /**
   * 显示加载提示
   * @param {string} title 提示内容
   */
  showLoading: (title = '加载中...') => {
    wx.showLoading({
      title,
      mask: true
    });
  },

  /**
   * 隐藏加载提示
   */
  hideLoading: () => {
    wx.hideLoading();
  },

  /**
   * 显示模态对话框
   * @param {string} title 标题
   * @param {string} content 内容
   * @param {boolean} showCancel 是否显示取消按钮
   * @returns {Promise} 返回Promise对象
   */
  showModal: (title, content, showCancel = true) => {
    return new Promise((resolve, reject) => {
      wx.showModal({
        title,
        content,
        showCancel,
        success: (res) => {
          if (res.confirm) {
            resolve(true);
          } else if (res.cancel) {
            resolve(false);
          }
        },
        fail: reject
      });
    });
  },

  /**
   * 本地存储
   * @param {string} key 键
   * @param {any} data 值
   */
  setStorage: (key, data) => {
    try {
      wx.setStorageSync(key, data);
    } catch (e) {
      console.error('setStorage error:', e);
    }
  },

  /**
   * 获取本地存储
   * @param {string} key 键
   * @returns {any} 存储的值
   */
  getStorage: (key) => {
    try {
      return wx.getStorageSync(key);
    } catch (e) {
      console.error('getStorage error:', e);
      return null;
    }
  },

  /**
   * 移除本地存储
   * @param {string} key 键
   */
  removeStorage: (key) => {
    try {
      wx.removeStorageSync(key);
    } catch (e) {
      console.error('removeStorage error:', e);
    }
  },

  /**
   * 页面导航
   * @param {string} url 页面路径
   */
  navigateTo: (url) => {
    wx.navigateTo({
      url
    });
  },

  /**
   * 重定向页面
   * @param {string} url 页面路径
   */
  redirectTo: (url) => {
    wx.redirectTo({
      url
    });
  }
};

module.exports = Helper; 