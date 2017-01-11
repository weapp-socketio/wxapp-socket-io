(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = lookup;
	
	var _manager = __webpack_require__(2);
	
	var _manager2 = _interopRequireDefault(_manager);
	
	var _url = __webpack_require__(50);
	
	var _url2 = _interopRequireDefault(_url);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var cache = {};
	
	function lookup(uri, opts) {
	  if (!uri) {
	    throw new Error('uri is required.');
	  }
	
	  opts = opts || {};
	
	  var parsed = (0, _url2.default)(uri);
	
	  var source = parsed.source;
	  var id = parsed.id;
	  var path = parsed.path;
	  var sameNamespace = cache[id] && path in cache[id].nsps;
	
	  var newConnection = opts.forceNew || opts['force new connection'] || false === opts.multiplex || sameNamespace;
	
	  // return new socket or from cache
	  var io = void 0;
	  if (newConnection) {
	    io = (0, _manager2.default)(source, opts);
	  } else {
	    if (!cache[id]) {
	      cache[id] = (0, _manager2.default)(source, opts);
	    }
	    io = cache[id];
	  }
	  return io.socket(parsed.path);
	}
	
	exports.connect = lookup;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _componentEmitter = __webpack_require__(3);
	
	var _componentEmitter2 = _interopRequireDefault(_componentEmitter);
	
	var _componentBind = __webpack_require__(4);
	
	var _componentBind2 = _interopRequireDefault(_componentBind);
	
	var _backo = __webpack_require__(5);
	
	var _backo2 = _interopRequireDefault(_backo);
	
	var _indexof = __webpack_require__(6);
	
	var _indexof2 = _interopRequireDefault(_indexof);
	
	var _on = __webpack_require__(7);
	
	var _on2 = _interopRequireDefault(_on);
	
	var _engine = __webpack_require__(8);
	
	var _engine2 = _interopRequireDefault(_engine);
	
	var _parser = __webpack_require__(46);
	
	var _socket = __webpack_require__(49);
	
	var _socket2 = _interopRequireDefault(_socket);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var has = Object.prototype.hasOwnProperty;
	
	(0, _componentEmitter2.default)(Manager.prototype);
	
	exports.default = Manager;
	
	
	function Manager(uri, opts) {
	  if (!(this instanceof Manager)) return new Manager(uri, opts);
	
	  opts.path = opts.path || 'socket.io';
	  this.nsps = {};
	  this.subs = [];
	  this.opts = opts;
	  this.uri = uri;
	  this.readyState = 'closed';
	  this.connected = false;
	  this.reconnection(opts.reconnection !== false);
	  this.reconnectionAttempts(opts.reconnectionAttempts || Infinity);
	  this.reconnectionDelay(opts.reconnectionDelay || 1000);
	  this.reconnectionDelayMax(opts.reconnectionDelayMax || 5000);
	  this.randomizationFactor(opts.randomizationFactor || 0.5);
	  this.backoff = new _backo2.default({
	    min: this.reconnectionDelay(),
	    max: this.reconnectionDelayMax(),
	    jitter: this.randomizationFactor()
	  });
	  this.timeout(null == opts.timeout ? 20000 : opts.timeout);
	  this.encoder = _parser.encoder;
	  this.decoder = _parser.decoder;
	  this.connecting = [];
	  this.autoConnect = opts.autoConnect !== false;
	  if (this.autoConnect) this.open();
	}
	
	Manager.prototype.open = Manager.prototype.connect = function (fn) {
	  var _this = this;
	
	  if (~this.readyState.indexOf('open')) return this;
	
	  this.engine = new _engine2.default(this.uri, this.opts);
	
	  this.readyState = 'opening';
	
	  var socket = this.engine;
	
	  this.subs.push((0, _on2.default)(socket, 'open', function () {
	    _this.onopen();
	    fn && fn();
	  }));
	
	  this.subs.push((0, _on2.default)(socket, 'error', function (data) {
	    _this.cleanup();
	    _this.readyState = 'closed';
	    _this.emitAll('connect_error', data);
	    if (fn) {
	      var error = new Error('Connect error');
	      error.data = data;
	      fn(error);
	    } else {
	      _this.maybeReconnectOnOpen();
	    }
	  }));
	
	  socket.connect();
	  return this;
	};
	
	Manager.prototype.onopen = function () {
	  this.cleanup();
	
	  this.readyState = 'open';
	  this.emit('open');
	
	  var socket = this.engine;
	  this.subs.push((0, _on2.default)(socket, 'data', (0, _componentBind2.default)(this, 'ondata')));
	  this.subs.push((0, _on2.default)(socket, 'ping', (0, _componentBind2.default)(this, 'onping')));
	  this.subs.push((0, _on2.default)(socket, 'pong', (0, _componentBind2.default)(this, 'onpong')));
	  this.subs.push((0, _on2.default)(socket, 'error', (0, _componentBind2.default)(this, 'onerror')));
	  this.subs.push((0, _on2.default)(socket, 'close', (0, _componentBind2.default)(this, 'onclose')));
	  // this.subs.push(on(this.decoder, 'decoded', bind(this, 'ondecoded')))
	};
	
	Manager.prototype.onclose = function (reason) {
	  this.cleanup();
	  this.readyState = 'closed';
	  this.emit('close', reason);
	  if (this._reconnection && !this.skipReconnect) this.reconnect();
	};
	
	Manager.prototype.onerror = function (reason) {
	  this.emitAll('error');
	};
	
	Manager.prototype.onping = function () {
	  this.lastPing = new Date();
	  this.emitAll('ping');
	};
	
	Manager.prototype.onpong = function () {
	  this.emitAll('pong', new Date() - this.lastPing);
	};
	
	Manager.prototype.ondata = function (data) {
	  var _this2 = this;
	
	  this.decoder(data, function (decoding) {
	    _this2.emit('packet', decoding);
	  });
	};
	
	Manager.prototype.packet = function (packet) {
	  var _this3 = this;
	
	  this.encoder(packet, function (encodedPackets) {
	    for (var i = 0; i < encodedPackets.length; i++) {
	      _this3.engine.write(encodedPackets[i], packet.options);
	    }
	  });
	};
	
	Manager.prototype.socket = function (nsp) {
	  var socket = this.nsps[nsp];
	  if (!socket) {
	    socket = new _socket2.default(this, nsp);
	    this.nsps[nsp] = socket;
	  }
	  return socket;
	};
	
	Manager.prototype.cleanup = function () {
	  var sub = void 0;
	  while (sub = this.subs.shift()) {
	    sub.destroy();
	  }this.packetBuffer = [];
	  this.lastPing = null;
	};
	
	Manager.prototype.emitAll = function () {
	  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	    args[_key] = arguments[_key];
	  }
	
	  this.emit.apply(this, args);
	  for (var nsp in this.nsps) {
	    if (has.call(this.nsps, nsp)) {
	      this.nsps[nsp].emit.apply(this.nsps[nsp], args);
	    }
	  }
	};
	
	Manager.prototype.reconnect = function () {
	  var _this4 = this;
	
	  if (this.reconnecting || this.skipReconnect) return this;
	
	  if (this.backoff.attempts >= this._reconnectionAttempts) {
	    this.backoff.reset();
	    this.emitAll('reconnect_failed');
	    this.reconnecting = false;
	  } else {
	    (function () {
	      var delay = _this4.backoff.duration();
	      _this4.reconnecting = true;
	      var timer = setTimeout(function () {
	        _this4.emitAll('reconnect_attempt', _this4.backoff.attempts);
	        _this4.emitAll('reconnecting', _this4.backoff.attempts);
	
	        if (_this4.skipReconnect) return;
	
	        _this4.open(function (err) {
	          if (err) {
	            _this4.reconnecting = false;
	            _this4.reconnect();
	            _this4.emitAll('reconnect_error', err.data);
	          } else {
	            _this4.onreconnect();
	          }
	        });
	      }, delay);
	
	      _this4.subs.push({
	        destroy: function destroy() {
	          clearTimeout(timer);
	        }
	      });
	    })();
	  }
	};
	
	Manager.prototype.onreconnect = function () {
	  var attempt = this.backoff.attempts;
	  this.reconnecting = false;
	  this.backoff.reset();
	  this.updateSocketIds();
	  this.emitAll('reconnect', attempt);
	};
	
	/**
	 * Update `socket.id` of all sockets
	 *
	 * @api private
	 */
	
	Manager.prototype.updateSocketIds = function () {
	  for (var nsp in this.nsps) {
	    if (has.call(this.nsps, nsp)) {
	      this.nsps[nsp].id = this.engine.id;
	    }
	  }
	};
	
	Manager.prototype.destroy = function (socket) {
	  var index = (0, _indexof2.default)(this.connecting, socket);
	  if (~index) this.connecting.splice(index, 1);
	  if (this.connecting.length) return;
	
	  this.close();
	};
	
	Manager.prototype.close = Manager.prototype.disconnect = function () {
	  this.skipReconnect = true;
	  this.reconnecting = false;
	  if ('opening' == this.readyState) {
	    // `onclose` will not fire because
	    // an open event never happened
	    this.cleanup();
	  }
	  this.readyState = 'closed';
	  if (this.engine) this.engine.close();
	};
	
	/**
	 * Sets the `reconnection` config.
	 *
	 * @param {Boolean} true/false if it should automatically reconnect
	 * @return {Manager} self or value
	 * @api public
	 */
	Manager.prototype.reconnection = function (v) {
	  if (!arguments.length) return this._reconnection;
	  this._reconnection = !!v;
	  return this;
	};
	
	/**
	 * Sets the reconnection attempts config.
	 *
	 * @param {Number} max reconnection attempts before giving up
	 * @return {Manager} self or value
	 * @api public
	 */
	Manager.prototype.reconnectionAttempts = function (v) {
	  if (!arguments.length) return this._reconnectionAttempts;
	  this._reconnectionAttempts = v;
	  return this;
	};
	
	/**
	 * Sets the delay between reconnections.
	 *
	 * @param {Number} delay
	 * @return {Manager} self or value
	 * @api public
	 */
	Manager.prototype.reconnectionDelay = function (v) {
	  if (!arguments.length) return this._reconnectionDelay;
	  this._reconnectionDelay = v;
	  this.backoff && this.backoff.setMin(v);
	  return this;
	};
	
	Manager.prototype.randomizationFactor = function (v) {
	  if (!arguments.length) return this._randomizationFactor;
	  this._randomizationFactor = v;
	  this.backoff && this.backoff.setJitter(v);
	  return this;
	};
	
	/**
	 * Sets the maximum delay between reconnections.
	 *
	 * @param {Number} delay
	 * @return {Manager} self or value
	 * @api public
	 */
	Manager.prototype.reconnectionDelayMax = function (v) {
	  if (!arguments.length) return this._reconnectionDelayMax;
	  this._reconnectionDelayMax = v;
	  this.backoff && this.backoff.setMax(v);
	  return this;
	};
	
	/**
	 * Sets the connection timeout. `false` to disable
	 *
	 * @return {Manager} self or value
	 * @api public
	 */
	Manager.prototype.timeout = function (v) {
	  if (!arguments.length) return this._timeout;
	  this._timeout = v;
	  return this;
	};
	
	/**
	 * Starts trying to reconnect if reconnection is enabled and we have not
	 * started reconnecting yet
	 *
	 * @api private
	 */
	Manager.prototype.maybeReconnectOnOpen = function () {
	  // Only try to reconnect if it's the first time we're connecting
	  if (!this.reconnecting && this._reconnection && this.backoff.attempts === 0) {
	    // keeps reconnection from firing twice for the same reconnection loop
	    this.reconnect();
	  }
	};

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * Expose `Emitter`.
	 */
	
	if (true) {
	  module.exports = Emitter;
	}
	
	/**
	 * Initialize a new `Emitter`.
	 *
	 * @api public
	 */
	
	function Emitter(obj) {
	  if (obj) return mixin(obj);
	};
	
	/**
	 * Mixin the emitter properties.
	 *
	 * @param {Object} obj
	 * @return {Object}
	 * @api private
	 */
	
	function mixin(obj) {
	  for (var key in Emitter.prototype) {
	    obj[key] = Emitter.prototype[key];
	  }
	  return obj;
	}
	
	/**
	 * Listen on the given `event` with `fn`.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 * @return {Emitter}
	 * @api public
	 */
	
	Emitter.prototype.on =
	Emitter.prototype.addEventListener = function(event, fn){
	  this._callbacks = this._callbacks || {};
	  (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
	    .push(fn);
	  return this;
	};
	
	/**
	 * Adds an `event` listener that will be invoked a single
	 * time then automatically removed.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 * @return {Emitter}
	 * @api public
	 */
	
	Emitter.prototype.once = function(event, fn){
	  function on() {
	    this.off(event, on);
	    fn.apply(this, arguments);
	  }
	
	  on.fn = fn;
	  this.on(event, on);
	  return this;
	};
	
	/**
	 * Remove the given callback for `event` or all
	 * registered callbacks.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 * @return {Emitter}
	 * @api public
	 */
	
	Emitter.prototype.off =
	Emitter.prototype.removeListener =
	Emitter.prototype.removeAllListeners =
	Emitter.prototype.removeEventListener = function(event, fn){
	  this._callbacks = this._callbacks || {};
	
	  // all
	  if (0 == arguments.length) {
	    this._callbacks = {};
	    return this;
	  }
	
	  // specific event
	  var callbacks = this._callbacks['$' + event];
	  if (!callbacks) return this;
	
	  // remove all handlers
	  if (1 == arguments.length) {
	    delete this._callbacks['$' + event];
	    return this;
	  }
	
	  // remove specific handler
	  var cb;
	  for (var i = 0; i < callbacks.length; i++) {
	    cb = callbacks[i];
	    if (cb === fn || cb.fn === fn) {
	      callbacks.splice(i, 1);
	      break;
	    }
	  }
	  return this;
	};
	
	/**
	 * Emit `event` with the given args.
	 *
	 * @param {String} event
	 * @param {Mixed} ...
	 * @return {Emitter}
	 */
	
	Emitter.prototype.emit = function(event){
	  this._callbacks = this._callbacks || {};
	  var args = [].slice.call(arguments, 1)
	    , callbacks = this._callbacks['$' + event];
	
	  if (callbacks) {
	    callbacks = callbacks.slice(0);
	    for (var i = 0, len = callbacks.length; i < len; ++i) {
	      callbacks[i].apply(this, args);
	    }
	  }
	
	  return this;
	};
	
	/**
	 * Return array of callbacks for `event`.
	 *
	 * @param {String} event
	 * @return {Array}
	 * @api public
	 */
	
	Emitter.prototype.listeners = function(event){
	  this._callbacks = this._callbacks || {};
	  return this._callbacks['$' + event] || [];
	};
	
	/**
	 * Check if this emitter has `event` handlers.
	 *
	 * @param {String} event
	 * @return {Boolean}
	 * @api public
	 */
	
	Emitter.prototype.hasListeners = function(event){
	  return !! this.listeners(event).length;
	};


/***/ },
/* 4 */
/***/ function(module, exports) {

	/**
	 * Slice reference.
	 */
	
	var slice = [].slice;
	
	/**
	 * Bind `obj` to `fn`.
	 *
	 * @param {Object} obj
	 * @param {Function|String} fn or string
	 * @return {Function}
	 * @api public
	 */
	
	module.exports = function(obj, fn){
	  if ('string' == typeof fn) fn = obj[fn];
	  if ('function' != typeof fn) throw new Error('bind() requires a function');
	  var args = slice.call(arguments, 2);
	  return function(){
	    return fn.apply(obj, args.concat(slice.call(arguments)));
	  }
	};


/***/ },
/* 5 */
/***/ function(module, exports) {

	
	/**
	 * Expose `Backoff`.
	 */
	
	module.exports = Backoff;
	
	/**
	 * Initialize backoff timer with `opts`.
	 *
	 * - `min` initial timeout in milliseconds [100]
	 * - `max` max timeout [10000]
	 * - `jitter` [0]
	 * - `factor` [2]
	 *
	 * @param {Object} opts
	 * @api public
	 */
	
	function Backoff(opts) {
	  opts = opts || {};
	  this.ms = opts.min || 100;
	  this.max = opts.max || 10000;
	  this.factor = opts.factor || 2;
	  this.jitter = opts.jitter > 0 && opts.jitter <= 1 ? opts.jitter : 0;
	  this.attempts = 0;
	}
	
	/**
	 * Return the backoff duration.
	 *
	 * @return {Number}
	 * @api public
	 */
	
	Backoff.prototype.duration = function(){
	  var ms = this.ms * Math.pow(this.factor, this.attempts++);
	  if (this.jitter) {
	    var rand =  Math.random();
	    var deviation = Math.floor(rand * this.jitter * ms);
	    ms = (Math.floor(rand * 10) & 1) == 0  ? ms - deviation : ms + deviation;
	  }
	  return Math.min(ms, this.max) | 0;
	};
	
	/**
	 * Reset the number of attempts.
	 *
	 * @api public
	 */
	
	Backoff.prototype.reset = function(){
	  this.attempts = 0;
	};
	
	/**
	 * Set the minimum duration
	 *
	 * @api public
	 */
	
	Backoff.prototype.setMin = function(min){
	  this.ms = min;
	};
	
	/**
	 * Set the maximum duration
	 *
	 * @api public
	 */
	
	Backoff.prototype.setMax = function(max){
	  this.max = max;
	};
	
	/**
	 * Set the jitter
	 *
	 * @api public
	 */
	
	Backoff.prototype.setJitter = function(jitter){
	  this.jitter = jitter;
	};
	


/***/ },
/* 6 */
/***/ function(module, exports) {

	
	var indexOf = [].indexOf;
	
	module.exports = function(arr, obj){
	  if (indexOf) return arr.indexOf(obj);
	  for (var i = 0; i < arr.length; ++i) {
	    if (arr[i] === obj) return i;
	  }
	  return -1;
	};

/***/ },
/* 7 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	/**
	 * Helper for subscriptions.
	 *
	 * @param {Object|EventEmitter} obj with `Emitter` mixin or `EventEmitter`
	 * @param {String} event name
	 * @param {Function} callback
	 * @api public
	 */
	
	exports.default = function (obj, ev, fn) {
	  obj.on(ev, fn);
	  return {
	    destroy: function destroy() {
	      obj.removeListener(ev, fn);
	    }
	  };
	};

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _keys = __webpack_require__(9);
	
	var _keys2 = _interopRequireDefault(_keys);
	
	var _componentEmitter = __webpack_require__(3);
	
	var _componentEmitter2 = _interopRequireDefault(_componentEmitter);
	
	var _on = __webpack_require__(7);
	
	var _on2 = _interopRequireDefault(_on);
	
	var _parsejson = __webpack_require__(44);
	
	var _parsejson2 = _interopRequireDefault(_parsejson);
	
	var _componentBind = __webpack_require__(4);
	
	var _componentBind2 = _interopRequireDefault(_componentBind);
	
	var _parseuri = __webpack_require__(45);
	
	var _parseuri2 = _interopRequireDefault(_parseuri);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = Engine;
	
	
	var GlobalEmitter = (0, _componentEmitter2.default)({ hasEmitte: false });
	
	(0, _componentEmitter2.default)(Engine.prototype);
	
	var packets = {
	  open: 0, // non-ws
	  close: 1, // non-ws
	  ping: 2,
	  pong: 3,
	  message: 4,
	  upgrade: 5,
	  noop: 6
	};
	
	var packetslist = (0, _keys2.default)(packets);
	
	function Engine(uri, opts) {
	  if (!(this instanceof Engine)) return new Engine(uri, opts);
	
	  this.subs = [];
	  uri = (0, _parseuri2.default)(uri);
	  this.protocol = uri.protocol;
	  this.host = uri.host;
	  this.query = uri.query;
	  this.port = uri.port;
	  this.opts = this.opts || {};
	  this.path = opts.path.replace(/\/$/, '');
	  this.connected = false;
	  this.lastPing = null;
	  this.pingInterval = 20000;
	  // init bind with GlobalEmitter
	  this.bindEvents();
	}
	
	Engine.prototype.connect = function () {
	  if (!GlobalEmitter.hasEmitte) Engine.subEvents();
	  var url = this.protocol + '://' + this.host + ':' + this.port + '/' + this.path + '/?' + (this.query ? this.query + '&' : '') + 'EIO=3&transport=websocket';
	
	  wx.connectSocket({ url: url });
	};
	
	Engine.prototype.onopen = function () {
	  this.emit('open');
	};
	
	Engine.prototype.onclose = function (reason) {
	  // clean all bind with GlobalEmitter
	  this.destroy();
	  this.emit('close', reason);
	};
	
	Engine.prototype.onerror = function (reason) {
	  this.emit('error');
	  // 如果 wx.connectSocket 还没回调 wx.onSocketOpen，而先调用 wx.closeSocket，那么就做不到关闭 WebSocket 的目的。
	  wx.closeSocket();
	};
	
	Engine.prototype.onpacket = function (packet) {
	  switch (packet.type) {
	    case 'open':
	      this.onHandshake((0, _parsejson2.default)(packet.data));
	      break;
	    case 'pong':
	      this.setPing();
	      this.emit('pong');
	      break;
	    case 'error':
	      {
	        var error = new Error('server error');
	        error.code = packet.data;
	        this.onerror(error);
	        break;
	      }
	    case 'message':
	      this.emit('data', packet.data);
	      this.emit('message', packet.data);
	      break;
	  }
	};
	
	Engine.prototype.onHandshake = function (data) {
	  this.id = data.sid;
	  this.pingInterval = data.pingInterval;
	  this.pingTimeout = data.pingTimeout;
	  this.setPing();
	};
	
	Engine.prototype.setPing = function () {
	  var _this = this;
	
	  clearTimeout(this.pingIntervalTimer);
	  this.pingIntervalTimer = setTimeout(function () {
	    _this.ping();
	  }, this.pingInterval);
	};
	
	Engine.prototype.ping = function () {
	  this.emit('ping');
	  this._send(packets.ping + 'probe');
	};
	
	Engine.prototype.write = Engine.prototype.send = function (packet) {
	  this._send([packets.message, packet].join(''));
	};
	
	Engine.prototype._send = function (data) {
	  wx.sendSocketMessage({ data: data });
	};
	Engine.subEvents = function () {
	  wx.onSocketOpen(function () {
	    GlobalEmitter.emit('open');
	  });
	  wx.onSocketClose(function (reason) {
	    GlobalEmitter.emit('close', reason);
	  });
	  wx.onSocketError(function (reason) {
	    GlobalEmitter.emit('error', reason);
	  });
	  wx.onSocketMessage(function (resp) {
	    GlobalEmitter.emit('packet', decodePacket(resp.data));
	  });
	  GlobalEmitter.hasEmitte = true;
	};
	
	Engine.prototype.bindEvents = function () {
	  this.subs.push((0, _on2.default)(GlobalEmitter, 'open', (0, _componentBind2.default)(this, 'onopen')));
	  this.subs.push((0, _on2.default)(GlobalEmitter, 'close', (0, _componentBind2.default)(this, 'onclose')));
	  this.subs.push((0, _on2.default)(GlobalEmitter, 'error', (0, _componentBind2.default)(this, 'onerror')));
	  this.subs.push((0, _on2.default)(GlobalEmitter, 'packet', (0, _componentBind2.default)(this, 'onpacket')));
	};
	
	Engine.prototype.destroy = function () {
	  var sub = void 0;
	  while (sub = this.subs.shift()) {
	    sub.destroy();
	  }
	
	  clearTimeout(this.pingIntervalTimer);
	  this.readyState = 'closed';
	  this.id = null;
	  this.writeBuffer = [];
	  this.prevBufferLen = 0;
	};
	
	function decodePacket(data) {
	  var type = data.charAt(0);
	  if (data.length > 1) {
	    return {
	      type: packetslist[type],
	      data: data.substring(1)
	    };
	  }
	  return { type: packetslist[type] };
	}

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(10), __esModule: true };

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(11);
	module.exports = __webpack_require__(31).Object.keys;

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.14 Object.keys(O)
	var toObject = __webpack_require__(12)
	  , $keys    = __webpack_require__(14);
	
	__webpack_require__(29)('keys', function(){
	  return function keys(it){
	    return $keys(toObject(it));
	  };
	});

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	// 7.1.13 ToObject(argument)
	var defined = __webpack_require__(13);
	module.exports = function(it){
	  return Object(defined(it));
	};

