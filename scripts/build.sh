#!/bin/bash
sed -i "s|OPENWEATHER_API_KEY_REPLACE|${OPENWEATHER_API_KEY}|" netlify.toml &&
sed -i "s|UNSPLASH_API_KEY_REPLACE|${UNSPLASH_API_KEY}|" netlify.toml
echo "inserted environment variables to netlify.toml"