import {config} from "dotenv"
config();
if(!process.env.NODE_ENV){
    process.env.NODE_ENV = "development";
    console.warn("No NODE_ENV defined, defined to \"development\"");
}
const SERVER_PATH = "server"
import { database } from "./db";


import userRouter from "./routers/server/user";
import * as express from "express"

import { userModel } from "./models/user";
import { messageModel } from "./models/message";
import { followModel } from "./models/follow";
if(require.main === module){
    start()
}
export async function start() {
    await database.authenticate({logging:true,retry:{
        max:8,
        timeout:5000,
        backoffBase:500
    }});
    userModel.hasMany(messageModel,{foreignKey:'userid',onDelete:"CASCADE"})
    userModel.hasMany(followModel,{foreignKey:'follow'})
    userModel.hasOne(followModel,{foreignKey:"user"})
    for(const schema of [userModel,messageModel,followModel]){
        await schema.sync({alter:true})
    }
    await database.sync();

    var app = express()
    
    app.use(express.json())
    app.use("/server",userRouter)
    
    app.listen(4000)
}