const io = require('./wxsocket.io/index.js')

// app.js
App({
  onLaunch: function() {
    // create a new socket object
    const socket = io("wss://chat.matong.io/")
    this.globalData.socket = socket
  },

  globalData:{
    userInfo: null,
  },
})
