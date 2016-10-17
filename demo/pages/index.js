const app = getApp()

Page({
  data: {
    logs: []
  },
  onLoad: function(){
    this.socket = app.getSocket()
    this.bindBehavior(this.socket)
  },
  onShow: () => {
  },
  onUnload: function(){
  },
  addItem: function(str) {
    const logs = this.data.logs.slice(0)
    logs.push(str)
    this.setData({
      logs: logs
    })

  },
  bindBehavior: function(ws){
    ws.on('typing', obj => {
      this.addItem(`[${obj.username}] is typing`)
    })
    ws.on('user joined', obj => {
      this.addItem(`[${obj.username}] Joined, Online: ${obj.numUsers}`)
    })
    ws.on('stop typing', obj => {
      this.addItem(`[${obj.username}] stop typing`)
    })
    ws.on('new message', obj => {
      this.addItem(`>>> ${obj.username}: ${obj.message}`)
    })
    ws.on('user left', obj => {
      this.addItem(`[${obj.username}] Left, Online: ${obj.numUsers}`)
    })
  }
})
