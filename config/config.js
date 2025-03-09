// 环境配置
const ENV = {
  DEV: {
    BASE_API: 'https://dev-api.example.com',
    ENV_NAME: 'development'
  },
  TEST: {
    BASE_API: 'https://test-api.example.com',
    ENV_NAME: 'testing'
  },
  PROD: {
    BASE_API: 'https://api.example.com',
    ENV_NAME: 'production'
  }
};

// 当前环境，可以根据需要切换
const CURRENT_ENV = ENV.DEV;

module.exports = {
  env: CURRENT_ENV,
  baseApi: CURRENT_ENV.BASE_API,
  // 其他全局配置
  timeout: 10000, // 请求超时时间
  debug: CURRENT_ENV.ENV_NAME !== 'production', // 是否开启调试模式
  version: '1.0.0' // 应用版本
}; 