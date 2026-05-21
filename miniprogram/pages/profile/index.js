const {
  decorateDream,
  getStats,
  readDreams,
} = require('../../utils/dreams')

Page({
  data: {
    stats: { total: 0, tagged: 0, streak: 0 },
    latestDream: null,
  },

  async onShow() {
    const dreams = (await readDreams()).map(decorateDream)

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
    if (!this.data.latestDream) return

    wx.navigateTo({
      url: `/pages/dream-detail/index?id=${this.data.latestDream.id}`,
    })
  },

  goPrivacy() {
    wx.navigateTo({
      url: '/pages/privacy/index',
    })
  },
})
