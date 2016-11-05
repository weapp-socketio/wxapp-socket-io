import Emitter from 'component-emitter'
import bind from 'component-bind'
import Backoff from 'backo2'
import indexOf from 'indexof'
import on from './on'
import Engine from './engine'
import { encoder, decoder } from './parser'
import Socket from './socket'

const has = Object.prototype.hasOwnProperty

Emitter(Manager.prototype)

export default Manager

function Manager(uri, opts) {
  if (!(this instanceof Manager)) return new Manager(uri, opts)

  opts.path = opts.path || 'socket.io'
  this.nsps = {}
  this.subs = []
  this.opts = opts
  this.uri = uri
  this.readyState = 'closed'
  this.connected = false
  this.reconnection(opts.reconnection !== false)
  this.reconnectionAttempts(opts.reconnectionAttempts || Infinity)
  this.reconnectionDelay(opts.reconnectionDelay || 1000)
  this.reconnectionDelayMax(opts.reconnectionDelayMax || 5000)
  this.randomizationFactor(opts.randomizationFactor || 0.5)
  this.backoff = new Backoff({
    min: this.reconnectionDelay(),
    max: this.reconnectionDelayMax(),
    jitter: this.randomizationFactor(),
  })
  this.timeout(null == opts.timeout ? 20000 : opts.timeout)
  this.encoder = encoder
  this.decoder = decoder
  this.connecting = []
  this.autoConnect = opts.autoConnect !== false
  if (this.autoConnect) this.open()
}

Manager.prototype.open =
Manager.prototype.connect = function(fn) {
  if (~this.readyState.indexOf('open')) return this

  this.engine = new Engine(this.uri, this.opts)

  this.readyState = 'opening'

  const socket = this.engine

  this.subs.push(on(socket, 'open', () => {
    this.onopen()
    fn && fn()
  }))

  this.subs.push(on(socket, 'error', data => {
    this.cleanup()
    this.readyState = 'closed'
    this.emitAll('connect_error', data)
    if (fn) {
      const error = new Error('Connect error')
      error.data = data
      fn(error)
    } else {
      this.maybeReconnectOnOpen()
    }
  }))

  socket.connect()
  return this
}

Manager.prototype.onopen = function() {
  this.cleanup()

  this.readyState = 'open'
  this.emit('open')

  const socket = this.engine
  this.subs.push(on(socket, 'data', bind(this, 'ondata')))
  this.subs.push(on(socket, 'ping', bind(this, 'onping')))
  this.subs.push(on(socket, 'pong', bind(this, 'onpong')))
  this.subs.push(on(socket, 'error', bind(this, 'onerror')))
  this.subs.push(on(socket, 'close', bind(this, 'onclose')))
  // this.subs.push(on(this.decoder, 'decoded', bind(this, 'ondecoded')))
}

Manager.prototype.onclose = function(reason) {
  this.cleanup()
  this.readyState = 'closed'
  this.emit('close', reason)
  if (this._reconnection && !this.skipReconnect) this.reconnect()
}

Manager.prototype.onerror = function(reason) {
  this.emitAll('error')
}

Manager.prototype.onping = function() {
  this.lastPing = new Date
  this.emitAll('ping')
}

Manager.prototype.onpong = function() {
  this.emitAll('pong', new Date - this.lastPing)
}

Manager.prototype.ondata = function(data) {
  this.decoder(data, decoding => {
    this.emit('packet', decoding)
  })
}

Manager.prototype.packet = function(packet) {
  this.encoder(packet, encodedPackets => {
    for (let i = 0; i < encodedPackets.length; i++) {
      this.engine.write(encodedPackets[i], packet.options)
    }
  })
}

Manager.prototype.socket = function(nsp) {
  let socket = this.nsps[nsp]
  if (!socket) {
    socket = new Socket(this, nsp)
    this.nsps[nsp] = socket
  }
  return socket
}

Manager.prototype.cleanup = function() {
  let sub
  while (sub = this.subs.shift()) sub.destroy()

  this.packetBuffer = []
  this.lastPing = null
}

Manager.prototype.emitAll = function(...args) {
  this.emit.apply(this, args)
  for (const nsp in this.nsps) {
    if (has.call(this.nsps, nsp)) {
      this.nsps[nsp].emit.apply(this.nsps[nsp], args)
    }
  }
}

