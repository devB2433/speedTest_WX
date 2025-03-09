Component({
  /**
   * 组件的属性列表
   */
  properties: {
    text: {
      type: String,
      value: '按钮'
    },
    type: {
      type: String,
      value: 'default' // default, primary, warn
    },
    size: {
      type: String,
      value: 'default' // default, mini
    },
    disabled: {
      type: Boolean,
      value: false
    },
    loading: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    handleTap() {
      if (this.data.disabled || this.data.loading) return;
      this.triggerEvent('tap');
    }
  }
}) 