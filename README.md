# Community
[Slack](https://wxapp-socket-io.slack.com)

# weapp-socket-io

微信小程序的 Socket.io client 实现，**压缩之后体积为 16K**

> 为了让开发者已最低的成本上手，本类库封装了与 socket.io 一致的 API 供开发者调用。

# Demo
 使用 socket.io 官网的 chat demo server 实现的 小程序版 聊天室应用
 使用 “微信开发者工具” 将 `weapp_demo` 目录打开，运行调试即可

# Features
 目前已支持
 * Namespace
 * Singleton
 * Reconnect

# Build
`npm run build`

生产环境可使用 `NODE_ENV=production npm run build` 进行压缩编译

# How to use

### npm
`npm install wxapp-socket-io`

### manual

拷贝 dist 目录的 index.js 文件到你的项目目录，并 require

`const io = require('yourPath/build/index.js')`


为了
使用风格与 socket.io 完全一致

```javascript
const news = io('ws://localhost:9999/news')
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
```
# Collaborator

+ [gongzili](https://github.com/gongzili456)
+ [C.C.](https://github.com/fanweixiao)

# TODO
+ emit buffer
+ Binary support
+ Room 的支持
+ Smaller size
