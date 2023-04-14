const Command = require('commander').Command;
const program = new Command();
const pkg = require('./package.json')


program
    .name('cxml')
    .description(pkg.description)
    .version(pkg.version);
program.command('check')
    .description('Check XML file against a schema')
    .argument('<xmlFile>', 'XML file to check')
    .argument('[outFile]', 'Output file')
    .option('-w, --watch', 'Watch the file for changes')
    .action((xmlFile, outFile, options) => {
        //console.log(JSON.stringify([options, xmlFile, outFile]));
        require('./cxml_w.js')(xmlFile, outFile, options)
    });
program.command('callback')
    .description('Add a callbackFunction to the <jsFile>')
    .argument('<xmlFile>', 'XML file to load')
    .argument('<jsFile>', 'JavaScript file to Append the callbackFunction')
    .option('-w, --write', 'Rewrite the file <jsFile>')
    .option('-a, --append', 'Append the file <jsFile>')
    .option('-watch, --watch', 'Watch the <xmlFile> file for changes')
    .action((xmlFile, jsFile, options) => {
        //console.log(JSON.stringify([options, xmlFile, jsFile]));
        if(options.watch){
            let w = require('chokidar').watch(xmlFile);
            w.on('change', () => {
                require('./xml2cbFn.js')(xmlFile, jsFile, options);
            })
        }else{
            require('./xml2cbFn.js')(xmlFile, jsFile, options);
        }
    });
program.parse();