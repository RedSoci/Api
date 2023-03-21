import {config} from "dotenv"
config();
if(!process.env.NODE_ENV){
    process.env.NODE_ENV = "development"
}
const SERVER_PATH = "server"
import { database } from "./db";

import { userSchema } from "./schemas/user";
import { messageSchema } from "./schemas/message";
import { followSchema } from "./schemas/follow";

import userRouter from "./Routers/server/user";
import express from "express"
var app = express()
app.use(express.json());
app.use("/server",userRouter);

app.listen(4000)
async function start() {
    await database.authenticate({logging:true,retry:{
        max:5,
        timeout:3000
    }});
    userSchema.hasMany(messageSchema,{foreignKey:'userSchemaid'});
    userSchema.hasMany(followSchema,{foreignKey:'follow'})
    userSchema.hasOne(followSchema,{foreignKey:'userSchema'});
    await database.sync();
}