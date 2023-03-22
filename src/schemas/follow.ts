import { database } from "../db";
import {DataTypes,fn} from "sequelize";
export const followSchema = database.define('follow',{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    user:{
        type:DataTypes.INTEGER,
        references:{model:"users",key:"id"},
    },
    follow:{
        type:DataTypes.INTEGER,
        references:{model:"users",key:"id"},
        primaryKey:true,
        onDelete:"CASCADE"
    },
    date:{
        type:DataTypes.DATE
    }
});