import { OB11Return } from '../types';
import SendGroupMsg from './SendGroupMsg'
import SendPrivateMsg from './SendPrivateMsg'
import SendMsg from './SendMsg'
import { createFailedActionResponse } from './utils'
import { handleReqData } from '../../server/httpserver';


export const actionHandles = {
    [SendGroupMsg.ACTION_TYPE]: new SendGroupMsg(),
    [SendPrivateMsg.ACTION_TYPE]: new SendPrivateMsg(),
    [SendMsg.ACTION_TYPE]: new SendMsg(),
}

export async function handleAction(
    jsonData: any,
): Promise<OB11Return<any> | undefined> {
    const handler = actionHandles[jsonData.action]
    if (handler) {
        // handle 这里目前会去 HttpServer.ts 中借用已有逻辑处理数据
        // 为重构成在main进程调用留出余地
        return await handler.handle(jsonData)
    } else {
        return createFailedActionResponse({
            message: `未知的 action: ${jsonData.action}`,
        })
    }

    // const resData = await handleReqData(jsonData)
    // return resData
}
