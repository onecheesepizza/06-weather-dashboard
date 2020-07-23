const axios = require('axios');

exports.handler = async (event, context) => {
    const { city } = event.queryStringParameters;
    const queryURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&units=imperial" + "&APPID=" + process.env.OPENWEATHER_API_KEY;
    return axios
        .get(queryURL)
        .then( res => {
            return ({
            statusCode:200 , 
            body: JSON.stringify(res.data)
        })})
        .catch( err => ({ 
            statusCode: 500, 
            body: err.toString() 
        }));
}