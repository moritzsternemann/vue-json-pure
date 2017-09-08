import VueNativeWebsocket from 'vue-native-websocket'
import Emitter from './emitter'
import API from './api'
import { warn } from './utils'

let _Vue
let _options
let _api

let _created

const install = (Vue, options) => {
  if (_Vue) {
    warn('already installed, Vue.use(VueJsonPure) should only be called once.')
    return
  }
  _Vue = Vue

  if (!options || !options.url) {
    throw new Error('[json-pure] please provide all necessary configuration data')
  }
  _options = options

  VueNativeWebsocket.install(Vue, options.url, options)

  Vue.prototype.$api = new API(Vue.prototype.$socket)
  _api = Vue.prototype.$api

  Vue.mixin({
    created () {
      if (_created) { return }

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

      _created = true
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
      websocketOnMessage (event) {
        let data = JSON.parse(event.data)
        if (options.autoPong === true && data.action_str === 'PING') {
          this.$socket.sendObj({ action_str: 'PONG' })
          return // don't call next() if responded to pong
        }

        handleJsonPure(event, data)
      }
    }
  })
}

const handleJsonPure = (event, data) => {
  let action = data.action_str.split('_')
  if (action.length === 2 && action[1] === 'FAIL') {
    Emitter.emit('fail', { action_str: action[0] })
    if (_options.store) {
      passToStore('API_FAIL', Object.assign(data, { action_str: action[0] }))
    }
  } else {
    Emitter.emit(action[0], data)
    if (_options.store) {
      passToStore('API_' + action[0], data)
    }
  }
}

const passToStore = (eventName, event) => {
  if (!eventName.startsWith('API_')) { return }
  let method = 'commit'
  let target = eventName.toUpperCase()
  let msg = event
  if (_options.format === 'json' && event && typeof event === 'string') {
    msg = JSON.parse(event)
  }
  _options.store[method](target, msg)
}

export default {
  install,
  get api () {
    return _api
  },

  version: '__VERSION__'
}
