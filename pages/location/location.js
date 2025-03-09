const helper = require('../../utils/helper');
const fs = wx.getFileSystemManager();

Page({
  data: {
    latitude: 0,
    longitude: 0,
    accuracy: 0,
    altitude: 0,
    verticalAccuracy: 0,
    horizontalAccuracy: 0,
    speed: 0,
    isLocating: false,
    locationEnabled: true,
    errorMsg: '',
    updateTime: '',
    dataPath: 'data/saved_coordinates.json',
    // 警报相关数据
    isAlerting: false,
    alertRadius: 50, // 警报半径（米）
    nearbyCoordinate: null, // 附近的坐标点
    distance: null, // 与最近坐标点的距离
    monitoringEnabled: false, // 是否启用监控
    flashInterval: null, // 闪烁定时器
    innerAudioContext: null, // 音频上下文
    hasAlerted: false, // 新增的hasAlerted状态
    isPlayingAudio: false // 新增的isPlayingAudio状态
  },

  onLoad: function() {
    // 检查用户是否授权获取位置信息
    this.checkLocationAuth();
    
    // 初始化音频上下文
    this.initAudio();
    
    // 更新坐标缓存
    this.updateCoordinatesCache();
    
    // 预加载音频
    this.preloadAudio();
  },

  onShow: function() {
    // 页面显示时开始获取位置
    if (this.data.locationEnabled) {
      this.startLocationUpdate();
    }
    
    // 更新坐标缓存
    this.updateCoordinatesCache();
  },

  onHide: function() {
    // 页面隐藏时停止获取位置
    this.stopLocationUpdate();
    // 停止警报
    this.stopAlert();
  },

  onUnload: function() {
    // 页面卸载时停止获取位置
    this.stopLocationUpdate();
    // 停止警报
    this.stopAlert();
    // 释放音频资源
    if (this.data.innerAudioContext) {
      this.data.innerAudioContext.destroy();
    }
  },

  // 初始化音频
  initAudio: function() {
    // 不预先创建音频上下文，而是在需要时创建
    this.setData({
      innerAudioContext: null
    });
  },

  // 检查位置权限
  checkLocationAuth: function() {
    const that = this;
    wx.getSetting({
      success: (res) => {
        // 如果未授权
        if (!res.authSetting['scope.userLocation']) {
          that.setData({
            locationEnabled: false,
            errorMsg: '请授权获取位置信息'
          });
        } else {
          that.setData({
            locationEnabled: true,
            errorMsg: ''
          });
          that.startLocationUpdate();
        }
      },
      fail: (err) => {
        console.error('获取设置失败', err);
        that.setData({
          locationEnabled: false,
          errorMsg: '获取设置失败'
        });
      }
    });
  },

  // 请求授权
  requestAuth: function() {
    const that = this;
    wx.authorize({
      scope: 'scope.userLocation',
      success: () => {
        that.setData({
          locationEnabled: true,
          errorMsg: ''
        });
        that.startLocationUpdate();
      },
      fail: (err) => {
        console.error('授权失败', err);
        that.setData({
          errorMsg: '授权失败，请在设置中打开位置权限'
        });
        // 引导用户去设置页面打开权限
        that.openSetting();
      }
    });
  },

  // 打开设置页面
  openSetting: function() {
    const that = this;
    wx.openSetting({
      success: (res) => {
        if (res.authSetting['scope.userLocation']) {
          that.setData({
            locationEnabled: true,
            errorMsg: ''
          });
          that.startLocationUpdate();
        }
      }
    });
  },

  // 开始获取位置更新
  startLocationUpdate: function() {
    const that = this;
    if (this.data.isLocating) return;

    this.setData({
      isLocating: true
    });

    // 使用实时位置更新API
    this.locationUpdateManager = wx.startLocationUpdate({
      success: () => {
        console.log('开始监听位置变化');
        
        // 监听位置变化事件
        wx.onLocationChange((location) => {
          console.log('位置变化', location);
          that.setData({
            latitude: location.latitude.toFixed(6),
            longitude: location.longitude.toFixed(6),
            accuracy: location.accuracy.toFixed(2),
            altitude: location.altitude ? location.altitude.toFixed(2) : '不可用',
            verticalAccuracy: location.verticalAccuracy ? location.verticalAccuracy.toFixed(2) : '不可用',
            horizontalAccuracy: location.horizontalAccuracy ? location.horizontalAccuracy.toFixed(2) : '不可用',
            speed: location.speed ? location.speed.toFixed(2) : '0.00',
            updateTime: new Date().toLocaleTimeString()
          });
          
          // 如果启用了监控，检查是否接近保存的坐标
          if (that.data.monitoringEnabled) {
            that.checkProximity(location.latitude, location.longitude);
          }
        });
      },
      fail: (err) => {
        console.error('开始监听位置失败', err);
        that.setData({
          isLocating: false,
          errorMsg: '开始监听位置失败: ' + err.errMsg
        });
        
        // 如果失败，尝试使用单次定位
        that.getLocationOnce();
      }
    });
  },

  // 停止位置更新
  stopLocationUpdate: function() {
    if (!this.data.isLocating) return;
    
    // 停止监听位置
    wx.stopLocationUpdate({
      success: () => {
        console.log('停止监听位置成功');
        wx.offLocationChange(); // 取消监听位置变化事件
      },
      fail: (err) => {
        console.error('停止监听位置失败', err);
      },
      complete: () => {
        this.setData({
          isLocating: false
        });
      }
    });
  },

  // 单次获取位置（备用方法）
  getLocationOnce: function() {
    const that = this;
    helper.showLoading('获取位置中...');
    
    wx.getLocation({
      type: 'gcj02', // 使用国测局坐标系
      altitude: true, // 传入 true 会返回高度信息
      isHighAccuracy: true, // 开启高精度定位
      highAccuracyExpireTime: 3000, // 高精度定位超时时间(ms)，指定时间内无法获取高精度定位结果，会返回最近的高精度定位结果
      success: (res) => {
        console.log('获取位置成功', res);
        that.setData({
          latitude: res.latitude.toFixed(6),
          longitude: res.longitude.toFixed(6),
          accuracy: res.accuracy.toFixed(2),
          altitude: res.altitude ? res.altitude.toFixed(2) : '不可用',
          verticalAccuracy: res.verticalAccuracy ? res.verticalAccuracy.toFixed(2) : '不可用',
          horizontalAccuracy: res.horizontalAccuracy ? res.horizontalAccuracy.toFixed(2) : '不可用',
          speed: res.speed ? res.speed.toFixed(2) : '0.00',
          updateTime: new Date().toLocaleTimeString(),
          errorMsg: ''
        });
        
        // 如果启用了监控，检查是否接近保存的坐标
        if (that.data.monitoringEnabled) {
          that.checkProximity(res.latitude, res.longitude);
        }
      },
      fail: (err) => {
        console.error('获取位置失败', err);
        that.setData({
          errorMsg: '获取位置失败: ' + err.errMsg
        });
      },
      complete: () => {
        helper.hideLoading();
      }
    });
  },

  // 手动刷新位置
  refreshLocation: function() {
    if (this.data.locationEnabled) {
      if (this.data.isLocating) {
        // 如果正在监听位置，先停止再重新开始
        this.stopLocationUpdate();
        setTimeout(() => {
          this.startLocationUpdate();
        }, 500);
      } else {
        // 如果没有监听位置，直接获取一次
        this.getLocationOnce();
      }
    } else {
      // 如果未授权，请求授权
      this.requestAuth();
    }
  },

  // 复制坐标到剪贴板
  copyCoordinates: function() {
    const coordinates = `${this.data.latitude}, ${this.data.longitude}`;
    wx.setClipboardData({
      data: coordinates,
      success: () => {
        helper.showToast('坐标已复制到剪贴板', 'success');
      }
    });
  },

  // 在地图中查看
  openInMap: function() {
    const latitude = parseFloat(this.data.latitude);
    const longitude = parseFloat(this.data.longitude);
    
    wx.openLocation({
      latitude,
      longitude,
      scale: 18,
      success: () => {
        console.log('打开地图成功');
      },
      fail: (err) => {
        console.error('打开地图失败', err);
        helper.showToast('打开地图失败');
      }
    });
  },

  // 保存当前位置
  saveCurrentLocation: function() {
    const that = this;
    
    // 如果没有位置数据，提示用户
    if (!that.data.latitude || !that.data.longitude) {
      helper.showToast('请先获取位置信息', 'none');
      return;
    }
    
    // 弹出输入框，让用户输入位置名称
    wx.showModal({
      title: '保存位置',
      content: '请输入位置名称',
      editable: true,
      placeholderText: '例如：家、公司、学校等',
      success: (res) => {
        if (res.confirm) {
          const locationName = res.content || '未命名位置';
          that.saveLocationToCache(locationName);
        }
      }
    });
  },
  
  // 将位置保存到缓存
  saveLocationToCache: function(locationName) {
    const that = this;
    helper.showLoading('保存中...');
    
    // 构建坐标数据
    const latitude = parseFloat(that.data.latitude);
    const longitude = parseFloat(that.data.longitude);
    
    // 将十进制度数转换为度分秒格式
    const latDegrees = Math.floor(Math.abs(latitude));
    const latMinutes = Math.floor((Math.abs(latitude) - latDegrees) * 60);
    const latSeconds = ((Math.abs(latitude) - latDegrees) * 60 - latMinutes) * 60;
    const latDirection = latitude >= 0 ? 'N' : 'S';
    
    const lngDegrees = Math.floor(Math.abs(longitude));
    const lngMinutes = Math.floor((Math.abs(longitude) - lngDegrees) * 60);
    const lngSeconds = ((Math.abs(longitude) - lngDegrees) * 60 - lngMinutes) * 60;
    const lngDirection = longitude >= 0 ? 'E' : 'W';
    
    // 格式化为度分秒字符串
    const dmsFormat = `${latDegrees}°${latMinutes}'${latSeconds.toFixed(1)}"${latDirection} ${lngDegrees}°${lngMinutes}'${lngSeconds.toFixed(1)}"${lngDirection}`;
    
    // 新的坐标点
    const newCoordinate = {
      id: Date.now(),
      name: locationName,
      raw: dmsFormat,
      decimal: {
        latitude: latitude,
        longitude: longitude
      },
      dms: {
        latitude: {
          degrees: latDegrees,
          minutes: latMinutes,
          seconds: latSeconds,
          direction: latDirection
        },
        longitude: {
          degrees: lngDegrees,
          minutes: lngMinutes,
          seconds: lngSeconds,
          direction: lngDirection
        }
      },
      timestamp: new Date().toISOString(),
      notes: "用户从位置页面保存"
    };
    
    try {
      // 从缓存读取现有数据
      let savedData = wx.getStorageSync('savedCoordinates');
      let data;
      
      if (savedData) {
        data = JSON.parse(savedData);
        data.coordinates.push(newCoordinate);
      } else {
        // 如果没有现有数据，创建新的数据结构
        data = {
          coordinates: [newCoordinate],
          meta: {
            version: "1.0",
            description: "存储用户保存的坐标点",
            lastUpdated: new Date().toISOString()
          }
        };
      }
      
      // 更新最后更新时间
      if (data.meta) {
        data.meta.lastUpdated = new Date().toISOString();
      }
      
      // 保存到缓存
      wx.setStorageSync('savedCoordinates', JSON.stringify(data));
      
      // 尝试保存到文件系统（备用方法）
      that.saveToFileSystem(data);
      
      helper.hideLoading();
      helper.showToast('位置已保存', 'success');
      
      // 导航到保存的坐标页面
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/saved-coordinates/saved-coordinates'
        });
      }, 1500);
    } catch (err) {
      console.error('保存坐标失败', err);
      helper.hideLoading();
      helper.showToast('保存坐标失败', 'none');
    }
  },
  
  // 尝试保存到文件系统（备用方法）
  saveToFileSystem: function(data) {
    const that = this;
    
    try {
      console.log('开始保存到文件系统，USER_DATA_PATH:', wx.env.USER_DATA_PATH);
      
      // 检查data目录是否存在
      try {
        fs.accessSync(`${wx.env.USER_DATA_PATH}/data`);
        console.log('用户数据目录中的data目录存在');
      } catch (dirErr) {
        console.log('用户数据目录中的data目录不存在，尝试创建');
        try {
          fs.mkdirSync(`${wx.env.USER_DATA_PATH}/data`, true);
          console.log('成功创建data目录');
        } catch (mkdirErr) {
          console.error('创建data目录失败', mkdirErr);
          throw mkdirErr;
        }
      }
      
      // 写入文件到用户数据目录
      const userDataFilePath = `${wx.env.USER_DATA_PATH}/${that.data.dataPath}`;
      console.log('准备写入文件到用户数据目录:', userDataFilePath);
      
      try {
        fs.writeFileSync(userDataFilePath, JSON.stringify(data, null, 2), 'utf-8');
        console.log('同步方式保存到用户数据目录成功');
        
        // 验证文件是否写入成功
        try {
          const content = fs.readFileSync(userDataFilePath, 'utf-8');
          const readData = JSON.parse(content);
          console.log('验证文件写入成功，包含', readData.coordinates.length, '个坐标点');
          
          // 同步更新缓存，确保所有页面使用最新数据
          wx.setStorageSync('savedCoordinates', JSON.stringify(data));
          console.log('同步更新了缓存数据');
          
          return true;
        } catch (readErr) {
          console.error('验证文件写入失败', readErr);
        }
      } catch (writeErr) {
        console.error('同步方式写入文件失败，尝试异步方式', writeErr);
        
        // 如果同步方式失败，尝试异步方式
        fs.writeFile({
          filePath: userDataFilePath,
          data: JSON.stringify(data, null, 2),
          encoding: 'utf-8',
          success: () => {
            console.log('异步方式保存到用户数据目录成功');
            
            // 验证文件是否写入成功
            try {
              const content = fs.readFileSync(userDataFilePath, 'utf-8');
              const readData = JSON.parse(content);
              console.log('验证文件写入成功，包含', readData.coordinates.length, '个坐标点');
              
              // 同步更新缓存，确保所有页面使用最新数据
              wx.setStorageSync('savedCoordinates', JSON.stringify(data));
              console.log('同步更新了缓存数据');
            } catch (readErr) {
              console.error('验证文件写入失败', readErr);
            }
          },
          fail: (err) => {
            console.error('异步方式写入坐标文件到用户数据目录失败', err);
            
            // 确保至少更新了缓存
            try {
              wx.setStorageSync('savedCoordinates', JSON.stringify(data));
              console.log('保存到缓存成功（备用方法）');
            } catch (cacheErr) {
              console.error('保存到缓存也失败', cacheErr);
            }
          }
        });
      }
    } catch (err) {
      console.error('保存到文件系统失败', err);
      
      // 确保至少更新了缓存
      try {
        wx.setStorageSync('savedCoordinates', JSON.stringify(data));
        console.log('保存到缓存成功（备用方法）');
      } catch (cacheErr) {
        console.error('保存到缓存也失败', cacheErr);
      }
    }
  },

  // 切换位置监控
  toggleMonitoring: function() {
    const newState = !this.data.monitoringEnabled;
    console.log('切换监控状态:', newState ? '开启' : '关闭');
    
    this.setData({
      monitoringEnabled: newState
    });
    
    if (newState) {
      // 启用监控时，立即检查当前位置
      this.checkProximity(parseFloat(this.data.latitude), parseFloat(this.data.longitude));
      helper.showToast('位置监控已启用', 'success');
    } else {
      // 停用监控时，停止警报
      console.log('停用监控，停止所有警报');
      this.stopAlert();
      
      // 确保所有警报效果都被停止
      this.stopAllAlertEffects();
      
      helper.showToast('位置监控已停用', 'none');
    }
  },
  
  // 检查是否接近保存的坐标
  checkProximity: function(latitude, longitude) {
    const that = this;
    
    try {
      // 从缓存读取保存的坐标
      let savedData = wx.getStorageSync('savedCoordinates');
      
      if (!savedData) {
        console.log('没有保存的坐标数据');
        return;
      }
      
      const data = JSON.parse(savedData);
      const coordinates = data.coordinates || [];
      
      if (coordinates.length === 0) {
        console.log('没有保存的坐标点');
        return;
      }
      
      // 计算与每个保存的坐标的距离
      let minDistance = Infinity;
      let nearestCoordinate = null;
      
      coordinates.forEach(coordinate => {
        const distance = that.calculateDistance(
          latitude, 
          longitude, 
          coordinate.decimal.latitude, 
          coordinate.decimal.longitude
        );
        
        if (distance < minDistance) {
          minDistance = distance;
          nearestCoordinate = coordinate;
        }
      });
      
      // 更新最近的坐标点和距离
      that.setData({
        nearbyCoordinate: nearestCoordinate,
        distance: minDistance.toFixed(2)
      });
      
      // 如果距离小于警报半径，触发警报
      if (minDistance <= that.data.alertRadius) {
        // 只有当前没有警报且30秒内没有触发过警报时才触发新警报
        if (!that.data.isAlerting && !that.hasAlerted) {
          console.log('距离小于警报半径，触发警报');
          that.startAlert(nearestCoordinate, minDistance);
        }
      } else {
        // 如果距离大于警报半径，完全停止警报
        if (that.data.isAlerting) {
          console.log('距离大于警报半径，停止警报');
          that.stopAlert();
        }
      }
    } catch (err) {
      console.error('检查接近度失败', err);
    }
  },
  
  // 计算两点之间的距离（米）
  calculateDistance: function(lat1, lon1, lat2, lon2) {
    const R = 6371000; // 地球半径（米）
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
  },
  
  // 角度转弧度
  deg2rad: function(deg) {
    return deg * (Math.PI/180);
  },
  
  // 开始警报
  startAlert: function(coordinate, distance) {
    const that = this;
    
    // 先清除之前可能存在的定时器和闪烁效果
    this.stopAllAlertEffects();
    
    // 设置警报状态
    that.setData({
      isAlerting: true
    });
    
    // 设置内部警报状态
    this.hasAlerted = true;
    
    // 显示警报提示
    wx.showToast({
      title: `接近${coordinate.name}，请减速！`,
      icon: 'none',
      duration: 3000
    });
    
    // 播放警报声音
    this.playAlertSound();
    
    // 设置定时器，每隔5秒播放一次声音（给予足够时间播放完整句子）
    this.soundTimer = setInterval(() => {
      this.playAlertSound();
    }, 5000); // 从2秒改为5秒
    
    // 设置10秒后自动停止警报的定时器
    console.log('设置10秒警报定时器');
    this.alertDurationTimer = setTimeout(() => {
      console.log('10秒时间到，停止警报效果');
      // 停止闪烁和声音，但保持监控状态
      this.stopAllAlertEffects();
      
      // 立即设置isAlerting为false，移除红色背景
      this.setData({
        isAlerting: false
      });
      
      // 显示提示
      wx.showToast({
        title: '已通过超速摄像头区域，继续监控中',
        icon: 'none',
        duration: 2000
      });
    }, 10000); // 10秒后停止
  },
  
  // 停止所有警报效果（闪烁和声音）
  stopAllAlertEffects: function() {
    console.log('执行停止所有警报效果');
    
    // 停止声音定时器
    if (this.soundTimer) {
      console.log('清除声音定时器');
      clearInterval(this.soundTimer);
      this.soundTimer = null;
    }
    
    // 清除警报持续时间定时器
    if (this.alertDurationTimer) {
      console.log('清除警报持续时间定时器');
      clearTimeout(this.alertDurationTimer);
      this.alertDurationTimer = null;
    }
    
    // 停止所有可能的音频
    this.stopAllAudio();
    
    // 重置音频播放状态
    this.isPlayingAudio = false;
  },
  
  // 恢复屏幕亮度 - 不再需要，使用CSS动画
  restoreScreenBrightness: function() {
    console.log('使用CSS动画，不需要恢复屏幕亮度');
  },
  
  // 停止所有音频
  stopAllAudio: function() {
    console.log('停止所有音频');
    
    // 1. 停止背景音频
    wx.stopBackgroundAudio();
    
    // 2. 停止原生音频组件
    const audioContext = wx.createAudioContext('myAudio');
    if (audioContext) {
      audioContext.pause();
    }
    
    // 3. 停止预加载的音频实例
    if (this.audioInstance) {
      this.audioInstance.stop();
    }
    
    // 4. 停止所有InnerAudioContext
    try {
      const innerAudioContext = wx.createInnerAudioContext();
      if (innerAudioContext) {
        innerAudioContext.stop();
      }
    } catch (err) {
      console.error('停止音频失败', err);
    }
  },
  
  // 播放警报声音
  playAlertSound: function() {
    try {
      // 如果正在播放，不要打断
      if (this.isPlayingAudio) {
        console.log('正在播放音频，跳过本次播放');
        return;
      }
      
      // 标记为正在播放
      this.isPlayingAudio = true;
      
      // 尝试方法1: 使用系统振动
      wx.vibrateLong();
      
      // 尝试方法2: 使用系统提示音
      wx.showToast({
        title: '接近超速摄像头，请减速！',
        icon: 'none',
        duration: 1000
      });
      
      // 尝试方法3: 使用预加载的音频实例
      if (this.audioInstance) {
        // 先停止可能正在播放的音频
        this.audioInstance.stop();
        // 从头开始播放
        this.audioInstance.seek(0);
        // 播放
        this.audioInstance.play();
        console.log('使用预加载的音频实例播放');
        
        // 监听播放结束事件
        this.audioInstance.onEnded(() => {
          console.log('音频播放结束');
          this.isPlayingAudio = false;
        });
        
        // 设置安全超时，防止onEnded不触发
        setTimeout(() => {
          this.isPlayingAudio = false;
        }, 5000); // 5秒后无论如何都重置状态
      } else {
        // 如果没有预加载的实例，创建新的
        const innerAudioContext = wx.createInnerAudioContext();
        innerAudioContext.src = 'https://fanyi.baidu.com/gettts?lan=zh&text=您已接近超速摄像头，请减速&spd=5&source=wise';
        innerAudioContext.obeyMuteSwitch = false; // 忽略静音开关
        innerAudioContext.volume = 1; // 设置音量为最大
        innerAudioContext.autoplay = true;
        
        // 监听播放成功
        innerAudioContext.onPlay(() => {
          console.log('音频播放成功');
        });
        
        // 监听播放结束
        innerAudioContext.onEnded(() => {
          console.log('音频播放结束');
          this.isPlayingAudio = false;
          innerAudioContext.destroy(); // 销毁实例，释放资源
        });
        
        // 监听播放失败
        innerAudioContext.onError((err) => {
          console.error('音频播放失败', err);
          this.isPlayingAudio = false;
          // 尝试方法4: 使用系统音效
          this.playSystemSound();
        });
        
        // 设置安全超时，防止onEnded不触发
        setTimeout(() => {
          this.isPlayingAudio = false;
          innerAudioContext.destroy(); // 销毁实例，释放资源
        }, 5000); // 5秒后无论如何都重置状态
      }
    } catch (err) {
      console.error('播放声音失败', err);
      this.isPlayingAudio = false;
      // 如果上述方法都失败，尝试使用系统音效
      this.playSystemSound();
    }
  },
  
  // 播放系统音效
  playSystemSound: function() {
    try {
      // 尝试使用微信小程序内置的系统音效
      wx.vibrateShort({type: 'medium'});
      
      setTimeout(() => {
        wx.vibrateShort({type: 'heavy'});
      }, 500);
      
      // 使用微信小程序内置的API播放系统音效
      if (wx.createSelectorQuery) {
        const query = wx.createSelectorQuery();
        query.select('#audio-player').node(res => {
          if (res && res.node) {
            const audioContext = res.node.getContext('2d');
            if (audioContext) {
              audioContext.fillStyle = '#000000';
              audioContext.fillRect(0, 0, 1, 1);
            }
          }
        }).exec();
      }
    } catch (err) {
      console.error('播放系统音效失败', err);
    }
  },
  
  // 更新缓存中的坐标数据
  updateCoordinatesCache: function() {
    try {
      console.log('开始更新坐标缓存');
      
      // 首先尝试从USER_DATA_PATH读取
      try {
        const userDataPath = `${wx.env.USER_DATA_PATH}/${this.data.dataPath}`;
        console.log('尝试从USER_DATA_PATH读取:', userDataPath);
        
        const fileContent = fs.readFileSync(userDataPath, 'utf-8');
        const data = JSON.parse(fileContent);
        
        // 更新缓存
        wx.setStorageSync('savedCoordinates', JSON.stringify(data));
        console.log('从USER_DATA_PATH成功更新了缓存，包含', data.coordinates.length, '个坐标点');
        
        // 如果正在监控，立即检查位置
        if (this.data.monitoringEnabled) {
          this.checkProximity(parseFloat(this.data.latitude), parseFloat(this.data.longitude));
        }
        
        return true;
      } catch (userDataErr) {
        console.error('从USER_DATA_PATH读取失败', userDataErr);
        
        // 如果从USER_DATA_PATH读取失败，尝试从项目包内读取
        try {
          console.log('尝试从项目包内读取:', this.data.dataPath);
          const fileContent = fs.readFileSync(this.data.dataPath, 'utf-8');
          const data = JSON.parse(fileContent);
          
          // 更新缓存
          wx.setStorageSync('savedCoordinates', JSON.stringify(data));
          console.log('从项目包内成功更新了缓存，包含', data.coordinates.length, '个坐标点');
          
          // 如果正在监控，立即检查位置
          if (this.data.monitoringEnabled) {
            this.checkProximity(parseFloat(this.data.latitude), parseFloat(this.data.longitude));
          }
          
          return true;
        } catch (packageErr) {
          console.error('从项目包内读取失败', packageErr);
          
          // 如果都失败了，尝试从缓存读取
          try {
            const cachedData = wx.getStorageSync('savedCoordinates');
            if (cachedData) {
              const data = JSON.parse(cachedData);
              console.log('使用现有缓存，包含', data.coordinates.length, '个坐标点');
              return true;
            }
          } catch (cacheErr) {
            console.error('读取缓存失败', cacheErr);
          }
        }
      }
      
      console.error('所有方法都失败，无法更新坐标缓存');
      return false;
    } catch (err) {
      console.error('更新坐标缓存失败', err);
      return false;
    }
  },

  // 预加载音频
  preloadAudio: function() {
    try {
      // 创建内部音频上下文
      const innerAudioContext = wx.createInnerAudioContext();
      innerAudioContext.src = 'https://fanyi.baidu.com/gettts?lan=zh&text=您已接近超速摄像头，请减速&spd=5&source=wise';
      innerAudioContext.obeyMuteSwitch = false; // 忽略静音开关
      innerAudioContext.volume = 1; // 设置音量为最大
      
      // 监听加载完成
      innerAudioContext.onCanplay(() => {
        console.log('音频预加载完成');
        // 保存到实例中，以便后续使用
        this.audioInstance = innerAudioContext;
        
        // 设置播放结束事件监听器
        this.audioInstance.onEnded(() => {
          console.log('预加载音频播放结束');
          this.isPlayingAudio = false;
        });
        
        // 设置错误事件监听器
        this.audioInstance.onError((err) => {
          console.error('预加载音频播放失败', err);
          this.isPlayingAudio = false;
        });
      });
      
      // 监听加载失败
      innerAudioContext.onError((err) => {
        console.error('音频预加载失败', err);
        this.audioInstance = null;
      });
    } catch (err) {
      console.error('预加载音频失败', err);
      this.audioInstance = null;
    }
  },

  // 停止警报效果（闪烁和声音），但保持监控状态
  stopAlertEffects: function() {
    // 停止所有警报效果
    this.stopAllAlertEffects();
    
    // 立即设置isAlerting为false，移除红色背景
    this.setData({
      isAlerting: false
    });
    console.log('立即移除红色背景');
    
    // 保持内部警报状态，以便在checkProximity中知道已经触发过警报
    this.hasAlerted = true;
    
    // 30秒后重置内部警报状态，以便可以再次触发警报
    setTimeout(() => {
      this.hasAlerted = false;
      console.log('重置内部警报状态，可以再次触发警报');
    }, 30000); // 延迟30秒
  },
  
  // 完全停止警报（包括监控状态）
  stopAlert: function() {
    console.log('执行完全停止警报');
    
    // 设置警报状态
    this.setData({
      isAlerting: false
    });
    
    // 重置内部警报状态
    this.hasAlerted = false;
    
    // 停止所有警报效果
    this.stopAllAlertEffects();
  }
}); 