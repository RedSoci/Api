const { join } = require("path");
var {start,app} = require("../dist/index.js");
var server;
var {createWriteStream,mkdirSync,existsSync} = require('fs');
let {setOut} = require('../dist/log.js')
var write;
before(async function(){
    setOut([]);
    if(!process.env.AUTOMATED_TEST){
        if(!existsSync('logs'))
            mkdirSync('logs')
        write = createWriteStream(join('logs','test.log'),{encoding:'utf-8',flags:'a'});
        write.write('-------'+(new Date().toUTCString()) + '------'+'\n');
        process.env.DB_LOG = "false";
    }
    app.use((req,res,next)=>{
        write.write(req.method + ':'+req.url + '\n');
        next()
    })
    server =await start({force:true});
})
beforeEach(function(){
    var title = this.currentTest?.title;
    //var suite = this.currentTest?.parent?.title;
    if(write && title){
        write.write('TEST:'+title + '\n')
    }
});
after(async function(){
    write.close()
    if(server){
        server.close();
    }
})