Manager.prototype.reconnect = function() {
  if (this.reconnecting || this.skipReconnect) return this

  if (this.backoff.attempts >= this._reconnectionAttempts) {
    this.backoff.reset()
    this.emitAll('reconnect_failed')
    this.reconnecting = false
  } else {
    const delay = this.backoff.duration()
    this.reconnecting = true
    const timer = setTimeout(() => {
      this.emitAll('reconnect_attempt', this.backoff.attempts)
      this.emitAll('reconnecting', this.backoff.attempts)

      if (this.skipReconnect) return

      this.open(err => {
        if (err) {
          this.reconnecting = false
          this.reconnect()
          this.emitAll('reconnect_error', err.data)
        } else {
          this.onreconnect()
        }
      })
    }, delay)

    this.subs.push({
      destroy: () => {
        clearTimeout(timer)
      },
    })
  }
}

Manager.prototype.onreconnect = function() {
  const attempt = this.backoff.attempts
  this.reconnecting = false
  this.backoff.reset()
  this.updateSocketIds()
  this.emitAll('reconnect', attempt)
}

/**
 * Update `socket.id` of all sockets
 *
 * @api private
 */

Manager.prototype.updateSocketIds = function() {
  for (const nsp in this.nsps) {
    if (has.call(this.nsps, nsp)) {
      this.nsps[nsp].id = this.engine.id
    }
  }
}

Manager.prototype.destroy = function(socket) {
  const index = indexOf(this.connecting, socket)
  if (~index) this.connecting.splice(index, 1)
  if (this.connecting.length) return

  this.close()
}

Manager.prototype.close =
Manager.prototype.disconnect = function() {
  this.skipReconnect = true
  this.reconnecting = false
  if ('opening' == this.readyState) {
    // `onclose` will not fire because
    // an open event never happened
    this.cleanup()
  }
  this.readyState = 'closed'
  if (this.engine) this.engine.close()
}

/**
 * Sets the `reconnection` config.
 *
 * @param {Boolean} true/false if it should automatically reconnect
 * @return {Manager} self or value
 * @api public
 */
Manager.prototype.reconnection = function(v) {
  if (!arguments.length) return this._reconnection
  this._reconnection = !!v
  return this
}

/**
 * Sets the reconnection attempts config.
 *
 * @param {Number} max reconnection attempts before giving up
 * @return {Manager} self or value
 * @api public
 */
Manager.prototype.reconnectionAttempts = function(v) {
  if (!arguments.length) return this._reconnectionAttempts
  this._reconnectionAttempts = v
  return this
}

/**
 * Sets the delay between reconnections.
 *
 * @param {Number} delay
 * @return {Manager} self or value
 * @api public
 */
Manager.prototype.reconnectionDelay = function(v) {
  if (!arguments.length) return this._reconnectionDelay
  this._reconnectionDelay = v
  this.backoff && this.backoff.setMin(v)
  return this
}

Manager.prototype.randomizationFactor = function(v) {
  if (!arguments.length) return this._randomizationFactor
  this._randomizationFactor = v
  this.backoff && this.backoff.setJitter(v)
  return this
}

/**
 * Sets the maximum delay between reconnections.
 *
 * @param {Number} delay
 * @return {Manager} self or value
 * @api public
 */
Manager.prototype.reconnectionDelayMax = function(v) {
  if (!arguments.length) return this._reconnectionDelayMax
  this._reconnectionDelayMax = v
  this.backoff && this.backoff.setMax(v)
  return this
}

/**
 * Sets the connection timeout. `false` to disable
 *
 * @return {Manager} self or value
 * @api public
 */
Manager.prototype.timeout = function(v) {
  if (!arguments.length) return this._timeout
  this._timeout = v
  return this
}

/**
 * Starts trying to reconnect if reconnection is enabled and we have not
 * started reconnecting yet
 *
 * @api private
 */
Manager.prototype.maybeReconnectOnOpen = function() {
  // Only try to reconnect if it's the first time we're connecting
  if (!this.reconnecting && this._reconnection && this.backoff.attempts === 0) {
    // keeps reconnection from firing twice for the same reconnection loop
    this.reconnect()
  }
}
