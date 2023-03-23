import { database } from "../db";
import {DataTypes,Model,ModelAttributes, Optional} from "sequelize";

export interface userSchemaAttributes {
    id:number,
    name:String,
    username:string,
    email:string,
    password:string
}
type creationAttrs  = Optional<userSchemaAttributes,"id">
const obj:ModelAttributes<Model<userSchemaAttributes,creationAttrs>,userSchemaAttributes> = {
    id:{
        type:DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true
    },
    name:{
        type:DataTypes.STRING,
        allowNull:false
    },
    username:{
        type:DataTypes.STRING(50),
        unique:true
    },
    email:{
        type:DataTypes.STRING
    },
    password:{
        type:DataTypes.STRING(56),
        allowNull:false
    }
}
export const userModel =database.define('user',obj);
