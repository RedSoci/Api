class Generator{
    /**@param {Array<string[]>} values */
    constructor(values){
        this._vals = values;
        this._opts = values.map(e =>0);
        this._tot = values.map(e => e.length);
        this._opts[0] = -1;
    };
    getValue(){
        this.#advance();
        var endString = "";
        this._vals.forEach((arr,index)=>{
            endString+=arr[this._opts[index]];
        })
        return endString;
    };
    reset(){
        this._opts = this._vals.map(e =>0);
        this._opts[0] = -1;
    }
    #advance(){
        var tots = this._tot;
        var opts = this._opts;
        opts[0]++;
        checkValid(0);
        function checkValid(pos){
            const actualPos = opts[pos];
            const maxPos = tots[pos];
            if(actualPos === undefined){
                throw new Error("Generator:Max reached");
            };
            if(actualPos >= maxPos){
                opts[pos]--;
                opts[pos + 1]++;
                checkValid(pos+1);
            };
        }
    }
}
/**
 * 
 * @param {number[]} vals 
 * @param {Array<string[]>} ref 
 */
function advance(vals,ref){
    vals[0]++;
    add(0);
    function add(position){
        if(!ref[position]){
            throw "Generation limit reached";
        }
    }
}
exports.Generator = Generator