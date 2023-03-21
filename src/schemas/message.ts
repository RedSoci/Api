import { database } from "../db";
import {DataTypes,fn} from "sequelize";
export const messageSchema = database.define('message',{
    userid:{
        type:DataTypes.INTEGER,
        references:{model:"users",key:"id"}
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
    },
    date:{
        type:DataTypes.DATE,
        defaultValue:fn("CURRENT_TIMESTAMP")
    }
});