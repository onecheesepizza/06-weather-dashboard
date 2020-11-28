# 06-weather-dashboard
## Unit 06 Server-Side APIs Homework: Weather Dashboard

A responsive and dynamic weather dashboard built with HTML, CSS, Javascript, Bootstrap, jQuery, Moment.js, and the browser's localStorage.

Data from OpenWeather API & Unsplash API proxied via [Netlify Redirects](https://docs.netlify.com/routing/redirects/).

![HTML5](https://img.shields.io/badge/HTML5-orange)
![CSS](https://img.shields.io/badge/CSS-blue)
![Javascript](https://img.shields.io/badge/Javascript-yellow)
![Bootstrap](https://img.shields.io/badge/Bootstrap-purple)
[![jQuery](https://img.shields.io/badge/jQuery-blue)](https://jquery.com/)
[![Moment.js](https://img.shields.io/badge/Moment.js-green)](https://momentjs.com/)
[![OpenWeather API](https://img.shields.io/badge/OpenWeather%20API-orange)](https://openweathermap.org/api)
[![Unsplash API](https://img.shields.io/badge/Unsplash%20API-black)](https://unsplash.com/documentation)
[![Netlify](https://img.shields.io/badge/Netlify-blue)](https://www.netlify.com/)

Live Site: [https://znode-weather-dash.netlify.app](https://znode-weather-dash.netlify.app) 

Deployed to [Netlify](https://www.netlify.com/)  
[![Netlify Status](https://api.netlify.com/api/v1/badges/65770d23-e1a6-4f20-aa22-0d96851ec85f/deploy-status)](https://app.netlify.com/sites/ocp-weather-dash/deploys)

If the searched city is found on the OpenWeather current weather API endpoint, the 5 day forecast and UV index API endpoints are called, the city is saved to localStorage, and all the data is rendered to the page. Additionally, an image related to the city's name is returned from the Unsplash API and applied to the header background.

![Screenshot](client/assets/06-weather-dashboard.png)
