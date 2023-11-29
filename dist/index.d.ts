declare class GWsClient {
    checkConnectionJSONObj: {
        type: string;
        data: {};
    };
    checkConnectionJSONOStr: string;
    selectedParamGroupIndex: number;
    wsStatus: number;
    wsDisconnected: number;
    wsConnecting: number;
    wsConnected: number;
    wsConnectingTimer: number;
    wsConnectingTimeOut: number;
    wsSendConnectionMsgTimer: number;
    wsSendConnectionMsgTimeOut: number;
    wsResponseWaitingTimer: number;
    wsResponseWaitingTimeOut: number;
    responseWaiting: number;
    requestId: number;
    serverIp: string;
    ws: WebSocket | null;
    connectionListener: (() => void) | undefined;
    disconnectionListener: (() => void) | undefined;
    msgListener: ((message: any) => void) | undefined;
    connectInterval: ReturnType<typeof setTimeout> | null;
    constructor(serverIp: string);
    connect: () => void;
    connectionCheckTimerFunc: () => void;
    connectWebSocket: () => void;
    disconnect: () => void;
    addConnectionListener: (connectionListener: () => void) => void;
    addDisconnectionListener: (disconnectionListener: () => void) => void;
    addMsgListener: <T>(msgListener: (message: T) => void) => void;
    send: <T>(message: T) => void;
    formatOutput: (data: any) => any;
}

export { GWsClient as default };
