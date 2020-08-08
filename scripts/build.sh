#!/bin/bash
sed -i '' s/OPENWEATHER_API_KEY/${OPENWEATHER_API_KEY}/g netlify.toml &&
sed -i '' s/UNSPLASH_API_KEY/${UNSPLASH_API_KEY}/g netlify.toml