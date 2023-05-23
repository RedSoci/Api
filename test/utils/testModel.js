const { DataTypes } = require("sequelize");

let attrs = {
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    nullable:{
        type:DataTypes.TEXT,
        allowNull:true
    },
    notNull:{
        type:DataTypes.TEXT,
        allowNull:false
    },
    intVal:{
        type:DataTypes.INTEGER
    }
}
module.exports = {
    attrs,
    getTestModel(db){
        return db.define('values',attrs);
    }
}