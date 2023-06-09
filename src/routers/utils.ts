import { Response,Request } from "express";
import { FindOptions,Model, ModelStatic, WhereOptions } from "sequelize";
export type validationErrors = 'incorrect_pattern'|'missing'|'invalid_type'|'min_violation'|'max_violation'|'not_exist'
export interface DescPropsFaileds{
    [index:string]:validationErrors
}
export const Resps = {
    internal_error:(res:Response<any>,req:Request<any,any,any,any>,error:any)=>{
        //TODO make system to auto report internal errors.
        var message:any = error;
        if(process.env.NODE_ENV === "production"){
            message = "Internal failure"
        };
        res.status(500).send({error:"internal_error",data:message})
    },
    malformed_data:(res:Response,props:DescPropsFaileds = {})=>{
        var obj:{error:string,props:DescPropsFaileds} = {error:"malformed_data",props};
        res.status(400).send(obj)
    },
    not_found:(res:Response,isPage?:boolean)=>{
        res.status(404).send({
            error:"not_found",
            type:isPage ? 'path':'object',
            message:isPage ? 'Page not found':'object not found'
        })
    },
    invalid_id:(res:Response,id:string)=>{
        res.status(400).send({
            error:"malformed_data",
            props:{[id]:'invalid_type'}
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