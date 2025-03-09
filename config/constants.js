// 应用常量配置
const Constants = {
  // 应用信息
  APP_NAME: '微信小程序',
  APP_VERSION: '1.0.0',
  
  // 本地存储键
  STORAGE_KEYS: {
    USER_INFO: 'userInfo',
    TOKEN: 'token',
    LOGS: 'logs'
  },
  
  // 状态码
  STATUS_CODES: {
    SUCCESS: 200,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    SERVER_ERROR: 500
  },
  
  // 路由路径
  ROUTES: {
    INDEX: '/pages/index/index',
    LOGS: '/pages/logs/logs'
  }
};

module.exports = Constants; 