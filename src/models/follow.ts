import { getDb } from "../db";
import {DataTypes, Model, ModelAttributes, Optional, Sequelize} from "sequelize";
//userId follows followId
export interface followSchemaAttributes{
    id:number,
    userId:number,
    followId:number
}
type creationAttrs  = Optional<followSchemaAttributes,"id">
export const followModelAttributes = <ModelAttributes<Model<followSchemaAttributes,creationAttrs>,followSchemaAttributes>>{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    userId:{
        type:DataTypes.INTEGER,
        references:{model:"users",key:"id"},
    },
    followId:{
        type:DataTypes.INTEGER,
        references:{model:"users",key:"id"},
        primaryKey:true,
        onDelete:"CASCADE"
    }
}
export function getFollowModel(db:Sequelize){
    const database =db;
    return database.define('follow',followModelAttributes);
} 