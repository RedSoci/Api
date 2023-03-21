import express from "express"
import { Request,Response } from "express";
var userRouter = express.Router();
interface UserRequest {
    email?:string
    password?:string
    id?:number
}
userRouter.get("/user",function(req:Request<null,null,UserRequest>,res:Response){
    const {email,password,id} = req.body
    res.send()
})
export = userRouter;