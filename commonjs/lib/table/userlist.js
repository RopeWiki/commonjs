var listUser, listName, userListTable, listTableIsEditable;

function isUserListTable() {
    if (userListTable === undefined) {
        var lstUser = document.getElementById("user");
        var lstName = document.getElementById("list");

        if (lstUser && lstName) {
            listUser = lstUser.innerHTML;
            listName = lstName.innerHTML;
            userListTable = true;

            var curuser = document.getElementById("curuser");
            if (curuser) {
                var currentUser = curuser.innerHTML;
                listTableIsEditable = currentUser === listUser;
            }
        } else
            userListTable = false;
    }

    return userListTable;
}

function setUserListGeneralComment(data) {

    var comment = Object.keys(data.query.results).length > 0
        ? data.query.results[Object.keys(data.query.results)[0]].printouts[""][0]  //complicated, but works
        : "";

    if (comment === undefined) comment = "";

    var table = document.getElementById("loctable");
    if (!table) return;

    var control = document.getElementById("generalcomment");
    if (!control) {
        control = document.createElement("div");
        control.id = 'generalcomment';

        var innerHtml = "<b>General Comment:</b> <span id='generalcomment-comment'></span>";

        if (listTableIsEditable) {
            innerHtml +=
                '&nbsp;&nbsp;' +
                '<input type="button" value="Edit"   id="generalcomment-edit"       title="Edit general comment" onclick="editComment(\'generalcomment\')"                class="userlistbutton edit"> ' +
                '<input type="button" value="\u2298" id="generalcomment-canceledit" title="Cancel the changes"   onclick="cancelEditComment(\'generalcomment\')"          class="userlistbutton cancel" style="display:none"> ';
        }

        innerHtml += '<br><br>';

        control.innerHTML = innerHtml;
        table.parentNode.insertBefore(control, table);
    }

    var commentElement = document.getElementById("generalcomment-comment");
    commentElement.innerHTML = comment;
}

function setUserListInfo(data) {
    $.each(data.query.results,
        function (i, item) {
            var name = item.printouts["Has location"][0].fulltext;
            var userDate = item.printouts["Has tentative date"][0];
            var comment = item.printouts["Has comment"][0];

            var marker = markers.filter(function (x) {
                return x.name === name;
            })[0];

            if (marker != undefined) {
                marker.locationData.userDate = userDate;
                marker.locationData.comment = comment;
            }
        });

    updateTable();
}

function getUserListTableHeaderRow() {

    const UserListTableUserDateColumn =
        '<th class="rwHdr">' +
            '<span class="rwText ctranslate">Date</span>' +
            '<span id="sort-userDate" title="Sort by date" class="rwSortIcon gmnoprint notranslate"></span>' +
        '</th>';

    const UserListTableCommentColumn =
        '<th class="rwHdr">' +
            '<span class="rwTextNoSort ctranslate">Comment</span>' +
        '</th>';

    const UserListTableEditColumn =
        '<th class="rwHdr">' +
            '<span class="rwTextNoSort ctranslate">Edit</span>' +
        '</th>';

    var header = UserListTableUserDateColumn + getStandardTableHeaderRow() + UserListTableCommentColumn;

    if (listTableIsEditable) {
        var userListTableEditColumn = UserListTableEditColumn
            .replace(/\[ListUser]/g, listUser)
            .replace(/\[ListName]/g, listName);

        header += userListTableEditColumn;
    }

    return header;
}

function getUserListTableRow(item) {
    
    const UserDate =
        '<td class="tdate" id="[LocationName]-userdate">[UserDate]</td>';

    const Comment =
        '<td class="tcomment" id="[LocationName]-comment">[Comment]</td>';

    const EditDelete =
            '<td class="noprint">' +
                '<input type="button" value="Edit"   id="[LocationName]-edit"       title="Edit date and comment" onclick="editComment(\'[LocationName]\')"                class="userlistbutton edit"> ' +
                '<input type="button" value="\u2298" id="[LocationName]-canceledit" title="Cancel the changes"    onclick="cancelEditComment(\'[LocationName]\')"          class="userlistbutton cancel" style="display:none"> ' +
                '<input type="button" value="\u2716" id="[LocationName]-remove"     title="Remove from this list" onclick="removeLocationFromUserList(\'[LocationName]\')" class="userlistbutton remove"> ' +
            '</td>';

    var userDate = UserDate
        .replace(/\[UserDate]/, getTableUserDate(item.userDate))
        .replace(/\[LocationName]/, item.id);

    var comment = Comment
        .replace(/\[Comment]/, (!item.comment ? "" : item.comment))
        .replace(/\[LocationName]/, item.id);

    var html =
        userDate +
        getStandardTableRow(item) +
        comment;

    if (listTableIsEditable) {

        var editDelete = EditDelete
            .replace(/\[LocationName]/g, item.id);

        html += editDelete;
    }

    return html;
}

