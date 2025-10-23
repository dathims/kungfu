#!/bin/bash

# Script to create placeholder PNG icons for the extension
# You can run this if you have ImageMagick installed: brew install imagemagick

if command -v convert &> /dev/null; then
    echo "Creating placeholder icons with ImageMagick..."

    # Create a simple blue square with white text
    convert -size 128x128 xc:'#3B82F6' \
        -gravity center \
        -pointsize 80 \
        -fill white \
        -annotate +0+0 '🥋' \
        public/icons/icon128.png

    convert public/icons/icon128.png -resize 48x48 public/icons/icon48.png
    convert public/icons/icon128.png -resize 32x32 public/icons/icon32.png
    convert public/icons/icon128.png -resize 16x16 public/icons/icon16.png

    echo "✅ Icons created successfully!"
    echo "Run 'npm run build' to copy them to dist/"
else
    echo "❌ ImageMagick not found."
    echo ""
    echo "To create icons, either:"
    echo "1. Install ImageMagick: brew install imagemagick"
    echo "   Then run this script again"
    echo ""
    echo "2. Manually create 4 PNG files in public/icons/:"
    echo "   - icon16.png (16x16)"
    echo "   - icon32.png (32x32)"
    echo "   - icon48.png (48x48)"
    echo "   - icon128.png (128x128)"
    echo ""
    echo "3. Use an online tool like https://favicon.io/"
fi
