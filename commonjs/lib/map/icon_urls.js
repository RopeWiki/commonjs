// @ts-check

//import { SITE_BASE_URL } from "../constants";

// Placemarker icons "StarnXY.png" based on quality X and category Y.
// Quality 0 is black & white (unknown) then 1-5 is ascending quality.
// Categories are {hiking=0, rappelling=1, caving=2, climbing=3, blank=4, star=5}
const KML_ICON_LIST = [
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

const ICON_CLOSED = SITE_BASE_URL + "/images/f/f8/Permit-closed.png";
const ICON_RESTRICTED = SITE_BASE_URL + "/images/1/11/Permit-restricted.png";
const ICON_PERMIT_YES = SITE_BASE_URL + "/images/2/29/Permit-yes.png";

const SORT_ICON = SITE_BASE_URL + "/images/2/2c/Sorticon.png";
const SORT_ICON_UP = SITE_BASE_URL + "/images/4/4b/Sorticonup.png";
const SORT_ICON_DOWN = SITE_BASE_URL + "/images/8/87/Sorticondown.png";
