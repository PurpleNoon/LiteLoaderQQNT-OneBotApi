import { OB11Return } from '../types';
import { handleReqData } from "../../server/httpserver";
import { BaseActionParams, BaseCheckResult } from "./types";
import { createErrorResponseWithParams } from "./utils";

export type ActionType = 'send_private_msg'

export interface ActionParams extends BaseActionParams<ActionType> {

}

class SendPrivateMsg {
    static ACTION_TYPE: ActionType = 'send_private_msg'

    async check<T>(jsonData: T): Promise<BaseCheckResult> {
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
        const resData = await handleReqData(jsonData)
        return resData
    }
}

export default SendPrivateMsg