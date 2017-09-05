import Observer from './observer'
import Emitter from './emitter'
import { warn } from './utils'

let Vue

let url
let options

const install = (_Vue) => {
  if (Vue) {
    warn('already installed, Vue.use(VueJsonPure) should only be called once.')
    return
  }

  Vue = _Vue

  let observer = new Observer(url, options)
  Vue.prototype.$socket = observer.WebSocket

  Vue.mixin({
    created () {
      let sockets = this.$options['sockets']

      this.$options.sockets = new Proxy({}, {
        set (target, key, value) {
          Emitter.addListener(key, value, this)
          target[key] = value
          return true
        },
        deleteProperty (target, key) {
          Emitter.removeListener(key, this.$options.sockets[key], this)
          delete target.key
          return true
        }
      })

      if (sockets) {
        Object.keys(sockets).forEach(key => {
          this.$options.sockets[key] = sockets[key]
        })
      }
    },
    beforeDestroy () {
      let sockets = this.$options['sockets']

      if (sockets) {
        Object.keys(sockets).forEach(key => {
          delete this.$options.sockets[key]
        })
      }
    }
  })
}

const setup = (_url, _options = {}) => {
  if (!_url) { throw new Error('[json-pure] the url cannot be empty') }

  url = _url
  options = _options
}

export default {
  install,
  setup,
  version: '__VERSION__'
}
