# weapp-socket-io

微信小程序的SocketIO实现，基于[CFETeam的实现](https://github.com/CFETeam/weapp-demo-websocket/blob/master/app/lib/wxsocket.io.js)基础上完善

# DEMO

[项目附了一个微信小程序的Demo项目](https://github.com/fanweixiao/wxapp-socket-io/tree/master/demo)演示了[接入Socket.io官方的演示聊天室](http://socket.io/demos/chat/)，在运行项目Demo时方便测试。

关于在微信小程序中如何使用Socket.io可以[参考腾讯云前端团队的文档](https://github.com/CFETeam/weapp-demo-websocket/blob/master/README.md)

# How to use

```javascript
const opts = {}
const socket = this.globalData.socket = new WxSocketIO()
socket.connect('ws://chat.socket.io', opts)
.then(_ => {
  console.info('App::WxSocketIO::onOpen')
  console.info('App:onShow:', that.globalData)
})
.catch(err => {
  console.error('App::WxSocketIO::onError', err)
})
```

其中`socket.connect(ws_url, opts)`中，`opts`目前可选值是`path`，用来指定使用socket.io时默认的path，比如设置opts为下列值：

```javascript
{
  query: 'fanweixiao',
  with: 'mia&una',
}
```
将会设置`Socket.io`的url为`ws://chat.socket.io/fanweixiao/?EIO=3&transport=websocket&with=mia%26una`

# TODO

+ 重连机制
+ Room的支持
+ Namespace的支持
