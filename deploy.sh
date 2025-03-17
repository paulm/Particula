#!/bin/bash
# Deployment script for Particula

# Create an archive of the current version
echo "Creating archive of current version..."
mkdir -p Archive/$(date +%Y%m%d)
cp -r index.html sketch.js style.css Archive/$(date +%Y%m%d)/

# Deploy the new version
echo "Deploying new version..."
cp -r src/* ./

echo "Deployment complete!"
echo "The original files have been archived in Archive/$(date +%Y%m%d)/"
echo "You can now run Particula by opening index.html in your browser."