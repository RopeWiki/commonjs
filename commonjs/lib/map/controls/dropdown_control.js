//google maps custom control to create a dropdown list for the map element

/**
 This is how the structure of the id's and class naming goes (using map-layer as the example):
 
basename = 'map-layer'

id=map-layer-control		    class = map-control dropdown map-layer

  id=map-layer			        class = map-control dropdown map-layer selection
     id=map-layer-current	    class = map-control dropdown map-layer selection-text
     (arrow)			        class = map-control dropdown map-layer arrow

  id=map-layer-items-list	    class = map-control dropdown map-layer items-list
   each entry:
      id=map-layer-item-terrain	class = map-control dropdown map-layer item
      (etc)  			        --and 'selected' for the one selected

also these classes:
 map-control dropdown map-layer checkbox
 map-control dropdown map-layer separator
 map-control dropdown map-layer item:hover,  map-control dropdown map-layer checkbox:hover
 */


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
    dropdown.bottomUp = options.bottomUp;

    for (var i = 0; i < options.items.length; i++) {
        dropdown.appendChild(options.items[i]);
    }

    var container = document.createElement("div");
    container.id = basename + "-control";
    container.className = dropdownCssBasename(basename);
    container.style.cssText = "z-index: " + options.zIndex;

    var selectedItem = document.createElement("div");
    selectedItem.className = dropdownCssBasename(basename) + " selection";
    selectedItem.id = basename;

    var selectedItemText = document.createElement("span");
    selectedItemText.className = dropdownCssBasename(basename) + " selection-text";
    selectedItemText.id = basename + "-current";
    selectedItemText.innerHTML = dropdown.firstChild.firstChild.innerHTML;
    selectedItem.appendChild(selectedItemText);

    var arrow = document.createElement("img");
    arrow.className = dropdownCssBasename(basename) + " arrow";
    dropdown.arrowElement = arrow;
    setArrow(dropdown);
    selectedItem.appendChild(arrow);
    
    if (!options.bottomUp) {
        container.appendChild(selectedItem);
        container.appendChild(dropdown);
    } else {
        container.appendChild(dropdown);
        container.appendChild(selectedItem);
    }

    options.gmap.controls[options.position].push(container);

    function hideDropdownList(dropdown) {
        dropdown.style.display = "none";
        setArrow(dropdown);
    }

    google.maps.event.addDomListener(selectedItem,
        "click",
        function () {
            if (dropdown.style.display === "" ||
                dropdown.style.display === "none") {
                dropdown.style.display = "block";
                setArrow(dropdown);
            }
            else
                hideDropdownList(dropdown);
        });

    document.addEventListener("click",
        function (event) {
            var targetElement = event.target || event.srcElement;

            if (targetElement.id !== basename + "-current" &&
                targetElement.id !== basename &&
                targetElement.parentElement && targetElement.parentElement.id !== basename + "-items-list" &&
                targetElement.parentElement.parentElement && targetElement.parentElement.parentElement.id !== basename + "-items-list") {
                if (dropdown.style.display === "block")
                    hideDropdownList(dropdown);
            }
        });

    if (!!options.dropdownHideTimer) {
        google.maps.event.addDomListener(container,
            "mouseleave",
            function () {
                options.dropdownHideTimer = setTimeout(function () {
                    hideDropdownList(dropdown);
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

function setArrow(dropdown) {
    var expanded = dropdown.style.display === "block";
    dropdown.arrowElement.src = !!(dropdown.bottomUp) === expanded
        ? "http://maps.gstatic.com/mapfiles/arrow-down.png"
        : "http://maps.gstatic.com/mapfiles/arrow-up.png";
}

function dropdownCssBasename(basename) {
    return "map-control dropdown " + basename;
}
