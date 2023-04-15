import {config} from "dotenv"
config();
if(!process.env.NODE_ENV){
    process.env.NODE_ENV = "development";
    console.warn("No NODE_ENV defined, defined to \"development\"");
}
export const SERVER_PATH = "/server/v1"
import { getDb } from "./db";


import userRouter from "./routers/server/user";
import * as express from "express"

import { userModel } from "./models/user";
import { postModel } from "./models/post";
import { followModel } from "./models/follow";

export var app = express()

if(require.main === module){
    start()
}
export async function start() {
    var database = getDb();
    await database.authenticate({logging:true,retry:{
        max:8,
        timeout:5000,
        backoffBase:500
    }});
    userModel.hasMany(postModel,{foreignKey:'userid',onDelete:"CASCADE"})
    userModel.hasMany(followModel,{foreignKey:'follow'})
    userModel.hasOne(followModel,{foreignKey:"user"})
    for(const schema of [userModel,postModel,followModel]){
        await schema.sync({alter:true})
    }
    await database.sync();
    
    app.use(express.json())
    app.use(SERVER_PATH,userRouter)
    
    app.listen(4000)
}