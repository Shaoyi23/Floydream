const {
  decorateDream,
  getDreamById,
} = require('../../utils/dreams')

Page({
  data: {
    id: '',
    dream: null,
    isLoading: true,
    loadFailed: false,
  },

  onLoad(options) {
    this.setData({ id: options.id || '' })
  },

  async onShow() {
    await this.loadDream()
  },

  onShareAppMessage() {
    const dream = this.data.dream
    return {
      title: dream ? `${dream.title || '我的梦境记录'}｜Floydream` : 'Floydream 梦境记录',
      path: `/pages/dream-detail/index?id=${this.data.id}`,
    }
  },

  async loadDream() {
    this.setData({
      isLoading: true,
      loadFailed: false,
    })

    try {
      const dream = decorateDream(await getDreamById(this.data.id))
      this.setData({
        dream,
        isLoading: false,
        loadFailed: !dream,
      })
    } catch (_) {
      this.setData({
        dream: null,
        isLoading: false,
        loadFailed: true,
      })
    }
  },

  goCreate() {
    wx.navigateTo({
      url: '/pages/dream-editor/index',
    })
  },
})
