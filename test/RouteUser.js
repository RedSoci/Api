const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const expect = chai.expect

const {SERVER_PATH,PORT} = require("../dist/index.js")
const { PATH_ROUTER } = require("../dist/routers/server/user.js")

const USER_ROUTER = SERVER_PATH +PATH_ROUTER;
const SERVER_URL = (process.env.TEST_SERVER_URL || "http://localhost:")+PORT;
const SERVER_TOKEN = process.env.SERVER_TOKEN_UNSAFE_ORIGIN || 'unsafe'
function getRequestObj(method = "GET") {
    return {
        method,
        href:"localhost",
        path:USER_ROUTER,
        port:PORT,
        headers:{
            'Content-Type': 'application/json',
            'UNSAFE_SERVER_KEY':SERVER_TOKEN
        }
    }
}
const {getUserModel} = require("../dist/models/user.js");
const { getDb } = require('../dist/db.js');
const { Generator } = require('./utils/gen.js');
const http = require('http');
const { RequestJson } = require('./utils/request.js');
const req = new RequestJson(USER_ROUTER);
describe("USERS",function(){
    beforeEach(async function(){
        /**@type {import('sequelize').ModelStatic<any>} */
        const userModel = getUserModel(getDb());
        await userModel.destroy({ truncate: { cascade: true } });
    })
    it("should POST new user",(done)=>{
        const userObj = createUserObj();
        chai.request(SERVER_URL).post(USER_ROUTER).set("UNSAFE_SERVER_KEY",SERVER_TOKEN).send(userObj).end((err,res)=>{
            expect(err).to.be.null;
            expect(res).to.have.status(201);
            done()
        })
    })
    it("should GET list of 10 users",async function(){
        //create 12 user to be inputed, but return only 10.
        var users = createUserObj(12);
        for(const user of users){
            await req.post(user);
        }
        chai.request(SERVER_URL).get(USER_ROUTER).set("UNSAFE_SERVER_KEY",SERVER_TOKEN).end((err,res)=>{
            expect(err).to.be.null;
            expect(res).to.be.status(200);
            expect(res.body).to.be.length(10);
        })
    })
    it("should GET user with all params valid",function(end){
        var user = createUserObj();
        user.name = "Test name";
        var req = http.request(getRequestObj("POST"),res =>{
            expect(res.statusCode).to.equal(201);
            chai.request(SERVER_URL).get(USER_ROUTER).set("UNSAFE_SERVER_KEY",SERVER_TOKEN).end((err,res)=>{
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                var actUser = res.body[0];
                expect(actUser).to.have.property("email",user.email);
                expect(actUser).to.have.property("username",user.username);
                expect(actUser).to.have.property("name",user.name);
                end();
            })
        })
        req.end(JSON.stringify(user));

    })
    it("should GET user by id param",async function(){
        var user = createUserObj();
        await req.post(user);
        var res =await req.get();
        var userId = res[0].id;
        var getData =await req.in(USER_ROUTER+"/"+userId).get();
        expect(getData).to.have.property('username',user.username);
    })
    it("should DELETE user by id param",function(done){
        req.post(createUserObj())
        .then(()=>req.get())
        .then((userObj)=>{
            var getId = userObj[0].id;
            chai.request(SERVER_URL).delete(USER_ROUTER+"/"+getId).set("UNSAFE_SERVER_KEY",SERVER_TOKEN).end(async (err,res)=>{
                var failed = false;
                try{
                    expect(err).to.be.null;
                    expect(res).to.have.status(204);
                    var clearList = await req.get();
                    expect(clearList).to.be.empty;
                }catch(e){
                    done(e);
                    failed = true;
                }
                if(!failed)
                    done();
            })
        });
    })
    describe('check safety',function(){
        function basicExpect(err,res){
            expect(err).to.be.null;
            expect(res).to.have.status(403);
            expect(res.body,'returned body not is object').to.be.an('object');
            expect(res.body,'invalid error code string').to.have.property('error','forbidden_action');
        }
        it("should not GET list of users and return 403",function(done){
            chai.request(SERVER_URL).get(USER_ROUTER).end((err,res)=>{
                basicExpect(err,res);
                done();
            })
        });
        it('should not POST new user and return 403',(done)=>{
            chai.request(SERVER_URL).post(USER_ROUTER).send(createUserObj()).end((err,res)=>{
                basicExpect(err,res);
                done();
            })
        });
    })
})

var usernames = [
    ["darc","marcs","sauzones","alex","july","danixt"],
    ["23a","af1","1","","631","642"],
    ["@ad","@fss","@fsege","@darse","@darfe"],
    ["","#chai","#caut","#zart"]
]
var emails = [
    ["marcs","alex","juli","martha"],
    ["@out","@yaho","@hotm"],
    [".com",".com.br",".org",".net"]
]
var passwords = ["marcS652@As","aryfw23afF$z","gef231q@A"];
var genUsername = new Generator(usernames);
var genEmail = new Generator(emails);


function createUserObj(quant = 1){
    var users = [];
    for(var actual = 0; actual < quant; actual++){
        var user = {
            name:"Marcos souza",
            username:genUsername.getValue(),
            email:genEmail.getValue(),
            password:passwords[Math.floor(Math.random() * passwords.length)]
        };
        users.push(user)
    }
    genUsername.reset();
    genEmail.reset();
    return users.length === 1 ? users[0] : users;
}