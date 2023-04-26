import * as express from "express"
import { Response} from "express"
import { getPostModel,postSchemaAttributes } from "../../models/post";
import { GetId, ResponseList, Resps } from "../utils";
import { Sequelize } from "sequelize";
import { GetRequest, PostRequest } from "../Request";
export var PATH_ROUTER = "/posts";
export var PATH_ROUTER_USER = "/users/:userId/posts"
const RETURN_ATTRS = ["userid","content","deleted","private","createdAt","updatedAt","id"]

var postRouter = express.Router();
type PostCreate = Partial<Pick<postSchemaAttributes,'private'>> & Pick<postSchemaAttributes,'userid'|'content'>;
type postAttrs = Partial<postSchemaAttributes>
type getRequest = GetRequest<postAttrs,{userId?:number}>
type postRequest = PostRequest<postAttrs>
export default function getPostRouter(db:Sequelize,pathRout?:string,pathRoutFromUser?:string){
    var postModel = getPostModel(db)
    postRouter.get(PATH_ROUTER,getPostsRouter)
    postRouter.get(PATH_ROUTER_USER,getPostsRouter)

    postRouter.post(PATH_ROUTER,postPostsRouter)
    postRouter.post(PATH_ROUTER_USER,postPostsRouter)
    
    async function postPostsRouter(req:getRequest,res:Response) {
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
            await createPost({
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
    function getPostsRouter(req:getRequest,res:Response<any[]>) {
        var userId =req.params?.userId;
        var query = req.query;
        var page = query.page;
        var sort = query.sort;
        
        getPosts({userId,sort,page}).then(resp=>{
            res.status(200).send(resp);
        }).catch(e =>{Resps.internal_error(res,req,e)})

    }
    async function createPost(post:PostCreate) {
        var userId = post.userid;
        
        var content = post.content;
        var priv = typeof post.private === "boolean" ? post.private : false;
        await postModel.create({userid:userId,content,private:priv});
    }
    async function getPosts({attrs = RETURN_ATTRS,page = 1,sort = null,userId:userid = null}){
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
    return postRouter;
}