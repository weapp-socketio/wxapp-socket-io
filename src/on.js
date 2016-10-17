/**
 * Helper for subscriptions.
 *
 * @param {Object|EventEmitter} obj with `Emitter` mixin or `EventEmitter`
 * @param {String} event name
 * @param {Function} callback
 * @api public
 */

export default (obj, ev, fn) => {
  obj.on(ev, fn)
  return {
    destroy: () => {
      obj.removeListener(ev, fn)
    },
  }
}
