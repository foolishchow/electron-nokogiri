const assert = require('assert');
const cacheMap = new Map();

const compiler = (ext,resolveData)=>{
    let callBacks = cacheMap.get(ext) || [];
    callBacks.forEach(_cb=>_cb(resolveData));
}
const loader = function (module, filePath) {
    let code = '',
    resolveData = {code,module, filePath};
    code += compiler(this.ext,resolveData)
    module._compile(resolveData.code, filePath);
};

/**
 * @export {Function} loader
 */

const addExt = (ext,resolver)=>{
    assert(resolver, "resolver can't be undefined");
    assert(typeof resolver == "function", "resolver should be a Function");
    let callBacks = cacheMap.get(ext) || [];
    callBacks.push(resolver);
    cacheMap.set(ext,callBacks)
    /**
     * Register Loader as default .{ext} hook
     */
    require.extensions[ext] = require.extensions[ext] || loader.bind({ext});
};

const removeExt = (ext,resolver)=>{
    if(resolver == undefined) return;
    let index = -1,
        callBacks = cacheMap.get(ext) || [];
    for(let i = callBacks.length -1 ; i > -1 ; i--){
        if(callBacks[i] == resolver){
            index = i;
            break;
        }
    }
    if(index == -1) return;
    callBacks.splice(index,1);
    cacheMap.set(ext,callBacks);
}
module.exports = {
    addExt,
    removeExt
}