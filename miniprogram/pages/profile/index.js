const {
  decorateDream,
  getStats,
  readDreams,
} = require('../../utils/dreams')

Page({
  data: {
    stats: {
      total: 0,
      interpreted: 0,
      streak: 0,
    },
    latestDream: null,
  },

  onShow() {
    const dreams = readDreams().map(decorateDream)

    this.setData({
      stats: getStats(dreams),
      latestDream: dreams[0] || null,
    })
  },

  goCreate() {
    wx.navigateTo({
      url: '/pages/dream-editor/index',
    })
  },

  goLatestDream() {
    if (!this.data.latestDream) {
      return
    }

    wx.navigateTo({
      url: `/pages/dream-detail/index?id=${this.data.latestDream.id}`,
    })
  },
})
