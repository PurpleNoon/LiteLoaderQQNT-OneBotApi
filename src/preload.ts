// Electron 主进程 与 渲染进程 交互的桥梁

import {
    Config,
    Group,
    PostDataSendMsg,
    SelfInfo,
    User,
    MessageElement,
    RawMessage,
} from "./common/types";
import {
    CHANNEL_DOWNLOAD_FILE,
    CHANNEL_GET_CONFIG,
    CHANNEL_SET_SELF_INFO,
    CHANNEL_LOG,
    CHANNEL_POST_ONEBOT_DATA,
    CHANNEL_RECALL_MSG,
    CHANNEL_SEND_MSG,
    CHANNEL_SET_CONFIG,
    CHANNEL_START_HTTP_SERVER,
    CHANNEL_UPDATE_FRIENDS,
    CHANNEL_UPDATE_GROUPS,
    CHANNEL_DELETE_FILE,
    CHANNEL_GET_RUNNING_STATUS,
    CHANNEL_GET_HISTORY_MSG,
    CHANNEL_SEND_NEW_MESSAGE_TO_MAIN,
    CHANNEL_INSERT_MESSAGE_HISTORY,
    CHANNEL_HANDLE_SINGLE_MESSAGE,
    CHANNEL_BACK_SINGLE_MESSAGE,
} from "./common/channels";
import { OB11Return, OB11SendMsgReturn } from "./onebot11/types";
import {
    SendIPCMsgSession,
} from "./main/IPCSend";


const { contextBridge } = require("electron");
const { ipcRenderer } = require('electron');

const llonebot = {
    postData: (data: any) => {
        ipcRenderer.send(CHANNEL_POST_ONEBOT_DATA, data);
    },
    updateGroups: (groups: Group[]) => {
        ipcRenderer.send(CHANNEL_UPDATE_GROUPS, groups);
    },
    updateFriends: (friends: User[]) => {
        ipcRenderer.send(CHANNEL_UPDATE_FRIENDS, friends);
    },
    sendSendMsgResult: (sessionId: string, msgResult: OB11SendMsgReturn) => {
        ipcRenderer.send(sessionId, msgResult);
    },
    listenSendMessage: (handle: (jsonData: PostDataSendMsg) => void) => {
        ipcRenderer.send(CHANNEL_LOG, "发送消息API已注册");
        ipcRenderer.on(CHANNEL_SEND_MSG, (event: any, args: PostDataSendMsg) => {
            handle(args)
        })
    },
    listenRecallMessage: (handle: (jsonData: { message_id: string }) => void) => {
        ipcRenderer.on(CHANNEL_RECALL_MSG, (event: any, args: { message_id: string }) => {
            handle(args)
        })
    },
    startExpress: () => {
        ipcRenderer.send(CHANNEL_START_HTTP_SERVER);
    },
    log: (data: any) => {
        ipcRenderer.send(CHANNEL_LOG, data);
    },
    setConfig: (config: Config) => {
        ipcRenderer.send(CHANNEL_SET_CONFIG, config);
    },
    getConfig: async (): Promise<Config> => {
        return ipcRenderer.invoke(CHANNEL_GET_CONFIG);
    },
    setSelfInfo(selfInfo: SelfInfo) {
        ipcRenderer.invoke(CHANNEL_SET_SELF_INFO, selfInfo)
    },
    downloadFile: (arg: { uri: string, fileName: string }): Promise<{ errMsg: string, path: string }> => {
        return ipcRenderer.invoke(CHANNEL_DOWNLOAD_FILE, arg);
    },
    deleteFile: async (localFilePath: string[]) => {
        ipcRenderer.send(CHANNEL_DELETE_FILE, localFilePath);
    },
    getRunningStatus: (): Promise<boolean> => {
        return ipcRenderer.invoke(CHANNEL_GET_RUNNING_STATUS);
    },
    getHistoryMsg: async (msgId: string): Promise<RawMessage> => {
        return await ipcRenderer.invoke(CHANNEL_GET_HISTORY_MSG, msgId)
    },
    sendNewMessageToMain: (msg: MessageElement) => {
        ipcRenderer.send(
            CHANNEL_SEND_NEW_MESSAGE_TO_MAIN,
            msg
        )
    },
    insertMessageHistory: (cb: (msg: MessageElement) => void) => {
        ipcRenderer.on(
            CHANNEL_INSERT_MESSAGE_HISTORY,
            (event: any, msg: MessageElement) => {
                cb(msg)
            }
        )
    },
    // 感觉 sendSendMsgResult 的实现不安全，因此更改了实现方式
    handleSingleMessage: (callback: (session: SendIPCMsgSession<MessageElement>) => void) => {
        ipcRenderer.on(
            CHANNEL_HANDLE_SINGLE_MESSAGE,
            (_event, value) => callback(value)
        )
    },
    backSingleMessage: <T>(data: T) => {
        ipcRenderer.send(
            CHANNEL_BACK_SINGLE_MESSAGE,
            data
        )
    },
    // startExpress,
}

export type LLOneBot = typeof llonebot

// 在window对象下导出只读对象
contextBridge.exposeInMainWorld("llonebot", llonebot);