
function textTranslation(text, pre, post) {
    if (!glist) return text;

    if (!pre) pre = "";
    if (!post) post = "";

    for (var k = 0; k < glist.length; ++k)
        text = text.replace(genlist[k], pre + glist[k] + post);
    return text;
}

function loadTranslation() {
    gtrans = getCookie("googtrans").split('/');
    if (gtrans.length >= 3)
        gtrans = gtrans[2];
    else
        gtrans = null;

    if (gtrans == gtrans2)
        return;

    gtrans2 = gtrans;
    var gtranslist = [
        "en,Introduction,Approach,Descent,Exit,Red tape,Background,Credits,Beta sites,Trip reports and media,Time,Raps,Shuttle,Start,End,Road,Parking,(Upper),(Middle),(Lower)",
        "es,Descripci�n,Aproximaci�n,Descenso,Retorno,Regulaciones,Historia,Cr�ditos,Referencias,Informes del recorrido y fotos,Horario,R�peles,Combinaci�n,Inicio,Final,Carretera,Parking,(Superior),(Intermedio),(Inferior)",
        "pt,Descri��o,Aproxima��o,Descida,Retorno,Regulamentos,Hist�ria,Cr�ditos,Refer�ncias,Relat�rios de viagens e fotos,Tempos,Rapeis,Combina��o,Entrada,Sa�da,Estrada,Parking,(Superior),(Intermedi�rio),(Inferior)",
        "it,Descrizione,Avvicinamento,Discesa,Rientro,Normativa,Storia,Crediti,Siti web,Report di viaggio e foto,Tempi,Calate,Navetta,Entrata,Uscita,Strada,Parking,(Superiore),(Intermedio),(Inferiore)",
        "fr,Description,Approche,Descente,Retour,R�glements,Historique,Cr�dits,Sites internet,Rapports de voyage et photos,Temps,Rappels,Navette,Depart,Arrivee,Route,Parking,(Sup�rieur),(Interm�diaire),(Inf�rieur)",
        "de,Einleitung,Zustieg,Zejscie,R�ckweg,Vorschriften,Hintergrund,Credits,Weblinks,Reiseberichte und fotos,Zeit,Abseilen,Schiffchen,Einleitung,Ausstieg,Strasse,Parking,(H�her),(Intermedi�r),(Untere)",
        "ca,Descripci�,Aproximaci�,Descens,Retorn,Regulacions,Hist�ria,Cr�dits,Refer�ncies,Informes del recorregut i fotos,Horari,R�pels,Combinaci�,Inici,Final,Carretera,Parking,(Superior),(Intermedi),(Inferior)"
    ];

    // translate titles
    glist = null;
    genlist = (gtranslist[0].substr(3) + gtranslist[0].substr(2).toLowerCase()).split(',');
    for (var g = 0; g < gtranslist.length; ++g)
        if (gtranslist[g].substr(0, 2) == gtrans) {
            glist = (gtranslist[g].substr(3) + gtranslist[g].substr(2).toLowerCase()).split(',');
            break;
        }

    var list = document.getElementsByClassName('ctranslate');
    for (var j = 0; j < list.length; j++) {
        var lj = list[j];
        var text = lj.innerHTML;
        // store original
        if (!lj.oinnerHTML)
            lj.oinnerHTML = text;
        else
            text = lj.oinnerHTML;
        // found term
        lj.innerHTML = textTranslation(text, '<span class="notranslate"> ', ' </span>');
    }

    /*
    // propagate to .rw files
    elem = document.getElementsByClassName('uhref');
    for (var i = 0; i < elem.length; i++)
        {
        var href = null, links = elem[i].getElementsByTagName('A');
        if (links!=null && links[0]!=null)
          href = links[0].href;
        if (href)
          {
          var str = href.value;
          href.value = str;
          }
        }
    */

    // Translated links
    var links = document.getElementsByClassName('external');
    for (var j = 0; j < links.length; j++) {
        var rwext = 'ext=.rw';
        var link = links[j];
        if (!link.href)
            continue;
        var url = link.href;
        //if (url.indexOf(SITE_HOSTNAME)>=0 || url.indexOf(LUCA_HOSTNAME)>=0)
        //   continue;
        if (url.indexOf("translate.google.com") < 0 && url.indexOf(rwext) < 0)
            continue;
        var text = link.innerHTML;

        // store original
        if (!link.ohref) {
            link.ohref = url;
            link.oinnerHTML = text;
        } else {
            url = link.ohref;
            text = link.oinnerHTML;
        }

        // .rw links
        if (url.indexOf(rwext) >= 0) {
            link.href = url = rwlink(url, "");
            continue;
        }

        // translated links
        var urlpos = url.indexOf("&u=http");
        if (urlpos < 0)
            continue;
        var ourl = url.substr(urlpos + 3);
        var to = "en";
        var from = "auto";
        var urlpos = url.indexOf("&sl=");
        if (urlpos >= 0) {
            from = url.substr(urlpos + 4, 2);
            if (from == "au")
                from = "auto";
        }

        if (gtrans)
            to = gtrans;
        if (from != to) {
            link.style.display = "inline";
            link.href = 'https://translate.google.com/translate?' + '&hl=' + to + '&sl=' + from + '&tl=' + to + '&u=' + ourl;
        } else {
            link.style.display = "none";
            //link.href = ourl;
        }
    }
}

function rwlink(url, opts) {
    var rwext = 'ext=.rw';

    // apply opts
    var urlopts = urlcheckbox;
    var olist = opts.split("&");
    for (var i = 0; i < olist.length; ++i) {
        var idval = olist[i].split("=");
        if (idval.length != 2) continue;
        urlopts = setparam(urlopts, idval[0], idval[1]);
    }

    if (metric)
        url = url.replace(rwext, 'metric=on&' + rwext);
    if (french)
        url = url.replace(rwext, 'french=on&' + rwext);
    if (gtrans)
        url = url.replace(rwext, 'gtrans=' + gtrans + '&' + rwext);
    if (urlopts)
        url = url.replace('&' + rwext, urlopts + '&' + rwext);
    if (urlopts.indexOf('smallscreen=on') < 0)
        url = url.replace(rwext, 'docwidth=' + $(window).width() + '&' + rwext);
    
    return url;
}

// tranlsate callback
function googleTranslateElementInit() {
    var hdr = document.getElementById('firstHeading');
    if (hdr) {
        // small screen
        var div = document.createElement('div')
        div.className = 'noprint';
        div.style.cssText = 'float:right';
        div.id = 'google_translate_flags';
        div.innerHTML = '<table class="noprint"><tr><td><img src="' + SITE_BASE_URL + '/images/c/c9/FlagIcon.png"/></td><td id="google_translate_element"></td></tr></table>';
        //hdr.parentNode.insertBefore(div, hdr);
        hdr.insertBefore(div, hdr.firstChild);

        //new google.translate.TranslateElement({pageLanguage: 'en', layout: google.translate.TranslateElement.InlineLayout.SIMPLE, multilanguagePage: true}, 'google_translate_element');
        //new google.translate.TranslateElement({pageLanguage: 'en', layout: google.translate.TranslateElement.InlineLayout.SIMPLE, multilanguagePage: true, gaTrack: true, gaId: 'UA-78683801-1', autoDisplay: false},
        new google.translate.TranslateElement({
            pageLanguage: 'en',
            multilanguagePage: true,
            gaTrack: true,
            gaId: 'UA-78683801-1'
        }, 'google_translate_element');
    }
}
