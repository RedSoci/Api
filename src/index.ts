import {config} from "dotenv"
config();
if(!process.env.NODE_ENV){
    process.env.NODE_ENV = "development"
}
const SERVER_PATH = "server"
import { database } from "./db";


import userRouter from "./Routers/server/user";
import express from "express"

import { userSchema } from "./schemas/user";
import { messageSchema } from "./schemas/message";
import { followSchema } from "./schemas/follow";
start()
async function start() {
    await database.authenticate({logging:true,retry:{
        max:8,
        timeout:5000,
        backoffBase:500
    }});
    //await userSchema.sync({alter:true})
    //await messageSchema.sync()
    //await followSchema.sync()
    userSchema.hasMany(messageSchema,{foreignKey:'userid'})
    userSchema.hasMany(followSchema,{foreignKey:'follow'})
    userSchema.hasOne(followSchema,{foreignKey:"user"})
    for(const schema of [userSchema,messageSchema,followSchema]){
        await schema.sync({alter:true})
    }
    await database.sync();

    var app = express()
    
    app.use(express.json())
    app.use("/server",userRouter)
    
    app.listen(4000)
}