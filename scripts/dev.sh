#!/bin/bash
#revert netlify.toml to original after netlify dev closes
function cleanup {
    cp netlify-copy.toml netlify.toml &&
    echo " reverted netlify.toml"
}
trap cleanup EXIT

#make copy of netlify.toml to revert to later
cp netlify.toml netlify-copy.toml &&
#set local environment variables from .env file
set -a && source .env && set +a &&
#insert environment variables in to netlify.toml
sed -i '' s/OPENWEATHER_API_KEY_REPLACE/${OPENWEATHER_API_KEY}/g netlify.toml &&
sed -i '' s/UNSPLASH_API_KEY_REPLACE/${UNSPLASH_API_KEY}/g netlify.toml &&
echo "added .env to netlify.toml"
netlify dev