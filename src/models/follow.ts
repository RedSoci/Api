import { database } from "../db";
import {DataTypes, Model, ModelAttributes, Optional} from "sequelize";
//userId follows followId
export interface followSchemaAttributes{
    id:number,
    userId:number,
    followId:number
}
type creationAttrs  = Optional<followSchemaAttributes,"id">
export const followModel = database.define('follow',<ModelAttributes<Model<followSchemaAttributes,creationAttrs>,followSchemaAttributes>>{
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
});