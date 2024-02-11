

import { ChatType, MessageElement } from "../../common/types";
import { EventData } from './types'
import MessageGroup from './MessageGroup'


// 还缺 friend temp
const converters = {
    [ChatType.group]: new MessageGroup(),
}

export async function convertMessageToEvent(
    message: MessageElement,
): Promise<EventData | undefined> {
    const converter = converters[message.raw.chatType]
    if (converter) {
        // create 这里目前会去渲染线程借用已有逻辑处理数据
        // 为重构成在main进程调用留出余地
        // 目前因为新消息接收在渲染进程，又因为要为重构成在main进程调用留出余地，所以调用逻辑如下
        // 渲染进程接收新消息 -> main 进程处理新消息
        // -> 返回渲染进程借用已有逻辑处理数据 -> 返回处理后数据到 main 进程
        // 可能看起来会有亿点点乱hhh
        return await converter.create(message)
    }
}