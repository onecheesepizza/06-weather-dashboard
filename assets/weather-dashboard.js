// set global vars
let apiKey = "";
let debugLog = false;
let city = "";

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
        apiKey = urlParams.get('key');
    }
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
    let queryURL = "http://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial" + "&APPID=" + apiKey;
    //Current Conditions AJAX request and response
    $.ajax({
        url: queryURL,
        method: "GET"
        //if a successful response for the provided city is received    
    }).done(function (response) {
        //save city to localStorage
        saveCity(city);
        //re-render cities list
        renderCities();
        //get the five day forecast for the found city
        getFiveDayForecast(event);
        //build html
        let currentWeatherHTML = `
            <h1 id="cityName">${response.name}</h1>
            <h2>Current Conditions</h2>
            <ul>
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
        let uvQueryURL = "api.openweathermap.org/data/2.5/uvi?lat=" + latitude + "&lon=" + longitude + "&APPID=" + apiKey;
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
    var queryURL = "http://api.openweathermap.org/data/2.5/forecast?q=" + city + "&units=imperial" + "&APPID=" + apiKey;
    // ajax request and response
    $.ajax({
        url: queryURL,
        method: "GET"
    }).done(function (response) {
        // build forecast html template
        let fiveDayForecastHTML = `
        <h2>5-Day Forecast</h2>
        <ul id="fiveDayForecastUl">`
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
                <li>${thisMoment.format("YYYY-MM-DD HH:mm Z")}</li>
                <li class="weather-icon"><img src="${iconURL}"></li>
                <li>Temp: ${dayData.main.temp}&#8457;</li>
                <li>Humidity: ${dayData.main.humidity}%</li>
                <br>`;
            }
        };
        // build html template
        fiveDayForecastHTML += `</ul>`;
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
    //clear results
    $('#city-results').empty();
    //get cities from storage and append to page
    for (let i = 0; i < localStorage.length; i++) {
        let city = localStorage.getItem("cities" + i);
        //create button for city
        let cityEl = `<li><button type=button>${city}</button></li>`
        //append to page
        $('#city-results').prepend(cityEl);
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
        //get and render current conditions (calls getFiveDayForecast if successful)
        getCurrentConditions(event);
    });
    // past city search buttons
    $('#city-results').on("click", function (event) {
        //override default button behavior
        event.preventDefault();
        //set search input value to button value
        $('#search-city').val(event.target.textContent);
        //get and render current conditions (calls getFiveDayForecast if successful)
        getCurrentConditions(event);
    });
}

// main app
function mainApp() {
    getURLParams();
    consoleMessage();
    getCurrentConditions(event);
    createEventListeners();
    renderCities();
}

mainApp();