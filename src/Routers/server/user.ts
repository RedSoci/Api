import express from "express"
import { Request,Response } from "express";
import { userSchema } from "../../schemas/user";
import sha224 from "crypto-js/sha224"
import Resp from "../Resp";
var userRouter = express.Router();

interface UserRequest {
    email?:string
    password?:string
    id?:number
}
interface UserPost extends UserRequest {
    username?:string
    name?:string
}
userRouter.get("/user",async function(req:Request<null,null,UserRequest>,res:Response){
    const {email,password,id} = req.body

    if(!(email && password)){
        if(typeof id === "number"){
            var result = await userSchema.findByPk(id)
            if(!result){
                Resp(res,400,"NOT_EXIST",null,"User Not Exist");
           }else{
                Resp(res,200,"OK",result.toJSON());
           }
        }else{
            Resp(res,400,"INVALID_DATA")
        }
        return
    }
    var result = await userSchema.findOne({where:{
        email:email,
        password:sha224(password).toString()
    }})

    if(!result){
        Resp(res,400,"INVALID_DATA",null,"User Not Exist");
    }else{
        Resp(res,200,"OK",result.toJSON());
    }
})
userRouter.post("/user",async function(req:Request<null,null,UserPost>,res:Response){
    const {email,password,username,name,id} = req.body
    //update
    if(typeof id=== "number"){
        var obj = {};
        Object.entries({email,password,username,name}).forEach(e=>{
            if(typeof e[1] === "string"){
                obj[e[0]] = e[1]
            }
        })
        var result = await userSchema.update(obj,{where:{id}})
        if(!result[0]){
            Resp(res,400,"NOT_EXIST")
        }else{
            Resp(res,200,"OK")
        }
        return;
    }
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
        await userSchema.create({
            email,
            name,
            password:cryptedPassword,
            username
        })
        Resp(res,200,"OK",null)
    }catch(e){
        if(e.name === "SequelizeUniqueConstraintError"){
            Resp(res,400,"INVALID_DATA",{fields:Object.keys(e.fields)},"username already exist");
        }
    }

})
export = userRouter;