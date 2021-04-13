
//for internet explorer incompatibility:
String.prototype.includes = function (str) {
    var returnValue = false;

    if (this.indexOf(str) !== -1) {
        returnValue = true;
    }

    return returnValue;
}

String.prototype.startsWith = function (str) {
    var returnValue = false;

    if (this.substr(0, str.length) === str) {
        returnValue = true;
    }

    return returnValue;
}

String.prototype.replaceAll = function (str1, str2) {

    return this.split(str1).join(str2);
}