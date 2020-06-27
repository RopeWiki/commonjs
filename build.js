var UglifyJS = require("uglify-js");
var fs = require('fs');
var path = require('path');

var options = {
    "output": {
        "preamble": "// Do not modify this page directly; instead build from https://github.com/RopeWiki/commonjs"
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
addInputFilesFrom(path.join(__dirname, 'lib'))

fs.writeFileSync("out/Common.min.js", UglifyJS.minify(inputFiles, options).code, "utf8");
