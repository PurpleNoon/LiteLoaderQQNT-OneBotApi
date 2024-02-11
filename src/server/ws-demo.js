const Connection = require("nodejs-websocket/Connection")
const frame = require("nodejs-websocket/frame")
const ws = require("nodejs-websocket")
const net = require('net')
// const dayjs = require('dayjs')
// dayjs().format()

// hack, fix ping
const oriProcessFrame = Connection.prototype.processFrame
Connection.prototype.processFrame = function (fin, opcode, payload) {
    if (opcode === 9) {
        // console.log(`ping: ${dayjs().format('YYYY-MM-DD HH:mm:ss') }`)
        // Ping frame
        if (this.readyState === this.OPEN) {
            this.socket.write(frame.createPongFrame(payload, !this.server))
        }
        return true
    }
    return oriProcessFrame.call(this, fin, opcode, payload)
}





// const serverPort = 9090
// const server = net.createServer(function (socket) {
//     console.log('客户端与服务器端连接已经建立')

//     //接收客户端数据，并向客户端返回数据
//     socket.on('data', function (data) {
//         console.log('[server-data]', data.toString())  //data是buffer,必须转换
//         // socket.write('hello')  //服务端接收到客户端数据之后返回给客户端"hello"
//     })
//     socket.on('end', function () {
//         console.log('连接中断')
//     })
// })
// server.listen(serverPort, '127.0.0.1', function () {
//     address = server.address()
//     console.log(`Websocket listen in 127.0.0.1:${serverPort}`)

//     const connection = ws.connect("ws://127.0.0.1:8080/onebot/v11/ws/", {
//         keepAlive: true,
//         extraHeaders: {
//             'X-Self-ID': '2435658320',
//             'Content-Type': 'application/json',
//             'X-Client-Role': 'Universal', // Universal Event API
//             // 'host': `127.0.0.1:${serverPort}`
//         }
//     }, () => {
//         const content = require('./groupEvent.json')
//         connection.send(JSON.stringify(content))

//         connection.on("text", function (data) {
//             console.log('data: ')
//             data = JSON.parse(data.toString('utf8'))
//             console.log(JSON.stringify(data, null, 2))
//             const response = {
//                 "status": "ok",
//                 "retcode": 0,
//                 "echo": data.echo,
//                 "data": { message_id: '7327911062756138928' },
//             }

//             connection.send(JSON.stringify(response), () => {
//                 console.log('finished')
//             })
//             // connection.socket.end()
//         })
//         connection.on("close", function (code, reason) {
//             console.log("Connection closed: ", code, reason)
//         })
//     })
// })

// 应对 反向 ws OK
let start
const connection = ws.connect("ws://127.0.0.1:8080/onebot/v11/ws/", {
    keepAlive: true,
    extraHeaders: {
        'X-Self-ID': '2435658320',
        'Content-Type': 'application/json',
        'X-Client-Role': 'Universal', // Universal Event API
        // 'host': `127.0.0.1:${serverPort}`
    }
}, () => {
    start = Date.now()
    // console.log(`connect in ${dayjs().format('YYYY-MM-DD HH:mm:ss')}`)

    const content = require('./groupEvent.json')
    console.log('Send data: ')
    // console.log(JSON.stringify(content, null, 2))
    connection.send(JSON.stringify(content))

    connection.on("text", function (data) {
        console.log('Receive data: ')
        data = JSON.parse(data.toString('utf8'))
        // console.log(JSON.stringify(data, null, 2))
        const response = {
            "status": "ok",
            "retcode": 0,
            "echo": data.echo,
            "data": { message_id: '7327911062756138928' },
        }

        connection.send(JSON.stringify(response), () => {
            console.log('finished')
        })
    })
    connection.on("pong", function (data) {
        console.log("[pong]: ", data.toString())
    })
    connection.on("timeout", function () {
        console.log("[timeout]: ")
    })
    connection.socket.on("timeout", function () {
        console.log("[socket-timeout]: ")
    })
    connection.on("close", function (code, reason) {
        console.log("Connection closed: ", code, reason)
        console.log(`持续时间：${(Date.now() - start) / 1000}s`)
    })
    connection.on("error", function (err, reason) {
        console.error(err)
    })
})