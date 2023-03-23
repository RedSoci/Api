import { database } from "../db";
import {DataTypes,fn} from "sequelize";
export const messageModel = database.define('message',{
    id:{
        type:DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true
    },
    content:{
        type:DataTypes.TEXT
    },
    deleted:{
        type:DataTypes.BOOLEAN,
        defaultValue:false
    },
    private:{
        type:DataTypes.BOOLEAN,
        defaultValue:false
    },
    date:{
        type:DataTypes.DATE
    }
});