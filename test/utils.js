//Make tests from utilities.
var assert = require('assert');
var utilsRouters = require("../dist/routers/utils.js");
var server = require("../dist/index.js");

before(function(done){
    server.start().finally(done)
})

describe('utilities tests',function(){
    const getId = utilsRouters.GetId;

    it("getId():return integer number from string",function(){
        assert.equal(getId("2"),2)
    });
    it("getId():return null with invalid string",function(){
        assert.equal(getId("a"),null)
    });
})