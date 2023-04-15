//Make tests from utilities.
var assert = require('assert');

describe('utilities tests',function(){
    var utilsRouters = require("../dist/routers/utils.js");
    const getId = utilsRouters.GetId;

    it("getId():return integer number from string",function(){
        assert.equal(getId("2"),2)
    });
    it("getId():return null with invalid string",function(){
        assert.equal(getId("a"),null)
    });
})