/***/ },
/* 13 */
/***/ function(module, exports) {

	// 7.2.1 RequireObjectCoercible(argument)
	module.exports = function(it){
	  if(it == undefined)throw TypeError("Can't call method on  " + it);
	  return it;
	};

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.14 / 15.2.3.14 Object.keys(O)
	var $keys       = __webpack_require__(15)
	  , enumBugKeys = __webpack_require__(28);
	
	module.exports = Object.keys || function keys(O){
	  return $keys(O, enumBugKeys);
	};

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	var has          = __webpack_require__(16)
	  , toIObject    = __webpack_require__(17)
	  , arrayIndexOf = __webpack_require__(20)(false)
	  , IE_PROTO     = __webpack_require__(24)('IE_PROTO');
	
	module.exports = function(object, names){
	  var O      = toIObject(object)
	    , i      = 0
	    , result = []
	    , key;
	  for(key in O)if(key != IE_PROTO)has(O, key) && result.push(key);
	  // Don't enum bug & hidden keys
	  while(names.length > i)if(has(O, key = names[i++])){
	    ~arrayIndexOf(result, key) || result.push(key);
	  }
	  return result;
	};

/***/ },
/* 16 */
/***/ function(module, exports) {

	var hasOwnProperty = {}.hasOwnProperty;
	module.exports = function(it, key){
	  return hasOwnProperty.call(it, key);
	};

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	// to indexed object, toObject with fallback for non-array-like ES3 strings
	var IObject = __webpack_require__(18)
	  , defined = __webpack_require__(13);
	module.exports = function(it){
	  return IObject(defined(it));
	};

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	// fallback for non-array-like ES3 and non-enumerable old V8 strings
	var cof = __webpack_require__(19);
	module.exports = Object('z').propertyIsEnumerable(0) ? Object : function(it){
	  return cof(it) == 'String' ? it.split('') : Object(it);
	};

/***/ },
/* 19 */
/***/ function(module, exports) {

	var toString = {}.toString;
	
	module.exports = function(it){
	  return toString.call(it).slice(8, -1);
	};

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	// false -> Array#indexOf
	// true  -> Array#includes
	var toIObject = __webpack_require__(17)
	  , toLength  = __webpack_require__(21)
	  , toIndex   = __webpack_require__(23);
	module.exports = function(IS_INCLUDES){
	  return function($this, el, fromIndex){
	    var O      = toIObject($this)
	      , length = toLength(O.length)
	      , index  = toIndex(fromIndex, length)
	      , value;
	    // Array#includes uses SameValueZero equality algorithm
	    if(IS_INCLUDES && el != el)while(length > index){
	      value = O[index++];
	      if(value != value)return true;
	    // Array#toIndex ignores holes, Array#includes - not
	    } else for(;length > index; index++)if(IS_INCLUDES || index in O){
	      if(O[index] === el)return IS_INCLUDES || index || 0;
	    } return !IS_INCLUDES && -1;
	  };
	};

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	// 7.1.15 ToLength
	var toInteger = __webpack_require__(22)
	  , min       = Math.min;
	module.exports = function(it){
	  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
	};

/***/ },
/* 22 */
/***/ function(module, exports) {

	// 7.1.4 ToInteger
	var ceil  = Math.ceil
	  , floor = Math.floor;
	module.exports = function(it){
	  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
	};

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	var toInteger = __webpack_require__(22)
	  , max       = Math.max
	  , min       = Math.min;
	module.exports = function(index, length){
	  index = toInteger(index);
	  return index < 0 ? max(index + length, 0) : min(index, length);
	};

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	var shared = __webpack_require__(25)('keys')
	  , uid    = __webpack_require__(27);
	module.exports = function(key){
	  return shared[key] || (shared[key] = uid(key));
	};

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	var global = __webpack_require__(26)
	  , SHARED = '__core-js_shared__'
	  , store  = global[SHARED] || (global[SHARED] = {});
	module.exports = function(key){
	  return store[key] || (store[key] = {});
	};

/***/ },
/* 26 */
/***/ function(module, exports) {

	// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
	var global = module.exports = typeof window != 'undefined' && window.Math == Math
	  ? window : typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();
	if(typeof __g == 'number')__g = global; // eslint-disable-line no-undef

/***/ },
/* 27 */
/***/ function(module, exports) {

	var id = 0
	  , px = Math.random();
	module.exports = function(key){
	  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
	};

/***/ },
/* 28 */
/***/ function(module, exports) {

	// IE 8- don't enum bug keys
	module.exports = (
	  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
	).split(',');

/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	// most Object methods by ES6 should accept primitives
	var $export = __webpack_require__(30)
	  , core    = __webpack_require__(31)
	  , fails   = __webpack_require__(40);
	module.exports = function(KEY, exec){
	  var fn  = (core.Object || {})[KEY] || Object[KEY]
	    , exp = {};
	  exp[KEY] = exec(fn);
	  $export($export.S + $export.F * fails(function(){ fn(1); }), 'Object', exp);
	};

/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	var global    = __webpack_require__(26)
	  , core      = __webpack_require__(31)
	  , ctx       = __webpack_require__(32)
	  , hide      = __webpack_require__(34)
	  , PROTOTYPE = 'prototype';
	
	var $export = function(type, name, source){
	  var IS_FORCED = type & $export.F
	    , IS_GLOBAL = type & $export.G
	    , IS_STATIC = type & $export.S
	    , IS_PROTO  = type & $export.P
	    , IS_BIND   = type & $export.B
	    , IS_WRAP   = type & $export.W
	    , exports   = IS_GLOBAL ? core : core[name] || (core[name] = {})
	    , expProto  = exports[PROTOTYPE]
	    , target    = IS_GLOBAL ? global : IS_STATIC ? global[name] : (global[name] || {})[PROTOTYPE]
	    , key, own, out;
	  if(IS_GLOBAL)source = name;
	  for(key in source){
	    // contains in native
	    own = !IS_FORCED && target && target[key] !== undefined;
	    if(own && key in exports)continue;
	    // export native or passed
	    out = own ? target[key] : source[key];
	    // prevent global pollution for namespaces
	    exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
	    // bind timers to global for call from export context
	    : IS_BIND && own ? ctx(out, global)
	    // wrap global constructors for prevent change them in library
	    : IS_WRAP && target[key] == out ? (function(C){
	      var F = function(a, b, c){
	        if(this instanceof C){
	          switch(arguments.length){
	            case 0: return new C;
	            case 1: return new C(a);
	            case 2: return new C(a, b);
	          } return new C(a, b, c);
	        } return C.apply(this, arguments);
	      };
	      F[PROTOTYPE] = C[PROTOTYPE];
	      return F;
	    // make static versions for prototype methods
	    })(out) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
	    // export proto methods to core.%CONSTRUCTOR%.methods.%NAME%
	    if(IS_PROTO){
	      (exports.virtual || (exports.virtual = {}))[key] = out;
	      // export proto methods to core.%CONSTRUCTOR%.prototype.%NAME%
	      if(type & $export.R && expProto && !expProto[key])hide(expProto, key, out);
	    }
	  }
	};
	// type bitmap
	$export.F = 1;   // forced
	$export.G = 2;   // global
	$export.S = 4;   // static
	$export.P = 8;   // proto
	$export.B = 16;  // bind
	$export.W = 32;  // wrap
	$export.U = 64;  // safe
	$export.R = 128; // real proto method for `library` 
	module.exports = $export;

/***/ },
/* 31 */
/***/ function(module, exports) {

	var core = module.exports = {version: '2.4.0'};
	if(typeof __e == 'number')__e = core; // eslint-disable-line no-undef

/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	// optional / simple context binding
	var aFunction = __webpack_require__(33);
	module.exports = function(fn, that, length){
	  aFunction(fn);
	  if(that === undefined)return fn;
	  switch(length){
	    case 1: return function(a){
	      return fn.call(that, a);
	    };
	    case 2: return function(a, b){
	      return fn.call(that, a, b);
	    };
	    case 3: return function(a, b, c){
	      return fn.call(that, a, b, c);
	    };
	  }
	  return function(/* ...args */){
	    return fn.apply(that, arguments);
	  };
	};

/***/ },
/* 33 */
/***/ function(module, exports) {

	module.exports = function(it){
	  if(typeof it != 'function')throw TypeError(it + ' is not a function!');
	  return it;
	};

/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	var dP         = __webpack_require__(35)
	  , createDesc = __webpack_require__(43);
	module.exports = __webpack_require__(39) ? function(object, key, value){
	  return dP.f(object, key, createDesc(1, value));
	} : function(object, key, value){
	  object[key] = value;
	  return object;
	};

/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	var anObject       = __webpack_require__(36)
	  , IE8_DOM_DEFINE = __webpack_require__(38)
	  , toPrimitive    = __webpack_require__(42)
	  , dP             = Object.defineProperty;
	
	exports.f = __webpack_require__(39) ? Object.defineProperty : function defineProperty(O, P, Attributes){
	  anObject(O);
	  P = toPrimitive(P, true);
	  anObject(Attributes);
	  if(IE8_DOM_DEFINE)try {
	    return dP(O, P, Attributes);
	  } catch(e){ /* empty */ }
	  if('get' in Attributes || 'set' in Attributes)throw TypeError('Accessors not supported!');
	  if('value' in Attributes)O[P] = Attributes.value;
	  return O;
	};

/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(37);
	module.exports = function(it){
	  if(!isObject(it))throw TypeError(it + ' is not an object!');
	  return it;
	};

/***/ },
/* 37 */
/***/ function(module, exports) {

	module.exports = function(it){
	  return typeof it === 'object' ? it !== null : typeof it === 'function';
	};

/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = !__webpack_require__(39) && !__webpack_require__(40)(function(){
	  return Object.defineProperty(__webpack_require__(41)('div'), 'a', {get: function(){ return 7; }}).a != 7;
	});

/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	// Thank's IE8 for his funny defineProperty
	module.exports = !__webpack_require__(40)(function(){
	  return Object.defineProperty({}, 'a', {get: function(){ return 7; }}).a != 7;
	});

/***/ },
/* 40 */
/***/ function(module, exports) {

	module.exports = function(exec){
	  try {
	    return !!exec();
	  } catch(e){
	    return true;
	  }
	};

/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(37)
	  , document = __webpack_require__(26).document
	  // in old IE typeof document.createElement is 'object'
	  , is = isObject(document) && isObject(document.createElement);
	module.exports = function(it){
	  return is ? document.createElement(it) : {};
	};

/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	// 7.1.1 ToPrimitive(input [, PreferredType])
	var isObject = __webpack_require__(37);
	// instead of the ES6 spec version, we didn't implement @@toPrimitive case
	// and the second argument - flag - preferred type is a string
	module.exports = function(it, S){
	  if(!isObject(it))return it;
	  var fn, val;
	  if(S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
	  if(typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it)))return val;
	  if(!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
	  throw TypeError("Can't convert object to primitive value");
	};

/***/ },
/* 43 */
/***/ function(module, exports) {

	module.exports = function(bitmap, value){
	  return {
	    enumerable  : !(bitmap & 1),
	    configurable: !(bitmap & 2),
	    writable    : !(bitmap & 4),
	    value       : value
	  };
	};

/***/ },
/* 44 */
/***/ function(module, exports) {

	'use strict';
	
	/**
	 * JSON parse.
	 *
	 * @see Based on jQuery#parseJSON (MIT) and JSON2
	 * @api private
	 */
	
	var rvalidchars = /^[\],:{}\s]*$/;
	var rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
	var rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
	var rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g;
	var rtrimLeft = /^\s+/;
	var rtrimRight = /\s+$/;
	
	module.exports = function parsejson(data) {
	  if ('string' != typeof data || !data) {
	    return null;
	  }
	
	  data = data.replace(rtrimLeft, '').replace(rtrimRight, '');
	
	  // Attempt to parse using the native JSON parser first
	  if (JSON.parse) {
	    return JSON.parse(data);
	  }
	
	  if (rvalidchars.test(data.replace(rvalidescape, '@').replace(rvalidtokens, ']').replace(rvalidbraces, ''))) {
	    return new Function('return ' + data)();
	  }
	};

