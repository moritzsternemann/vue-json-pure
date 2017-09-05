import Emitter from './emitter'

export default class {
  constructor (connectionUrl, options = {}) {
    this.format = options.format && options.format.toLowerCase()
    this.connect(connectionUrl, options)
    if (options.store) { this.store = options.store }
    this.onEvent()
  }

  connect (connectionUrl, options = {}) {
    let protocol = options.protocol || ''
    this.WebSocket = options.WebSocket || (protocol === '' ? new WebSocket(connectionUrl) : new WebSocket(connectionUrl, protocol))
    if (this.format === 'json') {
      if (!('sendObj' in this.WebSocket)) {
        this.WebSocket.sendObj = (object) => this.WebSocket.send(JSON.stringify(object))
      }
    }
  }

  onEvent () {
    ['onmessage', 'onclose', 'onerror', 'onopen'].forEach((eventType) => {
      this.WebSocket[eventType] = (event) => {
        Emitter.emit(eventType, event)
        if (this.store) { this.passToStore('SOCKET_' + eventType, event) }
      }
    })
  }

  passToStore (eventName, event) {
    if (!eventName.startsWith('SOCKET_')) { return }
    let method = 'commit'
    let target = eventName.toUpperCase()
    let msg = event
    if (this.format === 'json' && event.data) {
      msg = JSON.parse(event.data)
    }
    this.store[method](target, msg)
  }
}
