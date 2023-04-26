import {DataTypes, Model, ModelAttributes, Optional, Sequelize} from "sequelize";
export interface postSchemaAttributes{
    id:number,
    content:string,
    deleted:boolean,
    private:boolean,
    userid:number
}
export const postModelAttributes:ModelAttributes<Model<postSchemaAttributes,creationAttrs>,postSchemaAttributes> ={
    userid:{
        allowNull:true,
        type:DataTypes.INTEGER,
        references:{key:'id',model:'users'}
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
};
type creationAttrs  = Optional<postSchemaAttributes,"id">
export function getPostModel(database:Sequelize){
    return database.define('post',postModelAttributes);

}