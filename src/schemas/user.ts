import { database } from "../db";
import {DataTypes,Model,ModelAttributes, Optional} from "sequelize";

interface attributes {
    id:number,
    name:String,
    username:string,
    email:string,
    password:string
}
type creationAttrs  = Optional<attributes,"id">
const obj:ModelAttributes<Model<attributes,creationAttrs>,attributes> = {
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
export const userSchema =database.define('user',obj);
