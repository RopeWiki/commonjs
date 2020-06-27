var UglifyJS = require("uglify-js");
var fs = require('fs');
var path = require('path');

// Note: enabling `compress` breaks functionality on ropewiki.com currently
var options = {
    "compress": false,
    "mangle": true,
    "warnings": true,
    "output": {
        "preamble": "// Do not modify this page directly; instead build from https://github.com/RopeWiki/commonjs",
        "beautify": false
    }
};

const inputFiles = {}
function addInputFilesFrom(inputPath) {
    fs.readdirSync(inputPath).forEach(filename => {
        const filepath = path.resolve(inputPath, filename);
        const stat = fs.statSync(filepath);
        const isFile = stat.isFile();

        if (isFile) {
            inputFiles[filepath] = fs.readFileSync(filepath, "utf8");
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

fs.writeFileSync("out/Common.min.js", result.code, "utf8");
