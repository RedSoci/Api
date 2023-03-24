import { database } from "../db";
import {DataTypes, Model, ModelAttributes, Optional} from "sequelize";
export interface messageSchemaAttributes{
    id:number,
    content:string,
    deleted:boolean,
    private:boolean,
    userid:number
}
type creationAttrs  = Optional<messageSchemaAttributes,"id">

export const messageModel = database.define('message',<ModelAttributes<Model<messageSchemaAttributes,creationAttrs>,messageSchemaAttributes>>{
    userid:{
        type:DataTypes.INTEGER
    },
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
    }
});