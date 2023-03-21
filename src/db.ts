import { Sequelize } from "sequelize";
import {dbconfig} from "./config/db"
export const database = new Sequelize(
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