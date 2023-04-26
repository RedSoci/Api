const {PATH_ROUTER} = require('../dist/routers/server/post.js')
const {PATH_ROUTER:USER_SPECIFIC_ROUTE} = require('../dist/routers/server/user.js')
const {SERVER_PATH,PORT} = require("../dist/index.js")
const { getDb } = require('../dist/db.js');
const http = require('http');

const chai = require('chai');
const chaiHttp = require('chai-http');
const { RequestJson } = require('./utils/request.js');
const { getPostModel } = require('../dist/models/post.js');
const SERVER_TOKEN = process.env.SERVER_TOKEN_UNSAFE_ORIGIN || 'unsafe'
const serverKey = ["UNSAFE_SERVER_KEY",SERVER_TOKEN];
chai.use(chaiHttp);
const expect = chai.expect
const SERVER_URL = (process.env.TEST_SERVER_URL || "http://localhost")+':'+PORT;
var usersId = [];
const POST_ROUTER =SERVER_PATH +PATH_ROUTER;
var req = new RequestJson(POST_ROUTER);

describe("POSTS",()=>{
    before(async ()=>{
        const USER_ROUTER = SERVER_PATH+USER_SPECIFIC_ROUTE;
        //Create some users to use in posts
        await req.in(USER_ROUTER).post({
            name:"Daniel Silva",
            username:"danixt1",
            email:"dant@gmail.com",
            password:"afw@1asFa1"
        });
        await req.in(USER_ROUTER).post({
            name:"Alex Kafta",
            username:"alexKag",
            email:"kaft@gmail.com",
            password:"@aKGfta2153"
        });
        var users = await req.in(USER_ROUTER).get();
        for(const user of users){
            usersId.push(user.id);
        };
    })

    it("should POST new post",function(done){
        var post = {
            userid:usersId[0],
            content:'good day'
        };
        chai.request(SERVER_URL).post(POST_ROUTER).set(...serverKey).send(post).end((err,res)=>{
            expect(err).to.be.null;
            expect(res).to.have.status(201);
            done();
        })
    })
    it("should GET posts",function(done){
        req.post({userid:usersId[1],content:'other good day'}).then(e).catch(done);
        function e(){
            chai.request(SERVER_URL).get(POST_ROUTER).set(...serverKey).end((err,res)=>{
                try{
                    expect(err).to.be.null;
                    expect(res).to.have.status(200);
                    expect(res.body).to.not.empty;
                }catch(e){
                    done(e);
                    return;
                }
                done();
            })

        }
    })
    it("should NOT POST new post",function(done){
        var invalidPost = {userId:(usersId[1] + 324),content:'other good day'};
        chai.request(SERVER_URL).post(POST_ROUTER).set(...serverKey).send(invalidPost).end((err,res)=>{
            expect(err).to.be.null;
            expect(res).to.have.status(400);
            done();
        })
    })
    afterEach(async ()=>{
        /**@type {import('sequelize').ModelStatic<any>} */
        const postModel = getPostModel(getDb());
        await postModel.destroy({ truncate: { cascade: true } });
    })
})