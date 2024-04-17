// @ts-check

//import { SITE_BASE_URL } from "../constants";

// Placemarker icons "StarnXY.png" based on quality X and category Y.
// Quality 0 is black & white (unknown) then 1-5 is ascending quality.
// Categories are {hiking=0, rappelling=1, caving=2, climbing=3, blank=4, star=5}
var KML_ICON_LIST = [  //not a const because it is assigned to by Waterflow analysis page
    SITE_BASE_URL + "/images/7/75/Starn00.png",
    SITE_BASE_URL + "/images/8/87/Starn10.png",
    SITE_BASE_URL + "/images/1/15/Starn20.png",
    SITE_BASE_URL + "/images/d/d3/Starn30.png",
    SITE_BASE_URL + "/images/a/a0/Starn40.png",
    SITE_BASE_URL + "/images/c/cc/Starn50.png",
    SITE_BASE_URL + "/images/b/b6/Starn01.png",
    SITE_BASE_URL + "/images/1/12/Starn11.png",
    SITE_BASE_URL + "/images/b/b7/Starn21.png",
    SITE_BASE_URL + "/images/2/2e/Starn31.png",
    SITE_BASE_URL + "/images/1/1d/Starn41.png",
    SITE_BASE_URL + "/images/f/fe/Starn51.png",
    SITE_BASE_URL + "/images/3/3a/Starn02.png",
    SITE_BASE_URL + "/images/a/a4/Starn12.png",
    SITE_BASE_URL + "/images/1/13/Starn22.png",
    SITE_BASE_URL + "/images/3/32/Starn32.png",
    SITE_BASE_URL + "/images/7/77/Starn42.png",
    SITE_BASE_URL + "/images/1/11/Starn52.png",
    SITE_BASE_URL + "/images/b/bd/Starn03.png",
    SITE_BASE_URL + "/images/0/09/Starn13.png",
    SITE_BASE_URL + "/images/9/98/Starn23.png",
    SITE_BASE_URL + "/images/0/07/Starn33.png",
    SITE_BASE_URL + "/images/f/fb/Starn43.png",
    SITE_BASE_URL + "/images/d/dc/Starn53.png",
    SITE_BASE_URL + "/images/2/25/Starn04.png",
    SITE_BASE_URL + "/images/7/73/Starn14.png",
    SITE_BASE_URL + "/images/e/ea/Starn24.png",
    SITE_BASE_URL + "/images/6/6a/Starn34.png",
    SITE_BASE_URL + "/images/3/31/Starn44.png",
    SITE_BASE_URL + "/images/2/27/Starn54.png",
    SITE_BASE_URL + "/images/2/29/Starn05.png",
    SITE_BASE_URL + "/images/d/d9/Starn15.png",
    SITE_BASE_URL + "/images/e/e0/Starn25.png",
    SITE_BASE_URL + "/images/0/09/Starn35.png",
    SITE_BASE_URL + "/images/8/81/Starn45.png",
    SITE_BASE_URL + "/images/3/37/Starn55.png"
];

var STARLIST = [
    SITE_BASE_URL + "/images/9/9d/GoldStar0.png",
    SITE_BASE_URL + "/images/8/86/GoldStar1.png",
    SITE_BASE_URL + "/images/f/fd/GoldStar2.png",
    SITE_BASE_URL + "/images/8/8d/GoldStar3.png",
    SITE_BASE_URL + "/images/4/41/GoldStar4.png"
];

const PINMAP_ICON = SITE_BASE_URL + "/images/8/86/PinMap.png";
const MARKER_MOUSEOVER_HIGHLIGHT = SITE_BASE_URL + "/images/3/39/Starn_b.png"; //blue outline
const MARKER_USERLIST_HIGHLIGHT = SITE_BASE_URL + "/images/e/e6/Starn_y.png"; //yellow outline
const MARKER_USERRATED_HIGHLIGHT = SITE_BASE_URL + "/images/8/87/Starn_g.png"; //green outline

const WEATHER_MINI_ICON = SITE_BASE_URL + "/images/d/d5/Wforecast.png";
const OPENWEATHER_LOGO = SITE_BASE_URL + "/images/f/f2/OpenWeatherLogo.png";

const ICON_CLOSED = SITE_BASE_URL + "/images/f/f8/Permit-closed.png";
const ICON_RESTRICTED = SITE_BASE_URL + "/images/1/11/Permit-restricted.png";
const ICON_PERMIT_YES = SITE_BASE_URL + "/images/2/29/Permit-yes.png";

const SORT_ICON = SITE_BASE_URL + "/images/2/2c/Sorticon.png";
const SORT_ICON_UP = SITE_BASE_URL + "/images/4/4b/Sorticonup.png";
const SORT_ICON_DOWN = SITE_BASE_URL + "/images/8/87/Sorticondown.png";

const INSTAGRAM_ICON = SITE_BASE_URL + "/images/c/c0/InstaIcon.png";
const FACEBOOK_ICON = SITE_BASE_URL + "/images/0/03/FacebIcon.png";
const FLICKR_ICON = SITE_BASE_URL + "/images/f/f7/FlickIcon.png";
const PANORAMIO_ICON = SITE_BASE_URL + "/images/a/a4/PanorIcon.png";

const MULTI_FLAG_ICON = SITE_BASE_URL + "/images/c/c9/FlagIcon.png";

const BULLET_LIST_ICON = SITE_BASE_URL + "/images/0/01/BulletlistIcon.png";
const PHOTO_GALLERY_ICON = SITE_BASE_URL + "/images/4/45/Galleryicon1.png";
const PHOTO_GALLERY_ICON2 = SITE_BASE_URL + "/images/c/ca/Galleryiconx.png";
const MULTIPHOTO_GALLERY_ICON = SITE_BASE_URL + "/images/d/d4/Galleryiconn.png";

const CURRENT_POSITION_ICON = SITE_BASE_URL + "/images/3/33/Current_position.png";
