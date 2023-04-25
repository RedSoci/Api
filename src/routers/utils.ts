import { Response } from "express";
import { FindOptions,Model, ModelStatic, WhereOptions } from "sequelize";

export const Resps = {
    not_found:(res:Response<any>)=>{
        res.status(404).send({
            error:"not_found"
        })
    },
    invalid_id:(res:Response<any>,id:string)=>{
        res.status(400).send({
            error:"invalid_id",
            message:"passed id is invalid",
            id
        })
    }
}
export class ResponseList<M extends Model>{
    private model:ModelStatic<M>;
    private _sort:[string,string] = ["id","DESC"]
    private _page:number = 1
    public attrs:string[] | null = null
    public limit:number = 10
    public where:WhereOptions<M> ={}
    constructor(model:ModelStatic<M>){
        this.model = model;
    }
    set sort(value:string | null){
        if(!value) return;
        var data =value.split('_')
        if(data.length === 1){
            data.push("DESC")
        }
        if(data.length === 2){
            this._sort =<[string,string]> data
        }
    }
    set page(value:string | number | null){
        if(!value) return;
        if(typeof value === "string"){
            var ret = GetId(value) || 1
            this._page = ret
        }else{
            this._page = value
        }
    }
    async findAll(additional:FindOptions<M> = {},json = false){
        var send = Object.assign(this.getOps(),additional);
        var result =await this.model.findAll(send)
        return json ? result.map((e)=>e.toJSON()) : result;
    }
    findOne(additional:FindOptions<M> = {}){
        var send = Object.assign(additional);
        return this.model.findOne(send);
    }
    private getOps(){
        var ops:FindOptions<M> = {
            order:[this._sort],
            limit:this.limit,
            offset: 10 * (this._page - 1),
            where:{}
        }
        if(this.attrs){
            ops.attributes = this.attrs
        }
        return ops
    }
}
/**
 * Convert string to number, case fail return `null`
 */
export function GetId(value:string | number):number | null{
    if(typeof value === "number"){
        return value
    }
    var n = Number(value)
    if(Number.isInteger(n)){
        return n
    }else{
        return null;
    }
}