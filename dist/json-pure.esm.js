/**
 * vue-json-pure v1.0.0
 * (c) 2017 Moritz Sternemann
 * @license MIT
 */
class Emitter {
  constructor () {
    this.listeners = new Map();
  }

  addListener (label, callback, vm) {
    if (typeof callback !== 'function') {
      return false
    }

    this.listeners.has(label) || this.listeners.set(label, []);
    this.listeners.get(label).push({ callback, vm });
    return true
  }

  removeListener (label, callback, vm) {
    let listeners = this.listeners.get(label);
    let index;

    if (listeners && listeners.length) {
      index = listeners.reduce((i, listener, index) => {
        if (typeof listener.callback === 'function' && listener.callback === callback && listener.vm === vm) {
          i = index;
        }
        return i
      }, -1);

      if (index > -1) {
        listeners.splice(index, 1);
        this.listeners.set(label, listeners);
        return true
      }
    }
    return false
  }

  emit (label, event) {
    let listeners = this.listeners.get(label);

    if (listeners && listeners.length) {
      var next = true;
      var listener = null;
      for (var i = 0; i < listeners.length; i++) {
        if (next !== true) {
          break
        }

        next = false;
        listener = listeners[i];
        listener.callback.call(listener.vm, event, () => {
          next = true;
        });
      }
      return true
    }
    return false
  }
}

var Emitter$1 = new Emitter();

var Observer = class {
  constructor (connectionUrl, options = {}) {
    this.format = options.format && options.format.toLowerCase();
    this.connect(connectionUrl, options);
    if (options.store) { this.store = options.store; }
    this.onEvent();
  }

  connect (connectionUrl, options = {}) {
    let protocol = options.protocol || '';
    this.WebSocket = options.WebSocket || (protocol === '' ? new WebSocket(connectionUrl) : new WebSocket(connectionUrl, protocol));
    if (this.format === 'json') {
      if (!('sendObj' in this.WebSocket)) {
        this.WebSocket.sendObj = (object) => this.WebSocket.send(JSON.stringify(object));
      }
    }
  }

  onEvent () {
    ['onmessage', 'onclose', 'onerror', 'onopen'].forEach((eventType) => {
      this.WebSocket[eventType] = (event) => {
        Emitter$1.emit(eventType, event);
        if (this.store) { this.passToStore('SOCKET_' + eventType, event); }
      };
    });
  }

  passToStore (eventName, event) {
    if (!eventName.startsWith('SOCKET_')) { return }
    let method = 'commit';
    let target = eventName.toUpperCase();
    let msg = event;
    if (this.format === 'json' && event.data) {
      msg = JSON.parse(event.data);
    }
    this.store[method](target, msg);
  }
};

const warn = (message) => {
  console.warn(`[json-pure] ${message}`);
};

let Vue;

let url$1;
let options$1;

const install$1 = (_Vue) => {
  if (Vue) {
    warn('already installed, Vue.use(VueJsonPure) should only be called once.');
    return
  }

  Vue = _Vue;

  let observer = new Observer(url$1, options$1);
  Vue.prototype.$socket = observer.WebSocket;

  Vue.mixin({
    created () {
      let sockets = this.$options['sockets'];

      this.$options.sockets = new Proxy({}, {
        set (target, key, value) {
          Emitter$1.addListener(key, value, this);
          target[key] = value;
          return true
        },
        deleteProperty (target, key) {
          Emitter$1.removeListener(key, this.$options.sockets[key], this);
          delete target.key;
          return true
        }
      });

      if (sockets) {
        Object.keys(sockets).forEach(key => {
          this.$options.sockets[key] = sockets[key];
        });
      }
    },
    beforeDestroy () {
      let sockets = this.$options['sockets'];

      if (sockets) {
        Object.keys(sockets).forEach(key => {
          delete this.$options.sockets[key];
        });
      }
    }
  });
};

const setup$1 = (_url, _options = {}) => {
  if (!_url) { throw new Error('[json-pure] the url cannot be empty') }

  url$1 = _url;
  options$1 = _options;
};

var VueNativeWebsocket = {
  install: install$1,
  setup: setup$1,
  version: '1.0.0'
};

var API = class {
  constructor (socket) {
    this.socket = socket;
  }

  create (dataType, requestMap) {
    this.socket.sendObj({
      action_str: 'create',
      data_type: dataType,
      request_map: requestMap
    });
  }

  retrieve (dataType, requestMap) {
    this.socket.sendObj({
      action_str: 'retrieve',
      data_type: dataType,
      request_map: requestMap
    });
  }

  update (dataType, requestMap) {
    this.socket.sendObj({
      action_str: 'update',
      data_type: dataType,
      request_map: requestMap
    });
  }

  delete (dataType, requestMap) {
    this.socket.sendObj({
      action_str: 'delete',
      data_type: dataType,
      request_map: requestMap
    });
  }

  flush (dataType, requestMap) {
    this.socket.sendObj({
      action_str: 'flush',
      data_type: dataType,
      request_map: requestMap
    });
  }
};

let url;
let options;

const install = (Vue) => {
  if (!url || !options) { throw new Error('[json-pure] you have to call setup() before Vue.use()') }

  VueNativeWebsocket.setup(url, options);
  VueNativeWebsocket.install(Vue, url, options);

  Vue.prototype.$api = new API(Vue.prototype.$socket);

  Vue.mixin({
    created () {
      this.$options.sockets.onmessage = this.websocketOnMessage;

      let api = this.$options['api'];
      this.$options.api = new Proxy({}, {
        set (target, key, value) {
          Emitter$1.addListener(key, value, this);
          target[key] = value;
          return true
        },
        deleteProperty (target, key) {
          Emitter$1.removeListener(key, this.$options.api[key], this);
          delete target.key;
          return true
        }
      });

      if (api) {
        Object.keys(api).forEach(key => {
          this.$options.api[key] = api[key];
        });
      }
    },
    beforeDestroy () {
      let api = this.$options['api'];
      if (api) {
        Object.keys(api).forEach(key => {
          delete this.$options.api[key];
        });
      }
    },
    methods: {
      websocketOnMessage (event, next) {
        let data = JSON.parse(event.data);
        if (options.autoPong === true && data.action_str === 'PING') {
          this.$socket.sendObj({ action_str: 'PONG' });
          return // don't call next() if responded to pong
        }

        handleJsonPure(event, data, next);

        next();
      }
    }
  });
};

const setup = (_url, _options = {}) => {
  if (!_url) { throw new Error('[json-pure] the url cannot be empty') }

  url = _url;
  options = _options;
};

const handleJsonPure = (event, data, next) => {
  let action = data.action_str.split('_');
  if (action.length === 2 && action[1] === 'FAIL') {
    Emitter$1.emit('fail', { action_str: action[0] });
    if (options.store) {
      passToStore('API_FAIL', { action_str: action[0] });
    }
  } else {
    Emitter$1.emit(action[0], data);
    if (options.store) {
      passToStore('API_' + action[0], data);
    }
  }
  next();
};

const passToStore = (eventName, event) => {
  if (!eventName.startsWith('API_')) { return }
  let method = 'commit';
  let target = eventName.toUpperCase();
  let msg = event;
  if (options.format === 'json' && event) {
    msg = JSON.parse(event);
  }
  options.store[method](target, msg);
};

var index = {
  install,
  setup,

  version: '1.0.0'
};

export default index;
