var listUser, listName, isUserListTableVar;

function isUserListTable() {
    if (isUserListTableVar === undefined) {
        var lstUser = document.getElementById("user");
        var lstName = document.getElementById("list");

        if (lstUser && lstName) {
            listUser = lstUser.innerHTML;
            listName = lstName.innerHTML;
            isUserListTableVar = true;
        } else
            isUserListTableVar = false;
    }

    return isUserListTableVar;
}

function isUserListIsOwned() {

    var currentUser = mw.config.get("wgUserName");

    return currentUser === listUser;
}

function isUserListTableEditable() {
    
    var chk = document.getElementById("listTableEnableEditing");
    var enableChecked = !!chk && chk.checked;

    return isUserListIsOwned() && enableChecked;
}

function setUserListGeneralComment(data) {

    var comment = Object.keys(data.query.results).length > 0
        ? data.query.results[Object.keys(data.query.results)[0]].printouts[""][0] //complicated, but works
        : "";

    if (comment === undefined) comment = "";

    drawUserListGeneralComment(comment);
}

function drawUserListGeneralComment(comment) {

    var table = document.getElementById("loctable");
    if (!table) return;

    var enabledSlider = document.getElementById("userListEditableEnabled");
    if (!enabledSlider && isUserListIsOwned()) {
        enabledSlider = document.createElement("div");
        enabledSlider.id = 'userListEditableEnabled';

        //add editable toggle
        enabledSlider.innerHTML = '<span>Edit this list:&nbsp;&nbsp;&nbsp;</span><label class="toggleswitch"><input type="checkbox" id="listTableEnableEditing" onclick="toggleUserListEnableEditing()" ><span class="toggleslider round"></span></label>';
        table.parentNode.insertBefore(enabledSlider, table);
    }

    var control = document.getElementById("generalcomment");
    if (!control) {
        control = document.createElement("div");
        control.id = 'generalcomment';

        var innerHtml = '<table><tbody>';
        
        //add comment line
        innerHtml += '<tr><td class="generalcomment-header"><b>General Comment:</b>';

        //add edit button
        if (isUserListTableEditable()) {
            innerHtml +=
                '<br>' +
                '<input type="button" value="Edit"   id="generalcomment-edit"       title="Edit general comment" onclick="editComment(\'generalcomment\')"       class="userlistbutton edit"> ' +
                '<input type="button" value="\u2298" id="generalcomment-canceledit" title="Cancel the changes"   onclick="cancelEditComment(\'generalcomment\')" class="userlistbutton cancel" style="display:none"> ';
        }

        innerHtml += '</td><td class="generalcomment-cell"><span id="generalcomment-comment"></span></td></tr></tbody><table><br>';

        control.innerHTML = innerHtml;
        table.parentNode.insertBefore(control, table);
    }

    var commentElement = document.getElementById("generalcomment-comment");
    commentElement.textContent = comment;
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

    if (isUserListTableEditable()) {
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
                '<input type="button" value="Edit"   id="[LocationName]-edit"       title="Edit date and comment" onclick="editComment(\'[LocationNameWithoutApostrophe]\')"                class="userlistbutton edit"> ' +
                '<input type="button" value="\u2298" id="[LocationName]-canceledit" title="Cancel the changes"    onclick="cancelEditComment(\'[LocationNameWithoutApostrophe]\')"          class="userlistbutton cancel" style="display:none"> ' +
                '<input type="button" value="\u2716" id="[LocationName]-remove"     title="Remove from this list" onclick="removeLocationFromUserList(\'[LocationNameWithoutApostrophe]\')" class="userlistbutton remove"> ' +
            '</td>';

    var sanitisedId = escapeHtml(item.id);
    var sanitisedIdForJs = escapeHtml(item.id.split("'").join("%27"));

    var userDate = UserDate
        .replace(/\[UserDate]/, getTableUserDate(item.userDate))
        .replace(/\[LocationName]/, sanitisedId);

    var comment = Comment
        .replace(/\[Comment]/, (!item.comment ? "" : escapeHtml(item.comment)))
        .replace(/\[LocationName]/, sanitisedId);

    var html =
        userDate +
        getStandardTableRow(item) +
        comment;

    if (isUserListTableEditable()) {

        var editDelete = EditDelete
            .replace(/\[LocationName]/g, sanitisedId)
            .replace(/\[LocationNameWithoutApostrophe]/g, sanitisedIdForJs);

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
    elementId = elementId.split("%27").join("'");

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

            var dateString = userDateElement.innerHTML;

            // Extract the parts of the string
            var datePart = dateString.slice(dateString.length - 9, dateString.length - 7);
            var monthPart = dateString.slice(dateString.length - 7, dateString.length - 4);
            var yearPart = dateString.slice(dateString.length - 4);

            var formattedDateString = datePart + ' ' + monthPart + ' ' + yearPart;

            userDateElement.innerHTML = "<input type=\"date\" value=" + new Date(formattedDateString).toLocaleDateString('en-CA') + ">";
        }

        commentElement.originalText = commentElement.textContent;
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
        var newComment = commentElement.innerHTML;

        canceleditButton.style.display = "none";

        //update item with new comment and date
        for (var i = 0; i < markers.length; i++) {
            var marker = markers[i];
            if (marker.name !== elementId) continue;

            marker.locationData.comment = newComment;
            marker.locationData.userDate = newDate;
            break;
        }

        //save the data to mediawiki
        var state = {
            elementId: elementId,
            editingRowItem: editingRowItem,
            newComment: newComment,
            newUserDate: newDate
        };
        
        saveUserListEntry(state);
    }
}

