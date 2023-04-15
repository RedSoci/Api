import { getDb } from "../db"
import {DataTypes, Model, ModelAttributes, Optional} from "sequelize"

const database = getDb()

export interface postSchemaAttributes{
    id:number,
    content:string,
    deleted:boolean,
    private:boolean,
    userid:number
}
type creationAttrs  = Optional<postSchemaAttributes,"id">

export const postModel = database.define('post',<ModelAttributes<Model<postSchemaAttributes,creationAttrs>,postSchemaAttributes>>{
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