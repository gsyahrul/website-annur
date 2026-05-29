#!/bin/sh

# If node_modules is empty (named volume override), reinstall
if [ ! -d "/app/node_modules/express" ]; then
  echo "📦 node_modules not found, installing dependencies..."
  npm install --include=dev
fi

# Start the app with nodemon
exec npx nodemon index.js
