// guide.js
Page({
  data: {
    guideContent: '',
    formattedContent: '',
    loading: true,
    error: ''
  },

  onLoad: function() {
    console.log('使用说明页面加载');
    this.loadGuideContent();
  },

  // 加载使用说明内容
  loadGuideContent: function() {
    const that = this;
    
    // 直接使用HTML格式的内容，调整字体大小和颜色
    const htmlContent = `
<div style="padding: 15rpx;">
  <p style="font-size: 18rpx; line-height: 1.6; margin: 16rpx 0; color: #666;">本应用用于提醒用户接近超速摄像头位置，帮助用户安全驾驶，避免超速。目前摄像头位置适用于奥克维尔地区。</p>
  <h2 style="font-size: 20rpx; font-weight: bold; margin: 20rpx 0 10rpx; color: #555; border-bottom: 1px solid #eee; padding-bottom: 8rpx;">主要功能</h2>
  
  <h3 style="font-size: 19rpx; font-weight: bold; margin: 16rpx 0 8rpx; color: #555;">1. 实时位置</h3>
  <ul style="padding-left: 0; margin: 12rpx 0; list-style-type: none;">
    <li style="font-size: 18rpx; line-height: 1.6; margin: 10rpx 0; color: #666;"><strong style="color: #555;">位置监控</strong>：显示您当前的位置信息，包括经纬度、精确度、速度等。</li>
    <li style="font-size: 18rpx; line-height: 1.6; margin: 10rpx 0; color: #666;"><strong style="color: #555;">位置监控</strong>：开启后，当您接近保存的坐标点（超速摄像头位置）时，会发出警报提醒。</li>
    <li style="font-size: 18rpx; line-height: 1.6; margin: 10rpx 0; color: #666;"><strong style="color: #555;">警报半径</strong>：默认为50米，当您进入这个范围内时，会触发警报。</li>
    <li style="font-size: 18rpx; line-height: 1.6; margin: 10rpx 0; color: #666;"><strong style="color: #555;">警报时间</strong>：默认为10秒。</li>
    <li style="font-size: 18rpx; line-height: 1.6; margin: 10rpx 0; color: #666;"><strong style="color: #555;">保存位置</strong>：点击"保存此位置"按钮，可以将当前位置保存到坐标列表中。</li>
  </ul>
  
  <h3 style="font-size: 19rpx; font-weight: bold; margin: 16rpx 0 8rpx; color: #555;">2. 保存的坐标</h3>
  <ul style="padding-left: 0; margin: 12rpx 0; list-style-type: none;">
    <li style="font-size: 18rpx; line-height: 1.6; margin: 10rpx 0; color: #666;"><strong style="color: #555;">查看坐标</strong>：查看所有保存的坐标点信息。</li>
    <li style="font-size: 18rpx; line-height: 1.6; margin: 10rpx 0; color: #666;"><strong style="color: #555;">地图查看</strong>：点击地图图标，可以在地图中查看坐标位置。</li>
    <li style="font-size: 18rpx; line-height: 1.6; margin: 10rpx 0; color: #666;"><strong style="color: #555;">添加位置</strong>：可以添加当前位置到坐标列表。</li>
    <li style="font-size: 18rpx; line-height: 1.6; margin: 10rpx 0; color: #666;"><strong style="color: #555;">清除缓存</strong>：清除所有保存的坐标数据。</li>
  </ul>
  
  <h2 style="font-size: 20rpx; font-weight: bold; margin: 20rpx 0 10rpx; color: #555; border-bottom: 1px solid #eee; padding-bottom: 8rpx;">使用提示</h2>
  <ul style="padding-left: 0; margin: 12rpx 0; list-style-type: none;">
    <li style="font-size: 18rpx; line-height: 1.6; margin: 10rpx 0; color: #666;"><strong style="color: #555;">首次使用</strong>：请允许应用获取您的位置信息。</li>
    <li style="font-size: 18rpx; line-height: 1.6; margin: 10rpx 0; color: #666;"><strong style="color: #555;">前台运行</strong>：由于微信小程序的限制，本应用需要保持在前台才能正常监控位置并发出警报。</li>
    <li style="font-size: 18rpx; line-height: 1.6; margin: 10rpx 0; color: #666;"><strong style="color: #555;">后台限制</strong>：当应用进入后台时，位置监控功能会受到限制，最多只能在后台运行约5分钟。</li>
    <li style="font-size: 18rpx; line-height: 1.6; margin: 10rpx 0; color: #666;"><strong style="color: #555;">省电模式</strong>：如果您的设备开启了省电模式，可能会影响位置更新频率。</li>
    <li style="font-size: 18rpx; line-height: 1.6; margin: 10rpx 0; color: #666;"><strong style="color: #555;">安全驾驶</strong>：本应用仅作为辅助工具，请始终遵守交通规则，安全驾驶。</li>
  </ul>
  
  <h2 style="font-size: 20rpx; font-weight: bold; margin: 20rpx 0 10rpx; color: #555; border-bottom: 1px solid #eee; padding-bottom: 8rpx;">常见问题</h2>
  
  <h3 style="font-size: 19rpx; font-weight: bold; margin: 16rpx 0 8rpx; color: #555;">为什么应用无法获取我的位置？</h3>
  <p style="font-size: 18rpx; line-height: 1.6; margin: 10rpx 0; color: #666;">请确保您已经授权应用获取位置信息，并且设备的GPS功能已开启。</p>
  
  <h3 style="font-size: 19rpx; font-weight: bold; margin: 16rpx 0 8rpx; color: #555;">为什么警报没有声音？</h3>
  <p style="font-size: 18rpx; line-height: 1.6; margin: 10rpx 0; color: #666;">请确保您的设备没有静音，并且应用的通知权限已开启。</p>
  
  <h3 style="font-size: 19rpx; font-weight: bold; margin: 16rpx 0 8rpx; color: #555;">为什么切换到其他应用后不再提醒？</h3>
  <p style="font-size: 18rpx; line-height: 1.6; margin: 10rpx 0; color: #666;">由于微信小程序的限制，应用在后台运行时无法持续监控位置。为了获得最佳效果，请保持应用在前台运行。</p>
  
  <h3 style="font-size: 19rpx; font-weight: bold; margin: 16rpx 0 8rpx; color: #555;">坐标数据会保存在哪里？</h3>
  <p style="font-size: 18rpx; line-height: 1.6; margin: 10rpx 0; color: #666;">坐标数据会保存在设备本地，不会上传到服务器。</p>
  
  <h3 style="font-size: 19rpx; font-weight: bold; margin: 16rpx 0 8rpx; color: #555;">如何添加新的坐标点？</h3>
  <p style="font-size: 18rpx; line-height: 1.6; margin: 10rpx 0; color: #666;">在"实时位置"页面，点击"保存此位置"按钮，输入位置名称即可保存。</p>
  
  <h3 style="font-size: 19rpx; font-weight: bold; margin: 16rpx 0 8rpx; color: #555;">如何删除坐标点？</h3>
  <p style="font-size: 18rpx; line-height: 1.6; margin: 10rpx 0; color: #666;">目前不支持删除单个坐标点，但您可以使用"清除缓存"功能清除所有坐标数据。</p>
  
  <h2 style="font-size: 20rpx; font-weight: bold; margin: 20rpx 0 10rpx; color: #555; border-bottom: 1px solid #eee; padding-bottom: 8rpx;">联系作者</h2>
  <p style="font-size: 18rpx; line-height: 1.6; margin: 10rpx 0; color: #666;">如有任何问题或建议，请联系Peter：</p>
  <ul style="padding-left: 0; margin: 12rpx 0; list-style-type: none;">
    <li style="font-size: 18rpx; line-height: 1.6; margin: 10rpx 0; color: #666;">邮箱：dev.stbei@gmail.com</li>
  </ul>
</div>
    `;

    // 更新UI
    that.setData({
      formattedContent: htmlContent,
      loading: false
    });
    
    console.log('成功加载使用说明内容');
  }
}) 