

// export interface SuccessApiResponse<T> {
//     status: number // 0，但是 onebot 标准里是字符串
//     retcode: number
//     data: T
//     echo?: string
// }

// export interface FailedApiResponse {
//     status: number // 1
//     retcode: number
//     data: {}
//     message: string
//     echo?: string
// }

// export type ApiResponse<T> = SuccessApiResponse<T> | FailedApiResponse

export interface BaseActionParams<T> {
    action: T
    [k: string | number]: any
}

export type BaseCheckResult = ValidCheckResult | InvalidCheckResult

export interface ValidCheckResult {
    valid: true
    [k: string | number]: any
}

export interface InvalidCheckResult {
    valid: false
    message: string
    [k: string | number]: any
}
