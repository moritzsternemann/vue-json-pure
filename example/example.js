VueJsonPure.setup('ws://localhost:8080', { format: 'json', autoPong: true })

Vue.use(VueJsonPure)

const app = new Vue({
  data () {
    return {
      helloWorld: 'Hello World!'
    }
  },
  render (h) {
    return h('div', this.helloWorld)
  },
  created () {
    this.$options.sockets.onopen = this.onWebsocketOpen
    this.$options.sockets.onmessage = this.onWebsocketMessage
    this.$options.api.retrieved = this.onRetrieved
  },
  methods: {
    onWebsocketOpen (data) {
      console.log('websocket openend')
      this.$api.retrieve('currentUser')
    },
    onWebsocketMessage (message) {
      console.log('websocket message', message)
    },
    onRetrieved (data) {
      console.log('retrieved', data)
    }
  }
})

app.$mount('#app')
