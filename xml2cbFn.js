const fs = require('fs');
const xmlFlatten = require('./xml2json');
const checker = require('./check.js');
const lodash = require('lodash');
const clashes = require('./clashAttributes.json').crashs;
const SDT = require('./StDelegate.json');
const chokidar = require('chokidar');
const xmljs = require('xml-js');

module.exports = (arg1, arg2, flag) => {
    if (!arg1.endsWith('.xml')) throw new Error('The first argument must be a XML file');
    if (!arg2.endsWith('.js')) throw new Error('The second argument must be a JS file');
    if (fs.existsSync(arg1) === false) throw new Error('The first argument file does not exist');

    let xmlContent = fs.readFileSync(arg1, 'utf-8');
    if (xmlContent.trim() === "") {
        console.log("The XML file is empty");
        return;
    }
    let xml2jsonContent = xmljs.xml2js(xmlContent, { compact: false, spaces: 4 }, (err, res) => {
        if (err) {
            console.error(err);
        } else {
            return res;
        }
    });
    let xmlFlattenRes = xmlFlatten(xml2jsonContent);
    let attrs = xmlFlattenRes.map(o => {
        // 有属性值的元素
        if (Object.keys(o).includes('attributes') && Object.values(o["attributes"]).join('').length > 0) {
            let kvObj = o["attributes"];
            // 拿到该元素的所有回调属性
            /** @type {Array} */
            let itemCallBackFns = SDT[o["name"]];
            if (itemCallBackFns === undefined) return;
            // 是否存在回调属性且不为空
            let isHasCallBack = itemCallBackFns.some(cb => {
                return Object.keys(kvObj).includes(cb) && kvObj[cb].trim() !== "";
            });
            // 是否存在冲突属性
            let isHasClash = clashes.some(c => {
                return lodash.intersection(Object.keys(kvObj), c).length > 1;
            })
            // 返回符合条件的元素
            if (!isHasClash && isHasCallBack) {
                return { a: o["attributes"], p: o["xmlpath"], n: o["name"] };
            }
        }
    });
    attrs = lodash.compact(attrs);
    // 提取出所有的回调函数名
    let callbackFunctionNames = attrs.map(o => {
        let attrNames = Object.keys(o.a);
        let itemCallBackFns = SDT[o.n];
        let cbFns = lodash.intersection(itemCallBackFns, attrNames);
        if (cbFns.length > 0){
            return lodash.compact(cbFns.map(cb => o.a[`${cb}`]));
        }
    });
    callbackFunctionNames = lodash.flattenDeep(callbackFunctionNames);
    // 去重
    callbackFunctionNames = lodash.uniq(callbackFunctionNames);
    // console.log(callbackFunctionNames);
    // 用回调函数名获取 attrs 对象；
    let attrsObj = callbackFunctionNames.map(cb => {
        let z = lodash.map(attrs, o => {
            let s = [];
            Object.keys(o.a).forEach(k => {
                if (o.a[k] === cb) {
                    s.push ({fn:cb,xmlPath:o.p,id:o.a.id})
                }
            });
            return s;
        });
        return lodash.compact(z);
    });
    attrsObj = lodash.flattenDeep(attrsObj);
    //console.log(attrsObj);
    let fnGroup = lodash.groupBy(attrsObj, 'fn'); // 按照回调函数名分组
    console.log(fnGroup);
    // console.log(callbackFunctionNames);
    // console.log(callbackFunctionNames);
    // 检查JS文件是否存在,不存在就创建。
    if (!fs.existsSync(arg2)) {
        fs.writeFileSync(arg2, '');
    }
    if (flag.write) {
        fs.writeFileSync(arg2, '');
    }
    // 读取JS文件内容
    let jsContent = fs.readFileSync(arg2, 'utf-8');
    // 检查JS文件中是否存在回调函数
    callbackFunctionNames.forEach(cb => {
        let cbItem = cb;// 回调函数的属性值
        let regexGets = new RegExp(` ${cbItem}`, 'g');
        let cbFnContent = cbTemplete(cbItem);
        if (!jsContent.match(regexGets)||flag.write) {
            fs.writeFileSync(arg2, cbFnContent, { flag: 'a' });
        }
    });
    function cbTemplete(attrValue) {
        let infos = fnGroup[attrValue];
        let cases = infos.map(o =>`// xmlPath: ${o.xmlPath}\n        case "${o.id}":\n            break;`);
        return `
/**
* @param {RibbonUI} ctrl 你不需要关心这个参数，它代表一个菜单控件元素对象。比如 button、group 等。
* @note 
*  - 这是控件的回调函数，你不应该在其他 JS 文件中调用这个函数。
*  - 通用模版而已，你可以根据需要自行修改。
*  - 这里的回调函数都是异步的，你不应该在这里写长耗时同步的代码，否则可能会导致 UI 卡死。(AI 说的)
*  
*  Time: ${new Date()}
*/
function ${attrValue}(ctrl){

    // 以下代码只是通用模版，你可以根据需要自行修改
    // 通过 ctrl.Id 来判断当前元素
    // use ctrl.Id to judge the current element

    switch(ctrl.Id){
        ${cases.join('\n')}
        default:
            break;
    };

    // 避免 UI 报错，总是返回 true
    // Need return value of true

    return true;
}`;
    }
}