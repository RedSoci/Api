const {PORT} = require("../../dist/index.js")
const {request} = require('http');
const SERVER_TOKEN = process.env.SERVER_TOKEN_UNSAFE_ORIGIN || 'unsafe'
var HTTP_METHODS = ['GET','POST',"PUT","DELETE"];
class RequestJson{
    href = 'localhost'
    unsafe_server_key = SERVER_TOKEN
    port = PORT
    path = ''
    constructor(path){
        if(path){
            this.path = path;
        }
        for(const method of HTTP_METHODS){
            this[method.toLowerCase()] = (data)=>{
                return this.request({method,data});
            }
        }
    }
    createRequestObj(method = "GET"){
        return {
            href:this.href,
            method,
            port:this.port,
            path:this.path,
            headers:{
                'Content-Type': 'application/json',
                'UNSAFE_SERVER_KEY':this.unsafe_server_key
            }
        }
    }
    requestByPath(path,method = 'GET',data){
        var obj = this.createRequestObj(method);
        obj.path = path;
        return this.request({method,data,reqObj:obj});
    }
    request({method,data,reqObj} = {method:"GET"}){
        return new Promise((ret,rej)=>{
            var obj =reqObj || this.createRequestObj(method);
            var req =request(obj,(res)=>{
                if(res.statusCode >304){
                    rej('Failed Request:'+obj.method+" "+res.statusCode + ' req:'+obj.path);
                }
                res.on('data',(e)=>{
                    try{
                        ret(JSON.parse(e.toString()));
                    }catch(e){
                        rej("invalid JSON passed:" +e.toString());
                    }
                });
                res.on('end',(e)=>{
                    ret();
               })
            });
            if(typeof data != 'undefined'){
                if(typeof data === 'object'){
                    data = JSON.stringify(data);
                };
                req.end(data);
            }else{
                req.end();
            }
        })

    }
    in(path){
        var thisClass = this;
        var wrapper = {};
        for(const method of HTTP_METHODS){
            wrapper[method.toLowerCase()] = (data)=>{
                var reqObj = thisClass.createRequestObj(method);
                reqObj.path = path;
                return thisClass.request({reqObj,data});
            }
        }
        return wrapper
    }
}
module.exports = {
    RequestJson
}