
MessageBox = function (map, paren, myvar, mb) {
    this.map = map;
    this.paren = paren;
    this.myvar = paren.myvar + "." + myvar;
    this.eraseMess = null;
    this.centerMe = null;
    this.mb = null;
    if (mb) { this.mb = mb; }
    this.id = this.myvar + "_message";
};

MessageBox.prototype.hideMess = function () {
    if (this.paren.quiet) {
        return;
    }
    this.mb.style.visiblity = "hidden";
    this.mb.style.left = "-1200px";
    this.mb.style.top = "-1200px";
};

MessageBox.prototype.centerThis = function () {
    var c = {}
    var left = $(mapid).offset().left;
    var top = $(mapid).offset().top;
    var width = $(mapid).width();
    var height = $(mapid).height();
    c.x = width / 2;
    c.y = height / 2;
    //alert(c.x);
    if (!this.mb) {
        this.mb = Lance$(this.id);
    }
    if (this.centerMe) { clearTimeout(this.centerMe); }
    if (this.mb) {
        var nw = this.mb.offsetWidth;
        if (nw > width) {
            nw = parseInt(2 * c.x / 3, 10);
            this.mb.style.width = nw + "px";
            this.centerMe = setTimeout(this.myvar + ".centerThis()", 5);
            return;
        }
        this.mb.style.left = left + (c.x - (nw / 2)) + "px";
        this.mb.style.top = top + (c.y - 20 - (this.mb.offsetHeight / 2)) + "px";
    }
    else {
        this.centerMe = setTimeout(this.myvar + ".centerThis()", 10);
    }
};

MessageBox.prototype.showMess = function (val, temp) {
    if (this.paren.quiet) {
        if (console) {
            console.log(val);
        }
        return;
    }
    val = unescape(val);
    if (this.eraseMess) { clearTimeout(this.eraseMess); }
    if (!this.mb) { this.mb = Lance$(this.id); }
    var left = $(mapid).offset().left;
    var top = $(mapid).offset().top;
    var width = $(mapid).width();
    var height = $(mapid).height();
    if (this.mb) {

        this.mb.innerHTML = "<span>" + val + "</span>";
        if (temp) {
            this.eraseMess = setTimeout(this.myvar + ".hideMess();", temp);
        }

        var w = this.mb.offsetWidth / 2;
        var h = this.mb.offsetHeight / 2;
        this.mb.style.position = "absolute";
        this.mb.style.left = parseInt(width / 2 - w) + left + "px";
        this.mb.style.top = parseInt(height / 2 - h) + top + "px";
        this.mb.style.width = "";
        this.mb.style.height = "";
        this.centerMe = setTimeout(this.myvar + ".centerThis()", 5);
        this.mb.style.visibility = "visible";
        //alert(this.mb.style.left+"x"+this.mb.style.top+"l"+left+"t"+top+"w"+width+"h"+height);
        //if (parseInt(width/2 - w)+left<600)
        //@ alert("l"+left+"t"+top+"w"+width+"h"+height);
    }

    else {
        var d = document.createElement("div");
        d.innerHTML = val;
        var w = d.offsetWidth / 2;
        var h = d.offsetHeight / 2;
        d.id = this.myvar + "_message";
        d.style.position = "absolute";
        d.style.backgroundColor = this.style.backgroundColor || "silver";
        d.style.opacity = this.style.opacity || 0.80;
        if (document.all) {
            d.style.filter = "alpha(opacity=" + parseInt(d.style.opacity * 100, 10) + ")";
        }
        d.style.color = this.style.color || "black";
        d.style.padding = this.style.padding || "6px";
        d.style.borderWidth = this.style.borderWidth || "3px";
        d.style.borderColor = this.style.borderColor || "";
        d.style.backgroundImage = this.style.backgroundImage || "";
        d.style.borderStyle = this.style.borderStyle || "outset";
        d.style.visibility = "visible";
        d.style.left = parseInt(width / 2 - w) + left + "px";
        d.style.top = parseInt(height / 2 - h) + top + "px";
        //alert(this.myvar);
        this.centerMe = setTimeout(this.myvar + ".centerThis()", 5);

        d.style.zIndex = 1000;
        document.body.appendChild(d);
    }
};
