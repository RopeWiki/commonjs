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
            '<form action="/Special:FormEdit/List/Lists:[ListUser]/List:[ListName]" method="get" class="popupformlink" target="_self"><button type="submit" value="General Comment">General Comment</button></form>' +
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
        '<td class="tdate">[UserDate]</td>';

    const Comment =
        '<td class="tcomment" id="[LocationName]-comment">[Comment]</td>';

    const EditDelete =
            '<td class="noprint">' +
                '<input type="button" value="Edit" id="[LocationName]-edit" onclick="editComment(\'[LocationName]\')" class="plain"> ' +
                '<input type="button" value="\u2716" id="[LocationName]-canceledit" onclick="cancelEditComment(\'[LocationName]\')" class="plain" style="display:none"> ' +
                '<input type="button" value="Remove" id="[LocationName]-remove" onclick="removeLocationFromUserList(\'[LocationName]\')" class="plain"> ' +
            '</td>';
    
    var userDate = UserDate
        .replace(/\[UserDate]/, getTableUserDate(item.userDate));

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
    var commentElement = document.getElementById(elementId + "-comment");
    var editButton = document.getElementById(elementId + "-edit");
    var canceleditButton = document.getElementById(elementId + "-canceledit");
    if (editButton.value === "Edit") {
        editButton.value = "\u2714"; //checkmark

        commentElement.originalText = commentElement.innerHTML;
        commentElement.contentEditable = true;
        commentElement.focus();

        canceleditButton.style.display = "inline-block";
    } else {
        editButton.value = "Edit";

        commentElement.contentEditable = false;

        canceleditButton.style.display = "none";

        //save the data to mediawiki
        saveComment(elementId, commentElement.innerHTML);
    }
}

var cancelEditComment = function (elementId) {
    var commentElement = document.getElementById(elementId + "-comment");
    var editButton = document.getElementById(elementId + "-edit");
    var canceleditButton = document.getElementById(elementId + "-canceledit");

    commentElement.contentEditable = false;
    commentElement.innerHTML = commentElement.originalText;

    editButton.value = "Edit";

    canceleditButton.style.display = "none";
}

var removeLocationFromUserList = function (elementId) {
    var state = {
        elementId: elementId
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

function saveComment(elementId, newComment) {
    var state = {
        elementId: elementId,
        newComment: newComment
    };

    getCsrfToken(editRequest, state);
}

function getPageContent(callback, state) {

    state.pageTitle = "Lists:" + listUser + "/" + state.elementId.replace(/\s/g, '_');

    //$.getJSON(geturl(SITE_BASE_URL + '/api.php?action=query&prop=revisions&titles=' + pageTitle + '&rvprop=content&format=json'),
    $.getJSON(geturl(SITE_BASE_URL + '/api.php?action=parse&page=' + state.pageTitle + '&prop=wikitext&format=json'),
        function (data) {
            var content = data.parse.wikitext["*"];

            state.pageContent = content;

            callback(state);
        });
}

function editRequest(state) {

    const commentMarker = "|Comment=";
    const commentEndMarker = "\n";

    var content = state.pageContent;

    var startIndex = content.indexOf(commentMarker);
    var endIndex;
    if (startIndex > 0) {
        endIndex = content.indexOf(commentEndMarker, startIndex) + commentEndMarker.length;
    } else {
        startIndex = content.indexOf("}}");
        endIndex = startIndex;
    }

    var newPageContent = content.substring(0, startIndex) + commentMarker + state.newComment + commentEndMarker + content.substring(endIndex);

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

        updateTable();
    });
}