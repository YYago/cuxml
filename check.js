
const lodash = require('lodash');
/**
 * 规范 xml 元素和属性
 * @type {object}
 */
const elementsAttributes = require('./simpleTypes.json');
/**
 * 规范 xml 元素
 * @type {array}
 */
const elements = Object.keys(elementsAttributes);
/**
 * 规范 xml 属性集合
 * @type {array}
 */
const attributes = lodash.uniq(Object.values(elementsAttributes).flat());
/**
 * 规范 xml 属性冲突集合
 * @type {array}
 */
const clash = require('./clashAttributes.json').crashs;

/**
 * You can use this function to check the xml node and it's attributes. The xml node should turn to json object.
 *  
 *  @example
 *  ```
 *   customUI_Ribbon_xml_node_Check({name:'button', attributes:{"id":"", "label":"", "onAction:"", "image":""}})
 *  ```
 * @param {object} xmlObj object of xml node as json;
 * @param {string} xmlObj.name element name;
 * @param {array} xmlObj.attributes element attributes;
 * -------
 * @returns {object}
 * 
 *  - `nodeElement {object}` - Parameter xmlObj.
 *  - `unKnownElement {array|undefined}` - unknown elements.
 *  - `unknownAttribute {array|undefined}`  - unknown attributes.
 *  - `duplicateAttributes {array|undefined}` - duplicate attributes.
 *  - `hasClashAttributes {array|undefined}`  - clash attributes.
 *  - `unInvokeAttributes {array|undefined}` - unInvoke attributes.
 *  - `emptyValueOfAttributes {array|undefined}` - emptty value of attributes.
 */
function customUI_Ribbon_xml_node_Check(xmlObj) {
    let result = {
        nodeElement: xmlObj,
        time: new Date().toLocaleString()
    }
    if (!xmlObj || !xmlObj.name || !xmlObj.attributes) return result;
    /**
     * 参数的xml元素
     * @type {string}
     */
    let nodeTagName = xmlObj.name;
    /**
     * 参数的xml元素属性
     * @type {array}
     */
    let Attributes = Object.keys(xmlObj.attributes);
    // unknown element;
    if (!elements.includes(nodeTagName)) {
        result["unKnownElement"] = nodeTagName;
        return result;
    }
    if (Attributes.length === 0 || Attributes.length === 1) {
        return result;
    };
    // unknown attribute;
    if(lodash.compact(Attributes.map(o => attributes.includes(o) ? false : o)).length>0) result["unknownAttribute"] = lodash.compact(Attributes.map(o => attributes.includes(o) ? false : o));
    //result["unknownAttribute"] = ;
    // has same arttibute;
    let Duplicate_attributes = () => {
        return lodash.filter(lodash.countBy(Attributes), o => o>1);
    }
    if(Duplicate_attributes().length>0) result["duplicateAttributes"] = Duplicate_attributes();
    // has clash attribute;
    let hasClashAttr = () => {
        let clashAttribute = [];
        clash.forEach(o => {
            let hasClash = lodash.intersection(o, Attributes);
            if (hasClash.length > 1) {
                clashAttribute.push(hasClash);
            }
        })
        return clashAttribute;
    }
    if(hasClashAttr().length>0) result["hasClashAttributes"] = hasClashAttr();
    //result["hasClashAttributes"] = hasClashAttr();
    // unInvoke attribute;
    let NotAttributesOfElementHaven = () => {
        let NotAttributesOfElementHaves = [];
        let elementAttributes = elementsAttributes[nodeTagName];
        Attributes.forEach(o => {
            if (!elementAttributes.includes(o)) {
                NotAttributesOfElementHaves.push(o);
            }
        })
        return NotAttributesOfElementHaves;
    };
    if(NotAttributesOfElementHaven().length>0){
        result["notAttributesOfElementHaves"] = NotAttributesOfElementHaven();
    }
    //result["notAttributesOfElementHaves"] = NotAttributesOfElementHaven().length>0?NotAttributesOfElementHaven():false;
    let emptyValueOfAttr = () => {
        let valuesOfAttrs = xmlObj.attributes;
        return Object.keys(valuesOfAttrs).filter(o => valuesOfAttrs[o] === "");
    };
    if(emptyValueOfAttr().length>0){
        result["emptyValueOfAttributes"] = emptyValueOfAttr()
    }
    return result;
}

module.exports = customUI_Ribbon_xml_node_Check;