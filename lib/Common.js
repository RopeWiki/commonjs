/* Any JavaScript here will be loaded for all users on every page load. */

  function rap(raps, space)
  {
	if (isNaN(raps))
	  return "";
	return raps + (space ? "&nbsp;" : "") + "r";
  }

  function acaconv(str, more)
  {
	var end = str.indexOf(')');         
	if (end<0)
	  return str;
	var start = str.indexOf('*')+1; 
	while (start<end && !(str.charAt(start)>='1' && str.charAt(start)<='4'))
	   ++start;
	if (start>=3 && str.substr(start-3,3)=='<i>')
		   start -=3;
	var rating = str.substr(start, end-start).split('(');
	if (rating.length<2)
	  return str;
	var val = rating[french ? 1 : 0].trim();    
	if (more)
	  val += ' ('+rating[french ? 0 : 1].trim()+')';
	return str.substr(0, start) + val + str.substr(end+1);
  }
  
  function smallstyle()
  {
  WebViewStyle();
  $("#p-logo a").attr("href", "#");
  /* DISABLED! USING CSS
  // set meta viewport (not used)
  // $('head').append('<meta name="viewport" content="width=device-width; initial-scale=1.0;">');
   // set style based on screen size
   var width = $(window).width();
   if (screen) 
	  if (screen.width<width)
	   width = screen.width;
   var e = document.getElementById('p-navigation-label');
   if (e) e.innerHTML = width;
   if (width<970)
	{
	// small screen
	 var sheet = document.createElement('style')
	 sheet.id = 'smallstyle';
	 sheet.innerHTML = " .floatright { float: none !important; } .tablecanyon { width: 100% !important; float: none !important; } .tableregion { width: 100% !important; float: none !important; } .bigdisplay { display: none !important; }";
	 document.body.appendChild(sheet);
	}
   else
	{
	 // large screen
	var sheetToBeRemoved = document.getElementById('smallstyle');
	if (sheetToBeRemoved)
	  {
	  var sheetParent = sheetToBeRemoved.parentNode;
	  sheetParent.removeChild(sheetToBeRemoved);
	  }
	}
  */
  }

  var sheet = document.createElement('style')
  sheet.id = 'french';
  sheet.innerHTML = french ? " .uaca0 { display: none ; }" : " .uaca1 { display: none ; }";
  if (document.body) document.body.appendChild(sheet);

  function noextraction(name) 
  {
	  return name.indexOf("roadtripryan.com")>=0;
  }
  
  var lastlinks = [];
  function loadSource(link, domain)
  {
	  var optdiv = document.getElementById("myddOptsDiv");      
	  var opttext = document.getElementById("myddOptsText");
	  if (!opttext || !optdiv)
		 return;                 
	  optdiv.style.display = "none";
	  opttext.innerHTML = domain;
	  
	  gxml.overlayman.Hide();   
		
	  // set up new KML
	  var isropewiki = link.indexOf("ropewiki.com")>=0;
		var kmlfile = link;
		if (!isropewiki)
			kmlfile = 'http://d5a.net/rwr?gpx=off&filename=tmp&kmlnfx&kmlx=' + kmlfile;

	  var kmlfilep = document.getElementById("kmlfilep");
	  if (kmlfilep)
	    kmlfilep.innerHTML = kmlfile;

	  if (lastlinks.indexOf(link)>=0)
		 {
		 // display pre-loaded kml
		 gxml.overlayman.Show(link);
		 }
	  else
		 {
		 gxml.load(kmlfile, link);
		 lastlinks.push(link);
		 }
	  
	  // display warning or hide it for ropewiki
	  var noex = noextraction(link);
	  var dlist = ["rw", "ex", "noex" ]
	  var dshow = [isropewiki, !isropewiki && !noex, !isropewiki && noex];
	  for (var i=0; i<dlist.length; ++i)
		 {
		 var elem = document.getElementsByClassName('display'+dlist[i]); 
		 for (var e=0; e<elem.length; ++e)
			elem[e].style.display = dshow[i] ? "block" : "none";
		 }

	  // change links     
	  var dlist2 = ["ex", "noex" ]
	  for (var i=0; i<dlist2.length; ++i)
		{
		var elem = document.getElementsByClassName('display'+dlist2[i]);   
		for (var e = 0; e < elem.length; e++) 
		 {
		 var links = elem[e].getElementsByTagName('A');
		 for (var l=0; l < links.length; ++l)
			{
			var clink = links[l].href;
			if (clink.indexOf("caltopo.com")>0)
			  {
			  var prefix = "kmlx%253D";
			  var postfix = "ext%253D.kml";
			  var start = clink.indexOf(prefix);
			  var end = clink.indexOf(postfix, start+1);
			  links[l].href = clink.substr(0,start+prefix.length)+urlencode(link+'&')+clink.substr(end);
			  }
			else if (clink.indexOf("d5a.net")>0)
			  {
			  var prefix = "kmlx%3D";
			  var postfix = "ext%3D.kml";
			  var start = clink.indexOf(prefix);
			  var end = clink.indexOf(postfix, start+1);
			  links[l].href = clink.substr(0,start+prefix.length)+link+'&'+clink.substr(end);
			  }
			else if (clink.indexOf("/Map?pagename=")<0)
			  {
			  links[l].href = link;
			  links[l].innerHTML = domain;              
			  }
			
			}
		 }
	   }
  }

  function setfield(id)
  {
		 var list = $('#setfieldtarget input');
		if (list.length>0 && id)
		  list[0].value = id.innerHTML;

  }

  var locdist = 'locdist=';
  function nearbyselect(elem)
  {
  var a = elem.parentNode.getElementsByTagName('A')[0];
  var href = a.href;
  var e = href.indexOf(locdist);
  var url = href.substring(0, e)+locdist+elem.value;
	document.body.style.cursor = 'wait';
	window.location.href = url;
  }

  function deftext(str)
  {
	return str==null || str=='' || str[0]=='&' || str[0]==' ' || str.charCodeAt(0)==160;
  }
  
  /*
  function mappoint( even )
  {
			// get map stats
			var scale = Math.pow(2, map.getZoom());
			var proj = map.getProjection();
			var bounds = map.getBounds();
			if (!proj || !bounds)
			  {   
			  console.log("null proj");
			  return null;
			  }
			//console.log("bounds NE "+bounds.getNorthEast()+" SW "+bounds.getSouthWest());
			//console.log("bounds NE.lat "+bounds.getNorthEast().lat()+" SW,lng "+bounds.getSouthWest().lng());
			var nwll = new google.maps.LatLng( bounds.getNorthEast().lat(), bounds.getSouthWest().lng() );
			//console.log("nwll "+nwll);
			var nw = proj.fromLatLngToPoint(nwll);
			//console.log("nw "+nw);
		  
		  function fromLatLngToPixel(position) {
			var point = proj.fromLatLngToPoint(position);
			return new google.maps.Point(
			Math.floor((point.x - nw.x) * scale),
			Math.floor((point.y - nw.y) * scale));
			}
		  
		  function fromPixelToLatLng(pixel) {
			var point = new google.maps.Point();
			point.x = pixel.x / scale + nw.x;
			point.y = pixel.y / scale + nw.y;
			return proj.fromPointToLatLng(point);
		  }
  
	  var d = 20;
	  var bounds = map.getBounds();
	  var pixsw = fromLatLngToPixel( bounds.getSouthWest() );
	  pixsw.x += d; pixsw.y -=d;
	  var sw = fromPixelToLatLng(pixsw);
	  var pixne = fromLatLngToPixel( bounds.getNorthEast() );
	  pixne.x -= d; pixne.y +=d;
	  var ne = fromPixelToLatLng(pixne);
  }
  */
  
  var searchmapn = -1;
  var searchmappt = [];
  function searchmap()
  {
  map.setOptions({draggableCursor:'crosshair'});
  var element = document.getElementById('searchinfo');
  if (element) element.innerHTML = '<span class="rwwarningbox"><b>CLICK ON MAP TO DEFINE SEARCH AREA</b></span>';
  searchmapn = 0;
  } 

  var searchmaprectangle;
  function searchmaprun()
  {
  map.setOptions({draggableCursor:''});
  searchmapn = -1;
  searchmappt = []; 
  var element = document.getElementById('searchinfo');
  if (element) element.innerHTML = '<span class="rwwarningbox"><b>SEARCHING...</b></span>';
  mapsearchbounds(searchmaprectangle.bounds, -1);
  } 
  
  function mapsearchbounds(bounds, zoom)
  {
	var locsearchchk = document.getElementById('locsearchchk');
	if (map!=null && locsearchchk!=null)
	  {
	  var sw = bounds.getSouthWest();
	  var ne = bounds.getNorthEast();
	  locsearchchk.checked = true; 
	  var v = "Coord:"+Math.round(sw.lat()*1e3)/1e3+","+Math.round(sw.lng()*1e3)/1e3+","+Math.round(ne.lat()*1e3)/1e3+","+Math.round(ne.lng()*1e3)/1e3;
	  if (zoom>=0) v += ','+zoom;
	  document.getElementById('locnameval').value = v;
	  }
	filtersearch();
  }
  
  function mapsearch()
  {
	mapsearchbounds(map.getBounds(), map.getZoom());
  }
  
  function fbusersearch()
	{
	var user = prompt("Please enter your Facebook name", getCookie("fbuser"));
	if (user)
		{
		setCookie("fbuser", user);
		document.body.style.cursor = 'wait';
		window.location.href = "http://ropewiki.com/Location?onlycuser="+user.split(" ").join("")+"%40Facebook&sortby=-Has_condition_date";
		}
	}
	
  function regsearch()
  {
	//console.log("locsearch");
	var regnameval = document.getElementById('regnameval');
	if (regnameval.value!="" && deftext(regnameval.value)) 
	   return;     
	   
	var url = window.location.href;
	var url = url.split('#')[0].split('?')[0];
	var val = regnameval.value;
	if (val.length>0)
	   url += "?region="+urlencode(val);   
	setCookie('regnameval', urlencode(val));
	
	// disable buttons, wait cursor and navigate away
	var buttons = document.getElementsByClassName('submitoff'); 
	for (var i = 0; i < buttons.length; i++)
		buttons[i].disabled = true;
		
	document.body.style.cursor = 'wait';
	window.location.href = url;
  }
  
  function filtersearch(linkurl)
  {
	var url = window.location.href;
	if (typeof linkurl != "undefined")
	  url = linkurl;
	var url = url.split('#')[0].split('?')[0];
  
	//console.log("fsearch");
	// clean url first
	var param = "";
	
	// append options
	var optionschks = document.getElementsByClassName('optionschk'); 
	if (optionschks!=null)
	  for (var i = 0; i < optionschks.length; i++) 
		if (optionschks[i].checked)
		  param = addparam(param, optionschks[i].id, 'on');
  
	// append filters (if any)
	var filterschk = document.getElementById('filterschk');
	if (filterschk!=null && filterschk.checked)
	  {
	  var chks = document.getElementsByClassName('filtersel'); 
	  for (var i = 0; i < chks.length; i++) 
		if (chks[i].style.display != "none")
		{
		var mid = chks[i].id+'flt';
		var list = chks[i].getElementsByClassName(mid); 
		for (var l=0; l<list.length; ++l)
		  {
		  var x = list[l].selectedIndex;
		  var y = list[l].options;
		  param = addparam(param, chks[i].id, y[x].text);
		  }
		}
	  var chks = document.getElementsByClassName('filterchk'); 
	  for (var i = 0; i < chks.length; i++) 
		{
		var mid = chks[i].id+'flt';
		var list = document.getElementsByClassName(mid); 
		var attr = [];
		for (var l= 0; l < list.length; l++) 
		  if (list[l].checked)
			 attr.push(list[l].id.substring(list[l].id.lastIndexOf('_')+1));
		param = addparam(param, chks[i].id, attr.join());
		}
	  }
   
	// append location (if any)
	var locsearchchk = document.getElementById('locsearchchk');
	if (typeof linkurl == "undefined")
	 if (locsearchchk!=null && locsearchchk.checked)
	  {
	  var locnameval = document.getElementById('locnameval').value;
	  if (!deftext(locnameval))
		 {
		 var locdistval = document.getElementById('locdistval').value;
		 if (deftext(locdistval)) 
		  if (locnameval.substr(0,6)!='Coord:')
			locdistval ="50mi"; // default
		 //setCookie('locnameval', locnameval);
		 //setCookie('locdistval', locdistval);
		 //console.log("loc");
		 url = 'http://ropewiki.com/Location';
		 param = addparam(param, 'locname', urlencode(locnameval));
		 if (!deftext(locdistval)) 
		   param = addparam(param, 'locdist', urlencode(locdistval));
		 }
	  }
	//console.log(url);
	
	// append hidden parameters
	var optionsurl = document.getElementsByClassName('optionsurl'); 
	if (optionsurl!=null)
	  for (var i = 0; i < optionsurl.length; i++) 
		{
		var val = optionsurl[i].innerHTML;
		if (val.length>0)
		  param = addparam(param, optionsurl[i].id, val);
		}
  
	// append sorting if any
	if (sortby)
	   param = addparam(param, 'sortby', sortby);
	   
	if (param!="") url += "?jform"+param;
	
	if (typeof linkurl != "undefined")
	   return url;
  
	// disable buttons, wait cursor and navigate away
	  var buttons = document.getElementsByClassName('submitoff'); 
	  for (var i = 0; i < buttons.length; i++)
		buttons[i].disabled = true;
		
	document.body.style.cursor = 'wait';
	window.location.href = url;
  }
  
  function locsearch()
  {
	//console.log("locsearch");
	var locnameval = document.getElementById('locnameval');
	if (locnameval!=null && deftext(locnameval.value)) 
	   return;     
	filtersearch();
  }
  
  
  function toggleFilterSel(elem, checked)
  {
	/*
	var elem = document.getElementById(id);
	if (!elem) 
	  return null;
	*/
  
	var x = elem.selectedIndex;
	var y = elem.options;
	if (checked==null)
		 checked = y[x].text;       
  
   elem.value = checked;
  
   for (var l=0; l<y.length; ++l)
	 if (y[l].text!="")
	 {
	 var text = y[l].text;
	 var chks = document.getElementsByClassName(elem.id+text);
	 for (var i = 0; i < chks.length; i++) 
		 chks[i].style.display = text==checked ? "" : "none";
	 }
  
   setCookie(elem.id,checked);
   return checked;
  }
  
  
  function toggleFilter(id, checked)
  {
	if (checked==null)
	  checked = document.getElementById(id).checked;
	document.getElementById(id).checked = checked;
	if (checked)
	 setCookie(id,"on");
	else
	 setCookie(id,"");    
   return checked;
  }
  
  
  function toggleOption(id, forcechecked)
  { 
	checked = toggleFilter(id, forcechecked);
   //console.log("id:"+id+" checked:"+checked);
   elems = document.getElementsByClassName(id.split('chk').join('on'));
   for (var i = 0; i < elems.length; i++) 
	 elems[i].style.display = checked ? "" : "none";
   elems = document.getElementsByClassName(id.split('chk').join('off'));
   for (var i = 0; i < elems.length; i++) 
	 elems[i].style.display = checked ? "none" : "";
   return checked;
  }
  
  function togglelocsearchchk(id)
  {
	toggleOption(id);
  }
  
  function togglefilterschk(id)
  {
	if (!toggleOption(id))
	   {
	   // refresh page
	   filtersearch();
	   }
  }
  
  function toggledisplayschk(id)
  {
	if (!toggleOption(id))
	   {
	   // disable all options
	   elems = document.getElementsByClassName(id.split('chk').join('on'));
	   for (var i = 0; i < elems.length; i++) 
		 toggleFilter(elems[i].id+'chk', false);
	   // refresh page
	   filtersearch();
	   }
  }
  
  
  /*
  function StarRate(counter)
  {
		if (counter>100)
		   if (!confirm('The list has over 100 canyons, refreshing the list will be slow.\nIt may be faster to rate smaller areas separately or use filters to display only canyons that have never been rated (check [x]Filters and Star Rate: [x]0).\n\nAre you sure you want to proceed?'))
			  return;
  
		// enable options
		var id = 'displayschk';
		toggleOption(id, true);
		elems = document.getElementsByClassName(id.split('chk').join('on'));
		for (var i = 0; i < elems.length; i++) 
			  toggleFilter(elems[i].id+'chk', true);
		// refresh page
		filtersearch();
  }
  */
  
  function togglenomapchk(id)
  {
	   // refresh page
	  filtersearch();
  }
  
  function togglefulltablechk(id)
  {
	   // refresh page
	  filtersearch();
  }
  
  /*
  function togglestarratechk(id)
  {
	   // refresh page
	  //filtersearch();
	  LoadStars();
  }
  
  function togglefrenchchk(id)
  {
	   // refresh page
	  filtersearch();
  }
  */
  
  function addhighlight(idlist)
  {
	for (var i=0; i<markers.length; ++i)
	 if (idlist.indexOf(markers[i].name)>=0)
	  { 
	  var m = markers[i];
	  if (m.highlight)
		continue;
		
	  var iconsize = 16;
	  var highlight = new google.maps.Marker({
		  position: m.getPosition(),
		  icon: "http://ropewiki.com/images/e/e6/Starn_y.png",          
		  draggable: false,
		  clickable: false,
		  optimized: false,
		  zIndex: m.zIndex-1
		  });
		//alert(m.zIndex);
	
		highlight.setMap(qmaps[m.q]);
		m.highlight = highlight;
		
		if (m.infowindow && m.infowindow.content)
		  m.infowindow.content = m.infowindow.content.replace('value="+"', 'value="*"');
	  }
  
   var pinicons = document.getElementsByClassName('pinicon'); 
   for (var i=0; i<pinicons.length; ++i)
	  if (idlist.indexOf(pinicons[i].id)>=0)
		 pinicons[i].style.backgroundImage = "url(http://ropewiki.com/images/e/e6/Starn_y.png)";
  }
  
  var oldid = '@';
  function addbutton(id)
  {
  //id = urlencode(id);
  function reattribute(elem)
  {
	var elems = elem.childNodes;
	for (var e=0; e<elems.length; ++e)
	{
	var elem = elems[e];
	if (elem.attributes)
	 for (var a=0; a<elem.attributes.length; ++a)
	  {
	  /*
	  if (elem.attributes[a].oldattribute)
	   {
	   elem.attributes[a].value = elem.attributes[a].oldattribute.replace(/@/gi,id);
	   }
	  else if (elem.attributes[a].value.indexOf('@')>=0)
	   {
	   elem.attributes[a].oldattribute = elem.attributes[a].value;
	   elem.attributes[a].value = elem.attributes[a].value.replace(/@/gi,id);
	   }
	  */
	  if (elem.attributes[a].value.indexOf(oldid)>=0)
	   elem.attributes[a].value = elem.attributes[a].value.split(oldid).join(id);
	  }
	reattribute(elem);
	}
  }
   var kmladdbutton = document.getElementById("kmladdbutton");
   if (kmladdbutton)
	 {
	 reattribute(kmladdbutton);
	 var kmlform = kmladdbutton.getElementsByTagName('BUTTON');
	 if (kmlform.length>0)
	   kmlform[0].click();    
  /*
	 var kmlform = kmladdbutton.getElementsByTagName('FORM');
	 if (kmlform.length>0)
	   kmlform[0].submit();
  */
  
	 if (lastinfowindow) 
	   lastinfowindow.close(); 
	 var idlist = [ id ];
	 addhighlight(idlist);
	 oldid = id;
	 }
  }
  

  function inputkey(event, submitfunc)
  {
	if (event.which == 13) 
	   submitfunc(); 
	//console.log("key:"+event.which+":");
  }
  
  function inputfocus(elem)
  {
	elem.style.color = 'black';
	//console.log(":"+elem.value[0]+":"+elem.value.charCodeAt(0));
	if (deftext(elem.value))
	  {
	  elem.value ='';
	  //console.log("reset:"+elem.value+":");
	  }
  }
  
  
  /* Google Maps integration with external Topo map sources */
  function getTextFromHyperlink(linkText) {
	  var start = linkText.search('href=');
	  var str=  linkText.slice(start).split('"')[1];
	  //document.getElementById("firstHeading").innerHTML = str;
	  return str;
	  //return linkText.match(/<a [^>]+>([^<]+)<\/a>/)[1];
  }
  
  
  
  var map;
  var gxml;
  var zindex = 0;
  var markers = [];
  var handlekeys = false;
  
  var lastinfowindow = null;
  function displayinfowindow(marker) 
  { 
	tooltip.hide(); 
	if (lastinfowindow) 
	   lastinfowindow.close(); 
	marker.infowindow.setZIndex(++zindex); 
  marker.infowindow.open(map, marker);  
  getgeoelevation(marker.getPosition(), "infoelevation", "~")
	lastinfowindow=marker.infowindow;
  }
  
  function pinicon(id, icon)
  {
	if(!icon || typeof icon == "undefined")
	   icon = "http://ropewiki.com/images/8/86/PinMap.png";
	return '<img src="'+icon+'" id="'+id+'" class="pinicon" title="Show location on map" style="cursor:pointer;vertical-align:middle" onclick=\'pinmap(this.id)\'/>';
  }
  
  function pinmap(id)
  {
	//alert(id);
	for (var i=0; i<markers.length; ++i)
	  if (markers[i].name==id)
		{
		var mapboxoffset = $("#mapbox").offset().top;
		if (mapboxoffset<$(window).scrollTop())
				window.scrollTo(0, mapboxoffset);	  	
		$("#mapcover").css({display: "none"});	   
		map.panTo(markers[i].position);
		window.setTimeout(function() {
			displayinfowindow(markers[i]); 
    	}, 500);

		return;
		}
  }
  
  

  
  // icons 
  var kmliconlist = [ "http://ropewiki.com/images/7/75/Starn00.png","http://ropewiki.com/images/8/87/Starn10.png","http://ropewiki.com/images/1/15/Starn20.png","http://ropewiki.com/images/d/d3/Starn30.png","http://ropewiki.com/images/a/a0/Starn40.png","http://ropewiki.com/images/c/cc/Starn50.png","http://ropewiki.com/images/b/b6/Starn01.png","http://ropewiki.com/images/1/12/Starn11.png","http://ropewiki.com/images/b/b7/Starn21.png","http://ropewiki.com/images/2/2e/Starn31.png","http://ropewiki.com/images/1/1d/Starn41.png","http://ropewiki.com/images/f/fe/Starn51.png","http://ropewiki.com/images/3/3a/Starn02.png","http://ropewiki.com/images/a/a4/Starn12.png","http://ropewiki.com/images/1/13/Starn22.png","http://ropewiki.com/images/3/32/Starn32.png","http://ropewiki.com/images/7/77/Starn42.png","http://ropewiki.com/images/1/11/Starn52.png","http://ropewiki.com/images/b/bd/Starn03.png","http://ropewiki.com/images/0/09/Starn13.png","http://ropewiki.com/images/9/98/Starn23.png","http://ropewiki.com/images/0/07/Starn33.png","http://ropewiki.com/images/f/fb/Starn43.png","http://ropewiki.com/images/d/dc/Starn53.png","http://ropewiki.com/images/2/25/Starn04.png","http://ropewiki.com/images/7/73/Starn14.png","http://ropewiki.com/images/e/ea/Starn24.png","http://ropewiki.com/images/6/6a/Starn34.png","http://ropewiki.com/images/3/31/Starn44.png","http://ropewiki.com/images/2/27/Starn54.png","http://ropewiki.com/images/2/29/Starn05.png","http://ropewiki.com/images/d/d9/Starn15.png","http://ropewiki.com/images/e/e0/Starn25.png","http://ropewiki.com/images/0/09/Starn35.png","http://ropewiki.com/images/8/81/Starn45.png","http://ropewiki.com/images/3/37/Starn55.png" ];

  // bounds
  var nlist = 10000;
  var qmaps = [];

  function loadlist(list, fitbounds)
  {
   if (qmaps.length==0)
	for (var i=0; i<6; ++i)
	  qmaps.push(map);
  
   // load custom icon list, if any
   var kmlstarlist;
   var kmlstars = document.getElementById("kmlstars");
   if (kmlstars!=null)
	 kmlstarlist = kmlstars.innerHTML.split(',');
  
   // load addbutton 
   var kmladdbutton = document.getElementById("kmladdbutton");
  
   // calc nearby (only 1 shot of 100 or less)
   var calcnearby = document.getElementById('kmlnearby'); 
   if (calcnearby)
	 {
	  // process list
	  for (i=0; i<list.length; ++i)
		{
		var o = list[i];
		var sortlist = [];
		// compute distance
		for (ic=0; ic<list.length; ++ic)
		   sortlist.push({id: list[ic].id.split(" ")[0], distance: Distance(o.location, list[ic].location)});
		sortlist.sort(function(a, b){return a.distance-b.distance});
		
		var distlist = [];
		for (ic=1; ic<sortlist.length && ic<=5 && sortlist[ic].distance<20; ++ic)
		   distlist.push(sortlist[ic].id);
		   
		id = o.id.substr(1).split(" ")[0];
		if (!id || id=="")
		  continue;
		elems = document.getElementsByClassName("nearby");
		for (var e=0; e<elems.length && elems[e].id != id; ++e);
		if (e<elems.length)
		   elems[e].innerHTML = "~"+distlist.join();
		}
	 }

   var i, n = list.length;
   for (i=0; i<list.length; ++i) {
	var item = list[i];

	if (!item.id || item.id=="") 
	   continue;
	  
	++n;
	--nlist;
	// set up icon
	var zindexm = 5000 + nlist;
	if (item.q)
	  zindexm += item.q*1000;

	var iconm = "";
	if (item.icon)
	  iconm = item.icon;
  
	// set up description
	var descm = "", sdescm = ""; 
	if (item.description) 
	 {
	 // convert unist
	 str = item.description;
	 if (metric)
	  {
	  var pk = str.split(' ');
	  for (var p=0; p<pk.length; ++p)
		{
		var pre= "";
		var ps = pk[p];
		var idot = ps.indexOf(':');
		if (i>=0)
		   {
		   pre = ps.substr(0, idot+1);
		   ps = ps.substr(idot+1);
		   }
		if (ps[0] >= '0' && ps[0] <= '9')
		  {
		  var unit = ps.slice(-2);  
		  if (unit=='mi')
			  pk[p] = pre+uconv(ps, mi);
		  else if (unit=='ft')
			  pk[p] = pre+uconv(ps, ft);
		  }
		}
	  str = pk.join(' ');
	  }
	  
	 str = acaconv(str);
	 descm = sdescm = str;
	 }
  
	// set up stars
	//sdescm = sdescm.replace('*','<img height="12px" align="middle" src="'+kmlstarlist[4]+'"/>');
	//var stars = sdescm.split('*');
	//if (stars.length>1 && kmlstarlist.length>4)
	//  sdescm = GetStars(Number(stars[0]), 0, kmlstarlist, 10)+" "+stars[1];
	//var stars = descm.split('*');
	//if (stars.length>1 && kmlstarlist.length>4)
	// descm = stars[0]+'<img width="10px" height="10px" src="'+kmlstarlist[4]+'"/>'+' '+stars[1];
	sdescm = '<div class="notranslate">'+sdescm.split('*').join('&#9733;')+'</div>';
  
   // set up thumbnail
   var iwheight = "50px";
   if (item.thumbnail) 
	 {
	 /*
	 var height = "";
	 var ps=0, pe=0;
	 if ((pe=item.thumbnail.lastIndexOf('px-'))>0)
		{
		ps = item.thumbnail.lastIndexOf('/', pe);
		var h = parseInt(item.thumbnail.substring(ps+1,pe));
		console.log(h+"="+item.thumbnail);
		if (h>0)
		  height = 'height='+h+'px';
		  //img = '<div style="width:auto;height:'+h+'px;overflow:hidden;">'+img+'</div>';
		}
	 */
	 var style = "";
	 var width = "";
	 var height = 'height="150px"';
	 // try to get width from thumbnail
	 var fsplit = item.thumbnail.split('/');
	 if (fsplit.length>0)
		{
		var fname = fsplit[fsplit.length-1];
		var w = parseInt(fname);
		if (w>0)
		  {
		  width = 'width="'+w+'px"';
		  style = 'style="border:1px solid #808080"';
		  iwheight = "200px";
		  }
		}
	 sdescm += '<div><img '+style+' '+width+' '+height+' src="'+item.thumbnail+'"/></div>';
	 }
  
   // set up extras
	 {
	 if (item.kmlfile && item.kmlfile!="") 
	   {
	   sdescm += '<div><i>';
	   sdescm += '<a href="javascript:toggleRoutes(\''+urlencode(item.kmlfile)+'\',\''+urlencode(item.id)+'\');">Show KML Map of the route</a>';
	   sdescm += '</i></div>';
	   }
	 var extra = '<br><span id="infoelevation"></span> - '
	 extra += '<a href="http://ropewiki.com/Weather?pagename='+item.id+'" target="_blank">Weather</a>';
	 extra  += ' - <a href="http://ropewiki.com/Location?locdist=30mi&locname=Coord:'+item.location.lat+','+item.location.lng+'">Search nearby</a>';
	 sdescm += displaydirections(item.location.lat, item.location.lng, extra);     
	 }
	
   // set up infowindow
	//'<div class="gm-style-iw">'+'</div>'  
	var contentString = '<div style="width:auto;height:auto;overflow:hidden;"><b class="notranslate">'+sitelink(item.id, nonamespace(item.id))+'</b>'; //'+iwheight+'
	if (kmladdbutton)
	   contentString += '<input class="submitoff addbutton" type="submit" onclick="addbutton(\''+item.id.split("'").join("%27")+'\')" value="+">';
	contentString += '<hr/>'+sdescm+'</div>';
	if (item.infocontent) contentString = item.infocontent;
	var infowindowm = new google.maps.InfoWindow({ content: contentString });
	
	var descriptionString = '<b class="nostranslate">'+nonamespace(item.id)+'</b><br>'+descm.split('*').join('&#9733;');
	if (item.infodescription) descriptionString = item.infodescription;
  
  
	// build and add marker with infowindow callback
	var q = -1, qmap = map;
	if (item.q!=null) 
	   qmap = qmaps[ q = item.q ];
	var positionm = new google.maps.LatLng(item.location.lat, item.location.lng);  
	var marker = new google.maps.Marker({ position: positionm,  map: qmap, icon:iconm, name:nonamespace(item.id), /*title:item.id/*+":"+line[4],*/ description:descriptionString, infowindow: infowindowm, zIndex: zindexm, optimized: false});    
	marker.q = q;
	marker.oposition = positionm; 
	//var tooltip = tooltip({ marker: marker, content: "<b>"+nonamespace(item.id)+"</b><br>"+descm, cssClass: 'tooltip' });
  
	google.maps.event.addListener(marker, "mouseover", function(e) { 
	  //marker.setZIndex(++zI);
	  this.highlight = new google.maps.Marker({
		position: this.getPosition(),
		icon: "http://ropewiki.com/images/3/39/Starn_b.png", 
		draggable: false,
		clickable: false,
		optimized: false,
		zIndex: this.zIndex-1
		});
	  this.priority = 0;
	  this.highlight.setMap(map);
	  tooltip.show(this.description, e, this); 
	  });
	google.maps.event.addListener(marker, "mouseout", function() { 
	  tooltip.hide(this);
	  if (this.highlight!=null)
		  {
		  this.highlight.setMap(null);
		  this.highlight = null;
		  }
	  });
  
	markers.push(marker);
	google.maps.event.addListener(marker, 'click', function() { displayinfowindow(this); } );
	// extend bouds
	//console.log(item.id+":"+item.location.lat+","+item.location.lng+"="+positionm.toString());
	boundslist.extend(positionm);
	}
	
  
   // highlight
   var kmladdlist = document.getElementById("kmladdlist");
   if (kmladdlist)
	   {
	   var addlist = kmladdlist.innerHTML.split(';');
	   if (addlist.length>0)
		  addhighlight(addlist);
	   }

   if (n>0 && fitbounds) {
	// auto zoom & center map
	var ne = boundslist.getNorthEast();
	var sw = boundslist.getSouthWest();
	if (Distance({lat:ne.lat(), lng:ne.lng()},{lat:sw.lat(), lng:sw.lng()})<1){
	  map.setZoom(11);
	  map.panTo(markers[0].position);
	}
	else {
	  map.fitBounds(boundslist );
	  map.panToBounds(boundslist );
	}
	//console.log(bounds);
	zindex = 6000; 
	//map.panTo(bounds.getCenter());
   }
   
   return n;
  }


 var kmllistn = 0;
 var kmllisturl, tablelisturl;
 var kmlsummary;
 
 function getrwlist( data ) {
		var list = [];
		$.each(data.query.results, function(i, item) {
				//alert(item.printouts);                
				var v;
				++kmllistn;
				var obj = { id:item.fulltext };
				v = item.printouts["Has coordinates"];
				if (v && v.length>0) {
					obj.location = { lat:v[0].lat, lng:v[0].lon };
					// icon
					v = item.printouts["Has star rating"];
					if (v && v.length>0) {
						obj.q = Number(v[0]);                    
						v = item.printouts["Has location class"];
						if (v && v.length>0)
						  obj.icon = kmliconlist[obj.q + Number(v[0])*6];
						}
					// numeric icons
					if (kmlsummary)
					 if (obj.id[0]=='#')
					  {
					  //var colors = [ "666666", "7b6434", "b2882c", "f6b114", "f78931", "f74c24" ];
					  var num = obj.id.slice(1).split(' ')[0];
					  obj.icon = 'http://sites.google.com/site/rwicons/bg'+obj.q+'_'+num+'.png';
					  //iconm = 'http://chart.apis.google.com/chart?chst=d_text_outline&chld='+colors[Number(line[3])]+'|12|h|000000|b|'+parseInt(num);
					  }
					//console.log(iconm);                                        
					v = item.printouts["Has summary"];
					if (v && v.length>0)
						obj.description = v[0];
					v = item.printouts["Has banner image file"];
					if (v && v.length>0)
						obj.thumbnail = v[0];
					v = item.printouts["Has KML file"];
					if (v && v.length>0)
						obj.kmlfile = v[0];
					v = item.printouts["Located in region"];
					if (v && v.length>0)
						obj.region = v[0].fulltext;
					list.push( obj );
				 }
			});
		return list;
}

 function getkmllist( data ) {
		var list = getrwlist(data);
		
		if (typeof data['query-continue-offset'] == "undefined")
		  morestop();
			
		loadlist(list, true);
  }
  
  function findtag(children, tag, f)
  {
	function findlist(children, tag)
	{
		  var list = [];
		  for (var i=0; i<children.length; ++i) {
			var item = children[i];
			if (item.nodeName == tag)
			   list.push(item);
			else
			  list = list.concat(findlist(item.childNodes, tag));
			}
		  return list;
	}

	   var list = findlist(children, tag);
	   for (var i=0; i<list.length; ++i)
		 f(list[i]);
  }


  function morestop()
  {         
		// finished loading
		var loccount = document.getElementById("loccount");
		if (loccount) 
		  loccount.parentNode.removeChild(loccount);
		var loadmore = document.getElementById("loadmore");
		if (loadmore) 
		  loadmore.parentNode.removeChild(loadmore);
		var morelist = $(".loctable .smw-template-furtherresults a");
		if (morelist.length==1)
		  morelist[0].parentNode.removeChild(morelist[0]);
  }
  
  var morestep = 100;
  var moremapc = 0, morelistc = 0;
  function morekmllist(loccontinue, loctotal)
  { 
		loadingquery = true;
console.log("loadingquery true");
		++moremapc;
		map.setOptions({draggableCursor:'wait'});
		$.getJSON( geturl(kmllisturl+"|offset="+loccontinue), getkmllist)
			  .always(function() {
	  setTimeout(function(){ loadingquery =false; console.log("loadingquery false");}, 5000);
				  if (--moremapc<=0)
					map.setOptions({draggableCursor:''});
			  });

		
		if (loccontinue>0) {
		  var tablelist = $( ".loctable .loctabledata" );
		  //var morelist = $(".loctable .smw-template-furtherresults a");
		  if (tablelist.length==1)// && morelist.length==1)
			{
			//var href = morelist[0].href;
			//if (href) {
			  ++morelistc;
			  document.body.style.cursor = 'wait';              
			  $.get( geturl(tablelisturl + '&offset='+loccontinue), function( data ) {
				//alert( "Load was performed." );
				var newtablelist = $('#morekmllist').html($(data).find('.loctable').html());              
				if (newtablelist.length == 1) {
				  var newdocument = newtablelist[0];
				  newdocument.getElementsByName = function(name) { var list = []; return list; }
				  newdocument.getElementById = function(name) { return null; }
				  loadUserInterface(newdocument);
				  findtag(newdocument.childNodes, 'TR', function(item) { tablelist[0].appendChild(item); });
				}              
			  }).always(function() {
			  if (--morelistc<=0)
				document.body.style.cursor = '';
			  });
			 }          
		  }

		  loccontinue += morestep;          
		  if (loccontinue >= loctotal) {
			morestop();
			return;
		  }
					  
		  // more button
					
		  var loadmore = document.getElementById("loadmore");
		  if (loadmore)
			loadmore.innerHTML = '<button onclick="morekmllist('+loccontinue+','+loctotal+')">+</button> ';

		  var loccount = document.getElementById("loccount");
		  if (loccount)
			loccount.innerHTML = loccontinue + " of ";

		  var morelist = $(".loctable .smw-template-furtherresults a");
		  if (morelist.length==1) {
			morelist[0].href = 'javascript:morekmllist('+loccontinue+','+loctotal+');';
			/*
			var href = morelist[0].href;
			if (href) {
			  var offset = '&offset=';
			  var pos = href.indexOf(offset);
			  morelist[0].href = href.substr(0, pos) + offset + loccontinue;
			}
			*/
		  }
							  
  }


 function setmarker(lat, lng, z)
 {
	  var myLatlng = new google.maps.LatLng(lat, lng);  
	  var infowindowm = new google.maps.InfoWindow({ content: '<div class="textselect">'+displaylocation(lat, lng)+'<div id="elevation"></div>'+'<div id="geocode" style="max-width:200px"></div>'+displaydirections(lat,lng)+'</div>'});
	  var marker = new google.maps.Marker({ position: myLatlng,  map: map, infowindow:infowindowm, optimized: false, zIndex:z});
	  google.maps.event.addListener(marker, 'click', function() { this.infowindow.open(map, this); getgeoelevation(this.getPosition(), "elevation", "Elevation: "); getgeocode(lat, lng, "geocode"); });
	  boundslist.extend(myLatlng);  
 }

  // Custom Map functions
  function CLIP(xy, z)
  {
	return xy % (1<<z);
  }

  function TYZ(y, z)
  {
	return (1<<z)-y-1;
  }
  
  function Box(px,py,pz,tsize)
  {
	function Clip(n, minValue, maxValue)
	{
		return Math.min(Math.max(n, minValue), maxValue);
	}
	function zxy2LL(size, pixelZ, pixelX, pixelY)
	{
	  var mapSize =  size *(1<<pixelZ);
	  var tx = (Clip(size*pixelX, 0, mapSize - 1) / mapSize) - 0.5;
	  var ty = 0.5 - (Clip(size*pixelY, 0, mapSize - 1) / mapSize); 
	  var p = { lat: 90 - 360 * Math.atan(Math.exp(-ty * 2 * Math.PI)) / Math.PI, lng: 360 * tx };
	  return p;
	}
	var p1 = zxy2LL(tsize, pz, px, py);
	var p2 = zxy2LL(tsize, pz, px+1, py+1);
	var b = { lat1:p1.lat, lat2:p2.lat, lng1:p1.lng, lng2:p2.lng };
	return b;
  }

  function WmsBox(b,epsg,invert)
  { 
	function Wms(epsg, lat, lng)
	{
	  var p = { x:lat, y:lng};
	  if (epsg)
	  {
	  p.x = lng * 20037508.34 / 180;
	  var sy = Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180);
	  p.y = sy * 20037508.34 / 180;
	  }
	  return p;
	}
	var p1 = Wms(epsg, b.lat1, b.lng1);
	var p2 = Wms(epsg, b.lat2, b.lng2);
	var wb = [ p1.x<p2.x ? p1.x : p2.x, p1.y<p2.y ? p1.y : p2.y, p1.x<p2.x ? p2.x : p1.x, p1.y<p2.y ? p2.y : p1.y ] ;
	if (invert)
	  return wb[1]+","+wb[0]+","+wb[3]+","+wb[2];
	else
	  return wb[0]+","+wb[1]+","+wb[2]+","+wb[3];
  }

   // keep bounds for autozoom and center
  var boundslist;

  // map still loading callback
  var loadingmap = true, loadingtiles = false, loadingtiles2 = false, loadingkml = false, loadingquery = false, loadingquery2 = false;
  function isloadingmap()
  {
	return loadingmap || loadingtiles || loadingtiles2 || loadingkml || loadingquery || loadingquery2;
  }
  
  function initializemap() {
  var lasthighlight;  
  tooltip = function(){
	var id = 'tooltip';
	var top = 3;
	var left = 3;
	var maxw = 300;
	var speed = 10;
	var timer = 20;
	var endalpha = 95;
	var alpha = 0;
	var tt,t,c,b,h;
	var ie = document.all ? true : false;
	return{
	  show:function(v,w,highlight){
		if (!v || v=="")
		   return;
		if (highlight && lasthighlight)
		if (highlight.highlight && lasthighlight.highlight) 
		  if (highlight.priority>lasthighlight.priority)
		   {
		   // do not override if less priority
		   //console.log("show hide cur "+highlight.title2+highlight.description);
		   highlight.highlight.setMap(null);
		   highlight.highlight = null;
		   return;
		   }
		if (lasthighlight && highlight!=lasthighlight && lasthighlight.highlight)
		   {
		   //console.log("hide last "+lasthighlight.title2+lasthighlight.description);
		   lasthighlight.highlight.setMap(null);
		   lasthighlight.highlight = null;
		   }
		//console.log("show cur "+highlight.title2+highlight.description);
		lasthighlight = highlight;
		if(tt == null){
		  //alert("tnull");
		  tt = document.createElement('div');
		  tt.style.backgroundColor = "white";
		  tt.style.padding = "3px";
		  tt.style.position = "absolute";
		  tt.style.zIndex = 60000;
		  tt.style.fontFamily = "Arial,sans-serif";
		  tt.style.fontSize = "10px";
		  tt.setAttribute('id',id);
		  tt.className = "notranslate";
		  t = document.createElement('div');
		  t.setAttribute('id',id + 'top');
		  c = document.createElement('div');
		  c.setAttribute('id',id + 'cont');
		  b = document.createElement('div');
		  b.setAttribute('id',id + 'bot');
		  tt.appendChild(t);
		  tt.appendChild(c);
		  tt.appendChild(b);
		  document.body.appendChild(tt);
		  tt.style.opacity = 0;
		  tt.style.filter = 'alpha(opacity=0)';
		  document.onmousemove = this.pos;
		}
		tt.style.display = 'block';
		if (c) c.innerHTML = v;
		tt.style.width = w ? w + 'px' : 'auto';
		if(!w && ie){
		  t.style.display = 'none';
		  b.style.display = 'none';
		  tt.style.width = tt.offsetWidth;
		  t.style.display = 'block';
		  b.style.display = 'block';
		}
		if(tt.offsetWidth > maxw){tt.style.width = maxw + 'px';}
		h = parseInt(tt.offsetHeight) + top;
		clearInterval(tt.timer);
		tt.timer = setInterval(function(){tooltip.fade(1);},timer);
	  },
	  pos:function(e){
		var u = ie ? event.clientY + document.documentElement.scrollTop : e.pageY;
		var l = ie ? event.clientX + document.documentElement.scrollLeft : e.pageX;
		tt.style.top = (u - h) + 'px';
		tt.style.left = (l + left) + 'px';
	  },
	  fade:function(d){
		var a = alpha;
		if((a != endalpha && d == 1) || (a != 0 && d == -1)){
		  var i = speed;
		  if(endalpha - a < speed && d == 1){
			i = endalpha - a;
		  }else if(alpha < speed && d == -1){
			i = a;
		  }
		  alpha = a + (i * d);
		  tt.style.opacity = alpha * 0.01;
		  tt.style.filter = 'alpha(opacity=' + alpha + ')';
		}else{
		  clearInterval(tt.timer);
		  if(d == -1){tt.style.display = 'none';}
		}
		//console.log(tt.style.opacity);
	  },
	  hide:function(highlight){
		if (highlight)
		  if (highlight!=lasthighlight)
			  {
			  //console.log("hide not cur "+highlight.title2+highlight.description);
			  return;
			  }
		//console.log("hide cur "+(highlight ? (highlight.title2+highlight.description) : "NULL"));
		if(typeof tt != "undefined"){
		  if(tt.timer){ clearInterval(tt.timer); }
		  tt.timer = setInterval(function(){tooltip.fade(-1);},timer);  
		  }
		}
	};
  }();
  
  var mapbox = document.getElementById("mapbox");
  if (!mapbox) return;
  
	
  /* Map Setup */
  var mapOptions = {
  /*
  draggable: $(document).width() > 480 ? true : false;,   
  panControl: true,
  scrollwheel: false,
  */
  
  zoom: 13,
  scaleControl: true,
  keyboardShortcuts: false,
  mapTypeId: google.maps.MapTypeId.TERRAIN,
  mapTypeControl: true,
  mapTypeControlOptions: {
   mapTypeIds: ['topo', 'wtopo', 'wtopoesri', 'ocm', google.maps.MapTypeId.TERRAIN, google.maps.MapTypeId.HYBRID, 'wsatesri', 'mxtopo', 'estopo', 'frtopo', 'chtopo', 'nztopo'],
   style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
   position: google.maps.ControlPosition.TOP_RIGHT,
	},
   zoomControl: true,
   zoomControlOptions: {
	 position: google.maps.ControlPosition.LEFT_CENTER,
	},

   streetViewControl: true,
   streetViewControlOptions: {
	 position: google.maps.ControlPosition.LEFT_CENTER,
	},
  };


// cover
  var coverDiv = document.createElement('DIV');
  coverDiv.id = "mapcover";
  coverDiv.className = "gmnoprint";
  coverDiv.style.cssText= 'position:fixed;left:0;top:0;width:100%;height:100%;background-color:transparent;border-color:yellow;border-style: inset;border-width:2px';
  $(coverDiv).on('click', function(e) {
    //$("#mapbox").trigger(e);
	toggleFullScreen(true);
});

  // credits  
  var creditDiv = document.createElement('DIV');
  creditDiv.style.cssText="font-size:x-small;";

  var credits = [];
  map = new google.maps.Map(mapbox, mapOptions);
  map.controls[google.maps.ControlPosition.BOTTOM_RIGHT].push(creditDiv);
  
  // custom maps  
  credits[google.maps.MapTypeId.TERRAIN] = " ";
  credits[google.maps.MapTypeId.HYBRID] = " ";
  var relief = new google.maps.ImageMapType({getTileUrl: function(p,z) { return "http://s3-us-west-1.amazonaws.com/ctrelief/relief/" + z + "/" + CLIP(p.x,z) + "/" + CLIP(p.y,z) + ".png" }, maxZoom: 16, name: "Topo", opacity: 0.25, tileSize: new google.maps.Size(256,256)});
  map.mapTypes.set("topo", new google.maps.ImageMapType({getTileUrl: function(p,z) { return "http://s3-us-west-1.amazonaws.com/caltopo/topo/" + z + "/" + CLIP(p.x,z) + "/" + CLIP(p.y,z) + ".png" }, maxZoom: 16, name: "TopoUSA", opacity: 1, tileSize: new google.maps.Size(256,256)}) );
  credits["topo"] = "<a href='http://caltopo.com' target='_blank'>Topo map by CalTopo</a>";
  map.mapTypes.set("ocm", new google.maps.ImageMapType({getTileUrl: function(p,z) { return "http://tile.opencyclemap.org/cycle/" + z + "/" + CLIP(p.x,z) + "/" + CLIP(p.y,z) + ".png" }, maxZoom: 18, name: "OpenCycle", opacity: 1, tileSize: new google.maps.Size(256,256)}) );
  credits["ocm"] = "<a href='http://thunderforest.com' target='_blank'>Topo map by Thunderforest</a>";
//  map.mapTypes.set("wtopo", new google.maps.ImageMapType({getTileUrl: function(p,z) { return "http://a.tile.opentopomap.org/" + z + "/" + CLIP(p.x,z) + "/" + CLIP(p.y,z) + ".png" }, maxZoom: 18, name: "TopoWorld", opacity: 1, tileSize: new google.maps.Size(256,256)}) );
//  credits["wtopo"] = "<a href='http://oprntopomap.org' target='_blank'>Topo map by OpenTopoMap</a>";
  map.mapTypes.set("wtopo", new google.maps.ImageMapType({getTileUrl: function(p,z) { return "http://tile.thunderforest.com/outdoors/" + z + "/" + CLIP(p.x,z) + "/" + CLIP(p.y,z) + ".png?apikey=bdbb04f2d5df40cbb86e9e6e1acff6f7" }, maxZoom: 18, name: "TopoWorld", opacity: 1, tileSize: new google.maps.Size(256,256)}) );
  credits["wtopo"] = "<a href='http://thunderforest.com' target='_blank'>Topo map by Thunderforest</a>";
  map.mapTypes.set("wtopoesri", new google.maps.ImageMapType({getTileUrl: function(p,z) { return "http://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/" + z + "/" + CLIP(p.y,z) + "/" + CLIP(p.x,z) + ".png" }, maxZoom: 18, name: "TopoESRI", opacity: 1, tileSize: new google.maps.Size(256,256)}) );
  credits["wtopoesri"] = "<a href='http://arcgisonline.com' target='_blank'>Topo map by ESRI</a>";
  map.mapTypes.set("wsatesri", new google.maps.ImageMapType({getTileUrl: function(p,z) { return "http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/" + z + "/" + CLIP(p.y,z) + "/" + CLIP(p.x,z) + ".png" }, maxZoom: 18, name: "SatESRI", opacity: 1, tileSize: new google.maps.Size(256,256)}) );
  credits["wsatesri"] = "<a href='http://arcgisonline.com' target='_blank'>Sat map by ESRI</a>";
  map.mapTypes.set("estopo", new google.maps.ImageMapType({getTileUrl: function(p,z) { return "http://www.ign.es/wmts/mapa-raster?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=MTN&STYLE=default&TILEMATRIXSET=GoogleMapsCompatible&TILEMATRIX="+z+"&TILEROW="+CLIP(p.y,z)+"&TILECOL="+CLIP(p.x,z)+"&FORMAT=image%2Fjpeg" }, maxZoom: 17, name: "TopoSpain", opacity: 1, tileSize: new google.maps.Size(256,256)}) );
  credits["estopo"] = "<a href='http://sigpac.mapa.es/fega/visor/' target='_blank'>Topo map by IGN</a>";
  map.mapTypes.set("frtopo", new google.maps.ImageMapType({getTileUrl: function(p,z) { return "http://RopeWiki:b%40VM709c6Jix@wxs.ign.fr/8m34uuspdybhi9t89lpoeyfl/geoportail/wmts?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetTile&LAYER=GEOGRAPHICALGRIDSYSTEMS.MAPS&STYLE=normal&FORMAT=image/jpeg&TILEMATRIXSET=PM&TILEMATRIX="+z+"&TILEROW="+CLIP(p.y,z)+"&TILECOL="+CLIP(p.x,z) }, maxZoom: 16, name: "TopoFrance", opacity: 1, tileSize: new google.maps.Size(256,256)}) );
  credits["frtopo"] = "<a href='http://www.geoportail.gouv.fr' target='_blank'>Topo map by Geoportail</a>";  
  map.mapTypes.set("mxtopo", new google.maps.ImageMapType({getTileUrl: function(p,z) { return "http://gaiamapas1.inegi.org.mx/mdmCache/service/wms?LAYERS=MapaBaseTopograficov61_consombreado&FORMAT=image/jpeg&MINZOOMLEVEL=5&ZOOMOFFSET=5&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&SRS=EPSG:900913&BBOX="+WmsBox(Box(CLIP(p.x,z),CLIP(p.y,z),z,256),true,false)+"&WIDTH=256&HEIGHT=256" }, maxZoom: 16, name: "TopoMexico", opacity: 1, tileSize: new google.maps.Size(256,256)}) );
  credits["mxtopo"] = "<a href='http://gaia.inegi.org.mx/mdm6/' target='_blank'>Topo map by INEGI</a>";
  map.mapTypes.set("nztopo", new google.maps.ImageMapType({getTileUrl: function(p,z) { return z<13 ? "http://tiles-2.topomap.co.nz/tiles-topo250/"+z+"-"+CLIP(p.x,z)+"-"+TYZ(CLIP(p.y,z),z)+".png" : "http://tiles-2.topomap.co.nz/tiles-topo50/"+z+"-"+CLIP(p.x,z)+"-"+TYZ(CLIP(p.y,z),z)+".png" }, maxZoom: 15, name: "TopoNewZealand", opacity: 1, tileSize: new google.maps.Size(256,256)}) );
  credits["nztopo"] = "<a href='http://www.topomap.co.nz/' target='_blank'>Topo map by Topomap.co.nz</a>";
  map.mapTypes.set("chtopo", new google.maps.ImageMapType({getTileUrl: function(p,z) { return "http://wmts20.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/"+z+"/"+p.x+"/"+p.y+".jpeg" }, maxZoom: 18, name: "TopoSwiss", opacity: 1, tileSize: new google.maps.Size(256,256)}) );
  credits["chtopo"] = "<a href='http://map.geo.admin.ch' target='_blank'>Topo map by Swisstopo</a>";
  
  // Map Change
  google.maps.event.addListener(map, "maptypeid_changed", function() { 
	map.controls[google.maps.ControlPosition.BOTTOM_CENTER].clear(); 
	if(map.getMapTypeId()=="topo")
	  map.overlayMapTypes.setAt(0, relief); 
	else
	  map.overlayMapTypes.clear(); 
	var credit = credits[map.getMapTypeId()];
	if (!!credit && !!creditDiv)
		creditDiv.innerHTML = credit;
	})

  // Map out
  google.maps.event.addListener(map, 'mouseout', function() {
  	mapcover();
	});
	
  // set map type from "kmltype"
  var maptype = document.getElementById("kmltype");
  if (maptype!=null) 
  {
  var mapset = maptype.innerHTML.split('@');
  if (mapset.length>1)
	map.mapTypes[mapset[0]].maxZoom = parseInt(mapset[1]);
  map.setMapTypeId(mapset[0]);
  }


  // Tiles loaded
  loadingtiles = true;
  console.log("loadingtiles true");
  google.maps.event.addListener(map, 'tilesloaded', function(evt) {
	 setTimeout(function(){ loadingtiles =false; console.log("loadingtiles false");}, 5000);
  });
  google.maps.event.addListener(map, 'bounds_changed', function(evt) {
	loadingtiles2 = true;
	console.log('loadingtiles2 true');
  });
  google.maps.event.addListener(map, 'idle', function(evt) {
	 setTimeout(function(){ loadingtiles2 =false; console.log("loadingtiles2 false");}, 5000);
  });

  boundslist = new google.maps.LatLngBounds();

  var kmlmap;


  // set marker (if any) from "kmlmarker"
  var kmlmarker =document.getElementById("kmlmarker");
  if (kmlmarker!=null) {
	console.log('kmlmarker');    
	var coords = kmlmarker.innerHTML.split(",");
	if (coords!=null && coords.length>1) {
	  kmlmap = "kmlmarker";
	  setmarker(coords[0], coords[1], 0);
	  map.setZoom(13);
	  var latlng = new google.maps.LatLng(coords[0], coords[1]);
	  map.panTo(latlng);
	  
    var elevationdiv = document.getElementById('elevationdiv');
    if (elevationdiv)
    	getgeoelevation(latlng, "elevationdiv", ' ~');

	  //console.log('zoompanTo '+coords[0]+","+coords[1]+" obj="+new google.maps.LatLng(coords[0], coords[1]));
	  //map.panToBounds(bounds);
	  }
  }


  var kmlrect = document.getElementById("kmlrect");
  if (kmlrect!=null) {
	  var coords = kmlrect.innerHTML.split(',');
	  if (coords!=null && coords.length>1) {
		kmlmap = "kmlrect";
		
	  var maprectangle = new google.maps.Rectangle({
	  strokeColor: '#FF0000',
	  strokeOpacity: 0.5,
	  strokeWeight: 2,
	  fillColor: '#FF0000',
	  fillOpacity: 0.05,
	  map: map,
	  bounds: new google.maps.LatLngBounds(
		new google.maps.LatLng(coords[0], coords[1]),
		new google.maps.LatLng(coords[2], coords[3])),
	  draggable: false,
	  clickable: false,
	  optimized: false
	  });
	  boundslist=maprectangle.getBounds()
	  map.fitBounds(boundslist);
	  map.panToBounds(boundslist);
	  if (coords.length>4)
		{
		setTimeout(function(){
		map.setZoom(parseInt(coords[4]));
		 }, 1000);
		}    
	  }
	}
  
  var kmlcircle = document.getElementById("kmlcircle");
  if (kmlcircle!=null) {
	  var coords = kmlcircle.innerHTML.split(',');
	  if (coords!=null && coords.length>1) {
		kmlmap = "kmlcircle";
		var circleopt = {
		  strokeColor: '#FF0000',
		  strokeOpacity: 0.5,
		  strokeWeight: 2,
		  fillColor: '#FF0000',
		  fillOpacity: 0.05,
		  map: map,
		  center: new google.maps.LatLng(coords[0], coords[1]),
		  radius: Number(coords[2]),
		  draggable: false,
		  clickable: false,
		  optimized: false
		  };
		// Add the circle for this city to the map.
		setmarker(coords[0], coords[1], 90000);
		
		if (kmlrect==null)
		  {
		  var mapcircle = new google.maps.Circle(circleopt);
		  boundslist=mapcircle.getBounds()
		  }
		
		map.fitBounds(boundslist);
		map.panToBounds(boundslist);
		}
	}
  
  
   
  kmlsummary = document.getElementById("kmlsummary");
  var kmllist = document.getElementById("kmllist");
  if (kmllist!=null) {
	var kmlicons = document.getElementById("kmlicons");
	if (kmlicons!=null)
	   kmliconlist = kmlicons.innerHTML.split(',');
	kmlmap = "kmllist";
	var list = kmllist.innerHTML.split('&amp;').join('').split(';');   
	var objlist = [];
	for (var i=0; i<list.length; ++i) {
		if (list[i]==null) continue;
		if (list[i].length<=0) continue;
  
		var line = list[i].split(',');
		if (line==null) continue;
		
		var lat = parseFloat(line[1]);
		var lng = parseFloat(line[2]);
		if (isNaN(lat) || isNaN(lng)) // error checking
		  continue;

		var obj = { id: urldecode(line[0]), location:{lat:lat, lng:lng} };
		if (line.length>3) {
			obj.q = Number(line[3]);
			if (line.length>6)
			  obj.icon = kmliconlist[Number(line[6])*6+obj.q];
		}
		// numeric icons
		if (kmlsummary)
		 if (obj.id[0]=='#')
		  {
		  //var colors = [ "666666", "7b6434", "b2882c", "f6b114", "f78931", "f74c24" ];
		  var num = obj.id.slice(1).split(' ')[0];
		  obj.icon = 'http://sites.google.com/site/rwicons/bg'+obj.q+'_'+num+'.png';
		  //iconm = 'http://chart.apis.google.com/chart?chst=d_text_outline&chld='+colors[Number(line[3])]+'|12|h|000000|b|'+parseInt(num);
		  }
		if (line.length>4)
		   obj.description = urldecode(line[4]);
		if (line.length>5)
		   obj.thumbnail = line[5];
		objlist.push( obj )
		}
	loadlist(objlist, true);
	}
	
  var kmllistquery = document.getElementById("kmllistquery");
  if (kmllistquery!=null) {
	kmlmap = "kmllistquery";
	kmllist = kmllistquery;
	kmllisturl = 'http://ropewiki.com/api.php?action=ask&format=json&query='+kmllistquery.innerHTML+'|%3FHas_coordinates|%3FHas_star_rating|%3FHas_summary|%3FHas_banner_image_file|%3FHas_location_class|%3FHas_KML_file|limit=100';   
	tablelisturl = window.location.href.toString();     
	tablelisturl = tablelisturl.split('#')[0];
	//tablelisturl = 'http://ropewiki.com/California';
	tablelisturl += (tablelisturl.indexOf('?')<0 ? '?' : '&') + 'nomapchk=on';

	// load dynamic query
	var loctotaldiv = document.getElementById("loctotal");
	if (loctotaldiv) {        
		var loctotal = loctotaldiv.innerHTML;
		if (loctotal>0);
		  morekmllist(0, loctotal);
		}
   }

  
  // set kml (if any) from "kmlfile"
  var layer;
  var kmlfile = document.getElementById("kmlfile");
  if (kmlfile!=null && !layer) {  
	var file=kmlfile.innerHTML;
	if (file!=null && file.length>0) {
	kmlmap = "kmlfile";
	layer = new google.maps.KmlLayer(file); 
	layer.setMap(map);
	}
  }
  
  
  // spiderfy summary to avoid overlapping icons
  if (kmlsummary!=null) {  
  
  function spiderfy(srepeat) 
	{
	loadingquery2 = true;
	console.log("loadingquery2 true");

	var step = 1; // pixel step
	var isize2 = 26/2;  // icon size
	var osize = 16; // no overlapping size
	if (srepeat==null)
	  srepeat = 100; // repeat 
  
  
	// get map stats
	var scale = Math.pow(2, map.getZoom());
	var proj = map.getProjection();
	var bounds = map.getBounds();
	if (!proj || !bounds)
	  {   
	  console.log("null proj");
	  return;
	  }
	//console.log("bounds NE "+bounds.getNorthEast()+" SW "+bounds.getSouthWest());
	//console.log("bounds NE.lat "+bounds.getNorthEast().lat()+" SW,lng "+bounds.getSouthWest().lng());
	var nwll = new google.maps.LatLng( bounds.getNorthEast().lat(), bounds.getSouthWest().lng() );
	//console.log("nwll "+nwll);
	var nw = proj.fromLatLngToPoint(nwll);
	//console.log("nw "+nw);
  
  function fromLatLngToPixel(position) {
	var point = proj.fromLatLngToPoint(position);
	return new google.maps.Point(
	Math.floor((point.x - nw.x) * scale),
	Math.floor((point.y - nw.y) * scale));
	}
  
  function fromPixelToLatLng(pixel) {
	var point = new google.maps.Point();
	point.x = pixel.x / scale + nw.x;
	point.y = pixel.y / scale + nw.y;
	return proj.fromPointToLatLng(point);
  }
  
  
	// compute pixel locations
	for (var i = 0; i < markers.length; i++)
	   {
	   var m = markers[i];
	   m.p = fromLatLngToPixel(m.oposition);
	   m.p.y += isize2; // move center
	   //console.log(m.name+":"+m.p+" <- "+m.oposition);
	   }
  
   // reposition icons to avoid overlap
   // use incremental global approach
   var overlap = true;
   for (var r=0; r<srepeat && overlap; ++r)
	{
	overlap = false;
	for (var i = 0; i < markers.length; i++)
	   for (var j = i+1; j < markers.length; j++)
		 if (i!=j)
		 {
		 // if overlap, move
		 var dx = markers[i].p.x - markers[j].p.x;
		 var dy = markers[i].p.y - markers[j].p.y;
		 var adx = (dx<0 ? -dx : dx);
		 var ady = (dy<0 ? -dy : dy);
		 if (adx<osize && ady<osize)
		  {
		  //if (markers[i].name.substr(0,3)=='#08' || markers[j].name.substr(0,3)=='#08') //debug
		  //    console.log("["+i+"] "+markers[i].name+" x ["+j+"] "+markers[j].name+" dx:"+dx+" dy:"+dy);
		  if (adx<osize)
		   if (dx>0)
			  {
			  markers[i].p.x+=step;
			  markers[j].p.x-=step;
			  overlap = true;
			  }
		   else
			  {
			  markers[i].p.x-=step;
			  markers[j].p.x+=step;
			  overlap = true;
			  }
		  if (ady<osize)
		   if (dy>0)
			  {
			  markers[i].p.y+=step;
			  markers[j].p.y-=step;
			  overlap = true;
			  }
		   else
			  {
			  markers[i].p.y-=step;
			  markers[j].p.y+=step;
			  overlap = true;
			  }
		  }
		 }
	 }
	console.log("repetitions:"+r+" overlap:"+overlap+" os:"+osize+" st:"+step);
  
	// compute marker locations
	for (var i = 0; i < markers.length; i++)
	   {
	   var m = markers[i];
	   m.p.y -= isize2; // move center
	   var pos = fromPixelToLatLng(m.p);
	   //console.log(""+m.name+":"+m.p+" -> "+pos.lat()+","+pos.lng());
	   var ll = { lat: parseFloat(pos.lat()), lng: parseFloat(pos.lng()) };
	   if (!isNaN(ll.lat) && !isNaN(ll.lng)) // error checking
		  m.setPosition( ll );
	   else
		 console.log("error "+m.name+":"+m.p+" -> "+ll.lat+","+ll.lng);
	   }
	setTimeout(function(){ loadingquery2 =false; console.log("loadingquery2 false");}, 5000);
	}
		 
  google.maps.event.addListener(map, "zoom_changed", spiderfy);
  //google.maps.event.addListener(map, "projection_changed", spiderfy);  
  /* //Debug
  var customrepeat = 0;
  $(document).keydown(function(event) { //'#mapbox'
		switch(event.which) {
		  case 88: // X
			  if (customrepeat<50)
				 ++customrepeat;            
			  spiderfy(customrepeat);
			  break;
		  case 90: // Z
			  if (customrepeat>0)
				 --customrepeat;            
			  spiderfy(customrepeat);
			  break;
		}
  });
  */
  }
  
  
  // null map
  if (kmlmap==null) {
   var myLatlng = new google.maps.LatLng(0, 0);  
   var infowindowm = new google.maps.InfoWindow({ content: "UNKNOWN LOCATION" });
   var marker = new google.maps.Marker({ position: myLatlng,  map: map, infowindow:infowindowm, optimized: false});
   marker.infowindow.open(map, marker); 
   google.maps.event.addListener(marker, 'click', function() { this.infowindow.open(map, this); });
   map.panTo(myLatlng);
   map.setZoom(2);
   map.setMapTypeId(google.maps.MapTypeId.TERRAIN);
  }
  
  // set kml (if any) from "kmlfile"
  var kmltitle = document.getElementById("kmltitle");
  if (kmltitle!=null) {  
   var controlsDiv = document.createElement('DIV');
   controlsDiv.style.margin = "4px 4px 4px 4px";
   //controlsDiv.style.fontSize = "big"; 
   controlsDiv.innerHTML = '<img src="http://chart.apis.google.com/chart?chst=d_text_outline&chld=000000|32|h|FFFFFF|b|'+urlencode(kmltitle.innerHTML)+'"/>';
   //"<h2>"+kmltitle.innerHTML+"</h2>";
   map.controls[google.maps.ControlPosition.TOP_CENTER].push(controlsDiv);
  }
	
  
  // add special controls
  {
  var spstart = '<div class="gmnoprint maptopcontrols">', spend = '</div>';
  //var controls = '<div style="position:absolute;left:0;right:0;width:99%;height:99%;border-color:red;border-width:50px;border-style: solid;background-color:transparent"></div>';
  //var controls = spstart+'<label><input class="gmnoprint" id="fullscreenchk" type="checkbox" onclick="toggleFullScreen()">Full Screen&nbsp;</label>'+spend;
  var controls = spstart+'<img class="gmnoprint" id="fullscreenchk" onclick="toggleFullScreen()" title="Full Screen" src="http://ropewiki.com/images/b/b9/FullscreenIcon.png">'+spend;
  if (kmllist) 
	{
	 /*
	 // Cluster Engine
	 // http://google-maps-utility-library-v3.googlecode.com/svn/trunk/markerclustererplus/docs/reference.html
	 $.getScript("http://google-maps-utility-library-v3.googlecode.com/svn/trunk/markerclusterer/src/markerclusterer.js", function(){
	   //alert("Script loaded and executed.");
	 });
	//controls += spstart+'<label><input class="gmnoprint" id="clusterchk" type="checkbox" onclick="toggleCluster()">Cluster&nbsp;</label>'+spend;    
	 */
  
	controls += spstart+'<label><input class="gmnoprint" id="routeschk" type="checkbox" onclick="toggleRoutes()">Show&nbsp;KML&nbsp;</label>'+spend;

	// map search
	if (document.getElementById('locsearch'))
	{
	var controlsDiv2 = document.createElement('DIV');
	controlsDiv2.innerHTML = '<div id="searchmap"><span id="searchinfo"></span><button type="search" value="" onclick="searchmap()">Search Map</button></div>';
	map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(controlsDiv2);
	searchmaprectangle = new google.maps.Rectangle({
	  strokeColor: '#FF0000',
	  strokeOpacity: 0.5,
	  strokeWeight: 2,
	  fillColor: '#FF0000',
	  fillOpacity: 0.05,
	  bounds: new google.maps.LatLngBounds(
		new google.maps.LatLng(0, 0),
		new google.maps.LatLng(0, 0)),
	  draggable: false,
	  clickable: false,
	  optimized: false
	  });

	
	map.addListener('click', function(e) {
	  if (searchmapn>=0)
	  {
			 var marker = new google.maps.Marker({ position: e.latLng,  map: map, optimized: false});
			 searchmappt.push(e.latLng);
			 ++searchmapn;
			 var bounds = new google.maps.LatLngBounds();
			 bounds.extend(searchmappt[0]);
			 bounds.extend(searchmappt[ searchmappt.length>=2 ? 1 : 0]);
			 searchmaprectangle.setBounds(bounds);
			 searchmaprectangle.setMap(map);
			 if (searchmapn>=2)
			   searchmaprun();
	  }
	  });
	map.addListener('mousemove', function(e) {
	  if (searchmapn>0 && searchmapn<2)
	  {
			 var bounds = new google.maps.LatLngBounds();
			 bounds.extend(searchmappt[0]);
			 bounds.extend(e.latLng);
			 searchmaprectangle.setBounds(bounds);
			 searchmaprectangle.setMap(map);
	  }

	  });
	}
	
	}
  else
   {
   if (kmltitle)
	 controls += spstart+'<label><input class="gmnoprint" id="labelschk" type="checkbox" onclick="toggleLabels()" '+(labels ? 'checked' : '')+'>TrkLabels&nbsp;</label>'+spend;
   }
  //controls += spstart+'<label><input class="gmnoprint" id="metricchk" type="checkbox" onclick="toggleMetric()" '+(metric ? 'checked' : '')+'>Metric&nbsp;</label>'+spend;
  var controlsDiv = document.createElement('DIV');
  controlsDiv.style.cssText = "z-index:9999;";
  controlsDiv.innerHTML = controls;
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(controlsDiv);
  }
  map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(coverDiv);
  
  // set kml (if any) from "kmlfile"
  var kmlfilep = document.getElementById("kmlfilep");
  if (kmlfilep!=null) {
	loadingkml = true;
	console.log('loadingkml true');

	var file=kmlfilep.innerHTML;
	var filelink = "";
	if (file!=null && file.length>0) {
	kmlmap = "kmlfilep";
	var mapbox="#mapbox";
	var mapsidebar = "mapsidebar";

	var bskmlfile = document.getElementById("bskmlfile");
	if (bskmlfile!=null) {  
	  var sourceDiv= document.createElement('DIV');
	  var text = '<div class = "dropDownOptionsDiv" id="myddOptsDiv">'
			file = file.split("&amp;").join("&");
	  var selection = bskmlfile.innerHTML.toString().split("&amp;").join("&").split(',');
			if (urldecode(file).indexOf(urldecode(selection[0]))<0)
		 selection.unshift(file);
	  var domains = [];
	  for (var i=0; i<selection.length; ++i)
		{
		var style = "";
		var link = selection[i];
		if (noextraction(link))
		   style = "color:red;";
		var counter = 0;
		var domain = getdomain(link);
		domains.push(domain);
		for (var d=0; d<domains.length; ++d)
		   if (domains[d]==domain)
			  ++counter;
		if (counter>1)
		  domain += "#"+counter;
		text += '<div class="dropDownItemDiv" onClick="loadSource(\''+link+'\',\''+domain+'\')" style="'+style+'">'+domain+'</div>';
		}
	  var big = document.getElementsByTagName('BIG');
	  if (big && big.length>0 && selection.length>1)
		{
		var link = urlencode(big[0].innerHTML);
		text += '<div class="dropDownItemDiv" onClick="loadSource(\''+link+'\',\'ALL COMBINED\')" style="font-weight:bold">ALL COMBINED</div>';
		}
	  text += '</div>';
	  var name = getdomain(selection[0]);
	  text += '<div class="dropDownControl" onclick="(document.getElementById(\'myddOptsDiv\').style.display == \'block\') ? document.getElementById(\'myddOptsDiv\').style.display = \'none\' : document.getElementById(\'myddOptsDiv\').style.display = \'block\';"><span id="myddOptsText">'+name+'</span><img class="dropDownArrow" src="http://maps.gstatic.com/mapfiles/arrow-down.png"/></div>';
	  lastlinks.push(filelink=selection[0]);
  
	  sourceDiv.className = "dropDownControlDiv";
	  sourceDiv.style.zIndex = 1000;
	  sourceDiv.innerHTML = text; 
	  map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(sourceDiv); 
	  //document.body.appendChild(sourceDiv);
  
	  if (selection.length<2)
		sourceDiv.style.display = "none";
	}

	var sidebar = document.createElement('div');
	sidebar.setAttribute('id',mapsidebar);
	sidebar.className = "notranslate";
	document.body.appendChild(sidebar);
 

	var controlsDiv = document.createElement('DIV');
	controlsDiv.innerHTML = '<div id="legendbar"><label><input class="gmnoprint" id="legendchk" type="checkbox" onclick="toggleLegend()"><span id="legendlabel">Legend</span></label><br><div id="legend" class="notranslate"></div></div><div id="loadlinks"></div>';

	

	map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(controlsDiv);
	controlsDiv.style.maxHeight="90%";
	controlsDiv.style.overflow="auto";
	controlsDiv.style.zIndex=999;
	controlsDiv.style.marginRight="5px";
  
	
	 function geoxmlinitp(){ 
	  // Here you can use anything you defined in the loaded script
	  //alert("script loaded");
	  //map.panTo(new google.maps.LatLng(0, 0));
	  gxml = new GeoXml("gxml", map, "", {
	  sidebarid:mapsidebar,
	  sortbyname:true,
	  //publishdirectory:"http://www.dyasdesigns.com/tntmap/",
	  //iwwidth:280,
	  //iwmethod:"mouseover",
	  //nolegend:false,
	  simplelegend:true,
	  suppressallfolders:true,
	  //sidebarsnippet:true,
	  showArrows:true,
	  showLabels:true,
	  showRouteLabels:labels && kmltitle,
	  showElevation:labels && kmltitle,
	  directions:true,
	  dohilite:true,
	  allfoldersopen:true,
	  hilite:{ color:"#aaffff",opacity: 0.8, width:10, textcolor:"#000000" } //, c0c0ff
	  }); 
	  // avoid race conditions between map and geoxml
	  google.maps.event.addListener(gxml, "loaded", function() {      
		//console.log("event:kml loaded");
	  setTimeout(function(){ loadingkml=false; console.log("loadingkml false");}, 5000);
	  
	  if (document.getElementById("hidelegend")==null || showLegend)
		  {
		  var interval = setInterval(function(){
		  if (document.getElementById("legend")!=null)
			 {
			 toggleLegend(true);
			 var wlegend = $("#legendbar").width();
			 var hlegend = $("#legendbar").height();
			 var wmap = $("#mapbox").width();
			 var hmap = $("#mapbox").height();
			 if (wlegend*hlegend>wmap*hmap/4)
				 toggleLegend(false);
			 clearInterval(interval);
			 //console.log("legend is here!");
			 }
		  }, 500);
		  }
  
		});    
	  gxml.load(file, filelink);
	  }
	 if ((typeof staticscripts) == 'undefined')
		$.getScript((typeof geoxmljs) != 'undefined' ?  geoxmljs : geturl("http://ropewiki.com/index.php?title=MediaWiki:Geoxml.js&action=raw&ctype=text/javascript"), geoxmlinitp);
	 else
		setTimeout(geoxmlinitp,100);
	}
  }
  


  // set kml (if any) from "kmlfile"
  var kmlfilew = document.getElementById("kmlfilew");
  if (kmlfilew!=null) {  
	var file=kmlfilew.innerHTML;
	if (file!=null && file.length>0) {
	kmlmap = "kmlfilew";
	var mapbox="#mapbox";
	
	
	 function geoxmlinitw(){ 
	  // Here you can use anything you defined in the loaded script
	  //alert("script loaded");
	  //map.panTo(new google.maps.LatLng(0, 0));
	  gxml = new GeoXml("gxml", map, "", {
	  //sidebarid:mapsidebar,
	  //publishdirectory:"http://www.dyasdesigns.com/tntmap/",
	  //iwwidth:280,
	  //iwmethod:"mouseover",
	  //nolegend:false,
	  nozoom:true,
	  simplelegend:true,
	  suppressallfolders:true,
	  //sidebarsnippet:true,
	  showArrows:false,
	  showLabels:false,
	  patchIcons:true,
	  showRouteLabels:false,
	  directions:false,
	  dohilite:false,
	  //allfoldersopen:true,
	  hilite:{ color:"#aaffff",opacity: 0.8, width:10, textcolor:"#000000" } //, c0c0ff
	  }); 
	  gxml.load(file, file);
	  }
	 if ((typeof staticscripts) == 'undefined')
		$.getScript((typeof geoxmljs) != 'undefined' ?  geoxmljs : geturl("http://ropewiki.com/index.php?title=MediaWiki:Geoxml.js&action=raw&ctype=text/javascript"), geoxmlinitw);
	 else
		setTimeout(geoxmlinitw,100);
	}
  }

  setTimeout(function(){ loadingmap=false; console.log("loadingmap false");}, 5000);
  
  $('#mapbox').mouseover(function(event) {
   handlekeys = true;
   });
  
  $('#mapbox').mouseout(function(event) {
   handlekeys = false;
   mapcover();
  });
  
  $('#mapbox').mousedown(function(event){
   // prevent text selection on doubleclick
   event.preventDefault();
  });
  
  // keyboard shortcut handler
  $(document).keydown(function(event) { //'#mapbox'
	if (handlekeys)
	{
	  var z = 1;
	  var o = 128; // half a tile's width 
	  switch(event.which) {
		  case 37: // leftArrow
			  map.panBy(-o,0);
			  return false;
		  case 38: // upArrow
			  map.panBy(0,-o);
			  return false;
		  case 39: // rightArrow
			  map.panBy(o,0);
			  return false;
		  case 40: // downArrow
			  map.panBy(0,o);
			  return false;
		  case 109: // numpad -
		  case 189: // -
			  map.setZoom(z=map.getZoom()-1);
			  return false;
		  case 107: // numpad +
		  case 187: // =
			  map.setZoom(z=map.getZoom()+1);
			  return false;
		  case 27: // Esc
		  case 8: // Backspace
			  if (toggleFS!=null)  
				backFullScreen();
			  return false;
		  default:
			  //alert("key:"+event.which);
			  break;
	  }
	}
  });
  
  
  
  // in case window gets resized
  $( window ).resize(function() {
	if (toggleFS!=null)
	  toggleFullScreen(true);
	else
		centermap();
	smallstyle();
	mapcover();
  });

  }
  



  var piciconlist = [];  
  var picloadingmsg = "<img height=12 src='http://ropewiki.com/extensions/SemanticForms/skins/loading.gif'/> Loading... ";
  var piclist, picloading, picloadingerr, picloadingn;
  
  function pictureget(linklist)
  {    
  if (linklist.length==0)
    return;
  var url = geturl(linklist.shift());
	console.log("getpic "+url);
	$.getJSON(url, function( data ) {
	var poilist = [];
	var list = data.list; //data.split('/cgi-progs/staMeta?station_id=');
	for (var i=0; i<list.length; ++i) {
	  var col = list[i].split(',');
	  var node = document.createElement("LI");
	  node.className = "gallerybox";
	  var content = '<div class="thumbinner" style="width:154px"><a href="'+col[0]+'" target="_blank"><img src="'+col[4]+'" style="width:150px;height:150px;"></a><div class="thumbcaption"><div>'+pinicon(col[0],piciconlist[col[9]])+' <b>'+col[6]+'</b></div><div>'+col[8]+'</div><div>'+col[1]+'</div></div></div>';
	  node.innerHTML = content;
	  node.sortdate = col[5];
	  node.locid = col[0];
	  //piclist.appendChild(node);
	  var elems = piclist.getElementsByTagName("LI");
	  var pos = 0;
	  for (pos = 0; pos<elems.length && elems[pos].sortdate >= node.sortdate; ++pos);
	  if (pos==elems.length)
		 piclist.appendChild(node);
	  else
		 piclist.insertBefore(node, elems[pos]);      
	  var loc = {lat: parseFloat(col[2].toString()), lng: parseFloat(col[3].toString())};
	  poilist.push( {id:col[0], location:loc, zindex:100-i, icon:piciconlist[col[9]], thumbnail:col[4], description:'', infodescription: col[6]+' '+col[8], infocontent:content} );           
	  }
	if (map!=null)
	   loadlist(poilist);
	   
	// limit max 250 pics
	var locids = [];
	var elems = piclist.getElementsByTagName("LI");
	for (var pos = 250; pos<elems.length; ++pos)
	   {
	   locids.push(elems[pos].locid);
	   piclist.removeChild(elems[pos]);
	   }
	for (var i =0; i<markers.length; ++i)
	   if (locids.indexOf(markers[i].name)>=0)
		  markers[i].setMap(null);    
	}).error(function() { 
		++picloadingerr;
		console.log("picerror "+url);
		})
	.always(function() { 
	   var msg = "";
	   if (linklist.length>0) 
		  msg += picloadingmsg + Math.round((picloadingn-linklist.length)*100.0/picloadingn)+'%';
	   if (picloadingerr>0) 
		  msg += ' <span style="color:red">'+picloadingerr+' ERRORS!</span>';        
	   picloading.innerHTML = msg;
		 pictureget(linklist);
	  });
  }


  function pictureinit()
  {

	piclist = document.getElementById('picture-list');
	var picrect = document.getElementById('picture-rect');
	if (!picrect || !piclist)
	  return;
	
	picloading = document.createElement("DIV");
	picloading.innerHTML = picloadingmsg;
	piclist.parentNode.insertBefore(picloading, piclist);

	piciconlist["Instagram.com"] = "http://ropewiki.com/images/c/c0/InstaIcon.png";
	piciconlist["Facebook.com"] = "http://ropewiki.com/images/0/03/FacebIcon.png";
	piciconlist["Flickr.com"] = "http://ropewiki.com/images/f/f7/FlickIcon.png";
	piciconlist["Panoramio.com"] = "http://ropewiki.com/images/a/a4/PanorIcon.png";

	var local = window.location.href.toString().indexOf('debug=local')>=0; // || url.indexOf('http')<0;
	var preurl = local ? "http://localhost/rwr?pictures=" : "http://d5a.net/rwr?pictures=";
	var url = preurl+picrect.innerHTML;

	
	//console.log(url);
	$.getJSON(geturl(url), function( data ) {
	//alert( "Load was performed." );
	//console.log("load performed");
		
	// load sites
	var list = data.list; //data.split('/cgi-progs/staMeta?station_id=');
	picloadingerr = 0;
	picloadingn = list.length;
	for (t=0; t<3; ++t)
	  {             
	  setTimeout(function(){
		  pictureget(list);
		}, t*500);
	  }
	pictureget(list);
	}).error(function() { picloading.innerHTML = '<div style="color:red">ERROR!</div>'; });
  }
  
  
  function waterflowinit()
  {
	waterflow();
  }
  
  function loadMapInterface()
  {
  var elem = document.getElementById("mapbox");  
  if (elem==null)
	  {
	  loadingmap = false;
	  $('.locateicon').hide();
	  console.log("loadingmap none");
	  return;
	  }

	
  if ((typeof staticscripts) == 'undefined')
  {
  var script = document.createElement("script");
  script.type = "text/javascript";
  script.src = "https://www.google.com/jsapi";
  document.body.appendChild(script);
  
  var script = document.createElement("script");
  script.type = "text/javascript";
  script.src = "http://maps.googleapis.com/maps/api/js?v=3&key=AIzaSyDdkcexZV-p5Nj8RwgLYTcegm5jorJpbyw&callback=initializemap";
  document.body.appendChild(script);
  //initializemap();
  }
  else
  initializemap();
  
  // recent pictures
  pictureinit()

  // waterflow
  var table = document.getElementById('waterflow-table');
  if (!table) return;  
	if ((typeof staticscripts) == 'undefined')
	  $.getScript((typeof waterflowjs) != 'undefined' ? waterflowjs : geturl("http://ropewiki.com/index.php?title=MediaWiki:Waterflow.js&action=raw&ctype=text/javascript"), waterflowinit);
	else
	  setTimeout(waterflowinit,100);
  }

  function loadmapScript() {
  //console.log("0");
  smallstyle();
  //console.log("1");
  loadSkin();
  //console.log("2");
  loadEditor();  
  //console.log("3");
  loadFacebook();
  //console.log("4");
  loadMapInterface();
  //console.log("5");
  loadUserInterface(document);
  loadFormInterface();
  loadTranslation();
  var transtimer = setInterval(function(){  loadTranslation(); }, 2000 );
  // tranlsate script
  //$.getScript("//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit");
  var script = document.createElement("script");
  script.type = "text/javascript";
  script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  document.body.appendChild(script);
  }
  
 // tranlsate callback
  function googleTranslateElementInit() {
  var hdr = document.getElementById('firstHeading');
  if (hdr){
	 // small screen
	 var div = document.createElement('div')
	 div.className = 'noprint';
	 div.style.cssText='float:right';
	 div.id = 'google_translate_flags';
	 div.innerHTML = '<table class="noprint"><tr><td><img src="http://ropewiki.com/images/c/c9/FlagIcon.png"/></td><td id="google_translate_element"></td></tr></table>';
	 //hdr.parentNode.insertBefore(div, hdr);
	 hdr.insertBefore(div, hdr.firstChild);
	 
	 //new google.translate.TranslateElement({pageLanguage: 'en', layout: google.translate.TranslateElement.InlineLayout.SIMPLE, multilanguagePage: true}, 'google_translate_element');
	 //new google.translate.TranslateElement({pageLanguage: 'en', layout: google.translate.TranslateElement.InlineLayout.SIMPLE, multilanguagePage: true, gaTrack: true, gaId: 'UA-78683801-1', autoDisplay: false},      
	 new google.translate.TranslateElement({pageLanguage: 'en', multilanguagePage: true, gaTrack: true, gaId: 'UA-78683801-1'}, 'google_translate_element');
   }
  }

  //console.log("A");  
  window.onload = loadmapScript;
  
  var showLegend;
  function toggleLegend(force) {
  var idchk="legendchk";
  var legend=document.getElementById("legend");
  var label=document.getElementById("legendlabel");
  var mapsidebar = document.getElementById("mapsidebar");
  if (showLegend==null || force)
	{
	if (legend && mapsidebar) {
	  legend.style.display = "block";
	  legend.innerHTML = legend.innerHTML + mapsidebar.innerHTML;
	  mapsidebar.innerHTML = "";
	  }
	if (label && showLegend==null) 
	showLegend = label.innerHTML;
	}
  else
	{
	if (legend) legend.style.display = "none";
	//if (label) label.innerHTML = showLegend;
	showLegend = null;
	}
  var chk = document.getElementById(idchk);
  if (chk) chk.checked = showLegend!=null;
  //console.log("legend:"+(legend!=null)+" label:"+(label!=null)+" chk:"+(chk!=null));
  //google.maps.event.trigger(map,'resize');
  }
  
  
  
  var showRoutes, loadedRoutes;
  function toggleRoutes(kmlfile, kmlgroup) {
	idchk="routeschk";
	  
	var kmlroutes = document.getElementById('kmlroutes');
	if (!kmlroutes)
		return;
  
	var group = "KML";
	var url = kmlroutes.innerHTML.split('&amp;').join('&');
	if (!gxml || kmlfile)
	 {         
	 function geoxmlinitr(){ 
	  // Here you can use anything you defined in the loaded script
	  //alert("script loaded");
	  //map.panTo(new google.maps.LatLng(0, 0));
	  gxml = new GeoXml("gxml", map, "", {
	  //sidebarid:mapsidebar,
	  //publishdirectory:"http://www.dyasdesigns.com/tntmap/",
	  //iwwidth:280,
	  //iwmethod:"mouseover",
	  //nolegend:false,
	  nozoom:true,
	  simplelegend:true,
	  suppressallfolders:true,
	  //sidebarsnippet:true,
	  showArrows:false,
	  showLabels:false,
	  patchIcons:true,
	  showRouteLabels:false,
	  directions:true,
	  dohilite:true,
	  //allfoldersopen:true,
	  hilite:{ color:"#aaffff",opacity: 0.8, width:10, textcolor:"#000000" } //, c0c0ff
	  }); 
	  var file = kmlfile ? kmlfile : url;
	  var group = kmlgroup ? kmlgroup : group;
	  gxml.load(file, group, group);
	  }
	 if ((typeof staticscripts) == 'undefined')
		$.getScript((typeof geoxmljs) != 'undefined' ?  geoxmljs : geturl("http://ropewiki.com/index.php?title=MediaWiki:Geoxml.js&action=raw&ctype=text/javascript"), geoxmlinitr);
	 else
		setTimeout(geoxmlinitr,100);
	 if (kmlfile) return;    
	 showRoutes = 'on';
	 loadedRoutes = 'on';
	 }
	else
	 {   
	 if  (showRoutes==null)
	  {
	  showRoutes = 'on';
	  if (loadedRoutes == null)    
		 {
		 gxml.load(url, group, group);
		 loadedRoutes = 'on';
		 }
	  else
		 {
		 gxml.overlayman.Show();
		 }
	  }
	 else
	  {
	  showRoutes = null;
	  gxml.overlayman.Hide();
	  }
	 }
	document.getElementById(idchk).checked = showRoutes!=null;
	google.maps.event.trigger(map,'resize');
   }
  
  
