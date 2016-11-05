import manager from './manager'
import url from './url'

const cache = {}

export default function lookup(uri, opts) {
  if (!uri) {
    throw new Error('uri is required.')
  }

  opts = opts || {}

  const parsed = url(uri)

  const source = parsed.source
  const id = parsed.id
  const path = parsed.path
  const sameNamespace = cache[id] && path in cache[id].nsps

  const newConnection = opts.forceNew || opts['force new connection'] ||
                        false === opts.multiplex || sameNamespace

  // return new socket or from cache
  let io
  if (newConnection) {
    io = manager(source, opts)
  } else {
    if (!cache[id]) {
      cache[id] = manager(source, opts)
    }
    io = cache[id]
  }
  return io.socket(parsed.path)
}
