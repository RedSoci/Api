import development from "./dbDev"
var dvServer = development
if(process.env.SERVER_DEV){
    try{
        dvServer =JSON.parse(process.env.SERVER_DEV);
    }catch(e){
        throw "Failed trying to get info from env \"SERVER_DEV\""
    }
}
var config= {
    development:dvServer,
    production:process.env.SERVER_PRODUCTION ? JSON.parse(process.env.SERVER_PRODUCTION) : null
}
const dbconfig = config[process.env.NODE_ENV]
if(!dbconfig){
    if(process.env.NODE_ENV === "production"){
        throw "Impossible to execute in production mode, no configuration passed to ambient variable \"SERVER_PRODUCTION\"";
    }else{
        throw "Invalid ambient variable \"NODE_ENV\" "
    }
}
export{
    dbconfig
}