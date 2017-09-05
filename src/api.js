export default class {
  constructor (socket) {
    this.socket = socket
  }

  create (dataType, requestMap) {
    this.socket.sendObj({
      action_str: 'create',
      data_type: dataType,
      request_map: requestMap
    })
  }

  retrieve (dataType, requestMap) {
    this.socket.sendObj({
      action_str: 'retrieve',
      data_type: dataType,
      request_map: requestMap
    })
  }

  update (dataType, requestMap) {
    this.socket.sendObj({
      action_str: 'update',
      data_type: dataType,
      request_map: requestMap
    })
  }

  delete (dataType, requestMap) {
    this.socket.sendObj({
      action_str: 'delete',
      data_type: dataType,
      request_map: requestMap
    })
  }

  flush (dataType, requestMap) {
    this.socket.sendObj({
      action_str: 'flush',
      data_type: dataType,
      request_map: requestMap
    })
  }
}
