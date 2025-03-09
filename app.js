// app.js
App({
  // 全局数据
  globalData: {
    userInfo: null,
    defaultData: null  // 用于存储默认坐标数据
  },
  
  onLaunch: function () {
    console.log('===== 小程序启动 =====');
    console.log('USER_DATA_PATH:', wx.env.USER_DATA_PATH);
    
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 初始化加载保存的坐标数据
    this.initCoordinatesData();

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
  },

  // 初始化坐标数据
  initCoordinatesData: function() {
    console.log('初始化坐标数据');
    const fs = wx.getFileSystemManager();
    const dataPath = 'data/saved_coordinates.json';

    // 创建默认数据结构
    const defaultData = {
      meta: {
        version: "1.0",
        description: "保存用户坐标点的文件",
        lastUpdated: "2025-03-13T11:05:00.000Z"
      },
      coordinates: [
        {
          id: 1,
          name: "River Glen Boulevard between Towne Boulevard and Mowat Avenue",
          raw: "43°28'02.4\"N 79°44'09.7\"W",
          decimal: {
            latitude: 43.467333,
            longitude: -79.736028
          },
          dms: {
            latitude: {
              degrees: 43,
              minutes: 28,
              seconds: 2.4,
              direction: "N"
            },
            longitude: {
              degrees: 79,
              minutes: 44,
              seconds: 9.7,
              direction: "W"
            }
          },
          timestamp: "2025-03-09T03:52:00.000Z",
          notes: "系统默认坐标"
        },
        {
          id: 2,
          name: "Sixth Line between A point 75 metres south of Elm Road and Upper Middle Road East/Upper Middle Road West",
          raw: "43°27'55.8\"N 79°42'35.7\"W",
          decimal: {
            latitude: 43.465500,
            longitude: -79.709917
          },
          dms: {
            latitude: {
              degrees: 43,
              minutes: 27,
              seconds: 55.8,
              direction: "N"
            },
            longitude: {
              degrees: 79,
              minutes: 42,
              seconds: 35.7,
              direction: "W"
            }
          },
          timestamp: "2025-03-09T04:15:00.000Z",
          notes: "系统默认坐标"
        },
        {
          id: 3,
          name: "Reynolds Street between Cornwall Road and Sumner Avenue",
          raw: "43°27'10.5\"N 79°40'26.3\"W",
          decimal: {
            latitude: 43.452917,
            longitude: -79.673972
          },
          dms: {
            latitude: {
              degrees: 43,
              minutes: 27,
              seconds: 10.5,
              direction: "N"
            },
            longitude: {
              degrees: 79,
              minutes: 40,
              seconds: 26.3,
              direction: "W"
            }
          },
          timestamp: "2025-03-09T05:00:00.000Z",
          notes: "系统默认坐标"
        },
        {
          id: 4,
          name: "Old Abbey Lane between Montrose Abbey Drive and Milton Road/ Northwood Drive",
          raw: "43°26'44.6\"N 79°42'38.6\"W",
          decimal: {
            latitude: 43.445722,
            longitude: -79.710722
          },
          dms: {
            latitude: {
              degrees: 43,
              minutes: 26,
              seconds: 44.6,
              direction: "N"
            },
            longitude: {
              degrees: 79,
              minutes: 42,
              seconds: 38.6,
              direction: "W"
            }
          },
          timestamp: "2025-03-09T05:30:00.000Z",
          notes: "系统默认坐标"
        },
        {
          id: 5,
          name: "Nottinghill Gate between Runnymead Crescent (easterly intersection) and Beechgrove Crescent (southerly intersection)",
          raw: "43°26'23.7\"N 79°43'05.3\"W",
          decimal: {
            latitude: 43.439917,
            longitude: -79.718139
          },
          dms: {
            latitude: {
              degrees: 43,
              minutes: 26,
              seconds: 23.7,
              direction: "N"
            },
            longitude: {
              degrees: 79,
              minutes: 43,
              seconds: 5.3,
              direction: "W"
            }
          },
          timestamp: "2025-03-10T08:30:00.000Z",
          notes: "系统默认坐标"
        },
        {
          id: 6,
          name: "Pine Glen Road between Newcastle Crescent (westerly intersection) and Proudfoot Trail",
          raw: "43°27'04.4\"N 79°45'15.4\"W",
          decimal: {
            latitude: 43.451222,
            longitude: -79.754278
          },
          dms: {
            latitude: {
              degrees: 43,
              minutes: 27,
              seconds: 4.4,
              direction: "N"
            },
            longitude: {
              degrees: 79,
              minutes: 45,
              seconds: 15.4,
              direction: "W"
            }
          },
          timestamp: "2025-03-11T09:00:00.000Z",
          notes: "系统默认坐标"
        },
        {
          id: 7,
          name: "Westoak Trails Boulevard between Brookhaven Crescent/ Arbourview Drive and Colbeck Street/ Amberglen Court",
          raw: "43°25'53.3\"N 79°45'35.2\"W",
          decimal: {
            latitude: 43.431472,
            longitude: -79.759778
          },
          dms: {
            latitude: {
              degrees: 43,
              minutes: 25,
              seconds: 53.3,
              direction: "N"
            },
            longitude: {
              degrees: 79,
              minutes: 45,
              seconds: 35.2,
              direction: "W"
            }
          },
          timestamp: "2025-03-11T09:05:00.000Z",
          notes: "系统默认坐标"
        },
        {
          id: 8,
          name: "Colonel William Parkway between A point 340 metres south of Stocksbridge Avenue/Richview Boulevard and Watercliffe Court",
          raw: "43°25'24.4\"N 79°46'17.8\"W",
          decimal: {
            latitude: 43.423444,
            longitude: -79.771611
          },
          dms: {
            latitude: {
              degrees: 43,
              minutes: 25,
              seconds: 24.4,
              direction: "N"
            },
            longitude: {
              degrees: 79,
              minutes: 46,
              seconds: 17.8,
              direction: "W"
            }
          },
          timestamp: "2025-03-11T09:10:00.000Z",
          notes: "系统默认坐标"
        },
        {
          id: 9,
          name: "Rebecca Street between Sussex Street and Bronte Road",
          raw: "43°23'56.6\"N 79°43'07.4\"W",
          decimal: {
            latitude: 43.399056,
            longitude: -79.718722
          },
          dms: {
            latitude: {
              degrees: 43,
              minutes: 23,
              seconds: 56.6,
              direction: "N"
            },
            longitude: {
              degrees: 79,
              minutes: 43,
              seconds: 7.4,
              direction: "W"
            }
          },
          timestamp: "2025-03-11T09:15:00.000Z",
          notes: "系统默认坐标"
        },
        {
          id: 10,
          name: "Post Road between Dundas Street East and Threshing Mill Boulevard",
          raw: "43°29'06.4\"N 79°43'54.7\"W",
          decimal: {
            latitude: 43.485111,
            longitude: -79.731861
          },
          dms: {
            latitude: {
              degrees: 43,
              minutes: 29,
              seconds: 6.4,
              direction: "N"
            },
            longitude: {
              degrees: 79,
              minutes: 43,
              seconds: 54.7,
              direction: "W"
            }
          },
          timestamp: "2025-03-12T10:00:00.000Z",
          notes: "系统默认坐标"
        },
        {
          id: 11,
          name: "Glenashton Drive between Eighth Line and Grand Boulevard",
          raw: "43°29'16.9\"N 79°41'55.7\"W",
          decimal: {
            latitude: 43.488028,
            longitude: -79.698806
          },
          dms: {
            latitude: {
              degrees: 43,
              minutes: 29,
              seconds: 16.9,
              direction: "N"
            },
            longitude: {
              degrees: 79,
              minutes: 41,
              seconds: 55.7,
              direction: "W"
            }
          },
          timestamp: "2025-03-13T11:00:00.000Z",
          notes: "系统默认坐标"
        },
        {
          id: 12,
          name: "North Ridge Trail between Glenashton Drive and Postridge Drive",
          raw: "43°29'37.6\"N 79°41'46.7\"W",
          decimal: {
            latitude: 43.493778,
            longitude: -79.696306
          },
          dms: {
            latitude: {
              degrees: 43,
              minutes: 29,
              seconds: 37.6,
              direction: "N"
            },
            longitude: {
              degrees: 79,
              minutes: 41,
              seconds: 46.7,
              direction: "W"
            }
          },
          timestamp: "2025-03-13T11:05:00.000Z",
          notes: "系统默认坐标"
        }
      ]
    };
    
    // 将默认数据保存到globalData中，使其可以被其他页面访问
    this.globalData.defaultData = defaultData;

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
      
      // 首先尝试从USER_DATA_PATH读取
      try {
        const userDataPath = `${wx.env.USER_DATA_PATH}/${dataPath}`;
        console.log('尝试从USER_DATA_PATH读取:', userDataPath);
        
        // 检查文件是否存在
        try {
          fs.accessSync(userDataPath);
          console.log('用户数据目录中的坐标文件存在');
          
          const fileContent = fs.readFileSync(userDataPath, 'utf-8');
          const data = JSON.parse(fileContent);
          
          // 验证数据有效性
          if (data && data.coordinates && Array.isArray(data.coordinates)) {
            // 更新缓存
            wx.setStorageSync('savedCoordinates', JSON.stringify(data));
            console.log('应用启动时从USER_DATA_PATH成功加载了', data.coordinates.length, '个坐标点');
            return true;
          } else {
            console.error('从USER_DATA_PATH读取的数据格式无效');
            throw new Error('数据格式无效');
          }
        } catch (fileErr) {
          console.log('用户数据目录中的坐标文件不存在或无法访问');
          throw fileErr;
        }
      } catch (userDataErr) {
        console.error('从USER_DATA_PATH读取失败', userDataErr);
        
        // 如果从USER_DATA_PATH读取失败，尝试从项目包内读取
        try {
          console.log('尝试从项目包内读取:', dataPath);
          
          // 检查文件是否存在
          try {
            fs.accessSync(dataPath);
            console.log('项目包内的坐标文件存在');
            
            const fileContent = fs.readFileSync(dataPath, 'utf-8');
            const data = JSON.parse(fileContent);
            
            // 验证数据有效性
            if (data && data.coordinates && Array.isArray(data.coordinates)) {
              // 更新缓存
              wx.setStorageSync('savedCoordinates', JSON.stringify(data));
              console.log('应用启动时从项目包内成功加载了', data.coordinates.length, '个坐标点');
              
              // 尝试将数据保存到USER_DATA_PATH，以便后续使用
              this.saveToUserDataPath(data, dataPath);
              return true;
            } else {
              console.error('从项目包内读取的数据格式无效');
              throw new Error('数据格式无效');
            }
          } catch (fileErr) {
            console.log('项目包内的坐标文件不存在或无法访问');
            throw fileErr;
          }
        } catch (packageErr) {
          console.error('从项目包内读取失败', packageErr);
          
          // 尝试从缓存读取
          try {
            console.log('尝试从缓存读取');
            const cachedData = wx.getStorageSync('savedCoordinates');
            if (cachedData) {
              const data = JSON.parse(cachedData);
              if (data && data.coordinates && Array.isArray(data.coordinates)) {
                console.log('应用启动时从缓存成功加载了', data.coordinates.length, '个坐标点');
                
                // 尝试将缓存数据保存到USER_DATA_PATH，以便后续使用
                this.saveToUserDataPath(data, dataPath);
                return true;
              } else {
                console.error('缓存中的数据格式无效');
              }
            } else {
              console.log('缓存中没有坐标数据');
            }
          } catch (cacheErr) {
            console.error('从缓存读取失败', cacheErr);
          }
        }
      }
      
      // 如果所有方法都失败，创建一个默认的数据结构
      console.log('无法从任何来源加载坐标数据，使用默认数据结构');
      
      // 更新缓存
      wx.setStorageSync('savedCoordinates', JSON.stringify(this.globalData.defaultData));
      console.log('已将默认坐标数据保存到缓存');
      
      // 尝试将默认数据保存到USER_DATA_PATH
      this.saveToUserDataPath(this.globalData.defaultData, dataPath);
      
      return true;
    } catch (err) {
      console.error('初始化坐标数据失败', err);
      return false;
    }
  },

  // 保存数据到用户数据目录
  saveToUserDataPath: function(data, dataPath) {
    console.log('尝试将数据保存到用户数据目录');
    const fs = wx.getFileSystemManager();
    
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
}) 