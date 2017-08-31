const addExt = require('./index'),
fs = require('fs');

const styleToProtocol = (getProtocal=()=>{},ext='.css')=>{
addExt(ext,(context)=>{
    let {code,filePath,module} = context;
    let content = fs.readFileSync(filePath, 'utf8');
    let relativePath = getProtocal(filePath),
        hasCode = true;
    if(content.toString().replace(/{\s|\n}*/gi,'') != '') hasCode == false;
    context.code += `\n// the stylesheet is ${hasCode?'not ':''}null \n`
    context.code += `// it will ${!hasCode?'not ':''} compiled by ${relativePath}\n`;
    if(hasCode){
        context.code +=`module.exports = (()=>{
            let link = document.createElement('link');
            link.rel = "stylesheet";
            link.href = '${relativePath}';
            document.head.appendChild(link)
        })();`;
    }else{
        context.code += `module.exports = {};\n`
    }
});
}

module.exports = styleToProtocol;