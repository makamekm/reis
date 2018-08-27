var path = require('path');
var fs = require('fs');
 
let indexOfType;

indexOfType = process.argv.indexOf('dir');
let dir = indexOfType >= 0 && process.argv[indexOfType + 1] ? process.argv[indexOfType + 1] : './src/Modules';

indexOfType = process.argv.indexOf('outName');
let outName = indexOfType >= 0 && process.argv[indexOfType + 1] ? process.argv[indexOfType + 1] : 'Styles';

indexOfType = process.argv.indexOf('outDir');
let outDir = indexOfType >= 0 && process.argv[indexOfType + 1] ? process.argv[indexOfType + 1] : './src/Composer';

indexOfType = process.argv.indexOf('incDir');
let incDir = indexOfType >= 0 && process.argv[indexOfType + 1] ? process.argv[indexOfType + 1] : './src/Modules';

indexOfType = process.argv.indexOf('type');
let type = process.argv[indexOfType + 1];
let modules = process.argv.slice(indexOfType + 2);

console.log('Starting composering...');

function fromDir(startPath, filter, callback, pt = '') {

    //console.log('Starting from dir '+startPath+'/');

    if (!fs.existsSync(startPath)) {
        throw new Error('Not a directory: ' + startPath);
    }

    var files = fs.readdirSync(startPath);
    for (var i = 0; i < files.length; i++) {
        var filename = path.join(startPath, files[i]);
        var stat = fs.lstatSync(filename);
        filename = filename.replace(/\\/g, '\/');
        let p = pt + '/' + files[i];
        if (stat.isDirectory()) {
            fromDir(filename, filter, callback, p); //recurse
        }
        else if (filter.test(p)) {
            callback(p, filename);
        }
    };
};

var names = modules;
var data = {};

if (type == 'ts') {
    for (var i = 0; i < names.length; i++) {
        var name = names[i];

        data[name] = [];

        fromDir(path.resolve(dir), new RegExp("^\/\\w+\/" + name + "\/.+\.(tsx|ts)$"), function (filename) {
            data[name].push(filename);
        });

        var content = '';

        for (var k = 0; k < data[name].length; k++) {
            let matches = /^\/(\w+)\/\w+\/(.+)\.\w+$/gm.exec(data[name][k]);
            if (matches && matches[0]) {
                let moduleName = matches[1];
                let className = matches[2].replace(/[\//]+/gm, '_');
                // content = content + 'require("' + data[name][k] + '");\r';
                content = content + 'import * as _' + k + ' from "' + incDir + data[name][k].replace(/\.[^/.]+$/, "") + '";\r';
                content = content + 'export module ' + moduleName + ' { export const ' + className + ' = _' + k + '; }\r';
            }
        }

        if ((content.trim()).length == 0) content = 'export const _a = 1;';

        fs.writeFile(path.resolve(outDir, name + '.tsx'), content, function (err) { if (err) throw err; });
    }
} else if (type == 'less') {
    var content = '';

    for (var i = 0; i < names.length; i++) {
        var name = names[i];

        data[name] = [];

        fromDir(path.resolve(dir), new RegExp("^\/" + name + "\/.+\.(less|css)$"), function (filename) {
            data[name].push(filename);
        });

        for (var k = 0; k < data[name].length; k++) {
            content = content + '@import (less) "' + incDir + data[name][k] + '";\r';
        }
    }

    if ((content.trim()).length == 0) content = 'body {}';

    fs.writeFile(path.resolve(outDir, outName + '.less'), content, function (err) { if (err) throw err; });
} else if (type == 'pcss') {
    var content = '';

    for (var i = 0; i < names.length; i++) {
        var name = names[i];

        data[name] = [];

        fromDir(path.resolve(dir), new RegExp("^\/" + name + "\/.+\.(pcss|css)$"), function (filename) {
            data[name].push(filename);
        });

        for (var k = 0; k < data[name].length; k++) {
            content = content + '@import "' + incDir + data[name][k] + '";\r';
        }
    }

    if ((content.trim()).length == 0) content = 'body {}';

    fs.writeFile(path.resolve(outDir, outName + '.pcss'), content, function (err) { if (err) throw err; });
} else if (type == 'gql') {
    for (var i = 0; i < names.length; i++) {
        var name = names[i];

        data[name] = [];

        fromDir(path.resolve(dir), new RegExp("^\/\\w+\/" + name + "\/.+\.(gql)$"), function (filename) {
            // console.log('-- found: ', filename);
            data[name].push(filename);
        });

        var content = '';

        for (var k = 0; k < data[name].length; k++) {
            let matches = /^\/(\w+)\/\w+\/(.+)\.\w+$/gm.exec(data[name][k]);
            if (matches && matches[0]) {
                let moduleName = matches[1];
                let className = matches[2].replace(/[\//]+/gm, '_');
                // content = content + 'require("' + data[name][k] + '");\r';
                content = content + 'export module ' + moduleName + ' { export const ' + className + ' = require ("' + incDir + data[name][k] + '"); }\r';
            }
        }

        if ((content.trim()).length == 0) content = 'export const _a = 1;';

        fs.writeFile(path.resolve(outDir, name + '.tsx'), content, function (err) { if (err) throw err; });
    }
}

console.log('Composering is finished');
