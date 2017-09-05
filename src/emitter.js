class Emitter {
  constructor () {
    this.listeners = new Map()
  }

  addListener (label, callback, vm) {
    if (typeof callback !== 'function') {
      return false
    }

    this.listeners.has(label) || this.listeners.set(label, [])
    this.listeners.get(label).push({ callback, vm })
    return true
  }

  removeListener (label, callback, vm) {
    let listeners = this.listeners.get(label)
    let index

    if (listeners && listeners.length) {
      index = listeners.reduce((i, listener, index) => {
        if (typeof listener.callback === 'function' && listener.callback === callback && listener.vm === vm) {
          i = index
        }
        return i
      }, -1)

      if (index > -1) {
        listeners.splice(index, 1)
        this.listeners.set(label, listeners)
        return true
      }
    }
    return false
  }

  emit (label, event) {
    let listeners = this.listeners.get(label)

    if (listeners && listeners.length) {
      var next = true
      var listener = null
      for (var i = 0; i < listeners.length; i++) {
        if (next !== true) {
          break
        }

        next = false
        listener = listeners[i]
        listener.callback.call(listener.vm, event, () => {
          next = true
        })
      }
      return true
    }
    return false
  }
}

export default new Emitter()
