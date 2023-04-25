export type ResultsFromRequest = "OK"|"INVALID_DATA"|"NOT_EXIST"|"INVALID_PATH"|"ALREADY_EXIST"
export interface defaultResponse<DATA = null> {
    result:ResultsFromRequest
    message?:string
    data:DATA
}