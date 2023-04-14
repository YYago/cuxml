const lodash = require('lodash');
const std = require('./StDelegate.json');
const cbfTypes = require('./cbfTypes.json');

const elements = Object.keys(std);

//const attributes = lodash.uniq(Object.values(std).flat());
//console.log(attributes.map(o => `{"n":"${o}","t":"string"}`).join(",\n"));

/**
 * 
 * @param {object} cbf schema object;
 * @param {function} cb callback function, if you want to create other template, you can use this function;The first parameter is the name of the callback function, and the second parameter is the type of the callback function;
 * 
 * @returns 
 */
function cbfTemplate(cbf={key,val},cb) {
    // use val as function name and key as returns type;
    let cbfObj = lodash.filter(cbfTypes, ['n',cbf.key])[0];
    let cbfType = cbfObj.t;
    let cbfName = cbf.val;
    let cbfTemplate = `/**
    * callback function for ${cbf.key}
    * @param {${cbfType}} ${cbfName}
    * @returns {${cbfType}}
    */
    function ${cbfName}(targetElement) {
        switch (targetElement.Id) {
            case 'example':
                // do something
            default:
                break;
        }
        // SomeTime, Always needed return true or false, otherwise an error will be reported.
        return true;
    }`;
    if(cb){
        return cb(cbfName,cbfType);
    }else{
        return cbfTemplate;
    }
}

/**
 * create callback function for schema of xml node;
 * @param {object} schemaObject xml node as json object;
 * @param {string} schemaObject.element xml node name;
 * @param {array} schemaObject.cbKeyAndValue xml node attributes and values;
 */
function createCBF(schemaObject = { element, cbKeyAndValue }) {
    if (!schemaObject || !schemaObject.element || !schemaObject.cbKeyAndValue) return;
    let element = schemaObject.element;
    let cbKeyAndValue = schemaObject.cbKeyAndValue;
    if (!elements.includes(element)) return;
    let cb = std[element];
    let cbf = [];
    cbKeyAndValue.forEach(o => {
        if (cb.includes(Object.keys(o)[0])) {
            cbf.push(cbfTemplate(o))
        }
    })
    return cbf.join("\n");
}

module.exports = {
    createCBF,
    cbfTemplate
};