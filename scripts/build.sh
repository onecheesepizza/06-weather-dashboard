#!/bin/bash
sed -i s/OPENWEATHER_API_KEY_REPLACE/${process.env.OPENWEATHER_API_KEY}/g ./netlify.toml &&
sed -i s/UNSPLASH_API_KEY_REPLACE/${process.env.UNSPLASH_API_KEY}/g ./netlify.toml