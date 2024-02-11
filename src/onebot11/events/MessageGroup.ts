
import {
    MessageElement,
} from "../../common/types";
import { sendIPCMsgAsync } from "../../main/IPCSend";
import { SenderData, AnonymousData, EventData } from './types'
import {
    CHANNEL_HANDLE_SINGLE_MESSAGE,
    CHANNEL_BACK_SINGLE_MESSAGE,
} from '../../common/channels'

// import { convertMessage } from './utils'

export interface Data extends EventData {
    type: "message"
    post_type: "message"
    message_type: "group"
    sub_type: "group"
    detail_type: "group"
}

export async function convertGroupMessageAsync(
    oriMessage: MessageElement,
): Promise<Data> {
    const msg = await sendIPCMsgAsync<MessageElement, Data>(
        CHANNEL_HANDLE_SINGLE_MESSAGE,
        CHANNEL_BACK_SINGLE_MESSAGE,
        oriMessage
    )
    return msg
}

export type TYPE = 'message'

class MessageGroup {
    static TYPE: TYPE = 'message'

    async create(message: MessageElement): Promise<Data> {
        const data = await convertGroupMessageAsync(message)
        return data
    }
}

export default MessageGroup