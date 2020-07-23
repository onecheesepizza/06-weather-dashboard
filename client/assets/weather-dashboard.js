// set global vars
let currentCity = "";
let lastCity = "";

// developer console message
function consoleMessage() {
    let consoleMessage = `
    Developed by Brian Moore 🍕
    https://onecheesepizza.dev
    https://github.com/onecheesepizza/06-weather-dashboard
    `
    console.log(consoleMessage);
}

// get image of current city from the Unsplash API
function getBackgroundImage(){
    //construct query URL
    let bgQuery="/api/get-unsplash/?query="+currentCity;
    //photo search AJAX call
    $.ajax({
        url: bgQuery,
        method: "POST"
    }).done(function (response) {
        //parse response
        response = JSON.parse(response);
        if (response.total>0){
            //get first image from response
            let bgImage = response.results[0].urls.regular;
            //get artist credit from response
            let artistCredit = `Photo by <a href="${response.results[0].user.links.html}">${response.results[0].user.name}</a> on <a href="https://unsplash.com">Unsplash</a>`;
            //set header background and artist credit
            $('#header').attr("style", `background-image: url(${bgImage})`);
            $('#artist-credit').html(artistCredit);
        } else {
            //fallback bg image for empty results
            console.log("No Unsplash Image Results");
            $('#header').attr("style", `background-image: url("https://images.unsplash.com/photo-1530908295418-a12e326966ba?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjk5MjM4fQ")`);
            $('#artist-credit').html(`Photo by <a href="https://unsplash.com/@kenrickmills">Kenrick Mills</a> on <a href="https://unsplash.com">Unsplash</a>`);
        }
        
    }).fail(function(response){
        //fallback bg image for failed calls
        console.log("Unsplash API Error: rate limit likely exceeded.");
        $('#header').attr("style", `background-image: url("https://images.unsplash.com/photo-1530908295418-a12e326966ba?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjk5MjM4fQ")`);
        $('#artist-credit').html(`Photo by <a href="https://unsplash.com/@kenrickmills">Kenrick Mills</a> on <a href="https://unsplash.com">Unsplash</a>`);
    });
}

// get and render current conditions on openweathermaps API
function getCurrentConditions(event) {
    //get city name from user input
    let city = $('#search-city').val();
    currentCity= $('#search-city').val();
    //init coordinate vars
    let longitude;
    let latitude;
    // constructing a queryURL
    let queryURL = "/api/current-conditions?city="+currentCity;
    //Current Conditions AJAX request and response
    $.ajax({
        url: queryURL,
        method: "POST"
        //if a successful response for the provided city is received    
    }).done(function (response) {
        //parse response
        response = JSON.parse(response);
        //save city to localStorage
        saveCity(city);
        $('#search-error').text("");
        //create icon URL for current weather
        currentWeatherIcon="https://openweathermap.org/img/w/"+response.weather[0].icon+".png";
        // Unix Time UTC for response
        let currentTimeUTC = response.dt;
        // UTC Timezone Offset 
        let currentTimeZoneOffset = response.timezone; // seconds
        let currentTimeZoneOffsetHours = currentTimeZoneOffset / 60 / 60; // hours
        // moment.js object for response time
        let currentMoment = moment.unix(currentTimeUTC).utc().utcOffset(currentTimeZoneOffsetHours);
        //re-render cities list
        renderCities();
        //get bg image
        getBackgroundImage();
        //get the five day forecast for the found city
        getFiveDayForecast(event);
        //set header
        $('#header-text').text(response.name);
        //build html
        let currentWeatherHTML = `
            <h3>Current Conditions<img src="${currentWeatherIcon}"></h3>
            <h6>${currentMoment.format("MM/DD/YY h:mma")} local time</h6>
            <br>
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
        // --- UV index AJAX request and response
        // constructing a url for the UV API
        const uvQueryURL = "/api/uvi/"+"?lat="+latitude+"&lon="+longitude;
        //ajax request and response
        $.ajax({
            url: uvQueryURL,
            method: "POST"
        }).done(function (response) {
            //parse response
            response = JSON.parse(response);
            //get UV Index from response
            uvIndex = response.value;
            //add UV Index to current weather
            $('#uvIndex').html(`Mid-day UV Index: <span id="uvVal"> ${uvIndex}</span>`);
            //add background color to UV Index
            if (uvIndex>=0 && uvIndex<3){
                $('#uvVal').attr("class", "uv-green");
            } else if (uvIndex>=3 && uvIndex<6){
                $('#uvVal').attr("class", "uv-yellow");
            } else if (uvIndex>=6 && uvIndex<8){
                $('#uvVal').attr("class", "uv-orange");
            } else if (uvIndex>=8 && uvIndex<11){
                $('#uvVal').attr("class", "uv-red");
            } else if (uvIndex>=11){
                $('#uvVal').attr("class", "uv-violet");
            }
        });
    })
        //if the API fails, probably due to the city not being found
        .fail(function () {
            console.log("Current Weather API Error: city likely not found.");
            $('#search-error').text("City not found.");
        });
}

// get and render five day forecast
function getFiveDayForecast(event) {
    // event.preventDefault;
    let city = $('#search-city').val();
    // constructing a queryURL variable we will use instead of the literal string inside of the ajax method
    var queryURL = "/api/five-day/"+"?city="+city;
    // ajax request and response
    $.ajax({
        url: queryURL,
        method: "POST"
    }).done(function (response) {
        // parse response
        response = JSON.parse(response);
        // build forecast html template
        let fiveDayForecastHTML = `
        <h2>5-Day Forecast</h2>
        <div id="fiveDayForecastUl" class="d-inline-flex flex-wrap ">`;
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
            let iconURL = "https://openweathermap.org/img/w/" + dayData.weather[0].icon + ".png";
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
    //clear results
    $('#city-results').empty();
    //cases if localStorage is empty
    if (localStorage.length===0){
        if (lastCity){
            $('#search-city').attr("value", lastCity);
        } else {
            $('#search-city').attr("value", "Los Angeles");
        }
    } else {
        //build key of last city written to localStorage
        let lastCityKey="cities"+(localStorage.length-1);
        //get last city from local Storage
        lastCity=localStorage.getItem(lastCityKey);
        //set search input value to last city
        $('#search-city').attr("value", lastCity);
        //get cities from storage and append to page
        for (let i = 0; i < localStorage.length; i++) {
            let city = localStorage.getItem("cities" + i);
            //create button for city
            let cityEl;
            //check if currentCity is already set, set to lastCity if not
            if (currentCity===""){
                currentCity=lastCity;
            }
            //if stored city is currentCity, set button class to active
            if (city === currentCity) {
                cityEl = `<button type="button" class="list-group-item list-group-item-action active">${city}</button></li>`;
            } else {
                cityEl = `<button type="button" class="list-group-item list-group-item-action">${city}</button></li>`;
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
    
}

// event listeners
function createEventListeners() {
    // new city search button
    $('#search-button').on("click", function (event) {
        //override submit button behavior
        event.preventDefault();
        //set city to user input
        currentCity = $('#search-city').val();
        //set current city
        currentCity = $('#search-city').val();
        //get and render current conditions (calls saveCity and getFiveDayForecast if successful)
        getCurrentConditions(event);
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
    renderCities();
    getCurrentConditions();
    createEventListeners();
}

mainApp();