/***/ },
/* 45 */
/***/ function(module, exports) {

	/**
	 * Parses an URI
	 *
	 * @author Steven Levithan <stevenlevithan.com> (MIT license)
	 * @api private
	 */
	
	var re = /^(?:(?![^:@]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;
	
	var parts = [
	    'source', 'protocol', 'authority', 'userInfo', 'user', 'password', 'host', 'port', 'relative', 'path', 'directory', 'file', 'query', 'anchor'
	];
	
	module.exports = function parseuri(str) {
	    var src = str,
	        b = str.indexOf('['),
	        e = str.indexOf(']');
	
	    if (b != -1 && e != -1) {
	        str = str.substring(0, b) + str.substring(b, e).replace(/:/g, ';') + str.substring(e, str.length);
	    }
	
	    var m = re.exec(str || ''),
	        uri = {},
	        i = 14;
	
	    while (i--) {
	        uri[parts[i]] = m[i] || '';
	    }
	
	    if (b != -1 && e != -1) {
	        uri.source = src;
	        uri.host = uri.host.substring(1, uri.host.length - 1).replace(/;/g, ':');
	        uri.authority = uri.authority.replace('[', '').replace(']', '').replace(/;/g, ':');
	        uri.ipv6uri = true;
	    }
	
	    return uri;
	};


/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _stringify = __webpack_require__(47);
	
	var _stringify2 = _interopRequireDefault(_stringify);
	
	exports.encoder = encoder;
	exports.decoder = decoder;
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.types = ['CONNECT', 'DISCONNECT', 'EVENT', 'ACK', 'ERROR', 'BINARY_EVENT', 'BINARY_ACK'];
	
	function encoder(obj, callback) {
	  // if (exports.BINARY_EVENT == obj.type || exports.BINARY_ACK == obj.type)
	  // TODO support binary packet
	  var encoding = encodeAsString(obj);
	  callback([encoding]);
	}
	
	function encodeAsString(obj) {
	  var str = '';
	  var nsp = false;
	
	  str += obj.type;
	  // if (exports.BINARY_EVENT == obj.type || exports.BINARY_ACK == obj.type) {}
	  // TODO support binary type
	
	  if (obj.nsp && '/' != obj.nsp) {
	    nsp = true;
	    str += obj.nsp;
	  }
	
	  if (null != obj.id) {
	    if (nsp) {
	      str += ',';
	      nsp = false;
	    }
	    str += obj.id;
	  }
	
	  if (null != obj.data) {
	    if (nsp) str += ',';
	    str += (0, _stringify2.default)(obj.data);
	  }
	
	  return str;
	}
	
	function decoder(obj, callback) {
	  var packet = void 0;
	  if ('string' == typeof obj) {
	    packet = decodeString(obj);
	  }
	  callback(packet);
	}
	
	function decodeString(str) {
	  var p = {};
	  var i = 0;
	  // look up type
	  p.type = Number(str.charAt(0));
	  if (null == exports.types[p.type]) return error();
	
	  // look up attachments if type binary
	
	  // look up namespace (if any)
	  if ('/' == str.charAt(i + 1)) {
	    p.nsp = '';
	    while (++i) {
	      var c = str.charAt(i);
	      if (',' == c) break;
	      p.nsp += c;
	      if (i == str.length) break;
	    }
	  } else {
	    p.nsp = '/';
	  }
	
	  // look up id
	  var next = str.charAt(i + 1);
	  if ('' !== next && Number(next) == next) {
	    p.id = '';
	    while (++i) {
	      var _c = str.charAt(i);
	      if (null == _c || Number(_c) != _c) {
	        --i;
	        break;
	      }
	      p.id += str.charAt(i);
	      if (i == str.length) break;
	    }
	    p.id = Number(p.id);
	  }
	
	  // look up json data
	  if (str.charAt(++i)) {
	    try {
	      p.data = JSON.parse(str.substr(i));
	    } catch (e) {
	      return error();
	    }
	  }
	  return p;
	}
	
	function error(data) {
	  return {
	    type: exports.ERROR,
	    data: 'parser error'
	  };
	}

/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(48), __esModule: true };

/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	var core  = __webpack_require__(31)
	  , $JSON = core.JSON || (core.JSON = {stringify: JSON.stringify});
	module.exports = function stringify(it){ // eslint-disable-line no-unused-vars
	  return $JSON.stringify.apply($JSON, arguments);
	};

/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _componentEmitter = __webpack_require__(3);
	
	var _componentEmitter2 = _interopRequireDefault(_componentEmitter);
	
	var _on = __webpack_require__(7);
	
	var _on2 = _interopRequireDefault(_on);
	
	var _componentBind = __webpack_require__(4);
	
	var _componentBind2 = _interopRequireDefault(_componentBind);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	(0, _componentEmitter2.default)(Socket.prototype);
	
	var parser = {
	  CONNECT: 0,
	  DISCONNECT: 1,
	  EVENT: 2,
	  ACK: 3,
	  ERROR: 4,
	  BINARY_EVENT: 5,
	  BINARY_ACK: 6
	};
	
	var events = {
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
	  pong: 1
	};
	
	var emit = _componentEmitter2.default.prototype.emit;
	
	exports.default = Socket;
	
	
	function Socket(io, nsp) {
	  this.io = io;
	  this.nsp = nsp;
	  this.id = 0; // sid
	  this.connected = false;
	  this.disconnected = true;
	  this.receiveBuffer = [];
	  this.sendBuffer = [];
	  if (this.io.autoConnect) this.open();
	}
	
	Socket.prototype.subEvents = function () {
	  if (this.subs) return;
	
	  var io = this.io;
	  this.subs = [(0, _on2.default)(io, 'open', (0, _componentBind2.default)(this, 'onopen')), (0, _on2.default)(io, 'packet', (0, _componentBind2.default)(this, 'onpacket')), (0, _on2.default)(io, 'close', (0, _componentBind2.default)(this, 'onclose'))];
	};
	
	Socket.prototype.open = Socket.prototype.connect = function () {
	  if (this.connected) return this;
	  this.subEvents();
	  this.io.open(); // ensure open
	  if ('open' == this.io.readyState) this.onopen();
	  return this;
	};
	
	Socket.prototype.onopen = function () {
	  if ('/' != this.nsp) this.packet({ type: parser.CONNECT });
	};
	
	Socket.prototype.onclose = function (reason) {
	  this.connected = false;
	  this.disconnected = true;
	  delete this.id;
	  this.emit('disconnect', reason);
	};
	
	Socket.prototype.onpacket = function (packet) {
	  if (packet.nsp != this.nsp) return;
	
	  switch (packet.type) {
	    case parser.CONNECT:
	      this.onconnect();
	      break;
	    case parser.EVENT:
	      this.onevent(packet);
	      break;
	    case parser.DISCONNECT:
	      this.disconnect();
	      break;
	    case parser.ERROR:
	      this.emit('error', packet.data);
	      break;
	  }
	};
	
	Socket.prototype.onconnect = function () {
	  this.connected = true;
	  this.disconnected = false;
	  this.emit('connect');
	  // this.emitBuffered()
	};
	
	Socket.prototype.onevent = function (packet) {
	  var args = packet.data || [];
	
	  if (this.connected) {
	    emit.apply(this, args);
	  } else {
	    this.receiveBuffer.push(args);
	  }
	};
	
	Socket.prototype.close = Socket.prototype.disconnect = function () {
	  if (this.connected) {
	    this.packet({ type: parser.DISCONNECT });
	  }
	
	  this.destroy();
	
	  if (this.connected) {
	    this.onclose('io client disconnect');
	  }
	  return this;
	};
	
	Socket.prototype.destroy = function () {
	  if (this.subs) {
	    for (var i = 0; i < this.subs.length; i++) {
	      this.subs[i].destroy();
	    }
	    this.subs = null;
	  }
	  this.io.destroy(this);
	};
	
	Socket.prototype.emit = function () {
	  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	    args[_key] = arguments[_key];
	  }
	
	  if (events.hasOwnProperty(args[0])) {
	    emit.apply(this, args);
	    return this;
	  }
	
	  var parserType = parser.EVENT;
	  // if (hasBin(args)) { parserType = parser.BINARY_EVENT; } // binary
	  var packet = { type: parserType, data: args, options: {} };
	
	  if (this.connected) {
	    this.packet(packet);
	  } else {
	    this.sendBuffer.push(packet);
	  }
	  return this;
	};
	
	Socket.prototype.packet = function (packet) {
	  packet.nsp = this.nsp;
	  this.io.packet(packet);
	};

/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _parseuri = __webpack_require__(45);
	
	var _parseuri2 = _interopRequireDefault(_parseuri);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = function (uri) {
	  var obj = (0, _parseuri2.default)(uri);
	
	  // make sure we treat `localhost:80` and `localhost` equally
	  if (!obj.port) {
	    if (/^(http|ws)$/.test(obj.protocol)) {
	      obj.port = '80';
	    } else if (/^(http|ws)s$/.test(obj.protocol)) {
	      obj.port = '443';
	    }
	  }
	
	  obj.path = obj.path || '/';
	  var ipv6 = obj.host.indexOf(':') !== -1;
	  var host = ipv6 ? '[' + obj.host + ']' : obj.host;
	
	  // define unique id
	  obj.id = obj.protocol + '://' + host + ':' + obj.port;
	
	  return obj;
	};

/***/ }
/******/ ])
});
;
//# sourceMappingURL=index.js.map