var cancelEditComment = function (elementId) {
    elementId = elementId.split("%27").join("'");

    var editingRowItem = elementId !== "generalcomment";

    var commentElement = document.getElementById(elementId + "-comment");
    var userDateElement = document.getElementById(elementId + "-userdate");
    var editButton = document.getElementById(elementId + "-edit");
    var canceleditButton = document.getElementById(elementId + "-canceledit");

    if (editingRowItem)
        userDateElement.innerHTML = userDateElement.originalText;

    commentElement.contentEditable = false;
    commentElement.textContent = commentElement.originalText;

    editButton.value = "Edit";
    editButton.title = elementId === "generalcomment" ? "Edit general comment" : "Edit date and comment";
    editButton.classList.remove("commit");
    editButton.classList.add("edit");

    canceleditButton.style.display = "none";
}

var removeLocationFromUserList = function (elementId) {
    elementId = elementId.split("%27").join("'");

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
    if (state.newList !== undefined) {
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
    if (state.newLocation !== undefined) {
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
        if (response.error || response.edit.result !== "Success") {
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

        removeMarker(state.elementId);
    });
}

function GetBoilerPlatePageContent() {
    return "{{List\r\n" +
        "|User=" + listUser +"\r\n" +
        "|List=" + listName + "\r\n" +
        "|Comment=\r\n}}\r\n";
}

function addToList(elementId) {

    var name = 'modal-addToList';

    const ModalHtml =
        '<p><font size="+2"><b>Add <span class="modal-locationname">[LocationNameWithApostrophe]</span> to your own list</b></font></p>' +
        '<hr>' +
        '<details class="modal-details">' +
        '<summary>Instructions for lists</summary>' +
        '<p>Lists can be used to plan an upcoming trip, or to record past accomplishments. ' +
        'The link (url) for a list can be shared with others, but only you have the ability to edit lists that you created.</p>' +
        '<p>Choose one of your existing lists from the dropdown, or type in a name to create a new list.</p>' +
        '<p>You can add a date (such as proposed date in the future, or a date in the past when you completed it), and/or add a comment. Then click the "Save" button. ' +
        'These fields are also editable after the location has been added to the list; when viewing a list you can edit the individual entries from within the table itself.</p>' +
        '<p>You can only have a particular Ropewiki location included in one of your lists at a time. Correspondingly, each location can only have one date and comment associated with it.</p>' +
        '<p>A yellow highlight around a location marker on the map indicates that it is part of a list.</p>' +
        '<p>To remove a location from a list, you can assign it a blank "List name", or when viewing the list itself use the \'X\' button on the far right of each row in the table to remove it.</p>' +
        '<p>To view the lists you have created, click on the "Lists" link in the Ropewiki sidebar on the left.</p>' +
        '<p>To delete a list, when viewing it simply remove all entries from the table using the \'X\' buttons.</p>' +
        '</details>' +
        '<table class="formtable">' +
        '<tr><td><b>List name:</b></td><td><input type="text" id="modal-listname" list="existing-lists" autocomplete="off" onfocus="this.value=\'\'" /><datalist id="existing-lists"><option>Favorites</option></datalist></td></tr>' +
        '<tr><td><b>Date:</b></td><td><input type="date" id="modal-userdate" value="" /></td></tr>' +
        '<tr><td class="modal-comment-header"><b>Comment:</b></td><td id="modal-comment" contentEditable="true" class="modal-comment"></td></tr>' +
        '</table>' +
        '<br>' +
        '<input type="button" value="Save" onclick="commitAddToList(\'[LocationName]\')" class="map-control dropdown selection">';

    var modalHtml = ModalHtml
        .replace(/\[LocationNameWithApostrophe]/, escapeHtml(elementId.split("%27").join("'")))
        .replace(/\[LocationName]/, escapeHtml(elementId));

    createModal(name, modalHtml);
    openModal(name);

    var currentUser = mw.config.get("wgUserName");
    if (currentUser !== "null") {
        //load existing list names for this user
        var url = geturl(SITE_BASE_URL + '/api.php?action=ask&format=json' +
            '&query=' + urlencode('[[Has user::' + currentUser + ']][[Has list::+]][[Has location::+]]') +
            '|?Has list=|mainlabel=-');
        $.getJSON(url, function(data) {
            setUserListModalDropdown(data);
        });

        //load existing list values for this location
        var url = geturl(SITE_BASE_URL + '/api.php?action=ask&format=json' +
            '&query=' + urlencode('[[Has user::' + currentUser + ']][[Has location::' + elementId + ']]') +
            '|?Has list|?Has tentative date|?Has comment');
        $.getJSON(url, function (data) {
            setUserListModalExistingInfo(data);
        });
    }
}

function commitAddToList(elementId) {

    if (!listUser) {
        var currentUser = mw.config.get("wgUserName");
        if (currentUser !== "null") listUser = currentUser;
    }

    var listElement = document.getElementById("modal-listname");
    var userDateElement = document.getElementById("modal-userdate");
    var commentElement = document.getElementById("modal-comment");

    var list = listElement.value;
    var date = userDateElement.value !== "" ? parseInt(new Date(userDateElement.value).getTime() / 1000) : "";
    var comment = commentElement.innerHTML;

    //save the data to mediawiki
    elementId = elementId.split("%27").join("'"); //such as for Hades (Dante's Variation)

    var state = {
        elementId: elementId,
        editingRowItem: true,
        newLocation: elementId,
        newList: list,
        newComment: comment,
        newUserDate: date
    };

    saveUserListEntry(state);

    //set marker highlight
    if (list !== "") {
        addhighlight([elementId], MARKER_USERLIST_HIGHLIGHT);
    } else {
        var marker = markers.filter(function (x) {
            return x.name === state.elementId;
        })[0];

        if (marker.highlight) {
            marker.highlight.setMap(null);
            marker.highlight = null;
        }
    }

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

function setUserListModalExistingInfo(data) {
    var item = data.query.results[Object.keys(data.query.results)[0]];
    if (!item) return;

    var listElement = document.getElementById("modal-listname");
    var userDateElement = document.getElementById("modal-userdate");
    var commentElement = document.getElementById("modal-comment");

    var v = item.printouts["Has list"];
    if (v && v.length > 0) {
        listElement.value = v[0];
    }

    v = item.printouts["Has tentative date"];
    if (v && v.length > 0) {
        userDateElement.value = new Date(getTableUserDate(v[0])).toLocaleDateString('en-CA');
    }

    v = item.printouts["Has comment"];
    if (v && v.length > 0) {
        commentElement.textContent = v[0];
    }
}

function toggleUserListEnableEditing() {

    var commentElement = document.getElementById("generalcomment-comment");
    var comment = commentElement.textContent;

    var control = document.getElementById("generalcomment");
    control.parentElement.removeChild(control);

    drawUserListGeneralComment(comment);

    updateTable();
}