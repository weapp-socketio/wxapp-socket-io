exports.types = [
  'CONNECT',
  'DISCONNECT',
  'EVENT',
  'ACK',
  'ERROR',
  'BINARY_EVENT',
  'BINARY_ACK',
]

export function encoder(obj, callback) {
  // if (exports.BINARY_EVENT == obj.type || exports.BINARY_ACK == obj.type)
  // TODO support binary packet
  const encoding = encodeAsString(obj)
  callback([encoding])
}

function encodeAsString(obj) {
  let str = ''
  let nsp = false

  str += obj.type
  // if (exports.BINARY_EVENT == obj.type || exports.BINARY_ACK == obj.type) {}
  // TODO support binary type

  if (obj.nsp && '/' != obj.nsp) {
    nsp = true
    str += obj.nsp
  }

  if (null != obj.id) {
    if (nsp) {
      str += ','
      nsp = false
    }
    str += obj.id
  }

  if (null != obj.data) {
    if (nsp) str += ','
    str += JSON.stringify(obj.data)
  }

  return str
}

export function decoder(obj, callback) {
  let packet
  if ('string' == typeof obj) {
    packet = decodeString(obj)
  }
  callback(packet)
}

function decodeString(str) {
  const p = {}
  let i = 0
  // look up type
  p.type = Number(str.charAt(0))
  if (null == exports.types[p.type]) return error()

  // look up attachments if type binary

  // look up namespace (if any)
  if ('/' == str.charAt(i + 1)) {
    p.nsp = ''
    while (++i) {
      const c = str.charAt(i)
      if (',' == c) break
      p.nsp += c
      if (i == str.length) break
    }
  } else {
    p.nsp = '/'
  }

  // look up id
  const next = str.charAt(i + 1)
  if ('' !== next && Number(next) == next) {
    p.id = ''
    while (++i) {
      const c = str.charAt(i)
      if (null == c || Number(c) != c) {
        --i
        break
      }
      p.id += str.charAt(i)
      if (i == str.length) break
    }
    p.id = Number(p.id)
  }

  // look up json data
  if (str.charAt(++i)) {
    try {
      p.data = JSON.parse(str.substr(i))
    } catch (e) {
      return error()
    }
  }
  return p
}

function error(data) {
  return {
    type: exports.ERROR,
    data: 'parser error',
  }
}
