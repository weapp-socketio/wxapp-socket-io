import Emitter from 'component-emitter'
import on from './on'
import parsejson from './parsejson'
import bind from 'component-bind'
import parseuri from 'parseuri'

export default Engine

const GlobalEmitter = Emitter({ hasEmitte: false })

Emitter(Engine.prototype)

const packets = {
  open:     0,    // non-ws
  close:    1,    // non-ws
  ping:     2,
  pong:     3,
  message:  4,
  upgrade:  5,
  noop:     6,
}

const packetslist = Object.keys(packets)

function Engine(uri, opts) {
  if (!(this instanceof Engine)) return new Engine(uri, opts)

  this.subs = []
  uri = parseuri(uri)
  this.protocol = uri.protocol
  this.host = uri.host
  this.query = uri.query
  this.port = uri.port
  this.opts = this.opts || {}
  this.path = opts.path.replace(/\/$/, '')
  this.connected = false
  this.lastPing = null
  this.pingInterval = 20000
  // init bind with GlobalEmitter
  this.bindEvents()
}

Engine.prototype.connect = function() {
  if (!GlobalEmitter.hasEmitte) Engine.subEvents()
  const url = `${this.protocol}://${this.host}:${this.port}/${this.path}/?${this.query ? `${this.query}&` : ''}EIO=3&transport=websocket`

  wx.connectSocket({ url })
}

Engine.prototype.close = function() {
  wx.closeSocket()
}

Engine.prototype.onopen = function() {
  this.emit('open')
}

Engine.prototype.onclose = function(reason) {
  // clean all bind with GlobalEmitter
  this.destroy()
  this.emit('close', reason)
}

Engine.prototype.onerror = function(reason) {
  this.emit('error')
  // 如果 wx.connectSocket 还没回调 wx.onSocketOpen，而先调用 wx.closeSocket，那么就做不到关闭 WebSocket 的目的。
  wx.closeSocket()
}

Engine.prototype.onpacket = function(packet) {
  switch (packet.type) {
  case 'open':
    this.onHandshake(parsejson(packet.data))
    break
  case 'pong':
    this.setPing()
    this.emit('pong')
    break
  case 'error': {
    const error = new Error('server error')
    error.code = packet.data
    this.onerror(error)
    break
  }
  case 'message':
    this.emit('data', packet.data)
    this.emit('message', packet.data)
    break
  }
}

Engine.prototype.onHandshake = function(data) {
  this.id = data.sid
  this.pingInterval = data.pingInterval
  this.pingTimeout = data.pingTimeout
  this.setPing()
}

Engine.prototype.setPing = function() {
  clearTimeout(this.pingIntervalTimer)
  this.pingIntervalTimer = setTimeout(() => {
    this.ping()
  }, this.pingInterval)
}

Engine.prototype.ping = function() {
  this.emit('ping')
  this._send(`${packets.ping}probe`)
}

Engine.prototype.write =
Engine.prototype.send = function(packet) {
  this._send([packets.message, packet].join(''))
}

Engine.prototype._send = function(data) {
  wx.sendSocketMessage({ data })
}
Engine.subEvents = function() {
  wx.onSocketOpen(() => {
    GlobalEmitter.emit('open')
  })
  wx.onSocketClose(reason => {
    GlobalEmitter.emit('close', reason)
  })
  wx.onSocketError(reason => {
    GlobalEmitter.emit('error', reason)
  })
  wx.onSocketMessage(resp => {
    GlobalEmitter.emit('packet', decodePacket(resp.data))
  })
  GlobalEmitter.hasEmitte = true
}

Engine.prototype.bindEvents = function() {
  this.subs.push(on(GlobalEmitter, 'open', bind(this, 'onopen')))
  this.subs.push(on(GlobalEmitter, 'close', bind(this, 'onclose')))
  this.subs.push(on(GlobalEmitter, 'error', bind(this, 'onerror')))
  this.subs.push(on(GlobalEmitter, 'packet', bind(this, 'onpacket')))
}

Engine.prototype.destroy = function() {
  let sub
  while (sub = this.subs.shift()) { sub.destroy() }

  clearTimeout(this.pingIntervalTimer)
  this.readyState = 'closed'
  this.id = null
  this.writeBuffer = []
  this.prevBufferLen = 0
}

function decodePacket(data) {
  const type = data.charAt(0)
  if (data.length > 1) {
    return {
      type: packetslist[type],
      data: data.substring(1),
    }
  }
  return { type: packetslist[type] }
}
