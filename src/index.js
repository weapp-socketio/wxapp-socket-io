import manager from './manager'
import url from './url'
import _debug from './debug'

const debug = _debug('app:index:')

const cache = {}

export default function lookup(uri, opts) {
  if (!uri) {
    throw new Error('uri is required.')
  }

  opts = opts || {}

  const parsed = url(uri)
  debug('parsed: ', parsed)

  const source = parsed.source
  const id = parsed.id
  const path = parsed.path
  const sameNamespace = cache[id] && path in cache[id].nsps

  const newConnection = opts.forceNew || opts['force new connection'] ||
                        false === opts.multiplex || sameNamespace

  // return new socket or from cache
  debug('cache: ', cache)
  let io
  if (newConnection) {
    debug('newConnection is true')
    io = manager(source, opts)
  } else {
    debug('newConnection is false')
    if (!cache[id]) {
      debug('----------> no cache')
      cache[id] = manager(source, opts)
    }
    debug('==========> has cache')
    io = cache[id]
  }
  debug('ready to call io.socket path is -> ', parsed.path)
  return io.socket(parsed.path)
}
