const {addExt} = require('./index');
const compiler = require('vue-template-compiler');
const stripBom = require('strip-bom');
const fs = require('fs');
const path = require('path');
const beautify = require('js-beautify').js_beautify;


const formmatter = code=>beautify(code, {indent_size: 4 });
const toFunction = code=>`function (){${code}}`;
const pad = html=>html.split(/\r?\n/).map(line => `  ${line}`).join('\n');
const compile = content=>compiler.parseComponent(stripBom(content));

const getStyle = ({hasStyle,filePath,style,module})=>{
    let stylePath = style({filePath,module});
    if(hasStyle && document){
        let link = document.createElement('link');
        link.rel = "stylesheet";
        link.href = stylePath;//`ew://${relativePath}?type=vue-style-loader`;
        document.head.appendChild(link)
    }else{
        document.head.append(new Comment(`<link rel="stylesheet" href="${stylePath}"></link>`));
    }
}
const VueLoader = ({style})=>{
    addExt('.vue',(context)=>{
        let {filePath,module} = context,
            content = fs.readFileSync(filePath, 'utf8'),
            vueComponent = compile(content),
            {script,template,styles} = vueComponent,
            hasStyle = styles.some(s=>s.content.replace(/{\s|\n}*/gi,'') != '');
        
            getStyle({hasStyle,filePath,style,module})
            
            let code = `//this will be hide in top end\n`;
            
        let compiled = compiler.compile(template.content, {});

        // tips
        if (compiled.tips && compiled.tips.length) 
            compiled.tips.forEach(tip =>console.error(tip));

        if (compiled.errors && compiled.errors.length) {
            console.error(
                `\n  Error compiling template:\n${pad(template.content)}\n` +
                compiled.errors.map(e => `  - ${e}`).join('\n') + '\n'
            );
            code += `const ______compiled ={render:function(){},staticRenderFns:[]}`;
        } else {
            code += `const ______compiled={\n`+
            `   render: ${toFunction(compiled.render)},\n`+
            `   staticRenderFns: [${compiled.staticRenderFns.map(toFunction).join(',')}]\n`+
            `};`;
        }
        code +=  script.content.replace(/module.exports\s*=\s*/,'const ______attrs = ');
        code += `module.exports = Object.assign(______compiled,______attrs)`;
        context.code += code;
    })
}
module.exports = VueLoader;

/**
 * VueLoader({
 *     style({module, filePath}){
 *         let relativePath = filePath.replace(path.resolve(__dirname,'../../..'),'');
 *         return `ew://${relativePath}?type=vue-style-loader`;
 *     }
 * })
 */
