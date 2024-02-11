import { OB11MessageData } from "../types"

export type SenderData = Partial<{
    user_id: number         // 发送者 QQ 号
    nickname: string        // 昵称
    card: string            // 群名片／备注
    sex: string             // 性别，male 或 female 或 unknown
    age: number             // 年龄
    area: string            // 地区
    level: string           // 成员等级
    role: string            // 角色，owner 或 admin 或 member
    title: string           // 专属头衔
}>

export interface AnonymousData {
    id: number              // 匿名用户 ID
    name: string	        // 匿名用户名称
    flag: string	        // 匿名用户 flag，在调用禁言 API 时需要传入
}

export interface EventData {
    time: number                // 事件发生的时间戳
    self_id: string             // 收到事件的机器人 QQ 号
    post_type: string	        // 上报类型 
    message_type: string	    // 消息类型 
    // 消息子类型，正常消息是 `normal`，匿名消息是 `anonymous`
    // 系统提示（如「管理员已禁止群内匿名聊天」）是 `notice`
    sub_type: string
    message_id: number          // 消息 ID
    group_id: number            // 群号
    user_id: number             // 发送者 QQ 号
    anonymous?: AnonymousData   // 匿名信息，如果不是匿名消息则为 null
    message: OB11MessageData[]      // 消息内容
    raw_message: string         // 原始消息内容
    font: number                // 字体
    sender: SenderData          // 发送人信息

    type: string
    detail_type: string
    self: {
        platform: "qq"
        user_id: string
    }

    raw?: any
}