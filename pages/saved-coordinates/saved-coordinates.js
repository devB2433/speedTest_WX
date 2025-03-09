const helper = require('../../utils/helper');
const fs = wx.getFileSystemManager();

Page({
  data: {
    coordinates: [],
    loading: true,
    error: '',
    dataPath: 'data/saved_coordinates.json'
  },

  onLoad: function() {
    console.log('保存的坐标页面加载');
    this.debugEnvironment();
    this.loadCoordinates();
  },

  onShow: function() {
    console.log('保存的坐标页面显示');
    // 每次显示页面时重新加载数据
    this.loadCoordinates();
  },

  // 调试环境信息
  debugEnvironment: function() {
    console.log('===== 调试环境信息 =====');
    console.log('USER_DATA_PATH:', wx.env.USER_DATA_PATH);
    
    // 检查缓存
    try {
      const cachedData = wx.getStorageSync('savedCoordinates');
      if (cachedData) {
        const data = JSON.parse(cachedData);
        console.log('缓存中的坐标数量:', data.coordinates ? data.coordinates.length : 0);
        console.log('缓存数据:', data);
      } else {
        console.log('缓存中没有坐标数据');
      }
    } catch (err) {
      console.error('读取缓存失败', err);
    }
    
    // 检查文件系统
    try {
      const userDataPath = `${wx.env.USER_DATA_PATH}/data/saved_coordinates.json`;
      console.log('尝试检查用户数据目录文件:', userDataPath);
      
      try {
        // 检查目录是否存在
        fs.accessSync(`${wx.env.USER_DATA_PATH}/data`);
        console.log('data目录存在');
        
        try {
          // 检查文件是否存在
          fs.accessSync(userDataPath);
          console.log('坐标文件存在');
          
          // 读取文件内容
          const fileContent = fs.readFileSync(userDataPath, 'utf-8');
          const data = JSON.parse(fileContent);
          console.log('用户数据目录中的坐标数量:', data.coordinates ? data.coordinates.length : 0);
        } catch (fileErr) {
          console.error('坐标文件不存在或无法访问', fileErr);
        }
      } catch (dirErr) {
        console.error('data目录不存在或无法访问', dirErr);
      }
    } catch (err) {
      console.error('检查文件系统失败', err);
    }
    
    // 检查项目包内文件
    try {
      console.log('尝试检查项目包内文件:', this.data.dataPath);
      const fileContent = fs.readFileSync(this.data.dataPath, 'utf-8');
      const data = JSON.parse(fileContent);
      console.log('项目包内的坐标数量:', data.coordinates ? data.coordinates.length : 0);
    } catch (err) {
      console.error('检查项目包内文件失败', err);
    }
    
    console.log('===== 调试环境信息结束 =====');
  },

  // 加载保存的坐标
  loadCoordinates: function() {
    const that = this;
    that.setData({
      loading: true,
      error: ''
    });

    console.log('开始加载坐标数据');
    
    // 首先尝试从缓存读取，这是最快的方式
    try {
      console.log('尝试从缓存读取');
      const cachedData = wx.getStorageSync('savedCoordinates');
      if (cachedData) {
        try {
          const data = JSON.parse(cachedData);
          console.log('从缓存读取成功，数据:', data);
          
          if (data && data.coordinates && Array.isArray(data.coordinates) && data.coordinates.length > 0) {
            that.setData({
              coordinates: data.coordinates,
              loading: false
            });
            console.log('从缓存成功加载了', data.coordinates.length, '个坐标点');
            
            // 异步尝试从文件读取，以确保数据是最新的
            setTimeout(() => {
              that.loadFromFile();
            }, 100);
            
            return;
          } else {
            console.log('缓存中的数据无效或为空');
          }
        } catch (parseErr) {
          console.error('解析缓存数据失败', parseErr);
        }
      } else {
        console.log('缓存中没有坐标数据');
      }
    } catch (cacheErr) {
      console.error('读取缓存失败', cacheErr);
    }
    
    // 如果缓存读取失败，直接从文件读取
    that.loadFromFile();
  },
  
  // 刷新坐标数据（点击刷新按钮时调用）
  refreshCoordinates: function() {
    console.log('用户点击刷新按钮，开始刷新坐标数据');
    
    // 显示加载状态
    this.setData({
      loading: true,
      error: ''
    });
    
    // 首先尝试从用户数据目录读取文件
    const that = this;
    const userDataPath = `${wx.env.USER_DATA_PATH}/${that.data.dataPath}`;
    console.log('尝试从用户数据目录读取:', userDataPath);
    
    try {
      // 检查目录是否存在
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
          // 如果创建目录失败，加载默认数据
          that.loadDefaultData();
          return;
        }
      }
      
      // 检查文件是否存在
      try {
        fs.accessSync(userDataPath);
        console.log('用户数据目录中的坐标文件存在');
        
        const fileContent = fs.readFileSync(userDataPath, 'utf-8');
        const data = JSON.parse(fileContent);
        
        console.log('从用户数据目录读取成功，数据:', data);
        
        if (data && data.coordinates && Array.isArray(data.coordinates) && data.coordinates.length > 0) {
          // 更新缓存
          wx.setStorageSync('savedCoordinates', JSON.stringify(data));
          
          // 更新UI
          that.setData({
            coordinates: data.coordinates,
            loading: false
          });
          console.log('从用户数据目录成功加载了', data.coordinates.length, '个坐标点');
          helper.showToast('刷新成功', 'success');
          return;
        } else {
          console.log('用户数据目录中的数据无效或为空');
          // 如果数据无效，加载默认数据
          that.loadDefaultData();
        }
      } catch (fileErr) {
        console.log('用户数据目录中的坐标文件不存在或无法访问', fileErr);
        // 如果文件不存在，加载默认数据
        that.loadDefaultData();
      }
    } catch (err) {
      console.error('从用户数据目录读取坐标失败', err);
      // 如果读取失败，加载默认数据
      that.loadDefaultData();
    }
  },
  
  // 加载默认数据
  loadDefaultData: function() {
    console.log('加载默认数据');
    
    // 获取app实例
    const app = getApp();
    
    // 使用app.js中的默认数据
    if (app && app.globalData && app.globalData.defaultData) {
      console.log('使用app.js中的默认数据');
      const data = app.globalData.defaultData;
      
      // 更新缓存
      wx.setStorageSync('savedCoordinates', JSON.stringify(data));
      
      // 更新UI
      this.setData({
        coordinates: data.coordinates,
        loading: false
      });
      console.log('从app.js成功加载了', data.coordinates.length, '个坐标点');
      helper.showToast('已加载默认坐标', 'success');
      
      // 保存到用户数据目录
      this.saveToUserDataPath(data);
      return;
    }
    
    // 如果app.js中没有默认数据，则从项目包内读取
    this.loadFromPackage();
  },
  
  // 从文件加载数据
  loadFromFile: function() {
    const that = this;
    console.log('从文件加载坐标数据');
    
    try {
      // 尝试从用户数据目录读取文件
      const userDataPath = `${wx.env.USER_DATA_PATH}/${that.data.dataPath}`;
      console.log('尝试从用户数据目录读取:', userDataPath);
      
      // 检查目录是否存在
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
          // 如果创建目录失败，加载系统默认坐标
          that.loadFromPackage();
          return;
        }
      }
      
      // 检查文件是否存在
      try {
        fs.accessSync(userDataPath);
        console.log('用户数据目录中的坐标文件存在');
        
        const fileContent = fs.readFileSync(userDataPath, 'utf-8');
        const data = JSON.parse(fileContent);
        
        console.log('从用户数据目录读取成功，数据:', data);
        
        if (data && data.coordinates && Array.isArray(data.coordinates) && data.coordinates.length > 0) {
          // 更新缓存
          wx.setStorageSync('savedCoordinates', JSON.stringify(data));
          
          // 更新UI
          that.setData({
            coordinates: data.coordinates,
            loading: false
          });
          console.log('从用户数据目录成功加载了', data.coordinates.length, '个坐标点');
          return;
        } else {
          console.log('用户数据目录中的数据无效或为空');
          // 如果数据无效，加载系统默认坐标
          that.loadFromPackage();
        }
      } catch (fileErr) {
        console.log('用户数据目录中的坐标文件不存在或无法访问', fileErr);
        // 如果文件不存在，加载系统默认坐标
        that.loadFromPackage();
      }
    } catch (err) {
      console.error('从用户数据目录读取坐标失败', err);
      // 如果读取失败，加载系统默认坐标
      that.loadFromPackage();
    }
  },
  
  // 从项目包内加载数据
  loadFromPackage: function() {
    const that = this;
    console.log('从项目包内加载坐标数据');
    
    try {
      // 尝试从项目包内读取
      console.log('尝试从项目包内读取:', that.data.dataPath);
      
      // 检查文件是否存在
      try {
        fs.accessSync(that.data.dataPath);
        console.log('项目包内的坐标文件存在');
        
        const fileContent = fs.readFileSync(that.data.dataPath, 'utf-8');
        const data = JSON.parse(fileContent);
        
        console.log('从项目包内读取成功，数据:', data);
        
        if (data && data.coordinates && Array.isArray(data.coordinates) && data.coordinates.length > 0) {
          // 更新缓存
          wx.setStorageSync('savedCoordinates', JSON.stringify(data));
          
          // 更新UI
          that.setData({
            coordinates: data.coordinates,
            loading: false
          });
          console.log('从项目包内成功加载了', data.coordinates.length, '个坐标点');
          helper.showToast('已加载系统默认坐标', 'none');
          
          // 尝试将数据保存到用户数据目录
          that.saveToUserDataPath(data);
          
          return;
        } else {
          console.log('项目包内的数据无效或为空');
          that.showError('无法加载坐标数据');
        }
      } catch (fileErr) {
        console.log('项目包内的坐标文件不存在或无法访问', fileErr);
        that.showError('无法加载坐标数据');
      }
    } catch (err) {
      console.error('从项目包内读取失败', err);
      that.showError('无法加载坐标数据');
    }
  },
  
  // 显示错误信息
  showError: function(message) {
    this.setData({
      loading: false,
      error: message || '加载坐标数据失败，请稍后再试'
    });
  },
  
  // 保存数据到用户数据目录
  saveToUserDataPath: function(data) {
    console.log('尝试将数据保存到用户数据目录');
    const fs = wx.getFileSystemManager();
    const dataPath = this.data.dataPath;
    
    try {
      // 检查data目录是否存在
      try {
        fs.accessSync(`${wx.env.USER_DATA_PATH}/data`);
        console.log('用户数据目录中的data目录存在');
      } catch (dirErr) {
        console.log('用户数据目录中的data目录不存在，尝试创建');
        fs.mkdirSync(`${wx.env.USER_DATA_PATH}/data`, true);
        console.log('成功创建data目录');
      }
      
      // 将数据写入文件
      const userDataPath = `${wx.env.USER_DATA_PATH}/${dataPath}`;
      fs.writeFileSync(
        userDataPath,
        JSON.stringify(data, null, 2),
        'utf8'
      );
      console.log('成功将数据保存到用户数据目录:', userDataPath);
      return true;
    } catch (err) {
      console.error('保存数据到用户数据目录失败', err);
      return false;
    }
  },
  
  // 查看坐标详情
  viewCoordinate: function(e) {
    const index = e.currentTarget.dataset.index;
    const coordinate = this.data.coordinates[index];
    
    wx.showModal({
      title: coordinate.name,
      content: `原始格式: ${coordinate.raw}\n\n纬度: ${coordinate.decimal.latitude}\n经度: ${coordinate.decimal.longitude}\n\n添加时间: ${new Date(coordinate.timestamp).toLocaleString()}\n\n备注: ${coordinate.notes || '无'}`,
      showCancel: false,
      confirmText: '确定'
    });
  },
  
  // 在地图中查看坐标
  viewInMap: function(e) {
    const index = e.currentTarget.dataset.index;
    const coordinate = this.data.coordinates[index];
    
    wx.openLocation({
      latitude: coordinate.decimal.latitude,
      longitude: coordinate.decimal.longitude,
      name: coordinate.name,
      scale: 18
    });
  },
  
  // 添加当前位置
  addCurrentLocation: function() {
    wx.navigateTo({
      url: '/pages/location/location'
    });
  },
  
  // 删除坐标
  deleteCoordinate: function(e) {
    const that = this;
    const index = e.currentTarget.dataset.index;
    const coordinate = this.data.coordinates[index];
    
    // 确保只能删除用户自行添加的坐标
    if (coordinate.notes === '系统默认坐标') {
      helper.showToast('默认坐标不能删除', 'none');
      return;
    }
    
    // 显示确认对话框
    wx.showModal({
      title: '确认删除',
      content: `确定要删除坐标"${coordinate.name}"吗？`,
      confirmText: '删除',
      confirmColor: '#fa5151',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          console.log('用户确认删除坐标', coordinate);
          
          // 显示加载提示
          helper.showLoading('正在删除...');
          
          try {
            // 1. 从数组中移除该坐标
            const newCoordinates = that.data.coordinates.filter((item, i) => i !== index);
            
            // 2. 构建新的数据对象
            const newData = {
              coordinates: newCoordinates,
              meta: {
                version: "1.0",
                description: "存储用户保存的坐标点",
                lastUpdated: new Date().toISOString()
              }
            };
            
            // 3. 更新缓存
            wx.setStorageSync('savedCoordinates', JSON.stringify(newData));
            
            // 4. 更新用户数据目录中的文件
            that.saveToUserDataPath(newData);
            
            // 5. 更新UI
            that.setData({
              coordinates: newCoordinates
            });
            
            // 6. 显示成功提示
            helper.hideLoading();
            helper.showToast('删除成功', 'success');
            
            console.log('成功删除坐标，剩余', newCoordinates.length, '个坐标点');
          } catch (err) {
            console.error('删除坐标失败', err);
            helper.hideLoading();
            helper.showToast('删除失败', 'none');
          }
        } else {
          console.log('用户取消删除坐标');
        }
      }
    });
  },
  
  // 清除缓存
  clearCache: function() {
    const that = this;
    
    // 显示确认对话框
    wx.showModal({
      title: '确认清除',
      content: '确定要清除所有保存的坐标数据吗？此操作不可恢复。',
      confirmText: '确定清除',
      confirmColor: '#fa5151',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          console.log('用户确认清除缓存');
          
          // 显示加载提示
          helper.showLoading('正在清除...');
          
          try {
            // 1. 清除缓存
            wx.removeStorageSync('savedCoordinates');
            console.log('成功清除缓存数据');
            
            // 2. 删除用户数据目录中的文件
            const userDataPath = `${wx.env.USER_DATA_PATH}/data/saved_coordinates.json`;
            
            try {
              // 检查文件是否存在
              fs.accessSync(userDataPath);
              console.log('用户数据目录中的坐标文件存在，准备删除');
              
              // 删除文件
              fs.unlinkSync(userDataPath);
              console.log('成功删除用户数据目录中的坐标文件');
            } catch (fileErr) {
              console.log('用户数据目录中的坐标文件不存在或无法访问，无需删除', fileErr);
            }
            
            // 3. 重置页面数据
            that.setData({
              coordinates: [],
              loading: false,
              error: ''
            });
            
            // 4. 显示成功提示
            helper.hideLoading();
            helper.showToast('清除成功', 'success');
            
            // 5. 记录调试信息
            console.log('===== 清除缓存完成 =====');
            that.debugEnvironment();
          } catch (err) {
            console.error('清除缓存失败', err);
            helper.hideLoading();
            helper.showToast('清除失败', 'none');
          }
        } else {
          console.log('用户取消清除缓存');
        }
      }
    });
  },
  
  // 导航到坐标详情页
  navigateToDetail: function(e) {
    const index = e.currentTarget.dataset.index;
    const coordinate = this.data.coordinates[index];
    
    if (coordinate) {
      // 将坐标数据存储到缓存，以便详情页使用
      wx.setStorageSync('currentCoordinate', JSON.stringify(coordinate));
      
      // 导航到详情页
      wx.navigateTo({
        url: '../coordinate-detail/coordinate-detail'
      });
    } else {
      helper.showToast('无法获取坐标详情', 'none');
    }
  }
}); 