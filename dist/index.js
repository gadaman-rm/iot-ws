"use strict";
// WebSocket.ts
Object.defineProperty(exports, "__esModule", { value: true });
class GWsClient {
    constructor(serverIp) {
        this.checkConnectionJSONObj = {
            type: "checkConnection",
            data: {},
        };
        this.checkConnectionJSONOStr = JSON.stringify(this.checkConnectionJSONObj);
        this.selectedParamGroupIndex = 0;
        this.wsStatus = 0;
        this.wsDisconnected = 0;
        this.wsConnecting = 1;
        this.wsConnected = 2;
        this.wsConnectingTimer = 0;
        this.wsConnectingTimeOut = 30;
        this.wsSendConnectionMsgTimer = 0;
        this.wsSendConnectionMsgTimeOut = 30;
        this.wsResponseWaitingTimer = 0;
        this.wsResponseWaitingTimeOut = 30;
        this.responseWaiting = 0;
        this.requestId = 0;
        this.ws = null;
        this.connectInterval = null;
        this.serverIp = serverIp;
    }
    connect() {
        if (this.wsStatus !== this.wsConnected &&
            this.wsStatus !== this.wsConnecting) {
            if (this.ws != null) {
                try {
                    this.ws.close();
                }
                catch (e) {
                    console.warn(e);
                }
            }
            this.ws = null;
            this.connectWebSocket();
            this.wsStatus = this.wsConnecting;
        }
        this.connectInterval = setInterval(this.connectionCheckTimerFunc.bind(this), 1000);
    }
    connectionCheckTimerFunc() {
        var _a;
        if (this.wsStatus === this.wsConnecting) {
            if (++this.wsConnectingTimer === this.wsConnectingTimeOut) {
                this.wsConnectingTimer = 0;
                this.wsStatus = this.wsDisconnected;
            }
        }
        else {
            this.wsConnectingTimer = 0;
        }
        if (this.wsStatus === this.wsConnected) {
            if (this.responseWaiting === 0) {
                //this.ws?.send(`${this.wsSendConnectionMsgTimer}`);
                if (++this.wsSendConnectionMsgTimer === this.wsSendConnectionMsgTimeOut) {
                    this.wsSendConnectionMsgTimer = 0;
                    this.responseWaiting = 1;
                    try {
                        (_a = this.ws) === null || _a === void 0 ? void 0 : _a.send(this.checkConnectionJSONOStr);
                    }
                    catch (e) {
                        console.error(e);
                    }
                }
            }
            else if (this.responseWaiting === 1) {
                //this.ws?.send(`${this.wsResponseWaitingTimer}`);
                if (++this.wsResponseWaitingTimer === this.wsResponseWaitingTimeOut) {
                    this.responseWaiting = 0;
                    this.wsResponseWaitingTimer = 0;
                    this.wsStatus = this.wsDisconnected;
                }
            }
        }
        else {
            this.wsSendConnectionMsgTimer = 0;
            this.wsResponseWaitingTimer = 0;
            this.responseWaiting = 0;
        }
        if (this.wsStatus !== this.wsConnected &&
            this.wsStatus !== this.wsConnecting) {
            if (this.ws != null) {
                try {
                    this.ws.close();
                }
                catch (e) {
                    console.warn(e);
                }
            }
            this.ws = null;
            this.connectWebSocket();
            this.wsStatus = this.wsConnecting;
        }
    }
    connectWebSocket() {
        if (this.ws == null) {
            this.ws = new WebSocket(this.serverIp);
            this.ws.onopen = () => {
                this.wsStatus = this.wsConnected;
                if (this.connectionListener)
                    this.connectionListener();
            };
            this.ws.onmessage = (evt) => {
                this.responseWaiting = 0;
                this.wsResponseWaitingTimer = 0;
                this.wsSendConnectionMsgTimer = 0;
                if (this.msgListener)
                    this.msgListener(evt.data);
            };
            this.ws.onclose = () => {
                this.wsStatus = this.wsDisconnected;
                if (this.disconnectionListener)
                    this.disconnectionListener();
            };
        }
    }
    disconnect() {
        if (this.ws) {
            this.ws.close();
        }
        if (this.connectInterval) {
            clearInterval(this.connectInterval);
            this.connectInterval = null;
        }
    }
    addConnectionListener(connectionListener) {
        this.connectionListener = connectionListener;
    }
    addDisconnectionListener(disconnectionListener) {
        this.disconnectionListener = disconnectionListener;
    }
    addMsgListener(msgListener) {
        this.msgListener = msgListener;
    }
    send(message) {
        if (this.ws != null && this.wsStatus === this.wsConnected) {
            this.ws.send(message);
        }
    }
    isJson(str) {
        try {
            JSON.parse(str);
        }
        catch (e) {
            return false;
        }
        return true;
    }
}
exports.default = GWsClient;
