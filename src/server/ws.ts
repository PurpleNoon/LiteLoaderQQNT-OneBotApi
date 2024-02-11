import { getConfigUtil, log } from "../common/utils"
import * as Connection from "nodejs-websocket/Connection"
import { createPongFrame } from "nodejs-websocket/frame"
import * as ws from "nodejs-websocket"
import { EventEmitter } from 'events'
import { selfInfo } from '../common/data'
import { handleAction } from "../onebot11/actions"

// hack, fix ping
const oriProcessFrame = Connection.prototype.processFrame
Connection.prototype.processFrame = function (fin, opcode, payload) {
    if (opcode === 9) {
        // Ping frame
        if (this.readyState === this.OPEN) {
            this.socket.write(createPongFrame(payload, !this.server))
        }
        return true
    }
    return oriProcessFrame.call(this, fin, opcode, payload)
}

// 隔离 ws 实现，为可能的重构做准备，懒得测试其他 ws 的包了
// （毕竟 nodejs-websocket 还是太旧了，十年前的东西了）
// 目前是为 NoneBot-Adapter-OneBot 构建的，其他的没测试过
class WebsocketDriver {
    connection: Connection & EventEmitter

    get connected(): boolean {
        if (!this.connection) {
            return false
        }
        return this.connection.readyState === this.connection.OPEN
    }

    getOptions() {
        return {
            keepAlive: true,
            extraHeaders: {
                'X-Self-ID': String(selfInfo.user_id),
                'Content-Type': 'application/json',
                'X-Client-Role': 'Universal', // Universal Event API
                // 'host': `127.0.0.1:${serverPort}`
            }
        }
    }

    onConnect() { }

    async connect() {
        // 目前做的是反向 ws，什么，你问正向 ws？嗝，懒得做了，不过感觉能做在这里
        const {
            wsReverseAddress = 'ws://127.0.0.1:8080/onebot/v11/',
        } = getConfigUtil().getConfig()
        if (!wsReverseAddress) {
            return
        }
        const connection = ws.connect(
            wsReverseAddress,
            this.getOptions(),
            () => this.onConnect()
        ) as Connection & EventEmitter // 继承了 EventEmitter，但声明里没有，这里强转一下
        connection.on("text", (data) => this.onMessage(data))
        connection.on("close", (code, reason) => this.onClose(code, reason))
        connection.on("error", (err, reason) => this.onError(err, reason))
        this.connection = connection
    }

    async init() {
        console.log(`ws init: timestamp=${Date.now()}`)
        this.connect()
    }

    async reconnect() {
        const {
            wsReconnectTime = 1000 * 3,
        } = getConfigUtil().getConfig()
        setTimeout(() => {
            console.log(`ws reconnect: timestamp=${Date.now()}`)
            this.connect()
        }, wsReconnectTime)
    }

    async onClose(code: number, reason: string) {
        console.log(`Websocket connection closed: code=${code}, reason=${reason}, timestamp=${Date.now()}`)
        this.connection.removeAllListeners()
        this.reconnect()
    }

    async onError(err, reason) {
        log(`Websocket error: err=${err}, reason=${reason}`)
    }

    async send<T>(data: T) {
        if (!this.connected) {
            return
        }
        this.connection.send(JSON.stringify(data))
    }

    async onMessage(data: Buffer) {
        try {
            const dataString = data.toString('utf8')
            console.log('Receive data: ', dataString)
            const jsonData = JSON.parse(dataString)
            const resData = await handleAction(jsonData)
            this.connection.send(JSON.stringify(resData))
        } catch (error) {
            log(error.message)
        }
    }

    async updateConfig() { }
}

export default WebsocketDriver
