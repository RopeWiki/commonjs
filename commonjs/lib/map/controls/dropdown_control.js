﻿//google maps custom control to create a dropdown list for the map element


/************
 Classes to set up the drop-down control
 ************/


function dropdownItem(options) {
    var control = document.createElement("div");
    control.id = options.basename + "-item-" + options.type;
    control.className = dropdownCssBasename(options.basename) + " item";
    control.title = options.tooltip;

    // Set CSS for the control interior.
    var controlText = document.createElement("div");
    controlText.innerHTML = options.text;
    control.appendChild(controlText);

    google.maps.event.addDomListener(control,
        "click",
        function () {
            options.action();
        });

    return control;
}

function dropdownCheckbox(options) {
    var container = document.createElement("div");
    container.className = dropdownCssBasename(options.basename) + " checkbox";
    container.title = options.tooltip;

    var span = document.createElement("span");
    span.role = "checkbox";

    var chk = document.createElement("input");
    chk.setAttribute("type", "checkbox");
    chk.id = options.id;

    var controlText = document.createElement("label");
    controlText.setAttribute("for", chk.id);
    controlText.innerHTML = options.text;

    container.appendChild(chk);
    container.appendChild(controlText);

    google.maps.event.addDomListener(chk,
        "change",
        function () {
            options.action();
        });

    return container;
}

function dropdownSeparator(basename) {
    var sep = document.createElement("hr");
    sep.className = dropdownCssBasename(basename) + " separator";
    return sep;
}

function createDropdownControl(options) {

    var basename = options.basename;

    var dropdown = document.createElement("div");
    dropdown.className = dropdownCssBasename(basename) + " items-list";
    dropdown.id = basename + "-items-list";

    for (var i = 0; i < options.items.length; i++) {
        dropdown.appendChild(options.items[i]);
    }

    var container = document.createElement("div");
    container.id = basename + "-control";
    container.className = dropdownCssBasename(basename);
    container.style.cssText = "z-index: " + options.zIndex;

    var control = document.createElement("div");
    control.className = dropdownCssBasename(basename) + " selection";
    control.id = basename;

    var controlText = document.createElement("span");
    controlText.className = dropdownCssBasename(basename) + " selection-text";
    controlText.id = basename + "-current";
    controlText.innerHTML = dropdown.firstChild.firstChild.innerHTML;
    control.appendChild(controlText);

    var arrow = document.createElement("img");
    arrow.src = "http://maps.gstatic.com/mapfiles/arrow-down.png";
    arrow.className = dropdownCssBasename(basename) + " arrow";
    control.appendChild(arrow);

    container.appendChild(control);
    container.appendChild(dropdown);

    options.gmap.controls[options.position].push(container);

    function hideDropdownList(id) {
        document.getElementById(id).style.display = "none";
    }

    google.maps.event.addDomListener(control,
        "click",
        function () {
            if (document.getElementById(dropdown.id).style.display === "" ||
                document.getElementById(dropdown.id).style.display === "none") {
                document.getElementById(dropdown.id).style.display = "block";
            }
            else
                hideDropdownList(dropdown.id);
        });

    document.addEventListener("click",
        function (event) {
            var targetElement = event.target || event.srcElement;

            if (targetElement.id !== basename + "-current" &&
                targetElement.id !== basename &&
                targetElement.parentElement && targetElement.parentElement.id !== basename + "-items-list" &&
                targetElement.parentElement.parentElement && targetElement.parentElement.parentElement.id !== basename + "-items-list") {
                var dropdownList = document.getElementById(dropdown.id);
                if (dropdownList && dropdownList.style.display === "block")
                    hideDropdownList(dropdown.id);
            }
        });

    if (!!options.dropdownHideTimer) {
        google.maps.event.addDomListener(container,
            "mouseleave",
            function () {
                options.dropdownHideTimer = setTimeout(function () {
                    hideDropdownList(dropdown.id);
                },
                    1000);
            });

        google.maps.event.addDomListener(container,
            "mouseenter",
            function () {
                clearTimeout(options.dropdownHideTimer);
            }
        );
    }
}

function setDropdownSelection(basename, selected) {
    var item, i;

    var fullList = document.getElementById(basename + "-items-list").childNodes;

    if (!selected) { //this would be null if the cookie was set to a map layer that is not available on the current map
        var label = document.getElementById(basename + "-current").innerHTML;
        for (i = 0; i < fullList.length; i++) {
            item = fullList[i];
            if (item.firstChild && item.firstChild.innerHTML === label) {
                selected = item.id;
                break;
            }
        }
    }

    var element = document.getElementById(basename + "-item-" + selected);
    document.getElementById(basename + "-current").innerHTML = element.firstChild.innerHTML;
    for (i = 0; i < fullList.length; i++) {
        item = fullList[i];
        if (item.classList.contains("selected")) {
            item.classList.remove("selected");
        }
    }

    element.classList.add("selected");
}

function dropdownCssBasename(basename) {
    return "map-control dropdown " + basename;
}
