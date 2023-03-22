import { Response } from "express";
import { ResultsFromRequest,defaultResponse } from "./Response";
/**
 * Send response in default API format
 * @param res response object
 * @param status the status code
 * @param result legible human / computer info
 * @param data 
 * @param message 
 */
const Resp = (res:Response,status:number,result:ResultsFromRequest,data?:any,message?:string)=>{
    res.status(status);
    res.send(<defaultResponse>{
        result,
        data,
        message
    })
}
export = Resp