function getTableUserDate(unix_timestamp) {
    if (!unix_timestamp) return "";

    var date = new Date(unix_timestamp * 1000);
    return days[date.getUTCDay()] + ' ' + date.getUTCDate() + months[date.getUTCMonth()] + date.getUTCFullYear();
}

// Edit/Remove functionality
var editComment = function (elementId) {
    var editingRowItem = elementId !== "generalcomment";

    var commentElement = document.getElementById(elementId + "-comment");
    var userDateElement = document.getElementById(elementId + "-userdate");
    var editButton = document.getElementById(elementId + "-edit");
    var canceleditButton = document.getElementById(elementId + "-canceledit");

    if (editButton.value === "Edit") {
        editButton.value = "\u2714"; //checkmark
        editButton.title = "Save the changes";
        editButton.classList.remove("edit");
        editButton.classList.add("commit");
        
        if (editingRowItem) {
            userDateElement.originalText = userDateElement.innerHTML;
            userDateElement.innerHTML = "<input type=\"date\" value=" + new Date(userDateElement.innerHTML).toLocaleDateString('en-CA') + ">";
        }

        commentElement.originalText = commentElement.innerHTML;
        commentElement.contentEditable = true;
        commentElement.focus();

        if (commentElement.getAttribute('keydown-listener') !== 'true') {
            commentElement.addEventListener("keydown",
                function(event) {
                    if (event.keyCode === 13 && !event.getModifierState("Shift")) {
                        //commit change
                        editComment(elementId);
                        return false;
                    }
                    return true;
                });
            commentElement.setAttribute('keydown-listener', 'true');
        }

        canceleditButton.style.display = "inline-block";
    } else {
        editButton.value = "Edit";
        editButton.title = elementId === "generalcomment" ? "Edit general comment" : "Edit date and comment";
        editButton.classList.remove("commit");
        editButton.classList.add("edit");

        var newDate = null;
        if (editingRowItem) {
            //convert date to unix timestamp
            newDate = parseInt(new Date(userDateElement.firstChild.value).getTime() / 1000);

            userDateElement.innerHTML = getTableUserDate(newDate);
        }

        commentElement.contentEditable = false;

        canceleditButton.style.display = "none";

        //save the data to mediawiki
        var state = {
            elementId: elementId,
            editingRowItem: editingRowItem,
            newComment: commentElement.innerHTML,
            newUserDate: newDate
        };
        
        saveUserListEntry(state);
    }
}

var cancelEditComment = function (elementId) {
    var editingRowItem = elementId !== "generalcomment";

    var commentElement = document.getElementById(elementId + "-comment");
    var userDateElement = document.getElementById(elementId + "-userdate");
    var editButton = document.getElementById(elementId + "-edit");
    var canceleditButton = document.getElementById(elementId + "-canceledit");

    if (editingRowItem)
        userDateElement.innerHTML = userDateElement.originalText;

    commentElement.contentEditable = false;
    commentElement.innerHTML = commentElement.originalText;

    editButton.value = "Edit";
    editButton.title = elementId === "generalcomment" ? "Edit general comment" : "Edit date and comment";
    editButton.classList.remove("commit");
    editButton.classList.add("edit");

    canceleditButton.style.display = "none";
}

var removeLocationFromUserList = function (elementId) {
    var state = {
        elementId: elementId,
        editingRowItem: true
    };

    getCsrfToken(deleteLocation, state);
}

var csrfToken;
function getCsrfToken(callback, state) {
    if (csrfToken === undefined) {
        $.getJSON(geturl(SITE_BASE_URL + '/api.php?action=query&meta=tokens&format=json'),
            function (data) {
                csrfToken = data.query.tokens.csrftoken;
                getCsrfToken(callback, state);
            });
        return;
    }

    getPageContent(callback, state);
}

function saveUserListEntry(state) {
    getCsrfToken(editRequest, state);
}

