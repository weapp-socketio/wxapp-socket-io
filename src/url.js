import parseuri from 'parseuri'

export default uri => {
  const obj = parseuri(uri)

  // make sure we treat `localhost:80` and `localhost` equally
  if (!obj.port) {
    if (/^(http|ws)$/.test(obj.protocol)) {
      obj.port = '80'
    } else if (/^(http|ws)s$/.test(obj.protocol)) {
      obj.port = '443'
    }
  }

  obj.path = obj.path || '/'
  const ipv6 = obj.host.indexOf(':') !== -1
  const host = ipv6 ? `[${obj.host}]` : obj.host

  // define unique id
  obj.id = `${obj.protocol}://${host}:${obj.port}`

  return obj
}
