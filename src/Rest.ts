import { Attributes, CreateOptions, CreationAttributes, FindOptions, Identifier, InstanceUpdateOptions, Model, ModelStatic, WhereOptions } from "sequelize";
import { Fn, Col, Literal } from "sequelize/types/utils";
import * as express from "express"
import { Response,Request} from "express"
import { Resps } from "./routers/utils";
type Req = Request<{[index:string]:string},any,any>
type Res = Response<any,any>
interface Route{
    /**
     * The Path route
     * @example
     * ```js
     * "users/:UserId/posts"
     * ```
     */
    path:string,
    /**
     * Trasform params name to relative name in db
     * @example
     * ```js
     * {"UserId":"userId"}//UserId is the param name and userId is db name
     * ```
     */
    resolve:{[index:string]:string}
}
export type CreationErrors = 'min'|'max'|'pattern'|'type'
export interface ErrorItem{
    error:CreationErrors,
    message?:string
}
export interface CreateErrorRequired{
    error:"required_props",
    props:string[]
}
export interface CreateErrorDb{
    error:"database",
    message:string,
    data:any
}
export interface CreateErrorCheck{
    error:"check",
    data:ErrorItem[]
}
type CreateOpts<A extends {[index:string]:any}> = {
    check:{
        [key in keyof A]?:(value:A[key])=>true | ErrorItem
    }
    required:Array<keyof A>
}
const converter = {
    'INTEGER':(value:string)=>{
        var tried =Number(value)
        if(Number.isNaN(tried))
            return null;
        return tried;
    },
    'BOOLEAN':(value:string)=>{
        var v= value.toLowerCase();
        var final:null | boolean = null;
        if(v === 'true' || v === 'false'){
            final = v === 'true'
        }
        return final;
    }
}
export class Rest<M extends ModelStatic<any>,S extends InstanceType<M>,A extends Attributes<S>>{
    constructor(private model:M,private creationFilter:CreateOpts<A> = {check:{},required:[]}){
    }
    async create(values:CreationAttributes<S>,opts?:CreateOptions<A>):Promise< true | CreateErrorRequired | CreateErrorCheck | CreateErrorDb>{
        let filter = this.creationFilter;
        let required =filter.required;
        let check = filter.check;
        let notPresentRequired = required.filter(e => values[e] === undefined)
        if(notPresentRequired.length > 0){
            return {
                error:'required_props',
                props:<string[]> notPresentRequired
            }
        }
        let checkFails:ErrorItem[] = [];
        for(const [propName,value] of Object.entries(values)){
            let checker = check[propName];
            if(checker){
                let ret = checker(value);
                if(typeof ret === 'object'){
                    checkFails.push(ret);
                }
            }
        }
        if(checkFails.length > 0){
            return {
                error:'check',
                data:checkFails
            }
        }
        try{
            await this.model.create(values,opts)
        }catch(e){
            return {
                error:'database',
                message:e.message,
                data:e
            }
        }
        return true
    }
    get(find:Identifier):Promise<S | null>
    get(find:WhereOptions<A>,opts?:Omit<FindOptions<A>, 'where'>):Promise<S[]>
    get(find?:WhereOptions<A> | Identifier,opts?:Omit<FindOptions<A>, 'where'>){
        if(
            typeof find === 'string' ||
            typeof find === 'number' ||
            typeof find === 'bigint' ||
            find instanceof Buffer
        ){
            return this.model.findByPk(find,opts);
        }else{
            opts = opts || {};
            var newOpts:FindOptions<A> = Object.assign({where:find},opts);
            return this.model.findAll(newOpts);
        }
    }
    async delete(id:Identifier){
        var item = await this.model.findByPk(id);
        if(!item){
            return false;
        }else{
            await item.destroy();
            return true;
        }
    }

    async update<K extends keyof A>(pk:Identifier,key: K, value: A[K] | Col | Fn | Literal,opts?:InstanceUpdateOptions<A>):Promise<boolean>
    async update(pk:Identifier,data:{
        [key in keyof A]?: A[key] | Fn | Col | Literal;
    },opts?:InstanceUpdateOptions<A>):Promise<boolean>
    async update(pk:Identifier,data:any,value?:any,opts?:any){
        var obj:Model | null =await this.model.findByPk(pk);
        if(obj){
            if(typeof data === 'string'){
                await obj.update(data,value,opts)
            }else{
                await obj.update(data,value);
            }
            return true;
        }else{
            return false;
        }
    }

    public createRouter(name:string,subRoutes?:Route[] |  Route){
        //TODO change subRoutes to general configuration file
        var attributes = {}
        var router = express.Router();
        var dbParamName:{[index:string]:string} = {};
        var _attrs = this.model.getAttributes();
        for(const [index,value] of Object.entries(_attrs)){
            var type = value.type;
            var finalType:string;
            if(typeof type != 'string'){
                finalType = type.constructor.name;
            }else{
                finalType = type;
            }
            attributes[index] = finalType;
        }
        if(subRoutes){
            if(Array.isArray(subRoutes)){
                for(const route of subRoutes){
                    processRoute(route)
                }
            }else{
                processRoute(subRoutes);
            }
        }
        const get = (req:Req,res:Res)=>{
            var searchFor:{[index:string]:string} = {};

            for(const [paramName,value] of Object.entries(req.params)){
                var dbName = dbParamName[paramName];
                if(!dbName)
                    continue;
                if(!saveProperty(dbName,value)){
                    return;
                }
            }
            for(const [queryName,value] of Object.entries(req.query)){
                if(!saveProperty(queryName,value)){
                    return;
                }
            }
            function saveProperty(dbName:string,value:any){
                var needConversion = converter[attributes[dbName]]
                var finalValue = needConversion ? needConversion(value) : value;
                if(finalValue === null){
                    Resps.malformed_data(res,{[dbName]:'invalid_type'})
                    return false;
                }
                searchFor[dbName] = finalValue;
                return true;
            }

        }
        function processRoute(route:Route){
            var extractParams = route.path.match(/(?<=\:)\w+/g);
            if(!extractParams){
                return;
            }
            for(const extracted of extractParams){
                dbParamName[extracted] = route.resolve[extracted] || extracted
            }
        }
    }
}