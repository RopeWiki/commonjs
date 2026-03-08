#!/usr/bin/env node
var UglifyJS = require("uglify-js");
var fs = require('fs');
var path = require('path');

// Note: enabling `compress` breaks functionality on ropewiki.com currently
var options = {
    "compress": false,
    "mangle": false,
    "warnings": true,
    "output": {
        "preamble": "// Do not modify this page directly; instead build from https://github.com/RopeWiki/commonjs",
        "beautify": true
    }
};

const inputFiles = {}
function addInputFilesFrom(inputPath) {
    fs.readdirSync(inputPath).forEach(filename => {
        const filepath = path.resolve(inputPath, filename);
        const stat = fs.statSync(filepath);
        const isFile = stat.isFile();

        if (isFile && filepath.endsWith('.js')) {
            inputFiles[filepath] = fs.readFileSync(filepath, "utf8");
        } else if (!isFile) {
            addInputFilesFrom(filepath);
        }
    });
}
addInputFilesFrom(path.join(__dirname, 'lib'));

const result = UglifyJS.minify(inputFiles, options);

if (result.warnings != null) {
    console.log("===== Warnings =====")
    console.log(result.warnings);
} else {
    console.log("No warnings.")
}

if (result.error != null) {
    console.log("===== Errors =====")
    console.log(result.error);
} else {
    console.log("No errors.")
}

// Ensure output directory exists
const outDir = path.join(__dirname, 'out');
if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
}

const outputFile = path.join(outDir, 'Common.min.js');
fs.writeFileSync(outputFile, result.code, "utf8");
console.log("Built: " + outputFile);
