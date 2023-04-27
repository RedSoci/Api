import * as express from "express"
import { Response} from "express"
import { getPostModel,postSchemaAttributes } from "../../models/post";
import { GetId, ResponseList, Resps } from "../utils";
import { Model, Sequelize } from "sequelize";
import { GetRequest, PostRequest } from "../Request";
export var PATH_ROUTER = "/posts";
export var PATH_ROUTER_USER = "/users/:userId/posts"
const RETURN_ATTRS = ["userid","content","deleted","private","createdAt","updatedAt","id"]

var postRouter = express.Router();

type PostCreate = Partial<Pick<postSchemaAttributes,'private'>> & Pick<postSchemaAttributes,'userid'|'content'>;
type postAttrs = Partial<postSchemaAttributes>
type getRequest = GetRequest<postAttrs,{userId?:number,postId?:number}>
type postRequest = PostRequest<postAttrs>

export default function getPostRouter(db:Sequelize,pathRout?:string,pathRoutFromUser?:string){
    var postModel = getPostModel(db)

    postRouter.get(PATH_ROUTER,getReceiver)
    postRouter.get(PATH_ROUTER_USER,getReceiver)

    postRouter.post(PATH_ROUTER,postReceiver)
    postRouter.post(PATH_ROUTER_USER,postReceiver)
    
    postRouter.delete(PATH_ROUTER + '/:postId',delReceiver)
    postRouter.delete(PATH_ROUTER_USER + '/:postId',delReceiver)
    
    postRouter.get(PATH_ROUTER + '/:postId',getReceiver)
    postRouter.get(PATH_ROUTER_USER + '/:postId',getReceiver)

    postRouter.put(PATH_ROUTER + '/:postId',putReceiver)
    postRouter.put(PATH_ROUTER_USER + '/:postId',putReceiver)
    async function postReceiver(req:getRequest,res:Response) {
        var userId =GetId(req.params?.userId || req.body?.userid)
        if(typeof req.body.content != 'string'){
            Resps.bad_request(res,"invalid content data");
            return;
        }
        if(userId === null){
            Resps.invalid_id(res,'userid');
            return;
        }
        try{
            await create({
                content:req.body.content,
                userid:userId,
                private:req.body.private
            })
            res.status(201).end();
        }catch(e){
            if(e.name === "SequelizeForeignKeyConstraintError"){
                Resps.bad_request(res,'User not exist');
            }else{
                res.status(500).send({error:"unknown",name:e.name,data:process.env.NODE_ENV === 'development'? e : ''});
            }
        }
    }
    function delReceiver(req:getRequest,res:Response<any[]>){
        var idPost =GetId(req.params?.postId);
        if(idPost === null){
            Resps.invalid_id(res,'postId');
        };
        del(idPost).then(e =>{
            if(e){
                res.status(204).end();
            }else{
                Resps.not_found(res)
            }
        }).catch(e =>{Resps.internal_error(res,req,e)})
    }
    function putReceiver(req:getRequest,res:Response){
        var postId = GetId(req.params?.postId)
        var body = req.body;
        var params:{content?:string,private?:boolean};
        if(body.content){
            if(typeof body.content != 'string'){
                Resps.bad_request(res,'invalid type in property content');
                return;
            }
            params.content = body.content;
        }
        if(body.private != undefined){
            if(typeof body.private != "boolean"){
                Resps.bad_request(res,'invalid type in property private');
                return;
            }
            params.private = body.private;
        }
        if(postId === null){
            Resps.invalid_id(res,'postId')
            return;
        };
        put(postId,params).then(()=>{
            res.status(202).end();
        }).catch((e)=>{
            if(e.name === 'not_exist'){
                Resps.not_found(res);
            }else{
                Resps.internal_error(res,req,e);
            }
        })
    }
    function getReceiver(req:getRequest,res:Response<any[] | any>) {
        var userId =req.params?.userId;
        var query = req.query;
        var page = query.page;
        var sort = query.sort;
        var id =GetId(req.params?.postId);
        get({userId,sort,page,id}).then(resp=>{
            if(resp === null){
                Resps.not_found(res);
            }else{
                res.status(200).send(resp);
            }
        }).catch(e =>{Resps.internal_error(res,req,e)})

    }

    async function put(id:number,params:{content?:string,private?:boolean}) {
        var obj =await postModel.findByPk(id);
        if(!obj){
            throw {name:'not_exist'}
        };
        await obj.update(params);
    }
    async function create(post:PostCreate) {
        var userId = post.userid;
        
        var content = post.content;
        var priv = typeof post.private === "boolean" ? post.private : false;
        await postModel.create({userid:userId,content,private:priv});
    }
    async function get({attrs = RETURN_ATTRS,page = 1,sort = null,userId:userid = null,id = null}){
        if(typeof id === 'number'){
            return (await postModel.findByPk(id,{attributes:attrs}))?.toJSON();
        }
        var list = new ResponseList(postModel);
        list.attrs = attrs;
        list.page = page;
        list.sort = sort;
        var obj = {};
        if(userid){
            obj = {where:{userid}}
        }
        var resp =await list.findAll(obj,true);
        return resp;
    }
    async function del(idModel:number | Model){
        var result =typeof idModel === "number" ?(await postModel.findByPk(idModel)) : idModel;
        if(!result){
            return false;
        }else{
            await result.destroy();
            return true;
        }
    }
    return postRouter;
}