function getPageContent(callback, state) {

    state.pageTitle = state.editingRowItem
        ? "Lists:" + listUser + "/" + state.elementId.replace(/\s/g, '_') //row item
        : "Lists:" + listUser + "/List:" + listName.replace(/\s/g, '_'); //general comment

    $.getJSON(geturl(SITE_BASE_URL + '/api.php?action=parse&page=' + state.pageTitle + '&prop=wikitext&format=json'),
        function (data) {
            var content = data.parse !== undefined
                ? data.parse.wikitext["*"]
                : GetBoilerPlatePageContent();

            state.pageContent = content;

            callback(state);
        });
}

function editRequest(state) {

    var content = state.pageContent;
    const endMarker = "\n";

    //set comment
    const commentMarker = "|Comment=";
    
    var startIndex = content.indexOf(commentMarker);
    var endIndex;
    if (startIndex > 0) {
        endIndex = content.indexOf(endMarker, startIndex) + endMarker.length;
    } else {
        startIndex = content.indexOf("}}");
        endIndex = startIndex;
    }

    var newPageContent = content.substring(0, startIndex) + commentMarker + state.newComment + endMarker + content.substring(endIndex);
    
    //set user date
    if (state.editingRowItem) {
        content = newPageContent;

        const dateMarker = "|Date=";

        startIndex = content.indexOf(dateMarker);
        if (startIndex > 0) {
            endIndex = content.indexOf(endMarker, startIndex) + endMarker.length;
        } else {
            startIndex = content.indexOf("}}");
            endIndex = startIndex;
        }

        newPageContent = content.substring(0, startIndex) + dateMarker + state.newUserDate + endMarker + content.substring(endIndex);
    }

    //set list name
    if (state.newList) {
        content = newPageContent;

        const listMarker = "|List=";

        startIndex = content.indexOf(listMarker);
        if (startIndex > 0) {
            endIndex = content.indexOf(endMarker, startIndex) + endMarker.length;
        } else {
            startIndex = content.indexOf("}}");
            endIndex = startIndex;
        }

        newPageContent = content.substring(0, startIndex) + listMarker + state.newList + endMarker + content.substring(endIndex);
    }

    //set location name
    if (state.newLocation) {
        content = newPageContent;

        const locationMarker = "|Location=";

        startIndex = content.indexOf(locationMarker);
        if (startIndex > 0) {
            endIndex = content.indexOf(endMarker, startIndex) + endMarker.length;
        } else {
            startIndex = content.indexOf("}}");
            endIndex = startIndex;
        }

        newPageContent = content.substring(0, startIndex) + locationMarker + state.newLocation + endMarker + content.substring(endIndex);
    }

    //call to server
    var params = {
        action: "edit",
        title: state.pageTitle,
        text: newPageContent,
        token: csrfToken,
        format: "json"
    };

    $.post(geturl(SITE_BASE_URL + '/api.php'), params, function (response) {
        if (response.edit.result !== "Success") {
            return;
        }
    });
}

function deleteLocation(state) {

    const listsMarker = "|List=";
    const listsEndMarker = "\n";
    var content = state.pageContent;

    var startIndex = content.indexOf(listsMarker);
    if (startIndex < 0) return; //no lists entry, nothing to remove

    var endIndex = content.indexOf(listsEndMarker, startIndex + listsMarker.length) + listsEndMarker.length;
    var currentLists = content.substring(startIndex + listsMarker.length, endIndex - 1);

    currentLists = currentLists
        .replace(',' + listName, "")
        .replace(listName + ',', "")
        .replace(listName, "");
    
    var newPageContent = content.substring(0, startIndex) + listsMarker + currentLists + listsEndMarker + content.substring(endIndex);

    var params = {
        action: "edit",
        title: state.pageTitle,
        text: newPageContent,
        token: csrfToken,
        format: "json"
    };

    $.post(geturl(SITE_BASE_URL + '/api.php'), params, function (response) {
        if (response.edit.result !== "Success") {
            return;
        }

        //remove row from table
        var marker = markers.filter(function (x) {
            return x.name === state.elementId;
        })[0];

        marker.isVisible = false;
        marker.setMap(null);
        if (marker.closedMarker) marker.closedMarker.setMap(null);
        if (marker.highlight) marker.highlight.setMap(null);

        updateTable();
    });
}

function GetBoilerPlatePageContent() {
    return "{{List\r\n" +
        "|User=" + listUser +"\r\n" +
        "|List=" + listName + "\r\n" +
        "|Comment=\r\n}}\r\n";
}


