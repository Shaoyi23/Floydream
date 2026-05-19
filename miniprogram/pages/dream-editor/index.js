const {
  createDream,
  parseTags,
  upsertDream,
} = require('../../utils/dreams')
const { interpretDream } = require('../../utils/interpret')

const SAMPLE_DREAM = {
  title: '一直上不去的电梯',
  mood: '紧张',
  content: '梦里我在一栋很高的楼里找电梯，门每次打开都不是我要去的楼层。后来电梯忽然开始快速上升，我很害怕，但门打开时却看到小时候住过的房间。',
  tagsInput: '电梯 童年 房间',
}

Page({
  data: {
    title: '',
    content: '',
    mood: '平静',
    tagsInput: '',
    needInterpretation: true,
    isSubmitting: false,
    moods: ['平静', '开心', '奇妙', '紧张', '害怕', '悲伤'],
  },

  onLoad(options) {
    if (options.mode === 'sample') {
      this.setData(SAMPLE_DREAM)
    }
  },

  onShareAppMessage() {
    return {
      title: '来 Floydream 记下一段梦吧',
      path: '/pages/dream-editor/index',
    }
  },

  handleInput(event) {
    const { field } = event.currentTarget.dataset
    this.setData({
      [field]: event.detail.value,
    })
  },

  selectMood(event) {
    this.setData({
      mood: event.currentTarget.dataset.mood,
    })
  },

  toggleInterpretation(event) {
    this.setData({
      needInterpretation: event.detail.value,
    })
  },

  async submitDream() {
    const {
      title,
      content,
      mood,
      tagsInput,
      needInterpretation,
      isSubmitting,
    } = this.data

    if (isSubmitting) {
      return
    }

    if (!content.trim()) {
      wx.showToast({
        title: '先写下一段梦境内容',
        icon: 'none',
      })
      return
    }

    this.setData({ isSubmitting: true })

    let dream = createDream({
      title: title.trim(),
      content: content.trim(),
      mood,
      tags: parseTags(tagsInput),
      status: needInterpretation ? 'analyzing' : 'draft',
    })

    dream = upsertDream(dream)

    try {
      if (needInterpretation) {
        wx.showLoading({
          title: '正在解读梦境',
          mask: true,
        })

        const analysis = await interpretDream(dream)
        dream = upsertDream({
          ...dream,
          analysis,
          analyzedAt: Date.now(),
          status: 'done',
        })
      }

      wx.hideLoading()
      wx.redirectTo({
        url: `/pages/dream-detail/index?id=${dream.id}`,
      })
    } catch (error) {
      wx.hideLoading()
      upsertDream({
        ...dream,
        status: 'draft',
      })
      wx.showToast({
        title: '保存成功，解读稍后再试',
        icon: 'none',
      })
      wx.redirectTo({
        url: `/pages/dream-detail/index?id=${dream.id}`,
      })
    } finally {
      this.setData({ isSubmitting: false })
    }
  },
})
