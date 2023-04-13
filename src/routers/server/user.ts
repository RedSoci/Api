import * as express from "express"
import { Response,NextFunction } from "express"
import { userModel,userSchemaAttributes } from "../../models/user"
import * as CryptoJs from "crypto-js"
import {GetId, ResponseList,Resps} from "../utils"
import { GetRequest,GetRequestById, PostRequest } from "../Request"
const {SHA224} = CryptoJs;
const PATH_ROUTER = "/users"
const RETURN_ATTRS = ["name","username","email","createdAt","updatedAt","id"]

var userRouter = express.Router();

type userAttrs = Partial<userSchemaAttributes>
type getRequest = GetRequest<userAttrs>
type postRequest = PostRequest<userAttrs>

userRouter.get(PATH_ROUTER,async function(req:getRequest,res:Response<any[]>){
    var info =Object.keys(req.query).length === 0 ? req.body : req.query
    var list = new ResponseList(userModel);

    list.attrs = RETURN_ATTRS
    list.page = info.page
    list.sort = info.sort

    delete info.sort;
    delete info.page;

    if(info.username || info.password){
        var where:{[index:string]:any} = {}
        if(info.password){
            where.password = SHA224(info.password).toString()
        }
        if(info.username){
            where.username = info.username
        }
        var resultUser =await list.findOne({where});
        if(resultUser){
            res.status(200).send([resultUser.toJSON()]);
        }else{
            res.status(200).send([]);
        }
        return;
    }else{
        var results =await list.findAll({},true);
        res.status(200).send(results);
    }
})
userRouter.post(PATH_ROUTER,async function(req:postRequest,res:Response<any>){
    const {email,password,username,name} = req.body
    var getVals = ["email","password","username","name"];
    const values:userAttrs = {};
    const noValue = [];
    getVals.forEach(e =>{
        if(!req.body[e]){
            noValue.push(e);
        }
        values[e] = req.body[e];
    });
    if(noValue.length > 0){
        var props = {};
        noValue.forEach(propName=>{
            props[propName] = "missing"
        })
        res.status(400).send({
            error:"malformed_data",
            props
        })
        return;
    }
    var cryptedPassword = SHA224(password).toString();
    try{
        await userModel.create({
            email,
            name,
            password:cryptedPassword,
            username
        })
        res.status(201).end();
    }catch(e){
        if(e.name === "SequelizeUniqueConstraintError"){
            res.status(409).send({error:"already_exist",conflict:e.fields})
        }else{
            res.status(400).send({error:"unknown",name:e.name});
        }
    }

})

userRouter.use(PATH_ROUTER + "/:userId*",checkUserId);

//Operations specifies users using id
userRouter.get(PATH_ROUTER+"/:userId",async function(req:GetRequestById,res:Response<any>){
    var userId =req.params.userId

    var result = await userModel.findByPk(userId,{attributes:RETURN_ATTRS})
    if(!result){
        Resps.not_found(res);
   }else{
        res.status(200).send(result.toJSON());
   }
})
userRouter.post(PATH_ROUTER+"/:userId",async function(req:GetRequestById<userAttrs>,res:Response<any>){
    var id =req.params.userId;
    var result = await userModel.update(req.body,{where:{id}})
    if(!result[0]){
        Resps.not_found(res);
    }else{
        res.status(201).end();
    }
})
userRouter.delete(PATH_ROUTER+"/:userId",async function(req:GetRequestById,res){
    var id =req.params.userId
    var result = await userModel.findByPk(id);
    if(result){
        await result.destroy()
        res.status(204).end();
    }else{
        Resps.not_found(res);
    }
})
function checkUserId(req:GetRequestById,res,next:NextFunction){
    var id =GetId(req.params.userId);
    if(!id){
        Resps.invalid_id(res,"userId");
    }else{
        next();
    }
}
export default userRouter;