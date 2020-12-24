
//inline weather
function loadInlineWeather() {
    var coords = "";
    var kmlmarker = document.getElementById('kmlmarker');
    if (kmlmarker)
        coords = kmlmarker.innerHTML.toString().split(',').map(function (item) { return item.trim(); });

    var weatherdiv = document.getElementById('weatherdiv');
    if (coords.length >= 2 && weatherdiv && weather) {

        //May2018 WUnderground API was shutdown
        //Aug2020 DarkSky API was shutdown (purchased by Apple)
        //so use OpenWeather (limit with free account 60 calls/minute)

        var url = "http://api.openweathermap.org/data/2.5/onecall?lat=" + coords[0] + "&lon=" + coords[1] + "&exclude=current,minutely,hourly&appid=" + OPENWEATHER_APIKEY;

        $.getJSON(geturl(url),
            function (data) {
                // dailyforecast
                if (data &&
                    data.daily &&
                    data.daily.length > 0) {
                    weatherdiv.classList.add('wst');

                    var link;
                    var a = weatherdiv.getElementsByTagName('A');
                    if (a && a.length > 0 && a[0].href)
                        link = a[0].href;

                    var periods = data.daily;
                    var w = '<div class="wstheader noprint">';

                    w += '<span class="notranslate">';

                    var e = periods.length - 1;
                    var startDate = new Date(periods[0].dt * 1000);
                    var endDate = new Date(periods[e].dt * 1000);

                    w += startDate.getDate() + '-' + endDate.getDate() + ' ' + months[endDate.getMonth()];

                    if (link) w += '&nbsp;&nbsp;<a rel="nofollow" class="external text" href="' + link + '"><img alt="Wforecast.png" src="/images/d/d5/Wforecast.png" width="13" height="22"> Extended forecast</a>';

                    w += '<span class="wstheader units" style="float:right;">' + (metric ? "&#176;C" : "&#7506;F") + '</span>';

                    w += '</span>';

                    w += '</div>';

                    w += '<table class="wikitable wst bst notranslate">';

                    w += '<img class="wstlogo" src="http://ropewiki.com/images/f/f2/OpenWeatherLogo.png"/>';

                    for (var i = 0; i < periods.length; ++i) {
                        var date = new Date(periods[i].dt * 1000);
                        w += '<th class="wstheader ' + isWeekend(date.getDay()) + '">' + days[date.getDay()] + '<br></th>';
                    }

                    w += '<tr>';

                    for (var i = 0; i < periods.length; ++i) {
                        var h = metric
                            ? convertKelvinToCelsius(periods[i].temp.max).toFixed(0)
                            : convertKelvinToFahrenheit(periods[i].temp.max).toFixed(0);

                        var l = metric
                            ? convertKelvinToCelsius(periods[i].temp.min).toFixed(0)
                            : convertKelvinToFahrenheit(periods[i].temp.min).toFixed(0);

                        var date = new Date(periods[i].dt * 1000);

                        w += '<td title="' + date.getDate() + ' ' + months[date.getMonth()] + ' : &quot;' + periods[i].weather[0].description + '&quot; Max ' + h + (metric ? 'C' : 'F') + ' Min ' + l + (metric ? 'C' : 'F') + '">';
                        var weatherIconSize = periods[i].weather[0].icon === "01d" ? "30" : "40"; //if it's the sun, shrink the size down a little more 
                        w += '<div class="weatherimg" style="background-image: url(&#39;http://openweathermap.org/img/wn/' + periods[i].weather[0].icon + '.png&#39;);  background-size: ' + weatherIconSize + 'px ' + weatherIconSize + 'px;"/></div>';
                        w += '<div class="weatherh">' + h + '</div>';
                        w += '<div class="weatherl">' + l + '</div>';
                        w += '</td>';
                    }

                    w += '</tr>';

                    // alerts
                    if (data.alerts && data.alerts.length > 0) {
                        w += '<tr><td colspan="' + periods.length + '" style="padding:0;">';
                        var list = [];
                        for (var i = 0; i < data.alerts.length; ++i)
                            list.push(data.alerts[i].description + '!');
                        if (link) w += '<a href="' + link + '">';
                        w += '<div class="weatheralert rwwarningbox">' + list.join('<br>') + '</div>';
                        if (link) w += '</a>';
                        w += '</td></tr>';
                    }
                    w += '</table>';

                    weatherdiv.innerHTML = w;
                }
            });
    } else {
        if (weatherdiv) {
            weatherdiv.innerHTML =
                '<a rel="nofollow" class="external text" href="http://ropewiki.com/Weather?location=Lomatium+%26+Krill+Loop"><img alt="Wforecast.png" src="/images/d/d5/Wforecast.png" width="13" height="22"> Weather forecast</a>';
        }
    }
}

function convertKelvinToCelsius(kelvin) {
    return kelvin - 273.15;
}

function convertKelvinToFahrenheit(kelvin) {
    return (kelvin - 273.15) * 9 / 5 + 32;
}

function isWeekend(dayOfWeek) {
    return (dayOfWeek === 0 || dayOfWeek === 6)
        ? "weekend"
        : "";
}