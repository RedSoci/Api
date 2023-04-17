var {start} = require("../dist/index.js");
var server;
before(async function(){
    server =await start({force:true});
})
after(async function(){
    server.close();
})