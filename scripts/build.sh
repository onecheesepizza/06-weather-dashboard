#!/bin/bash
sed -i s/OPENWEATHER_API_KEY_REPLACE/${OPENWEATHER_API_KEY}/g netlify.toml &&
sed -i s/UNSPLASH_API_KEY_REPLACE/${UNSPLASH_API_KEY}/g netlify.toml &&
if [[ -v OPENWEATHER_API_KEY ]]
    echo "OPENWEATHER_API_KEY set"
else
    echo "OPENWEATHER_API_KEY NOT set"
fi
if [[ -v OPENWEATHER_API_KEY ]]
    echo "UNSPLASH_API_KEY set"
else
    echo "UNSPLASH_API_KEY NOT set"
fi
echo "inserted environment variables to netlify.toml"