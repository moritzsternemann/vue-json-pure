/**
 * vue-json-pure v1.0.0
 * (c) 2017 Moritz Sternemann
 * @license MIT
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.VueJsonPure = factory());
}(this, (function () { 'use strict';

var Emitter = function Emitter () {
  this.listeners = new Map();
};

Emitter.prototype.addListener = function addListener (label, callback, vm) {
  if (typeof callback !== 'function') {
    return false
  }

  this.listeners.has(label) || this.listeners.set(label, []);
  this.listeners.get(label).push({ callback: callback, vm: vm });
  return true
};

Emitter.prototype.removeListener = function removeListener (label, callback, vm) {
  var listeners = this.listeners.get(label);
  var index;

  if (listeners && listeners.length) {
    index = listeners.reduce(function (i, listener, index) {
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
};

Emitter.prototype.emit = function emit (label, event) {
  var listeners = this.listeners.get(label);

  if (listeners && listeners.length) {
    var next = true;
    var listener = null;
    for (var i = 0; i < listeners.length; i++) {
      if (next !== true) {
        break
      }

      next = false;
      listener = listeners[i];
      listener.callback.call(listener.vm, event, function () {
        next = true;
      });
    }
    return true
  }
  return false
};

var Emitter$1 = new Emitter();

var Observer = (function () {
  function anonymous (connectionUrl, options) {
  if ( options === void 0 ) options = {};

    this.format = options.format && options.format.toLowerCase();
    this.connect(connectionUrl, options);
    if (options.store) { this.store = options.store; }
    this.onEvent();
  }

  anonymous.prototype.connect = function connect (connectionUrl, options) {
    var this$1 = this;
    if ( options === void 0 ) options = {};

    var protocol = options.protocol || '';
    this.WebSocket = options.WebSocket || (protocol === '' ? new WebSocket(connectionUrl) : new WebSocket(connectionUrl, protocol));
    if (this.format === 'json') {
      if (!('sendObj' in this.WebSocket)) {
        this.WebSocket.sendObj = function (object) { return this$1.WebSocket.send(JSON.stringify(object)); };
      }
    }
  };

  anonymous.prototype.onEvent = function onEvent () {
    var this$1 = this;

    ['onmessage', 'onclose', 'onerror', 'onopen'].forEach(function (eventType) {
      this$1.WebSocket[eventType] = function (event) {
        Emitter$1.emit(eventType, event);
        if (this$1.store) { this$1.passToStore('SOCKET_' + eventType, event); }
      };
    });
  };

  anonymous.prototype.passToStore = function passToStore (eventName, event) {
    if (!eventName.startsWith('SOCKET_')) { return }
    var method = 'commit';
    var target = eventName.toUpperCase();
    var msg = event;
    if (this.format === 'json' && event.data) {
      msg = JSON.parse(event.data);
    }
    this.store[method](target, msg);
  };

  return anonymous;
}());

var warn = function (message) {
  console.warn(("[json-pure] " + message));
};

var Vue;

var url$1;
var options$1;

var install$1 = function (_Vue) {
  if (Vue) {
    warn('already installed, Vue.use(VueJsonPure) should only be called once.');
    return
  }

  Vue = _Vue;

  var observer = new Observer(url$1, options$1);
  Vue.prototype.$socket = observer.WebSocket;

  Vue.mixin({
    created: function created () {
      var this$1 = this;

      var sockets = this.$options['sockets'];

      this.$options.sockets = new Proxy({}, {
        set: function set (target, key, value) {
          Emitter$1.addListener(key, value, this);
          target[key] = value;
          return true
        },
        deleteProperty: function deleteProperty (target, key) {
          Emitter$1.removeListener(key, this.$options.sockets[key], this);
          delete target.key;
          return true
        }
      });

      if (sockets) {
        Object.keys(sockets).forEach(function (key) {
          this$1.$options.sockets[key] = sockets[key];
        });
      }
    },
    beforeDestroy: function beforeDestroy () {
      var this$1 = this;

      var sockets = this.$options['sockets'];

      if (sockets) {
        Object.keys(sockets).forEach(function (key) {
          delete this$1.$options.sockets[key];
        });
      }
    }
  });
};

var setup$1 = function (_url, _options) {
  if ( _options === void 0 ) _options = {};

  if (!_url) { throw new Error('[json-pure] the url cannot be empty') }

  url$1 = _url;
  options$1 = _options;
};

var VueNativeWebsocket = {
  install: install$1,
  setup: setup$1,
  version: '1.0.0'
};

var API = (function () {
  function anonymous (socket) {
    this.socket = socket;
  }

  anonymous.prototype.create = function create (dataType, requestMap) {
    this.socket.sendObj({
      action_str: 'create',
      data_type: dataType,
      request_map: requestMap
    });
  };

  anonymous.prototype.retrieve = function retrieve (dataType, requestMap) {
    this.socket.sendObj({
      action_str: 'retrieve',
      data_type: dataType,
      request_map: requestMap
    });
  };

  anonymous.prototype.update = function update (dataType, requestMap) {
    this.socket.sendObj({
      action_str: 'update',
      data_type: dataType,
      request_map: requestMap
    });
  };

  anonymous.prototype.delete = function delete$1 (dataType, requestMap) {
    this.socket.sendObj({
      action_str: 'delete',
      data_type: dataType,
      request_map: requestMap
    });
  };

  anonymous.prototype.flush = function flush (dataType, requestMap) {
    this.socket.sendObj({
      action_str: 'flush',
      data_type: dataType,
      request_map: requestMap
    });
  };

  return anonymous;
}());

var url;
var options;

var install = function (Vue) {
  if (!url || !options) { throw new Error('[json-pure] you have to call setup() before Vue.use()') }

  VueNativeWebsocket.setup(url, options);
  VueNativeWebsocket.install(Vue, url, options);

  Vue.prototype.$api = new API(Vue.prototype.$socket);

  Vue.mixin({
    created: function created () {
      var this$1 = this;

      this.$options.sockets.onmessage = this.websocketOnMessage;

      var api = this.$options['api'];
      this.$options.api = new Proxy({}, {
        set: function set (target, key, value) {
          Emitter$1.addListener(key, value, this);
          target[key] = value;
          return true
        },
        deleteProperty: function deleteProperty (target, key) {
          Emitter$1.removeListener(key, this.$options.api[key], this);
          delete target.key;
          return true
        }
      });

      if (api) {
        Object.keys(api).forEach(function (key) {
          this$1.$options.api[key] = api[key];
        });
      }
    },
    beforeDestroy: function beforeDestroy () {
      var this$1 = this;

      var api = this.$options['api'];
      if (api) {
        Object.keys(api).forEach(function (key) {
          delete this$1.$options.api[key];
        });
      }
    },
    methods: {
      websocketOnMessage: function websocketOnMessage (event, next) {
        var data = JSON.parse(event.data);
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

var setup = function (_url, _options) {
  if ( _options === void 0 ) _options = {};

  if (!_url) { throw new Error('[json-pure] the url cannot be empty') }

  url = _url;
  options = _options;
};

var handleJsonPure = function (event, data, next) {
  var action = data.action_str.split('_');
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

var passToStore = function (eventName, event) {
  if (!eventName.startsWith('API_')) { return }
  var method = 'commit';
  var target = eventName.toUpperCase();
  var msg = event;
  if (options.format === 'json' && event) {
    msg = JSON.parse(event);
  }
  options.store[method](target, msg);
};

var index = {
  install: install,
  setup: setup,

  version: '1.0.0'
};

return index;

})));
