const {
  decorateDream,
  readDreams,
} = require('../../utils/dreams')

const PAGE_META = {
  all: {
    title: '全部梦境',
    desc: '按时间顺序回看你保存过的每一场梦。',
  },
  tagged: {
    title: '关键词梦境',
    desc: '这些记录已经补充了关键词，后续整理会更轻松。',
  },
  recent: {
    title: '记录日历',
    desc: '按记录时间回看最近留下来的梦境片段。',
  },
}

Page({
  data: {
    type: 'all',
    pageTitle: '全部梦境',
    pageDesc: '',
    dreams: [],
    isLoading: true,
  },

  onLoad(options) {
    const type = options.type || 'all'
    const meta = PAGE_META[type] || PAGE_META.all
    wx.setNavigationBarTitle({
      title: meta.title,
    })
    this.setData({
      type,
      pageTitle: meta.title,
      pageDesc: meta.desc,
    })
  },

  async onShow() {
    await this.loadDreams()
  },

  async onPullDownRefresh() {
    await this.loadDreams()
    wx.stopPullDownRefresh()
  },

  async loadDreams() {
    this.setData({ isLoading: true })

    const dreams = (await readDreams()).map(decorateDream)
    const filtered = this.filterDreams(dreams)

    this.setData({
      dreams: filtered,
      isLoading: false,
    })
  },

  filterDreams(dreams) {
    if (this.data.type === 'tagged') {
      return dreams.filter((dream) => dream.tags.length)
    }
    return dreams
  },

  goDetail(event) {
    const { id } = event.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/dream-detail/index?id=${id}`,
    })
  },

  goCreate() {
    wx.navigateTo({
      url: '/pages/dream-editor/index',
    })
  },
})
