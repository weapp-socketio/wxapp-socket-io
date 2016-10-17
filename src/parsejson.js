/**
 * JSON parse.
 *
 * @see Based on jQuery#parseJSON (MIT) and JSON2
 * @api private
 */

const rvalidchars = /^[\],:{}\s]*$/
const rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g
const rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g
const rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g
const rtrimLeft = /^\s+/
const rtrimRight = /\s+$/

module.exports = function parsejson(data) {
  if ('string' != typeof data || !data) {
    return null
  }

  data = data.replace(rtrimLeft, '').replace(rtrimRight, '')

  // Attempt to parse using the native JSON parser first
  if (JSON.parse) {
    return JSON.parse(data)
  }

  if (rvalidchars.test(data.replace(rvalidescape, '@')
      .replace(rvalidtokens, ']')
      .replace(rvalidbraces, ''))) {
    return (new Function('return ' + data))()
  }
}
