class GWsClient {
  checkConnectionJSONObj = {
    type: "checkConnection",
    data: {},
  }

  checkConnectionJSONOStr: string = JSON.stringify(this.checkConnectionJSONObj)

  selectedParamGroupIndex: number = 0

  wsStatus: number = 0
  wsDisconnected: number = 0
  wsConnecting: number = 1
  wsConnected: number = 2

  wsConnectingTimer: number = 0
  wsConnectingTimeOut: number = 30

  wsSendConnectionMsgTimer: number = 0
  wsSendConnectionMsgTimeOut: number = 30

  wsResponseWaitingTimer: number = 0
  wsResponseWaitingTimeOut: number = 30

  responseWaiting: number = 0

  requestId: number = 0
  serverIp: string
  ws: WebSocket | null = null
  connectionListener: (() => void) | undefined
  disconnectionListener: (() => void) | undefined
  msgListener: ((message: any) => void) | undefined

  connectInterval: ReturnType<typeof setTimeout> | null = null

  constructor(serverIp: string) {
    this.serverIp = serverIp
  }

  connect = () => {
    if (
      this.wsStatus !== this.wsConnected &&
      this.wsStatus !== this.wsConnecting
    ) {
      if (this.ws != null) {
        try {
          this.ws.close()
        } catch (e) {
          console.warn(e)
        }
      }
      this.ws = null
      this.connectWebSocket()
      this.wsStatus = this.wsConnecting
    }
    this.connectInterval = setInterval(
      this.connectionCheckTimerFunc.bind(this),
      1000
    )
  }

  connectionCheckTimerFunc = () => {
    if (this.wsStatus === this.wsConnecting) {
      if (++this.wsConnectingTimer === this.wsConnectingTimeOut) {
        this.wsConnectingTimer = 0
        this.wsStatus = this.wsDisconnected
      }
    } else {
      this.wsConnectingTimer = 0
    }

    if (this.wsStatus === this.wsConnected) {
      if (this.responseWaiting === 0) {
        //this.ws?.send(`${this.wsSendConnectionMsgTimer}`)
        if (
          ++this.wsSendConnectionMsgTimer === this.wsSendConnectionMsgTimeOut
        ) {
          this.wsSendConnectionMsgTimer = 0
          this.responseWaiting = 1
          try {
            this.ws?.send(this.checkConnectionJSONOStr)
          } catch (e) {
            console.error(e)
          }
        }
      } else if (this.responseWaiting === 1) {
        //this.ws?.send(`${this.wsResponseWaitingTimer}`)
        if (++this.wsResponseWaitingTimer === this.wsResponseWaitingTimeOut) {
          this.responseWaiting = 0
          this.wsResponseWaitingTimer = 0
          this.wsStatus = this.wsDisconnected
        }
      }
    } else {
      this.wsSendConnectionMsgTimer = 0
      this.wsResponseWaitingTimer = 0
      this.responseWaiting = 0
    }

    if (
      this.wsStatus !== this.wsConnected &&
      this.wsStatus !== this.wsConnecting
    ) {
      if (this.ws != null) {
        try {
          this.ws.close()
        } catch (e) {
          console.warn(e)
        }
      }
      this.ws = null
      this.connectWebSocket()
      this.wsStatus = this.wsConnecting
    }
  }

  connectWebSocket = () => {
    if (this.ws == null) {
      this.ws = new WebSocket(this.serverIp)
      this.ws.onopen = () => {
        this.wsStatus = this.wsConnected
        if (this.connectionListener) this.connectionListener()
      }
      this.ws.onmessage = (evt) => {
        this.responseWaiting = 0
        this.wsResponseWaitingTimer = 0
        this.wsSendConnectionMsgTimer = 0
        if (this.msgListener) this.msgListener(this.formatOutput(evt.data))
      }
      this.ws.onclose = () => {
        this.wsStatus = this.wsDisconnected
        if (this.disconnectionListener) this.disconnectionListener()
      }
    }
  }

  disconnect = () => {
    if (this.ws) {
      this.ws.close()
    }
    if (this.connectInterval) {
      clearInterval(this.connectInterval)
      this.connectInterval = null
    }
  }

  addConnectionListener = (connectionListener: () => void) => {
    this.connectionListener = connectionListener
  }

  addDisconnectionListener = (disconnectionListener: () => void) => {
    this.disconnectionListener = disconnectionListener
  }

  addMsgListener = <T>(msgListener: (message: T) => void) => {
    this.msgListener = msgListener
  }

  send = <T>(message: T) => {
    if (this.ws != null && this.wsStatus === this.wsConnected) {
      this.ws.send(typeof message === "object" ? JSON.stringify(message) : message as any)
    }
  }

  formatOutput = (data: any) => {
    try {
      return JSON.parse(data)
    } catch (e) {
      return data
    }
  }
}

export default GWsClient
