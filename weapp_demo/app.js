import io from './wxsocket.io/index'

console.log('io ---> ' ,io)

// app.js
App({
  onLaunch: function() {
    // create a new socket object
    const socket = io("ws://chat.socket.io/")
    this.globalData.socket = socket
  },

  globalData:{
    userInfo: null,
  },
})
