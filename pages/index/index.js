// index.js
// 获取应用实例
const app = getApp()

// 生成构建号
const generateBuildNumber = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const version = '1.0.0'; // 应用版本号
  const buildDate = `${year}${month}${day}`;
  const buildNumber = `${version}.${buildDate}`;
  return buildNumber;
};

Page({
  data: {
    buildNumber: generateBuildNumber() // 构建号
  },
  
  // 事件处理函数
  bindViewTap() {
    wx.navigateTo({
      url: '../location/location'
    })
  },
  
  onLoad() {
    // 页面加载时的逻辑
  }
}) 