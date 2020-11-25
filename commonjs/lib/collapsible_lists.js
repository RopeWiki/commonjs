/*

CollapsibleLists.js

An object allowing lists to dynamically expand and collapse

Created by Stephen Morley - http://code.stephenmorley.org/ - and released under
the terms of the CC0 1.0 Universal legal code:

http://creativecommons.org/publicdomain/zero/1.0/legalcode

*/

// create the CollapsibleLists object
var clistloading;
//var nregionlist = 0;
//var cregionlist = [];
var clistcookie = "regionlist";
var CollapsibleLists =
    new function() {

        /* Makes all lists with the class 'collapsibleList' collapsible. The
         * parameter is:
         *
         * doNotRecurse - true if sub-lists should not be made collapsible
         */
        this.apply = function (doNotRecurse) {

            // load original status
            clistloading = getCookie(clistcookie);
            if (!clistloading) clistloading = "<World>";
            //console.log(clistloading);

            // loop over the unordered lists
            var uls = document.getElementsByTagName('ul');
            for (var index = 0; index < uls.length; index++) {

                // check whether this list should be made collapsible
                if (uls[index].className.match(/(^| )collapsibleList( |$)/)) {

                    // make this list collapsible
                    this.applyTo(uls[index], true);

                    // check whether sub-lists should also be made collapsible
                    if (!doNotRecurse) {

                        // add the collapsibleList class to the sub-lists
                        var subUls = uls[index].getElementsByTagName('ul');
                        for (var subIndex = 0; subIndex < subUls.length; subIndex++) {
                            subUls[subIndex].className += ' collapsibleList';
                        }

                    }

                }

            }
            clistloading = null;

            getregioncount();
        };

        /* Makes the specified list collapsible. The parameters are:
         *
         * node         - the list element
         * doNotRecurse - true if sub-lists should not be made collapsible
         */
        this.applyTo = function (node, doNotRecurse) {

            // REGION ROPEWIKI PATCH
            var lis, tag;
            if ((lis = node.getElementsByTagName(tag = 'A')).length == 0)
                lis = node.getElementsByTagName(tag = 'SPAN');
            var list = [], titles = [];
            for (var index = 0; index < lis.length; index++)
                list.push(lis[index]);

            for (var index = 0; index < list.length; index++) {
                var dup = -1;
                if (tag == 'A') {
                    dup = titles.indexOf(list[index].href);
                    titles.push(list[index].href);
                } else {
                    dup = titles.indexOf(list[index].innerHTML);
                    titles.push(list[index].innerHTML);
                }
                if (dup < 0) continue;
                // duplicate node! find li nodes
                var li1 = list[index];
                while (li1 && li1.tagName != "LI")
                    li1 = li1.parentNode;
                var uls1 = li1.getElementsByTagName('UL');
                var li2 = list[dup];
                while (li2 && li2.tagName != "LI")
                    li2 = li2.parentNode;
                var uls2 = li2.getElementsByTagName('UL');

                if (uls1.length > 0 && uls2.length == 0)
                    li2.appendChild(uls1[0].cloneNode(true));
                else if (uls2.length > 0 && uls1.length == 0)
                    li1.appendChild(uls2[0].cloneNode(true));
            }

            // loop over the list items within this node
            var lis = node.getElementsByTagName('li');
            for (var index = 0; index < lis.length; index++) {

                // check whether this list item should be collapsible
                if (!doNotRecurse || node == lis[index].parentNode) {

                    // prevent text from being selected unintentionally
                    if (lis[index].addEventListener) {
                        lis[index].addEventListener(
                            'mousedown', function (e) {
                                e.preventDefault();
                            }, false);
                    } else {
                        lis[index].attachEvent(
                            'onselectstart', function () {
                                event.returnValue = false;
                            });
                    }

                    // add the click listener
                    if (lis[index].addEventListener) {
                        lis[index].addEventListener(
                            'click', createClickListener(lis[index]), false);
                    } else {
                        lis[index].attachEvent(
                            'onclick', createClickListener(lis[index]));
                    }

                    // close the unordered lists within this list item
                    toggle(lis[index]);

                }

            }

        };

        /* Returns a function that toggles the display status of any unordered
         * list elements within the specified node. The parameter is:
         *
         * node - the node containing the unordered list elements
         */
        function createClickListener(node) {

            // return the function
            return function (e) {

                // ensure the event object is defined
                if (!e) e = window.event;

                // find the list item containing the target of the event
                var li = (e.target ? e.target : e.srcElement);
                //while (li.nodeName != 'LI')
                //    li = li.parentNode;

                // only process LI node events
                if (li.nodeName != 'LI')
                    return;

                // toggle the state of the node if it was the target of the event
                if (li == node) {
                    toggle(node);
                    getregioncount();
                }

            };

        }

        /* Opens or closes the unordered list elements directly within the
         * specified node. The parameter is:
         *
         * node - the node containing the unordered list elements
         */
        function toggle(node) {

            // determine whether to open or close the unordered lists
            var open = node.className.match(/(^| )collapsibleListClosed( |$)/);
            open = save(node, open);

            // loop over the unordered list elements with the node
            var uls = node.getElementsByTagName('ul');
            for (var index = 0; index < uls.length; index++) {

                // find the parent list item of this unordered list
                var li = uls[index];
                while (li.nodeName != 'LI') li = li.parentNode;

                // style the unordered list if it is directly within this node
                if (li == node) {
                    uls[index].style.display = (open ? 'block' : 'none');

                    // on-demand region count
                    if (open) {
                        var regionlist = [];
                        regioncountlist(uls[index], regionlist);
                        regioncount(regionlist);
                    }
                }

            }

            // remove the current class from the node
            node.className =
                node.className.replace(
                    /(^| )collapsibleList(Open|Closed)( |$)/, '');

            // if the node contains unordered lists, set its class
            if (uls.length > 0) {
                node.className += ' collapsibleList' + (open ? 'Open' : 'Closed');
            }

        }

        function save(node, open) {
            var href = null;
            var links = node.getElementsByTagName("a");
            if (links.length == 0)
                links = node.getElementsByTagName("span");
            if (links.length > 0)
                href = links[0].innerHTML;
            if (!href)
                return open;

            href = '<' + href + '>';

            if (clistloading != null) {
                if (clistloading.indexOf(href) >= 0)
                    return true;
                else
                    return false;
            } else {
                // save status
                var str = getCookie(clistcookie);
                str = str.split(href).join('')
                if (open)
                    str += href;
                setCookie(clistcookie, str);
            }
            return open;
        }

        function getregioncount() {
            /*
             while (nregionlist<cregionlist.length)
               {
               // process in batches of 10
               var rlist = [];
               for (var n=0; nregionlist<cregionlist.length && n<10; ++n, ++nregionlist)
                   rlist.push(cregionlist[nregionlist]);
               regioncount(rlist);
               }
            */
        }
        
        function regioncount(rlist) {
            var titles = [];
            for (var r = 0; r < rlist.length; ++r) {
                var title = 'NOTEXIST';
                var region = rlist[r].getElementsByTagName('A');
                if (region && region.length > 0)
                    title = region[0].title;
                titles.push(title);
            }

            var url = SITE_BASE_URL + '/index.php?title=Template:RegionCount&action=raw&templates=expand&ctype=text/x-wiki&region=' + urlencode(titles.join(';'));
            $.get(geturl(url), function (data) {
                var rdata = data.split(';');
                for (var r = 0; r < rlist.length; ++r)
                    rlist[r].innerHTML = rlist[r].innerHTML + ' ' + rdata[r];
            });
        }

        function regioncountlist(elem, list) {
            for (var i = 0; i < elem.childNodes.length; ++i) {
                var child = elem.childNodes[i];
                if (child.style && child.style.display != 'none') {
                    if (list.length < 30 && child.className && child.className.indexOf('regioncount') >= 0) {
                        $(child).removeClass('regioncount');
                        list.push(child);
                    }
                    if (child.childNodes.length > 0)
                        if (child.tagName == 'LI')
                            regioncountlist(child, list);
                }
            }
        }
    }();
