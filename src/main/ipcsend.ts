import {ipcMain, webContents} from 'electron';
import {PostDataSendMsg} from "../common/types";
import {CHANNEL_RECALL_MSG, CHANNEL_SEND_MSG} from "../common/channels";
import {v4 as uuid4} from "uuid";
import {log} from "../common/utils";


import {OB11Return} from "../onebot11/types";

export function sendIPCMsg(channel: string, data: any) {
    let contents = webContents.getAllWebContents();
    for (const content of contents) {
        try {
            content.send(channel, data)
        } catch (e) {
            console.log("llonebot send ipc msg to render error:", e)
        }
    }
}

export interface SendIPCMsgSession<T> {
    id: string
    data: T
}

export function sendIPCMsgAsync<T, V>(
    channelTo: string,
    channelBack: string,
    data: T
) {
    return new Promise<V>((resolve) => {
        const onceSessionId = `${channelTo}____${uuid4()}`
        const handler = (event: any, result: SendIPCMsgSession<V>) => {
            if (result.id === onceSessionId) {
                resolve(result.data)
                ipcMain.off(channelBack, handler)
                return
            }
        }
        ipcMain.on(channelBack, handler)
        sendIPCMsg(channelTo, {
            id: onceSessionId,
            data,
        })
    })
}


export function sendIPCSendQQMsg(postData: PostDataSendMsg, handleSendResult: (data: OB11Return<any>) => void) {
    const onceSessionId = "llonebot_send_msg_" + uuid4();
    postData.ipc_uuid = onceSessionId;
    ipcMain.once(onceSessionId, (event: any, sendResult: OB11Return<any>) => {
        // log("llonebot send msg ipcMain.once:" + JSON.stringify(sendResult));
        try {
            handleSendResult(sendResult)
        } catch (e) {
            log("llonebot send msg ipcMain.once error:" + JSON.stringify(e))
        }
    })
    sendIPCMsg(CHANNEL_SEND_MSG, postData);
}

export function sendIPCSendQQMsgAsync(postData: PostDataSendMsg) {
    return new Promise<OB11Return<any>>((resolve) => {
        const onceSessionId = "llonebot_send_msg_" + uuid4();
        postData.ipc_uuid = onceSessionId;
        ipcMain.once(onceSessionId, (event: any, sendResult: OB11Return<any>) => {
            resolve(sendResult);
        })
        sendIPCMsg(CHANNEL_SEND_MSG, postData);
    })
}

export function sendIPCRecallQQMsg(message_id: string) {
    sendIPCMsg(CHANNEL_RECALL_MSG, { message_id: message_id });
}