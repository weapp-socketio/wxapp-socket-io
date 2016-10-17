var io = require('../build/index.js')
//app.js
console.log('------: ', this)
App({
  onLaunch: function () {
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
  },
  getUserInfo:function(cb){
    var that = this
    if(this.globalData.userInfo){
      typeof cb == "function" && cb(this.globalData.userInfo)
    }else{
      //调用登录接口
      wx.login({
        success: function () {
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo
              typeof cb == "function" && cb(that.globalData.userInfo)
            }
          })
        }
      })
    }
  },
  globalData:{
    userInfo:null
  },
  getSocket: function() {
    const news = io('ws://localhost:9999/news')
    console.log('news: ', news)
    news.on('news', function(data) {
      console.log('======news data: ', data)
      news.emit('old', '1234abc')
    })

    const chat = io('ws://localhost:9999/chat')
    console.log('chat: ', chat)
    chat.on('chat', function(data) {
      console.log('======chat data: ', data)
      chat.emit('comment', 'Hi server chat')
    })
    console.log('=========oned.')
    return null
  }
})
