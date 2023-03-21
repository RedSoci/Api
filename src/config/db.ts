import development from "./dbDev"
var config= {
    development,
    production:process.env.SERVER_PRODUCTION ? JSON.parse(process.env.SERVER_PRODUCTION) : null
}
const dbconfig = config[process.env.NODE_ENV]
if(!dbconfig){
    if(process.env.NODE_ENV === "production"){
        throw "Impossible to execute in production mode, no configurations passed to ambient variable \"SERVER_PRODUCTION\"";
    }else{
        throw "Invalid ambient variable \"NODE_ENV\" "
    }
}
export{
    dbconfig
}