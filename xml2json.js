const lodash = require('lodash');
function flatten(obj, path = [], result = {}, resArray = [], resNames = []) {
     // pick the type, name and attributes
     let iWanted = lodash.pick(obj, ["type", "name", "attributes"]);
     if (Object.keys(iWanted).length > 0) {
         // add the xmlpath to the object;
         Object.assign(iWanted, { xmlpath: resNames.join('>')});
         resArray.push(iWanted);
     }
    if (obj && typeof obj === 'object') {
        Object.keys(obj).forEach(key => {
            const value = obj[key];
            const newPath = path.concat(key);
            //
            let newResNames=[];
            if(Number.isInteger(Number(key))) {
                let eItem = `${value.name}[${key}]`;// button[0]
                if(Number(key)>0){
                    let beDeleted = `${value.name}[${key-1}]`
                    let index = resNames.lastIndexOf(beDeleted);
                    let resNamesCopy = resNames.slice(0, index);
                    newResNames = resNamesCopy.concat(eItem);
                }else{
                    newResNames = resNames.concat(`${value.name}[${key}]`);
                }
                resNames=newResNames;
            }
            
            //
            if (value && typeof value === 'object') {
                flatten(value, newPath, result, resArray, resNames);
            } else {
                result[newPath.join('.')] = value;
            }
        });
    }
    return resArray
}

module.exports = flatten;