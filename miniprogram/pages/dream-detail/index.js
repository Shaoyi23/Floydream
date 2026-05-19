const {
  decorateDream,
  getDreamById,
  upsertDream,
} = require('../../utils/dreams')
const { interpretDream } = require('../../utils/interpret')

Page({
  data: {
    id: '',
    dream: null,
    isRefreshing: false,
  },

  onLoad(options) {
    this.setData({
      id: options.id || '',
    })
  },

  onShow() {
    this.loadDream()
  },

  onShareAppMessage() {
    const dream = this.data.dream

    return {
      title: dream ? `${dream.title || '我的梦境记录'}｜Floydream` : 'Floydream 梦境记录',
      path: `/pages/dream-detail/index?id=${this.data.id}`,
    }
  },

  loadDream() {
    const dream = decorateDream(getDreamById(this.data.id))

    this.setData({
      dream,
    })
  },

  async refreshInterpretation() {
    const dream = this.data.dream

    if (!dream || this.data.isRefreshing) {
      return
    }

    this.setData({ isRefreshing: true })
    wx.showLoading({
      title: '重新解读中',
      mask: true,
    })

    const analysis = await interpretDream(dream)
    upsertDream({
      ...dream,
      analysis,
      analyzedAt: Date.now(),
      status: 'done',
    })

    wx.hideLoading()
    this.setData({ isRefreshing: false })
    this.loadDream()
  },

  goCreate() {
    wx.navigateTo({
      url: '/pages/dream-editor/index',
    })
  },
})
