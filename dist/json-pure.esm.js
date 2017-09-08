/**
 * vue-json-pure v1.0.0
 * (c) 2017 Moritz Sternemann
 * @license MIT
 */
var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};



function unwrapExports (x) {
	return x && x.__esModule ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var build = createCommonjsModule(function (module, exports) {
!function(e,t){module.exports=t();}(commonjsGlobal,function(){return function(e){function t(o){if(n[o])return n[o].exports;var r=n[o]={i:o,l:!1,exports:{}};return e[o].call(r.exports,r,r.exports,t),r.l=!0,r.exports}var n={};return t.m=e,t.c=n,t.d=function(e,n,o){t.o(e,n)||Object.defineProperty(e,n,{configurable:!1,enumerable:!0,get:o});},t.n=function(e){var n=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(n,"a",n),n},t.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},t.p="",t(t.s=1)}([function(e,t,n){"use strict";function o(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(t,"__esModule",{value:!0});var r=function(){function e(e,t){for(var n=0;n<t.length;n++){var o=t[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o);}}return function(t,n,o){return n&&e(t.prototype,n),o&&e(t,o),t}}(),i=function(){function e(){o(this,e),this.listeners=new Map;}return r(e,[{key:"addListener",value:function(e,t,n){return"function"==typeof t&&(this.listeners.has(e)||this.listeners.set(e,[]),this.listeners.get(e).push({callback:t,vm:n}),!0)}},{key:"removeListener",value:function(e,t,n){var o=this.listeners.get(e),r=void 0;return!!(o&&o.length&&(r=o.reduce(function(e,o,r){return"function"==typeof o.callback&&o.callback===t&&o.vm===n&&(e=r),e},-1))>-1)&&(o.splice(r,1),this.listeners.set(e,o),!0)}},{key:"emit",value:function(e){for(var t=arguments.length,n=Array(t>1?t-1:0),o=1;o<t;o++)n[o-1]=arguments[o];var r=this.listeners.get(e);return!(!r||!r.length)&&(r.forEach(function(e){var t;(t=e.callback).call.apply(t,[e.vm].concat(n));}),!0)}}]),e}();t.default=new i;},function(e,t,n){e.exports=n(2);},function(e,t,n){"use strict";function o(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var r=n(3),i=o(r),s=n(0),c=o(s);t.default={install:function(e,t){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};if(!t)throw new Error("[vue-native-socket] cannot locate connection");var o=new i.default(t,n);e.prototype.$socket=o.WebSocket,e.mixin({created:function(){var e=this,t=this.$options.sockets;this.$options.sockets=new Proxy({},{set:function(e,t,n){return c.default.addListener(t,n,this),e[t]=n,!0},deleteProperty:function(e,t){return c.default.removeListener(t,this.$options.sockets[t],this),delete e.key,!0}}),t&&Object.keys(t).forEach(function(n){e.$options.sockets[n]=t[n];});},beforeDestroy:function(){var e=this,t=this.$options.sockets;t&&Object.keys(t).forEach(function(t){delete e.$options.sockets[t];});}});}};},function(e,t,n){"use strict";function o(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(t,"__esModule",{value:!0});var r=function(){function e(e,t){for(var n=0;n<t.length;n++){var o=t[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o);}}return function(t,n,o){return n&&e(t.prototype,n),o&&e(t,o),t}}(),i=n(0),s=function(e){return e&&e.__esModule?e:{default:e}}(i),c=function(){function e(t){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};o(this,e),this.format=n.format&&n.format.toLowerCase(),this.connect(t,n),n.store&&(this.store=n.store),this.onEvent();}return r(e,[{key:"connect",value:function(e){var t=this,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},o=n.protocol||"";this.WebSocket=n.WebSocket||(""===o?new WebSocket(e):new WebSocket(e,o)),"json"===this.format&&("sendObj"in this.WebSocket||(this.WebSocket.sendObj=function(e){return t.WebSocket.send(JSON.stringify(e))}));}},{key:"onEvent",value:function(){var e=this;["onmessage","onclose","onerror","onopen"].forEach(function(t){e.WebSocket[t]=function(n){s.default.emit(t,n),e.store&&e.passToStore("SOCKET_"+t,n);};});}},{key:"passToStore",value:function(e,t){if(e.startsWith("SOCKET_")){var n="commit",o=e.toUpperCase(),r=t;"json"===this.format&&t.data&&(r=JSON.parse(t.data),r.mutation?o=[r.namespace||"",r.mutation].filter(function(e){return!!e}).join("/"):r.action&&(n="dispatch",o=r.action)),this.store[n](o,r);}}}]),e}();t.default=c;}])});
});

var VueNativeWebsocket = unwrapExports(build);

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

class API {
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
}

const warn = (message) => {
  console.warn(`[json-pure] ${message}`);
};

let _Vue;
let _options;
let _api;

let _created;

const install = (Vue, options) => {
  if (_Vue) {
    warn('already installed, Vue.use(VueJsonPure) should only be called once.');
    return
  }
  _Vue = Vue;

  if (!options || !options.url) {
    throw new Error('[json-pure] please provide all necessary configuration data')
  }
  _options = options;

  VueNativeWebsocket.install(Vue, options.url, options);

  Vue.prototype.$api = new API(Vue.prototype.$socket);
  _api = Vue.prototype.$api;

  Vue.mixin({
    created () {
      if (_created) { return }

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

      _created = true;
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
      websocketOnMessage (event) {
        let data = JSON.parse(event.data);
        if (options.autoPong === true && data.action_str === 'PING') {
          this.$socket.sendObj({ action_str: 'PONG' });
          return // don't call next() if responded to pong
        }

        handleJsonPure(event, data);
      }
    }
  });
};

const handleJsonPure = (event, data) => {
  let action = data.action_str.split('_');
  if (action.length === 2 && action[1] === 'FAIL') {
    Emitter$1.emit('fail', { action_str: action[0] });
    if (_options.store) {
      passToStore('API_FAIL', Object.assign(data, { action_str: action[0] }));
    }
  } else {
    Emitter$1.emit(action[0], data);
    if (_options.store) {
      passToStore('API_' + action[0], data);
    }
  }
};

const passToStore = (eventName, event) => {
  if (!eventName.startsWith('API_')) { return }
  let method = 'commit';
  let target = eventName.toUpperCase();
  let msg = event;
  if (_options.format === 'json' && event && typeof event === 'string') {
    msg = JSON.parse(event);
  }
  _options.store[method](target, msg);
};

var index = {
  install,
  get api () {
    return _api
  },

  version: '1.0.0'
};

export default index;
