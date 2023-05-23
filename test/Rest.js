const {Rest} = require('../dist/Rest.js');
const {getDb} = require('./utils/db.js');
const { getTestModel } = require('./utils/testModel.js');
/**@type {import('sequelize').Sequelize} */
var db = getDb();
/**@type {import('sequelize').ModelStatic<any>} */
var model = getTestModel(db);
const chai = require('chai');
const expect = chai.expect
var rest = new Rest(model,{
    required:['notNull'],
    check:{
        nullable(val){
            if(val === 'ptnErr'){
                return {
                    error:'pattern',
                    message:'Invalid pattern test'
                }
            }
        }
    }
})
before(async ()=>{
    await db.authenticate();
    await model.sync({force:true})
    await db.sync();
})
describe('Rest.js',function(){
    it('create()',async ()=>{
        var res =await rest.create({
            notNull:'test1',
            nullable:'pass in check',
            intVal:2
        })
        chai.assert(res && typeof res != 'object')
        var check =await model.findOne();
        chai.assert(check)
        if(check){
            expect(check.toJSON()).to.have.property('nullable','pass in check')
        }
    })
    afterEach(async()=>{
        model.destroy({ truncate: { cascade: true } });
    })
})