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

    var control = document.createElement("div");

    var innerHtml = "<b>General Comment:</b> <span id='generalcomment-comment'>" + comment + '</span>';

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
        
        saveComment(state);
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

function saveComment(state) {
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

    //set comment
    const commentMarker = "|Comment=";
    const commentEndMarker = "\n";

    var startIndex = content.indexOf(commentMarker);
    var endIndex;
    if (startIndex > 0) {
        endIndex = content.indexOf(commentEndMarker, startIndex) + commentEndMarker.length;
    } else {
        startIndex = content.indexOf("}}");
        endIndex = startIndex;
    }

    var newPageContent = content.substring(0, startIndex) + commentMarker + state.newComment + commentEndMarker + content.substring(endIndex);
    
    //set user date
    if (state.editingRowItem) {
        content = newPageContent;

        const dateMarker = "|Date=";
        const dateEndMarker = "\n";

        startIndex = content.indexOf(dateMarker);
        if (startIndex > 0) {
            endIndex = content.indexOf(dateEndMarker, startIndex) + dateEndMarker.length;
        } else {
            startIndex = content.indexOf("}}");
            endIndex = startIndex;
        }

        newPageContent = content.substring(0, startIndex) + dateMarker + state.newUserDate + dateEndMarker + content.substring(endIndex);
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