import {config} from "dotenv"
config();
export const SERVER_PATH = "/server/v1"
export const PORT =process.env.SERVER_PORT || 4000;

import { getDb } from "./db";

import userRouter from "./routers/server/user";
import postRouter from "./routers/server/post";
import * as express from "express"

import { getUserModel } from "./models/user";
import { getPostModel } from "./models/post";
import { getFollowModel } from "./models/follow";

import { Sequelize } from "sequelize";

export var app = express()
const SERVER_TOKEN_TRUSTED_ORIGIN = process.env.SERVER_KEY || "trusted";
const SERVER_TOKEN_UNSAFE_ORIGIN = process.env.SERVER_KEY_UNSAFE || "unsafe";
if(require.main === module){
    start()
}
interface startOpts{
    db?:Sequelize,

    force?:boolean,
    /**Case not present use envs SERVER_KEY and SERVER_KEY_UNSAFE */
    tokens?:{trusted:string,unsafe:string},
    /**Case not present use env in NODE_ENV */
    env?:"production" |"development"
}

export async function start(ops:startOpts = {}) {
    const NODE_ENV = process.env.NODE_ENV;
    var force  = ops.force ? true : false;
    if(force && NODE_ENV === "production"){
        throw new Error("Unable to force database to rebuild in production mode")
    }
    const st_trusted = ops.tokens?.trusted || SERVER_TOKEN_TRUSTED_ORIGIN;
    const st_unsafe = ops.tokens?.unsafe || SERVER_TOKEN_UNSAFE_ORIGIN;
    if((st_trusted === "trusted" && st_unsafe === "unsafe") && NODE_ENV === "production"){
        throw new Error("Impossible to start no SERVER_TOKEN provided to server, please pass env vars SERVER_KEY and SERVER_KEY_UNSAFE");
    }
    const database =ops.db|| getDb();
    await database.authenticate({logging:false,retry:{
        max:8,
        timeout:5000,
        backoffBase:500
    }});

    const followModel = getFollowModel(database);
    const postModel = getPostModel(database);
    const userModel = getUserModel(database);

    userModel.hasMany(postModel,{onDelete:"CASCADE",foreignKey:{name:'userid',allowNull:false},constraints:true});
    postModel.belongsTo(userModel,{constraints:true,foreignKey:{name:'userid',allowNull:false}});

    userModel.hasMany(followModel,{foreignKey:'follow'})
    userModel.hasOne(followModel,{foreignKey:"user"})
    for(const schema of [userModel,postModel,followModel]){
        await schema.sync({alter:true,force})
    }
    await database.sync({force});
    app.use(express.json())
    function auth(req,res,next){
        var trusted =req.headers.server_key;
        var unsafe = req.headers.unsafe_server_key;
        if(st_trusted === trusted){
            res.locals.tokenMode="trusted";
            next();
            return;
        }
        if(st_unsafe === unsafe){
            res.locals.tokenMode = "unsafe";
            next();
            return;
        }
        res.status(403).send({error:"forbidden_action"}).end();
    }
    app.use(SERVER_PATH,auth,userRouter(database))
    app.use(SERVER_PATH,auth,postRouter(database))
    return app.listen(PORT)
}