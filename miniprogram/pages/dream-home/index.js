const {
  decorateDream,
  getStats,
  readDreams,
} = require('../../utils/dreams')

Page({
  data: {
    latestDream: null,
    recentDreams: [],
    stats: { total: 0, tagged: 0, streak: 0 },
  },

  async onShow() {
    await this.loadDreams()
  },

  async onPullDownRefresh() {
    await this.loadDreams()
    wx.stopPullDownRefresh()
  },

  onShareAppMessage() {
    return {
      title: 'Floydream｜把昨夜的梦温柔收好',
      path: '/pages/dream-home/index',
    }
  },

  async loadDreams() {
    const dreams = (await readDreams()).map(decorateDream)

    this.setData({
      latestDream: dreams[0] || null,
      recentDreams: dreams.slice(0, 5),
      stats: getStats(dreams),
    })
  },

  goCreate() {
    wx.navigateTo({
      url: '/pages/dream-editor/index',
    })
  },

  goDetail(event) {
    const { id } = event.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/dream-detail/index?id=${id}`,
    })
  },

  goList(event) {
    const type = event.currentTarget.dataset.type || 'all'
    wx.navigateTo({
      url: `/pages/dream-list/index?type=${type}`,
    })
  },
})
