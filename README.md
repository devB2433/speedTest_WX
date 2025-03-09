# 微信小程序项目

## 项目结构

```
├── app.js                 // 小程序逻辑
├── app.json               // 小程序公共配置
├── app.wxss               // 小程序公共样式表
├── project.config.json    // 项目配置文件
├── sitemap.json           // 小程序及页面是否允许被微信索引
├── components             // 自定义组件
│   └── custom-button      // 自定义按钮组件
├── config                 // 配置文件
│   ├── config.js          // 环境配置
│   └── constants.js       // 常量配置
├── images                 // 图片资源
├── pages                  // 页面文件
│   ├── index              // 首页
│   └── logs               // 日志页
├── services               // API服务
│   ├── api.js             // API基础封装
│   └── user.js            // 用户相关API
├── static                 // 静态资源
└── utils                  // 工具类
    ├── util.js            // 通用工具函数
    └── helper.js          // 辅助函数
```

## 开发环境

- 微信开发者工具
- Node.js

## 项目说明

这是一个微信小程序项目的基础框架，包含了常用的目录结构和基础功能。

## 使用方法

1. 克隆项目到本地
2. 使用微信开发者工具打开项目
3. 在 project.config.json 中修改 appid 为你自己的小程序 appid
4. 开始开发

## 功能特点

- 模块化的目录结构
- API 服务封装
- 常用工具类
- 自定义组件示例

## 注意事项

- 开发前请确保已经注册微信小程序账号并获取 appid
- 请根据实际需求修改配置文件中的参数 