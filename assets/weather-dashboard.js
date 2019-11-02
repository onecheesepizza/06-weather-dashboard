// set global vars
let openWeatherMapsAPIKey = "22aab04f38cba604b811ed53606af177";
let debugLog = false;
let currentCity = "";
let lastCity = "";

// developer console message
function consoleMessage() {
    let consoleMessage = `
    Developed by Brian Moore 🍕
    https://github.com/onecheesepizza/06-weather-dashboard
    `
    console.log(consoleMessage);
}

// get URL parameters
function getURLParams() {
    // get URL parameters
    let urlParams = new URLSearchParams(window.location.search);
    // check url for API key and set variable
    if (urlParams.has('key')) {
     openWeatherMapsAPIKey = urlParams.get('key');
    }
}

// get image of current city from the Unsplash API
function getBackgroundImage(){
    //construct query URL
    let unsplashKey="987d734859d674c4e4bc348d9bfe340d223694e86fe506b35997a51671897953"
    let bgQuery="https://api.unsplash.com/search/photos?client_id="+unsplashKey+"&query="+currentCity;
    //photo search AJAX call
    $.ajax({
        url: bgQuery,
        method: "GET"
    }).done(function (response) {
        //get first image from response
        let bgImage = response.results[0].urls.full;
        //get artist credit from response
        let artistCredit = "Photo by "+response.results[0].user.name;
        //set header background and artist credit
        $('#header').attr("style", `background-image: url(${bgImage})`);
        $('#artist-credit').text(artistCredit);
    });
}

// get and render current conditions on openweathermaps API
function getCurrentConditions(event) {
    // event.preventDefault;
    //get city name from user input
    let city = $('#search-city').val();
    //init coordinate vars
    let longitude;
    let latitude;
    // constructing a queryURL
    let queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial" + "&APPID=" + openWeatherMapsAPIKey;
    //Current Conditions AJAX request and response
    $.ajax({
        url: queryURL,
        method: "GET"
        //if a successful response for the provided city is received    
    }).done(function (response) {
        //re-render cities list
        renderCities();
        //get the five day forecast for the found city
        getFiveDayForecast(event);
        //build html
        let currentWeatherHTML = `
            <h1 id="cityName">${response.name}</h1>
            <h2>Current Conditions</h2>
            <ul class="list-unstyled">
                <li>Temperature: ${response.main.temp}&#8457;</li>
                <li>Humidity: ${response.main.humidity}%</li>
                <li>Wind Speed: ${response.wind.speed} mph</li>
                <li id="uvIndex">Mid-day UV Index:</li>
            </ul>`;
        //append to DOM
        $('#current-weather').html(currentWeatherHTML);
        //get longitude and latitude for UV index call
        latitude = response.coord.lat;
        longitude = response.coord.lon;
        // UV index AJAX request and response
        // constructing a url for the UV API
        let uvQueryURL = "api.openweathermap.org/data/2.5/uvi?lat=" + latitude + "&lon=" + longitude + "&APPID=" + openWeatherMapsAPIKey;
        //CORS error fix. alternate solution needed. 
        uvQueryURL = "https://cors-anywhere.herokuapp.com/" + uvQueryURL;
        //ajax request and response
        $.ajax({
            url: uvQueryURL,
            method: "GET"
        }).done(function (response) {
            //get UV Index from response
            uvIndex = response.value;
            //add UV Index to current weather
            $('#uvIndex').text("Mid-day UV Index: " + uvIndex)
        });
    })
        //if the API fails, probably due to the city not being found
        .fail(function () {
            console.log("Current Weather API Error");
        });
}

