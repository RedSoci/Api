const { Sequelize } = require("sequelize");
const {getConfig} = require('../../dist/config/db.js')
let db;
function getDb(){
    if(db){
        return db;
    }
    var config = getConfig()
    config.database = process.env.DB_TEST || 'test'
    db = new Sequelize(
        Object.assign({
            logging:()=>{},
            pool:{
                max:5,
                acquire:200
            },
        },
        config
        )
    );
    return db;
}
module.exports =  {
     getDb
}