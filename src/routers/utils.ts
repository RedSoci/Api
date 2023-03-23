import { Response } from "express";
import { FindOptions,Model, ModelStatic, WhereOptions } from "sequelize";
import { ResultsFromRequest,defaultResponse } from "./Response";
/**
 * Send response in default API format
 * @param res response object
 * @param status the status code
 * @param result legible human/computer info
 * @param data 
 * @param message 
 */
export const Resp = (res:Response,status:number,result:ResultsFromRequest,data?:any,message?:string)=>{
    res.status(status);
    res.send(<defaultResponse>{
        result,
        data,
        message
    })
}
export class ResponseList<M extends Model>{
    private model:ModelStatic<M>;
    private _sort:[string,string] = ["id","DESC"]
    public page:number = 1
    public attrs:string[] | null = null
    public limit:number = 10
    public where:WhereOptions<M> ={}
    constructor(model:ModelStatic<M>){
        this.model = model;
    }
    set sort(value:string){
        var data =value.split('_')
        if(data.length === 1){
            data.push("DESC")
        }
        if(data.length === 2){
            this._sort =<[string,string]> data
        }
    }
    findAll(additional:FindOptions<M> = {}){
        var send = Object.assign(this.getOps(),additional);
        return this.model.findAll(send);
    }
    findOne(additional:FindOptions<M> = {}){
        var send = Object.assign(this.getOps(),additional);
        return this.model.findOne(send);
    }
    private getOps(){
        var ops:FindOptions<M> = {
            order:[this._sort],
            limit:this.limit,
            offset: 10 * (this.page - 1),
            where:{}
        }
        if(this.attrs){
            ops.attributes = this.attrs
        }
        return ops
    }
}