// get and render five day forecast
function getFiveDayForecast(event) {
    // event.preventDefault;
    let city = $('#search-city').val();
    // constructing a queryURL variable we will use instead of the literal string inside of the ajax method
    var queryURL = "http://api.openweathermap.org/data/2.5/forecast?q=" + city + "&units=imperial" + "&APPID=" + openWeatherMapsAPIKey;
    // ajax request and response
    $.ajax({
        url: queryURL,
        method: "GET"
    }).done(function (response) {
        // build forecast html template
        let fiveDayForecastHTML = `
        <h2>5-Day Forecast</h2>
        <div id="fiveDayForecastUl" class="d-inline-flex flex-wrap ">`
        // loop over 5 day forecast response and build html template
        for (let i = 0; i < response.list.length; i++) {
            // get data for day from response
            let dayData = response.list[i];
            // Unix Time UTC
            let dayTimeUTC = dayData.dt;
            // UTC Timezone Offset 
            let timeZoneOffset = response.city.timezone; // seconds
            let timeZoneOffsetHours = timeZoneOffset / 60 / 60; // hours
            //moment.js moment
            let thisMoment = moment.unix(dayTimeUTC).utc().utcOffset(timeZoneOffsetHours);
            // create URL string for weather icon
            let iconURL = "http://openweathermap.org/img/w/" + dayData.weather[0].icon + ".png";
            // only display mid-day forecasts, skip other hours. 
            if (thisMoment.format("HH:mm:ss") === "11:00:00" || thisMoment.format("HH:mm:ss") === "12:00:00" || thisMoment.format("HH:mm:ss") === "13:00:00") {
                // build html template with forecast data
                fiveDayForecastHTML += `
                <div class="weather-card card m-2 p0">
                <ul class="list-unstyled p-3">
                <li>${thisMoment.format("MM/DD/YY")}</li>
                <li class="weather-icon"><img src="${iconURL}"></li>
                <li>Temp: ${dayData.main.temp}&#8457;</li>
                <li>Humidity: ${dayData.main.humidity}%</li>
                </ul>
                </div>
                <br>`;
            }
        };
        // build html template
        fiveDayForecastHTML += `</div>`;
        // append to DOM
        $('#five-day-forecast').html(fiveDayForecastHTML);
    })
        // API call fail
        .fail(function () {
            console.log("Forecast API Error");
        });
}

// save city to localStorage
function saveCity(newCity) {
    let cityExists = false;
    // check if city exists in localStorage
    for (let i = 0; i < localStorage.length; i++) {
        if (localStorage["cities" + i] === newCity) {
            cityExists = true;
            break;
        }
    }
    // save city to localStorage only if it does not exist already
    if (cityExists === false) {
        localStorage.setItem('cities' + localStorage.length, newCity);
    }
}

// render list of searched cities from localStorage
function renderCities() {
    //build key of last city written to localStorage
    let lastCityKey="cities"+(localStorage.length-1);
    //get last city from local Storage
    lastCity=localStorage.getItem(lastCityKey);
    //set search input value to last city
    $('#search-city').attr("value", lastCity);
    //clear results
    $('#city-results').empty();
    //get cities from storage and append to page
    for (let i = 0; i < localStorage.length; i++) {
        let city = localStorage.getItem("cities" + i);
        //create button for city
        let cityEl;
        //if city is currentCity, set button class to active
        if (city===currentCity){
        cityEl = `<button type="button" class="list-group-item list-group-item-action active">${city}</button></li>`
        } else {
        cityEl = `<button type="button" class="list-group-item list-group-item-action">${city}</button></li>`
        }
        //append to page
        $('#city-results').prepend(cityEl);
    }
    //add clear button if there are cities
    if (localStorage.length>0){
        $('#clear-storage').html($('<a id="clear-storage" href="#">clear</a>'));
    } else {
        $('#clear-storage').html('');
    }
}

// event listeners
function createEventListeners() {
    // new city search button
    $('#search-button').on("click", function (event) {
        //override submit button behavior
        event.preventDefault();
        //set city to user input
        let city = $('#search-city').val()
        //set current city
        currentCity = $('#search-city').val()
        //save city to localStorage
        saveCity(city);
        //get and render current conditions (calls getFiveDayForecast if successful)
        getCurrentConditions(event);
        getBackgroundImage();
    });
    // past city search buttons
    $('#city-results').on("click", function (event) {
        //override default button behavior
        event.preventDefault();
        //set search input value to button value
        $('#search-city').val(event.target.textContent);
        //set current city
        currentCity=$('#search-city').val();
        //get and render current conditions (calls getFiveDayForecast if successful)
        getCurrentConditions(event);
        getBackgroundImage();
    });
    // clear past city buttons from localStorage
    $("#clear-storage").on("click", function(event){
        //clear localStorage
        localStorage.clear();
        //render cities to clear them
        renderCities();
    });
}

// main app
function mainApp() {
    consoleMessage();
    getURLParams();
    currentCity=$('#search-city').val();
    getBackgroundImage();
    renderCities();
    getCurrentConditions();
    createEventListeners();
}

mainApp();