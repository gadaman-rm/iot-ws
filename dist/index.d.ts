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
    msgListener: ((message: string) => void) | undefined;
    connectInterval: ReturnType<typeof setTimeout> | null;
    constructor(serverIp: string);
    connect(): void;
    connectionCheckTimerFunc(): void;
    connectWebSocket(): void;
    disconnect(): void;
    addConnectionListener(connectionListener: () => void): void;
    addDisconnectionListener(disconnectionListener: () => void): void;
    addMsgListener(msgListener: (message: string) => void): void;
    send(message: string): void;
    isJson(str: string): boolean;
}
export default GWsClient;
