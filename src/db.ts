import { Sequelize } from "sequelize";
import {dbconfig} from "./config/db"
var db:Sequelize;
export function getDb(){
    if(!db){
        db = new Sequelize(
            Object.assign(
            {
                pool:{
                    max:5,
                    acquire:200
                }
            },
            dbconfig
            )
        )
    }
    return db;
}