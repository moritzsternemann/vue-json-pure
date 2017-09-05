import VueNativeWebsocket from './vue-native-websocket'
import Emitter from './emitter'
import API from './api'

let url
let options

const install = (Vue) => {
  if (!url || !options) { throw new Error('[json-pure] you have to call setup() before Vue.use()') }

  VueNativeWebsocket.setup(url, options)
  VueNativeWebsocket.install(Vue, url, options)

  Vue.prototype.$api = new API(Vue.prototype.$socket)

  Vue.mixin({
    created () {
      this.$options.sockets.onmessage = this.websocketOnMessage

      let api = this.$options['api']
      this.$options.api = new Proxy({}, {
        set (target, key, value) {
          Emitter.addListener(key, value, this)
          target[key] = value
          return true
        },
        deleteProperty (target, key) {
          Emitter.removeListener(key, this.$options.api[key], this)
          delete target.key
          return true
        }
      })

      if (api) {
        Object.keys(api).forEach(key => {
          this.$options.api[key] = api[key]
        })
      }
    },
    beforeDestroy () {
      let api = this.$options['api']
      if (api) {
        Object.keys(api).forEach(key => {
          delete this.$options.api[key]
        })
      }
    },
    methods: {
      websocketOnMessage (event, next) {
        let data = JSON.parse(event.data)
        if (options.autoPong === true && data.action_str === 'PING') {
          this.$socket.sendObj({ action_str: 'PONG' })
          return // don't call next() if responded to pong
        }

        handleJsonPure(event, data, next)

        next()
      }
    }
  })
}

const setup = (_url, _options = {}) => {
  if (!_url) { throw new Error('[json-pure] the url cannot be empty') }

  url = _url
  options = _options
}

const handleJsonPure = (event, data, next) => {
  let action = data.action_str.split('_')
  if (action.length === 2 && action[1] === 'FAIL') {
    Emitter.emit('fail', { action_str: action[0] })
    if (options.store) {
      passToStore('API_FAIL', { action_str: action[0] })
    }
  } else {
    Emitter.emit(action[0], data)
    if (options.store) {
      passToStore('API_' + action[0], data)
    }
  }
  next()
}

const passToStore = (eventName, event) => {
  if (!eventName.startsWith('API_')) { return }
  let method = 'commit'
  let target = eventName.toUpperCase()
  let msg = event
  if (options.format === 'json' && event) {
    msg = JSON.parse(event)
  }
  options.store[method](target, msg)
}

export default {
  install,
  setup,

  version: '__VERSION__'
}
