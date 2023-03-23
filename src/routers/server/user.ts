import express from "express"
import { userModel,userSchemaAttributes } from "../../models/user"
import sha224 from "crypto-js/sha224"
import {Resp, ResponseList} from "../utils"
import { GetRequest,GetRequestById, PostRequest } from "../Request"

const PATH_ROUTER = "/users"
const RETURN_ATTRS = ["name","username","email","createdAt","updatedAt","id"]

var userRouter = express.Router();

type userAttrs = Partial<userSchemaAttributes>
type getRequest = GetRequest<userAttrs>
type postRequest = PostRequest<userAttrs>

userRouter.get(PATH_ROUTER,async function(req:getRequest,res){
    var info =Object.keys(req.query).length === 0 ? req.body : req.query
    if(info.id){
        Resp(res,400,"INVALID_DATA",null,"use: "+PATH_ROUTER+"/<USER_ID>")
        return;
    }
    //var list = new ResponseList(userModel);
    var order:[string,string] = ["id","DESC"]
    if(typeof info.sort === "string"){
        var data =info.sort.split('_')
        if(data.length === 1){
            data.push("DESC")
        }
        if(data.length === 2){
            order =<[string,string]> data
        }
    }
    var page = info.page || 1
    delete info.sort;
    delete info.page;

    if(info.username || info.password){
        var where:{[index:string]:any} = {}
        if(info.password){
            where.password = sha224(info.password).toString()
        }
        if(info.username){
            where.username = info.username
        }
        var resultUser =await userModel.findOne({
            attributes:RETURN_ATTRS,
            where
        })
        if(resultUser){
            Resp(res,200,"OK",resultUser.toJSON())
        }else{
            Resp(res,404,"NOT_EXIST",null,"username not found")
        }
        return;
    }else{
        var results =await userModel.findAll({
            where:info,
            order:[order],
            limit:10,
            offset: 10 * (page - 1),
            attributes:RETURN_ATTRS
        })
        Resp(res,200,"OK",results.map(e=>e.toJSON()));
    }
})
userRouter.post(PATH_ROUTER,async function(req:postRequest,res){
    const {email,password,username,name} = req.body
    if(!(email && password && username && name)){
        Resp(res,400,"INVALID_DATA",null,"invalid email or password");
        return;
    }
    if(password.length < 6){
        Resp(res,400,"INVALID_DATA",null,"invalid password");
        return;
    }

    var cryptedPassword = sha224(password).toString();
    try{
        await userModel.create({
            email,
            name,
            password:cryptedPassword,
            username
        })
        Resp(res,201,"OK",null)
    }catch(e){
        if(e.name === "SequelizeUniqueConstraintError"){
            Resp(res,400,"INVALID_DATA",{fields:Object.keys(e.fields)},"username already exist");
        }
    }

})

//Operations specifies users using id
userRouter.get(PATH_ROUTER+"/:id",async function(req:GetRequestById,res){
    var userId =Number(req.params.id);
    if(!Number.isInteger(userId)){
        Resp(res,400,"INVALID_PATH",null,"passed user id not is number")
        return
    }

    var result = await userModel.findByPk(userId,{attributes:RETURN_ATTRS})
    if(!result){
        Resp(res,404,"NOT_EXIST",null);
   }else{
        Resp(res,200,"OK",result.toJSON());
   }
})
userRouter.post(PATH_ROUTER+"/:id",async function(req:GetRequestById<userAttrs>,res){
    var {email,password,username,name} = req.body
    var id = Number(req.params.id)
    if(Number.isInteger(id)){
        var obj = {};
        Object.entries({email,password,username,name}).forEach(e=>{
            if(typeof e[1] === "string"){
                obj[e[0]] = e[1]
            }
        })
        var result = await userModel.update(obj,{where:{id}})
        if(!result[0]){
            Resp(res,400,"NOT_EXIST")
        }else{
            Resp(res,201,"OK")
        }
        return;
    }
    Resp(res,400,"INVALID_DATA")
})
userRouter.delete(PATH_ROUTER+"/:id",async function(req:GetRequestById,res){
    var id = Number(req.params.id)
    if(!Number.isInteger(id)){
        Resp(res,400,"INVALID_DATA",null,"id not is a number")
        return
    }
    var result = await userModel.findByPk(id);
    if(result){
        await result.destroy()
        Resp(res,204,"OK")
    }else{
        Resp(res,404,"NOT_EXIST")
    }
})

export default userRouter;