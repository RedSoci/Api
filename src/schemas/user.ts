import { database } from "../db";
import {DataTypes} from "sequelize";
export const userSchema = database.define('user',{
    id:{
        type:DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true
    },
    name:{
        type:DataTypes.CHAR,
        allowNull:false
    },
    username:{
        type:DataTypes.CHAR(50)
    },
    email:{
        type:DataTypes.CHAR
    },
    password:{
        type:DataTypes.CHAR(56),
        allowNull:false
    }
});
