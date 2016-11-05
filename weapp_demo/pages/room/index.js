// index.js
// 获取应用实例
const app = getApp()
Page({
  data: {
    scrollTop: 100,
    messages: '',
    currentMsg: ''
  },

  typeMessageEvent: function(e) {
    console.log('typeMessageEvent => ', e)
    this.setData({
      currentMsg: e.detail.value
    })
  },

  sendMsg: function(e) {
    const currentMsg = this.data.currentMsg

    if (!currentMsg) {
      return
    }

    this.setData({
      messages: this.data.messages + '\n' + app.globalData.nickname + ': ' + currentMsg
    })

    this.setData({
      currentMsg: ''
    })

    app.globalData.socket.emit('new message', currentMsg)
  },

  onLoad: function() {
    const that = this

    this.onSocketEvent()
  },

  onSocketEvent: function() {
    const socket = app.globalData.socket
    const self = this
    socket.on('new message', function(msg) {
      self.setData({
        messages: self.data.messages + '\n' + msg.username + ': ' + msg.message
      })

      console.log('messages => ', self.data.messages)
    })

    socket.on('user joined', function(msg) {
      wx.showToast({
        title: msg.username + ' 加入了房间',
        icon: 'success',
        duration: 2000
      })
    })

    socket.on('user left', function(msg) {
      wx.showToast({
        title: msg.username + ' 离开了房间',
        icon: 'loading',
        duration: 2000
      })
    })
  }
})