/*  
  var markerCluster;
  function toggleCluster() {
	idchk="clusterchk";
	if  (markerCluster==null)
	  {
	  markerCluster = new MarkerClusterer(map, markers);
	  
	  for (var i = 0; i < markers.length; i++)
	  if (markers[i].highlight)
		markers[i].highlight.setOptions({ map:null, visible: false});
		//markers[i].setMap(null);
	  }
	else
	  {
	  markerCluster.clearMarkers();
	  //markerCluster.refresh();      
	  delete markerCluster;
	  markerCluster = null;
	  for (var i = 0; i < markers.length; i++) {
		markers[i].setOptions({ map:map, visible: true});
		if (markers[i].highlight)
		   markers[i].highlight.setOptions({ map:map, visible: true});
	  }
		//markers[i].setMap(map);
	  }
	document.getElementById(idchk).checked = markerCluster!=null;
	google.maps.event.trigger(map,'resize');
   }
*/  
  
  var fshash = '#fullscreen';
  $(window).on('hashchange', function() {
  		if (toggleFS!=null)
  			if (window.location.href.toString().indexOf(fshash)<0)
  			   toggleFullScreen();
			});

	function backFullScreen() 
	{
	  window.history.back();
	}

  function mapcover()
  {
  	 var mw = $("#mapbox").width();
  	 var dw = $(window).width()-mw;
  	 if (!toggleFS && (dw<50 || mw<500))
	    //$("#mapcover").show();
	    $("#mapcover").css({display: "block"});
	 else
	 	//$("#mapcover").hide();  	 
	    $("#mapcover").css({display: "none"});
  }
  
  function centermap()
  {
  	if (!map) return;
		//var bounds = map.getBounds();
		var center = map.getCenter();
		google.maps.event.trigger(map,'resize');
		//map.panToBounds(bounds);
		//map.fitBounds(bounds);
		map.panTo(center);
	}
  
  var toggleFS;
  function toggleFullScreen(force) {

	var idchk="fullscreenchk";
	var ide = document.getElementById("mapbox");
	if (!ide) return;
	
	if (toggleFS==null || force)
	  {
	  if (toggleFS==null)
      {
			toggleFS = { parent: ide.parentNode, next:ide.nextSibling, cssText: ide.style.cssText, className: ide.className, sx:window.pageXOffset, sy:window.pageYOffset };
      window.location.href = window.location.href.toString()+fshash;
			var list = document.body.childNodes;
		  for (var i=0; i<list.length; ++i)
		  if (list[i].tagName=='DIV')
		    {
		    list[i].normal_display = list[i].style.display;
		    list[i].style.display = "none";
		  	}
			//$(".goog-te-banner-frame").hide();
      }
	  $(ide).hide();
	  ide.className = "";
	  $(ide).css({
		  position: 'fixed',
		  top: 0,
		  left: 0,
		  zIndex: 9999999,
		  width: '100%',
		  height: '100%'
		  });
	  //var w = $(window).width()-3;
	  //var h = $(window).height()-3;
	  //$(ide).width(w).height(h);	         
	  document.body.insertBefore(ide, document.body.firstChild);
	  window.scrollTo(0,0);
	  }
	else
	  {
	  $(ide).hide();
	  var fs = toggleFS; 
	  ide.style.cssText = fs.cssText;
	  ide.className = fs.className;
	  fs.parent.insertBefore(ide, fs.next);	  	  
	  //$(".goog-te-banner-frame").show();
	  var list = document.body.childNodes;
		for (var i=0; i<list.length; ++i)
		 if (typeof list[i].normal_display != "undefined")
		    list[i].style.display = list[i].normal_display;
	  window.scrollTo(fs.sx,fs.sy);
	  toggleFS = null;
	  }
	  
	chk = document.getElementById(idchk);
	chk.src = toggleFS==null ? "http://ropewiki.com/images/b/b9/FullscreenIcon.png" : "http://ropewiki.com/images/9/92/SmallscreenIcon.png";
	chk.onclick = toggleFS==null ? toggleFullScreen : backFullScreen;
	mapcover();
	$(ide).show();
	centermap();
  }
  
  
  
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
	  new function(){
  
		/* Makes all lists with the class 'collapsibleList' collapsible. The
		 * parameter is:
		 *
		 * doNotRecurse - true if sub-lists should not be made collapsible
		 */
		this.apply = function(doNotRecurse){
		  
		  // load original status
		  clistloading = getCookie(clistcookie);
		  if (!clistloading) clistloading = "<World>";
		  //console.log(clistloading);
  
		  // loop over the unordered lists
		  var uls = document.getElementsByTagName('ul');
		  for (var index = 0; index < uls.length; index ++){
  
			// check whether this list should be made collapsible
			if (uls[index].className.match(/(^| )collapsibleList( |$)/)){
  
			  // make this list collapsible
			  this.applyTo(uls[index], true);
  
			  // check whether sub-lists should also be made collapsible
			  if (!doNotRecurse){
  
				// add the collapsibleList class to the sub-lists
				var subUls = uls[index].getElementsByTagName('ul');
				for (var subIndex = 0; subIndex < subUls.length; subIndex ++){
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
		this.applyTo = function(node, doNotRecurse){
  
		  // REGION ROPEWIKI PATCH            
		  var lis, tag;
		  if ((lis=node.getElementsByTagName(tag='A')).length==0)
			lis=node.getElementsByTagName(tag='SPAN');
		  var list = [], titles = [];
		  for (var index = 0; index < lis.length; index ++)
				list.push(lis[index]);
			
		  for (var index = 0; index < list.length; index ++){
			var dup = -1;
			if (tag=='A')
				{
				dup = titles.indexOf(list[index].href);
				titles.push(list[index].href);
				}
			else
				{
				dup = titles.indexOf(list[index].innerHTML);
				titles.push(list[index].innerHTML);
				}
			if (dup<0) continue;
			// duplicate node! find li nodes
			var li1 = list[index];
			while (li1 && li1.tagName!="LI")
				li1 = li1.parentNode;
			var uls1 = li1.getElementsByTagName('UL');
			var li2 = list[dup];
			while (li2 && li2.tagName!="LI")
				li2 = li2.parentNode;
			var uls2 = li2.getElementsByTagName('UL');
		  
			if (uls1.length>0 && uls2.length==0)
				   li2.appendChild( uls1[0].cloneNode(true) );
			else
			if (uls2.length>0 && uls1.length==0 )
				   li1.appendChild( uls2[0].cloneNode(true) );
		  }
			
		  // loop over the list items within this node
		  var lis = node.getElementsByTagName('li');
		  for (var index = 0; index < lis.length; index ++){
	
			// check whether this list item should be collapsible
			if (!doNotRecurse || node == lis[index].parentNode){
  
			  // prevent text from being selected unintentionally
			  if (lis[index].addEventListener){
				lis[index].addEventListener(
					'mousedown', function (e){ e.preventDefault(); }, false);
			  }else{
				lis[index].attachEvent(
					'onselectstart', function(){ event.returnValue = false; });
			  }
  
			  // add the click listener
			  if (lis[index].addEventListener){
				lis[index].addEventListener(
					'click', createClickListener(lis[index]), false);
			  }else{
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
		function createClickListener(node){
  
		  // return the function
		  return function(e){
  
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
		function toggle(node){
  
		  // determine whether to open or close the unordered lists
		  var open = node.className.match(/(^| )collapsibleListClosed( |$)/);
		  open = save(node, open);
  
		  // loop over the unordered list elements with the node
		  var uls = node.getElementsByTagName('ul');
		  for (var index = 0; index < uls.length; index ++){
  
			// find the parent list item of this unordered list
			var li = uls[index];
			while (li.nodeName != 'LI') li = li.parentNode;
  
			// style the unordered list if it is directly within this node
			if (li == node) 
			  {
			  uls[index].style.display = (open ? 'block' : 'none');
			  
			  // on-demand region count
			  if (open) {
				var regionlist = [];
				regioncountlist(uls[index], regionlist); //$(uls[index]).find(".regioncount:visible"); //uls[index].childNodes;
				regioncount(regionlist);
				}
			  }
  
		  }
  
		  // remove the current class from the node
		  node.className =
			  node.className.replace(
				  /(^| )collapsibleList(Open|Closed)( |$)/, '');
  
		  // if the node contains unordered lists, set its class
		  if (uls.length > 0){
			node.className += ' collapsibleList' + (open ? 'Open' : 'Closed');
		  }
  
		}
  
		function save(node, open){
		  var href = null;
		  var links = node.getElementsByTagName("a");
		  if (links.length==0) 
			 links = node.getElementsByTagName("span");
		  if (links.length>0) 
			 href = links[0].innerHTML;
		  if (!href) 
			return open;
			
		  href = '<'+href+'>';
  
		  if (clistloading!=null)
		  {
		  if (clistloading.indexOf(href)>=0)
			return true;
		  else
			return false;
		  }
		  else
		  {
		  // save status
		  var str = getCookie(clistcookie);
		  str = str.split(href).join('')
		  if (open)
			str+= href;
		  setCookie(clistcookie, str);
		  //console.log(href+" "+open+" "+str);
		  }
		  return open;
		}
  
		function getregioncount()
		{         
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


		function regioncount(rlist)
		{
			 var titles = [];
			 for (var r=0; r<rlist.length; ++r)
				  {
				  var title = 'NOTEXIST';
				  var region = rlist[r].getElementsByTagName('A');
				  if (region && region.length>0)
					  title = region[0].title;
				  titles.push(title);
				  }
			  
			  //var url = http://ropewiki.com/index.php?title=Template:RegionCount&action=raw&templates=expand&region=San%20Diego;
			  var url = 'http://ropewiki.com/index.php?title=Template:RegionCount&action=raw&templates=expand&ctype=text/x-wiki&region='+urlencode(titles.join(';'));
			  $.get(geturl(url), function( data ) {
			  //alert( "Load was performed." );
			  //console.log("load performed");
				var rdata = data.split(';');
				for (var r=0; r<rlist.length; ++r)
				   rlist[r].innerHTML = rlist[r].innerHTML +' '+rdata[r];
				});
		}
		
		function regioncountlist(elem, list)
		{
		  for (var i=0; i<elem.childNodes.length; ++i)
			{
			var child = elem.childNodes[i];
			if (child.style && child.style.display!='none')
				{
				if (list.length<30 && child.className && child.className.indexOf('regioncount')>=0)
				   {
				   $(child).removeClass('regioncount');                  
				   list.push(child);
				   }
				if (child.childNodes.length>0)
				  if (child.tagName=='LI')
					 regioncountlist(child, list);
				}
			}
		}
		
  
	  }();
  
  
  // site link
  var sites =[]; // shared
  function findsite(id) 
  {
	  for (var c = 0; c < sites.length; c++)
		  if (sites[c].id == id)
			  return sites[c];
	  return null;
  }
  
  function nonamespace(label)
  {
	return label.replace("Events:", "");
  }  
  function sitelink(siteid, label, url)
  {
	if(typeof url == "undefined")
	  {
	  url = /*"\/index.php\/"+*/siteid;
	  var site = findsite(siteid);
	  if (site) 
		{
		var id = siteid.split(":")[1];
		url = site.urls[0].replace("%id", id);
		}
	  }
	if (url=="")
	  return '<span style="color:#808080">'+label+'</span>';
	return aref(url, label, label, 'target="_blank"');
  }

	
	  


  // Android stuff
  var currenturl = window.location.href.toString();  

  function isAndroid()
  {
	if (typeof Android != "undefined" )
		return true;
	if (urlget(currenturl, "debugandroid", "" )!="")
		return true;
	return false;
  }

  function kmlurl(url)
  {
	if (typeof Android != "undefined" )
	  return Android.kmlurl(url);     
	var summaryurl = "query=%5B%5BCategory%3ACanyons%5D%5D%5B%5BLocated%20in%20region.Located%20in%20regions%3A%3AX%7C%7CSan%20Diego%5D%5D&sort=&order=ascending";
	return "http://d5a.net/rwr?gpx=off&kml=http://ropewiki.com/KMLList?action=raw&templates=expand&ctype=application/x-zope-edit&group=link&" + summaryurl + "&more=&num=on&ext=.kml";
  }
  
  function viewsize()
  {
	var size = 0;
	if (typeof Android != "undefined" )
	  size = Android.isWebView()-10;
	if (size<=0) size = 600;
	return size;
}




  function WebViewStyle()
  {  
	if (!isAndroid())
	  return;
	  
	var remove = " .noprint, .gmnoprint, .rwSort, #contentSub, #top, #mw-head-base, #mw-page-base, #mw-navigation, #footer, .popupformlink, .toc, .mw-editsection "; //, #firstHeading, 
	var style = " .mw-body { margin:0px !important; padding:5px !important; } body { margin:0px !important; padding:0px !important; }";
	//style += " @media only screen and (max-width: 800px) { .staticmap { width:100% !important; height:auto !important; } }";

	var pinmap = document.getElementsByClassName("pinmap");
	for (var i=0, n=1; i<pinmap.length; ++i, ++n)
	  {
	  var num = n.toString();
	  if (num.length<2) num = "0"+num;
	  var str =  "#" + num + " "+pinmap[i].innerHTML;
	  pinmap[i].innerHTML = str;
	  }
			
	var kmltitle = document.getElementById("kmltitle");
	if (kmltitle)
	  {
	  var size = viewsize();
	  remove += " #firstHeading ";
	  style += " .kmlmapdisplay { width:"+size+"px !important; height:"+size+"px !important; }";
	  }
	var kmlsummary = document.getElementById("kmlsummary");
	if (kmlsummary)
	  {
	  var size = viewsize();
	  remove += " #firstHeading, #displaysummary, "
	  style += " #mapbox { width:"+size+"px !important; height:"+size+"px !important; }";
	  }
	  
	var title = $(".tableregion td big");
	if (title.length>0)
	  $('#firstHeading').text($(".tableregion td big").text());
	
	$('.tableregion').remove();
	var mapmenu= document.getElementById("mapmenu");
	if (mapmenu)
	{
	  psum = $('a:contains("Printable Summary")')
	  pmap = $('a[href*="/Map?pagename"]');
	  var menu = [];
	  if (kmlsummary)
		{
		menu.push('<a class="button-link" href="'+kmlurl(window.location.href.toString())+'">Open KML</a>');          
		}
	  else 
	  if (psum.length>0)
		{
		$('#mapbox').remove();
		menu.push('<a class="button-link" href="'+psum[0].href+'">View Map</a>');
		menu.push('<a class="button-link" href="'+kmlurl(psum[0].href)+'">Open KML</a>');
		}
	  else
	  if (pmap.length>0)
		{
		$('#kmlmapdisplay').remove();
		elem = $('a:contains("Download KML")')
		if (elem.length>0)
		  {
		  menu.push('<a class="button-link" href="'+pmap[0].href+'">View Map</a>');
		  menu.push('<a class="button-link" href="'+elem[0].href+'">Open KML</a>');
		  }
		}
		
	  mapmenu.innerHTML = menu.join(" ");
	}
  
	// erase  {display:none !important; }
	var removelist = remove.split(",").join(" ").split(" ");
	for (var i=0; i<removelist.length; ++i)
	   if (removelist[i].length>0)
		  $(removelist[i]).remove();
			
	// insert in documentc
	var sheet = document.createElement('style');
	sheet.id = 'androidstyle';
	sheet.innerHTML = style;
	document.body.appendChild(sheet);    
  }





/* WikiEditor Customization */

function loadEditor()
{
}


// Basic Editor
{
var tb = document.getElementById('toolbar');
if (!tb)
	{
	tb = document.createElement("DIV");
	tb.id = "toolbar";
	}
   var first = null;
   var prefix = '_section';
   var list = document.getElementsByTagName('TEXTAREA');
   for (var i=0; i<list.length; ++i)
	  if (!!list[i].name && list[i].name.substr(0,prefix.length)==prefix)
		{
		if (!first) first = list[i];
		list[i].onfocus=function(){ 
		  //tb.style.display = 'block';
		  this.parentNode.insertBefore(tb, this);
		  };
		}
   if (first)
	  first.parentNode.insertBefore(tb, first);       
}

if(window.mw && !!mw){
mw.loader.using("mediawiki.action.edit", function() {
	  
  var tb = document.getElementById('toolbar');
  if (tb) tb.innerHTML = "";

  mw.toolbar.addButton(false,"Bold text","'''","'''","Bold text","mw-editbutton-bold");
  mw.toolbar.addButton(false,"Italic text","''","''","Italic text","mw-editbutton-italic");

  // add custom buttons
	mw.toolbar.addButton( {
		imageFile: 'http://ropewiki.com/images/0/01/BulletlistIcon.png',
		speedTip: 'Bulleted list',
		tagOpen: '* ',
		tagClose: '',
		sampleText: 'Bulleted list item',
		imageId: 'button-bullet'
	} );
	mw.toolbar.addButton( {
		imageFile: 'http://ropewiki.com/images/4/45/Galleryicon1.png',
		speedTip: 'Insert a picture (.jpg .gif .png .pdf)',
		tagOpen: '{{pic|',
		tagClose: '}}',
		sampleText: 'name.jpg ~ caption',
		imageId: 'button-pic1'
	} );
	mw.toolbar.addButton( {
		imageFile: 'http://ropewiki.com/images/d/d4/Galleryiconn.png',
		speedTip: 'Insert a picture gallery (.jpg .gif .png .pdf)',
		tagOpen: '{{pic|',
		tagClose: '}}',
		sampleText: 'pic1.jpg ~ caption1 ; pic2.jpg ~ caption2 ; pic3.jpg ~ caption3',
		imageId: 'button-picn'
	} );
	mw.toolbar.addButton( {
		imageFile: 'http://ropewiki.com/images/c/ca/Galleryiconx.png',
		speedTip: 'Insert a large sketch or document (.pdf .gif .png .jpg)',
		tagOpen: '{{pic|size=X|',
		tagClose: '}}',
		sampleText: 'sketch.pdf ~ caption',
		imageId: 'button-picx'
	} );

  mw.toolbar.addButton(false,"Internal link","[[","]]","Link title","mw-editbutton-link");
  mw.toolbar.addButton(false,"External link (remember http:// prefix)","[","]","http://www.example.com link title","mw-editbutton-extlink");
  mw.toolbar.addButton(false,"Level 2 headline","\n=== "," ===\n","Headline text","mw-editbutton-headline");
  mw.toolbar.addButton(false,"Ignore wiki formatting","\u003Cnowiki\u003E","\u003C/nowiki\u003E","Insert non-formatted text here","mw-editbutton-nowiki");
  mw.toolbar.addButton(false,"Your signature with timestamp","--[[User:BetaRobot2|BetaRobot2]] ([[User talk:BetaRobot2|talk]]) 17:01, 11 June 2016 (EDT)","","","mw-editbutton-signature");
  mw.toolbar.addButton(false,"Horizontal line (use sparingly)","\n----\n","","","mw-editbutton-hr");
// Create button bar
$(function() { mw.toolbar.init(); } );
});
}


/*
jQuery( document ).ready( function ( $ ) {
	  console.log("customizeToolbar1");

	$( '#wpTextbox1' ).wikiEditor( 'addToToolbar', {
		section: 'advanced',
		group: 'format',
		tools: {
			buttonId: {
				label: 'Comment visible only for editors',
				type: 'button',
				icon: '//upload.wikimedia.org/wikipedia/commons/f/f9/Toolbaricon_regular_S_stroke.png',
				action: {
					type: 'encapsulate',
					options: {
						pre: '<!-- ',
						peri: 'Insert comment here',
						post: ' -->'
					}
				}
			}
		}
	} );
} );
*/

var customizeToolbar = function() {
  /* Your code goes here */
	  console.log("customizeToolbar");

	$( '#wpTextbox1' ).wikiEditor( 'addToToolbar', {
		section: 'main',
		group: 'format',
		tools: {
			bullist: {
				label: 'Bulleted list',
				type: 'button',
				icon: 'http://ropewiki.com/images/0/01/BulletlistIcon.png',
				action: {
					type: 'encapsulate',
					options: {
						pre: '* ',
						peri: 'Bulleted list item',
						post: ''
					}
				}
			}
		}
	} );
	$( '#wpTextbox1' ).wikiEditor( 'addToToolbar', {
		section: 'main',
		group: 'format',
		tools: {
			pic1: {
				label: 'Insert a picture (.jpg .gif .png .pdf)',
				type: 'button',
				icon: 'http://ropewiki.com/images/4/45/Galleryicon1.png',
				action: {
					type: 'encapsulate',
					options: {
						pre: '{{pic|',
						peri: 'name.jpg ~ caption',
						post: '}}'
					}
				}
			}
		}
	} );    $( '#wpTextbox1' ).wikiEditor( 'addToToolbar', {
		section: 'main',
		group: 'format',
		tools: {
			picn: {
				label: 'Insert a picture gallery (.jpg .gif .png .pdf)',
				type: 'button',
				icon: 'http://ropewiki.com/images/d/d4/Galleryiconn.png',
				action: {
					type: 'encapsulate',
					options: {
						pre: '{{pic|',
						peri: 'pic1.jpg ~ caption1 ; pic2.jpg ~ caption2 ; pic3.jpg ~ caption3',
						post: '}}'
					}
				}
			}
		}
	} );
	$( '#wpTextbox1' ).wikiEditor( 'addToToolbar', {
		section: 'main',
		group: 'format',
		tools: {
			picx: {
				label: 'Insert a large sketch or document (.pdf .gif .png .jpg)',
				type: 'button',
				icon: 'http://ropewiki.com/images/c/ca/Galleryiconx.png',
				action: {
					type: 'encapsulate',
					options: {
						pre: '{{pic|size=X|',
						peri: 'sketch.pdf ~ caption',
						post: '}}'
					}
				}
			}
		}
	} );
   $( '#wpTextbox1, .wikieditor' ).wikiEditor( 'removeFromToolbar', {
						'section': 'advanced',
						'group': 'insert',
						'tool': 'gallery'
						}
   );
};

/* Check if view is in edit mode and that the required modules are available. Then, customize the toolbar � */
if (typeof mw != "undefined")
 {
 if (!!mw && $.inArray( mw.config.get( 'wgAction' ), [ 'edit', 'submit' ] ) !== -1 ) {
  mw.loader.using( 'user.options', function () {
	// This can be the string "0" if the user disabled the preference ([[phab:T54542#555387]])
	if ( mw.user.options.get( 'usebetatoolbar' ) == 1 ) {
	  $.when(
		mw.loader.using( 'ext.wikiEditor.toolbar' ), $.ready
	  ).then( customizeToolbar );
	}
  } );

 // Add the customizations to LiquidThreads' edit toolbar, if available
 mw.hook( 'ext.lqt.textareaCreated' ).add( customizeToolbar );
 }
 
 //rwuser = mw.config.get( 'wgUserName' ); 
 }




// Facebook Comment Plugin
function loadFacebook()
{
	/*
  window.fbAsyncInit = function() {
	FB.init({
	  appId      : '1561389274156117',
	  xfbml      : true,
	  version    : 'v2.6'
	});
  };

  (function(d, s, id){
	 var js, fjs = d.getElementsByTagName(s)[0];
	 if (d.getElementById(id)) {return;}
	 js = d.createElement(s); js.id = id;
	 js.src = "//connect.facebook.net/en_US/sdk.js";
	 fjs.parentNode.insertBefore(js, fjs);
   }(document, 'script', 'facebook-jssdk'));
*/
}


// Pop-out link support
$(function () {
  var popOuts = document.getElementsByClassName('mw-popout-link');
  var i;
  for (i = 0; i < popOuts.length; i++) {
    var args = popOuts[i].innerText;
    var iSpace = args.indexOf(' ');
    var link = (iSpace < 0) ? args : args.substring(0, iSpace);
    var caption = (iSpace < 0) ? link : args.substring(iSpace+1);
    popOuts[i].innerHTML = '<a href="' + link + '" target="_blank">' + caption + '</a>';
  }
}());