function addToList(id) {

    var name = 'modal-addToList';
    var innerHtml =
        '<p><font size="+2"><b>Add <span style="color:#0645AD;">' + id + '</span> to your own list</b></font></p>' +
        '<hr>' +
        '<details style="margin-top:20px;margin-bottom:10px;">' +
        '<summary>Instructions for lists</summary>' +
        '<p>Choose an existing list from the dropdown, or type in a name to create a new list. Lists can be used to plan an upcoming trip, or to record past accomplishments. ' +
        'The link (url) for a list can be shared with others, but only you have the ability to edit lists that you created.<br>' +
        'You can add a date (such as proposed date in the future, or a date in the past when you completed it), and/or add a comment. Then click the "Save" button.<br>' +
        'These fields are also editable after the location has been added to the list.<br>' +
        'A yellow highlight around a location indicates that it is part of a list.<br>' +
        'Each Ropewiki location can only be part of one list at a time.<br>' +
        '<br>' +
        'To view the lists you have created, click on the "Lists" link in the Ropewiki sidebar on the left.<br>' +
        'To delete a list, when viewing it simply remove all entries using the \'X\' buttons on the far right of each row.' +
        '</p>' +
        '</details>' +
        '<table class="formtable">' +
        '<tr><td><b>List name:</b></td><td><input type="text" id="modal-listname" list="existing-lists" autocomplete="off" /><datalist id="existing-lists"><option>Favorites</option></datalist></td></tr>' +
        '<tr><td><b>Date:</b></td><td><input type="date" id="modal-userdate" value="" /></td></tr>' +
        '<tr><td><b>Comment:</b></td><td id="modal-comment" contentEditable="true" style="border:1px solid #808080; padding:4px;border-radius:3px;"></td></tr>' +
        '</table>' +
        '<br>' +
        '<input type="button" value="Save" id="add-to-list" onclick="commitAddToList(\'' + id + '\')" class="map-control dropdown selection">';

    createModal(name, innerHtml);
    openModal(name);

    //load existing lists
    var curuser = document.getElementById("curuser");
    if (curuser) {
        var currentUser = curuser.innerHTML;
        var url = geturl(SITE_BASE_URL + '/api.php?action=ask&format=json' +
            '&query=' + urlencode('[[Has user::' + currentUser + ']][[Has list::+]][[Has location::+]]') +
            '|?Has list=|mainlabel=-');
        $.getJSON(url, function(data) {
                setUserListModalDropdown(data);
            });
    }
    return;

    var oldid;

    function reattribute(elem) {
        var elems = elem.childNodes;
        for (var e = 0; e < elems.length; ++e) {
            elem = elems[e];
            if (elem.attributes)
                for (var a = 0; a < elem.attributes.length; ++a) {
                    if (elem.attributes[a].value.indexOf(oldid) >= 0)
                        elem.attributes[a].value = elem.attributes[a].value.split(oldid).join(id);
                }
            reattribute(elem);
        }
    }

    var kmladdbutton = document.getElementById("kmladdbutton");
    if (kmladdbutton) {
        reattribute(kmladdbutton);
        var kmlform = kmladdbutton.getElementsByTagName('BUTTON');
        if (kmlform.length > 0)
            kmlform[0].click();

        if (lastinfowindow)
            lastinfowindow.close();

        var idlist = [id];
        addhighlight(idlist);
        oldid = id;
    }
}

function commitAddToList(elementId) {

    if (!listUser) {
        var curuser = document.getElementById("curuser");
        if (curuser) listUser = curuser.innerHTML;
    }

    var listElement = document.getElementById("modal-listname");
    var userDateElement = document.getElementById("modal-userdate");
    var commentElement = document.getElementById("modal-comment");

    var list = listElement.value;
    var date = userDateElement.value !== "" ? parseInt(new Date(userDateElement.value).getTime() / 1000) : null;
    var comment = commentElement.innerHTML;

    //save the data to mediawiki
    var state = {
        elementId: elementId,
        editingRowItem: true,
        newLocation: elementId,
        newList: list,
        newComment: comment,
        newUserDate: date
    };

    saveUserListEntry(state);

    var modal = document.getElementById('modal-addToList');
    modal.style.display = "none";
}

function setUserListModalDropdown(data) {
    var arr = [];
    arr.push("Favorites");

    $.each(data.query.results, function (index, value) {
        var val = value.printouts[""][0].trim();
        if (arr.indexOf(val) === -1) {
            arr.push(val);
        }
    });

    arr.sort();
    
    var html = "";
    for (var i = 0; i < arr.length; ++i) {
        html += '<option>' + arr[i] + '</option>';
    }

    var listdropdown = document.getElementById("existing-lists");
    listdropdown.innerHTML = html;
}