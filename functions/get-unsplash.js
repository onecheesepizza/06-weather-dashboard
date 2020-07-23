require('dotenv').config();
const axios = require('axios');

exports.handler = async (event, context) => {
    const { query } = event.queryStringParameters;
    let queryURL="https://api.unsplash.com/search/photos?client_id="+process.env.UNSPLASH_API_KEY+"&query="+query;
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