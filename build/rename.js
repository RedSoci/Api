//Script to rename paths imports from "./foo/bar" to "./foo/bar.js".
//Do not change the name of imports in ts files, due to incompatibility with ts-node
const {readFileSync,writeFileSync,opendirSync} = require("fs");
const {join} = require("path");
const IMPORT_REGEX =/(?<![\w.])require\s*\(["|'](\..*)["|']\)/g //ESM=/import\s*(.*)\s*from\s*['|"]\s*(\.?\.\/.*)['|"]/g
read("dist");
function read(path){
    var dir = opendirSync(path);
    var actualDir;
    while(actualDir = dir.readSync()){
        const actualPath = join(path,actualDir.name);
        if(actualDir.isDirectory()){
            read(actualPath);
        }else{
            if(actualDir.isFile() && actualDir.name.endsWith(".js")){
                var fileData = readFileSync(actualPath,{encoding:"utf-8"}).replace(IMPORT_REGEX,"require(\"$1.js\")")
                writeFileSync(actualPath,fileData);
            }
        }
    }
    dir.closeSync()
}