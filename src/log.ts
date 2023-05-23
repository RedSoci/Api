export const dateFormat:Intl.DateTimeFormatOptions = {
    hour12:false,
    day:'2-digit',
    month:'2-digit',
    year:'numeric',
    hour:'2-digit',
    minute:'2-digit',
    second:'2-digit'
}

type typeLogs = 'log'|'verbose'|'warn'|'info'|'error'
let logging:typeLogs[] = ['log','warn','error']
type exitType = {
    [index in typeLogs]: (mesage: string) => void;
};
export function setOut(log:typeLogs[]| typeLogs){
    if(Array.isArray(log)){
        logging = log;
    }else{
        logging = [log];
    }
}
interface Configs{
    json:boolean,
    outputs:exitType
}
export const config:Configs = {
    json:process.env.NODE_ENV === 'production',
    outputs :{
        error:  console.error,
        info:    console.log,
        log:    console.log,
        verbose:console.log,
        warn:   console.warn
    }
}
type logFunction = (message:any,id?:string,type?:typeLogs)=>void
type Log = {
    [index in typeLogs]: logFunction;
} & {
    (message: any, id?: string, type?: typeLogs): void;
};
Object.preventExtensions(config)
function logMessage(message:any,id?:string,type:typeLogs = 'log'){
    var json = config.json
    var obj:any = {localTime:getFormatedDate()};
    if(typeof message === 'object'){
        if(Array.isArray(message)){
            obj.message = message.join(',');
        }else{
            for(const [entry,value] of Object.entries(message)){
                obj[entry] = value;
            }
        }
    }else{
        obj.message = message + '';
    };
    if(id){
        obj.id = id;
    };
    if(!json){
        var out = obj.localTime + ':';
        if(!obj.message){
            out += JSON.stringify(obj);
        }else{
            if(obj.id){
                out+='#'+obj.id +' > ';
            };
            out+=obj.message;
        }
        config.outputs[type](out);
    }
}
export var log =<Log> ['log','verbose','warn','info','error'].reduce((prev,curr:typeLogs)=>{
    prev[curr] = function(message:any,id?:string){
        if(logging.includes(curr))
            logMessage(message,id,curr);
    }
    return prev;
},logMessage);

function getFormatedDate(){
    var formatedDate =new Intl.DateTimeFormat(undefined,dateFormat).format(new Date());
    return formatedDate;
}