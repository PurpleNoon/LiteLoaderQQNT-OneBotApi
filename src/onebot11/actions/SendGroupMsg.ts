import { OB11Return } from '../types';
import { handleReqData } from "../../server/httpserver";
import { BaseActionParams, BaseCheckResult } from "./types";
import { createErrorResponseWithParams } from "./utils";

export type ActionType = 'send_group_msg'

export interface ActionParams extends BaseActionParams<ActionType> {

}

class SendGroupMsg {
    static ACTION_TYPE: ActionType = 'send_group_msg'

    async check<T>(jsonData: any):
        Promise<BaseCheckResult> {
        if (jsonData.action !== SendGroupMsg.ACTION_TYPE) {
            return {
                valid: false,
                message: `${SendGroupMsg.ACTION_TYPE} 接收到了不正确的参数: action=${jsonData.action}`
            }
        }
        return {
            valid: true,
        }
    }

    async handle<T extends ActionParams>(
        jsonData: T
    ): Promise<OB11Return<any>> {
        const result = await this.check(jsonData)
        if (!result.valid) {
            return createErrorResponseWithParams(result)
        }
        // const resData = await handleReqData(jsonData)
        const resData = await OB11Constructor.message(jsonData)
        return resData
    }
}

export default SendGroupMsg