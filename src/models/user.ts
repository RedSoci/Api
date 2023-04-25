import {DataTypes,Model,ModelAttributes, Optional, Sequelize} from "sequelize";
export interface userSchemaAttributes {
    id:number,
    name:String,
    username:string,
    email:string,
    password:string,
    lastLogin:Date
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
    },
    lastLogin:{
        type:DataTypes.DATE,
        allowNull:true
    }
}
export const userModelAttributes = obj;
export function getUserModel(database:Sequelize){
    return database.define('user',obj);
}