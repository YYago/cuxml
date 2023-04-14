const fs = require('fs');
const xmlFlatten = require('./xml2json');
const checker = require('./check.js');
const chokidar = require('chokidar');
const xmljs = require('xml-js');

module.exports = (arg1, arg2, opt) => {
    if (!arg1.endsWith('.xml')) throw new Error('The first argument must be a XML file');
    let xmlContent;
    try {
        xmlContent = fs.readFileSync(arg1, 'utf-8');
    } catch (e) {
        throw new Error(e);
    }
    // 空文件不处理，且不监听的话，直接返回
    if(xmlContent.trim() === ""&&!opt.watch) return;
    let xml2jsonContent = xmljs.xml2js(xmlContent, { compact: false, spaces: 4 }, (err, res) => {
        if (err) {
            console.error(err);
        } else {
            return res;
        }
    });

    let xmlFlattenRes = xmlFlatten(xml2jsonContent);

    let realFile = fs.existsSync(arg2);

    function doit(){
        if(!realFile){
            fs.writeFileSync(arg2, '');
        }
        xmlFlattenRes.forEach(o => {
            let oItem_name = o.name;
            let oItem_attributes = [];
            if (Object.keys(o).includes('attributes')) {
                oItem_attributes = o.attributes;
            }
            let iTemCheckResult = checker({ name: oItem_name, attributes: oItem_attributes, xmlpath: o.xmlpath });
            if(realFile){
                console.log(iTemCheckResult);
                fs.writeFileSync(arg2, JSON.stringify(iTemCheckResult)+'\n',{flag:'a'});
            }else{
                console.log(iTemCheckResult);
            }
        })
    };
    if(opt.watch){
        let wcer = chokidar.watch(arg1);
        wcer.on('change', doit);
    }else{
        doit();
    }
}