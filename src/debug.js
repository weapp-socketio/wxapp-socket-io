export default nsp => {
  return (...log) => {
    if (__wxConfig.debug) {
      console.log.call(null, nsp, ...log)
    }
  }
}
