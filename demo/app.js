const WxSocketIO = require('./lib/wxsocket.io.js')

App({
  onLaunch: function() {
  },
  onShow: function() {
    const socket = this.globalData.socket = new WxSocketIO()
    socket.connect('ws://chat.socket.io', {
      path: 'socket.io',
      with: 'mia&una',
    })
    .then(_ => {
      console.info('App::WxSocketIO::onOpen')
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
