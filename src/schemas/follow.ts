import { database } from "../db";
import {DataTypes,fn} from "sequelize";
export const followSchema = database.define('follow',{
    user:{
        type:DataTypes.INTEGER,
        references:{model:"users",key:"id"},
        primaryKey:true,
        onDelete:"CASCADE"
    },
    follow:{
        type:DataTypes.INTEGER,
        references:{model:"users",key:"id"},
        primaryKey:true,
        onDelete:"CASCADE"
    },
    date:{
        type:DataTypes.DATE,
        defaultValue:fn("CURRENT_TIMESTAMP")
    }
});