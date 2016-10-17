import Emitter from 'component-emitter'
import on from './on.js'
import bind from 'component-bind'
import _debug from './debug'

const debug = _debug('app:socket:')

Emitter(Socket.prototype)

const parser = {
  CONNECT:      0,
  DISCONNECT:   1,
  EVENT:        2,
  ACK:          3,
  ERROR:        4,
  BINARY_EVENT: 5,
  BINARY_ACK:   6,
}

const events = {
  connect: 1,
  connect_error: 1,
  connect_timeout: 1,
  connecting: 1,
  disconnect: 1,
  error: 1,
  reconnect: 1,
  reconnect_attempt: 1,
  reconnect_failed: 1,
  reconnect_error: 1,
  reconnecting: 1,
  ping: 1,
  pong: 1,
}

const emit = Emitter.prototype.emit

export default Socket

function Socket(io, nsp) {
  this.io = io
  this.nsp = nsp
  this.id = 0  // sid
  this.connected = false
  this.disconnected = true
  this.receiveBuffer = []
  this.sendBuffer = []
  if (this.io.autoConnect) this.open()
}

Socket.prototype.subEvents = function() {
  if (this.subs) return

  const io = this.io
  this.subs = [
    on(io, 'open', bind(this, 'onopen')),
    on(io, 'packet', bind(this, 'onpacket')),
    on(io, 'close', bind(this, 'onclose')),
  ]
}

Socket.prototype.open =
Socket.prototype.connect = function() {
  debug('socket to open, connected -> ', this.connected)
  if (this.connected) return this
  this.subEvents()
  this.io.open() // ensure open
  if ('open' == this.io.readyState) this.onopen()
  return this
}

Socket.prototype.onopen = function() {
  debug('on open')
  if ('/' != this.nsp) this.packet({ type: parser.CONNECT })
}

Socket.prototype.onclose = function(reason) {
  debug('on close -> ', reason)
  this.connected = false
  this.disconnected = true
  delete this.id
  this.emit('disconnect', reason)
}

Socket.prototype.onpacket = function(packet) {
  if (packet.nsp != this.nsp) return

  switch (packet.type) {
  case parser.CONNECT:
    this.onconnect()
    break
  case parser.EVENT:
    this.onevent(packet)
    break
  case parser.DISCONNECT:
    this.disconnect()
    break
  case parser.ERROR:
    this.emit('error', packet.data)
    break
  }
}

Socket.prototype.onconnect = function() {
  debug('on connect')
  this.connected = true
  this.disconnected = false
  this.emit('connect')
  // this.emitBuffered()
}

Socket.prototype.onevent = function(packet) {
  const args = packet.data || []
  debug('emitting event -> ', packet)

  if (this.connected) {
    emit.apply(this, args)
  } else {
    this.receiveBuffer.push(args)
  }
}

Socket.prototype.close =
Socket.prototype.disconnect = function() {
  if (this.connected) {
    debug('performing disconnect ', this.nsp)
    this.packet({ type: parser.DISCONNECT })
  }

  this.destroy()

  if (this.connected) {
    this.onclose('io client disconnect')
  }
  return this
}

Socket.prototype.destroy = function() {
  if (this.subs) {
    for (let i = 0; i < this.subs.length; i++) {
      this.subs[i].destroy()
    }
    this.subs = null
  }
  this.io.destroy(this)
}

Socket.prototype.emit = function(...args) {
  if (events.hasOwnProperty(args[0])) {
    emit.apply(this, args)
    return this
  }

  const parserType = parser.EVENT
  // if (hasBin(args)) { parserType = parser.BINARY_EVENT; } // binary
  const packet = { type: parserType, data: args, options: {} }

  if (this.connected) {
    this.packet(packet)
  } else {
    this.sendBuffer.push(packet)
  }
  return this
}

Socket.prototype.packet = function(packet) {
  packet.nsp = this.nsp
  this.io.packet(packet)
}
