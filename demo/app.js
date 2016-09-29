const WxSocketIO = require('./lib/wxsocket.io.js')

App({
  onLaunch: function() {
  },
  onShow: function() {
    const that = this
    const socket = this.globalData.socket = new WxSocketIO()
    socket.connect('ws://chat.socket.io')
    .then(_ => {
      console.info('App::WxSocketIO::onOpen')
      console.info('App:onShow:', that.globalData)
    })
    .catch(err => {
      console.error('App::WxSocketIO::onError', err)
    })
  },
  onHide: function() {
    console.info('App:onHide')
  },
  getSocket: function() {
    return this.globalData.socket
  },
  globalData: {
    socket: null,
  }
})
