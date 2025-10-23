# Extension Icons

This folder should contain 4 PNG icon files for the Chrome extension:

- **icon16.png** (16x16 pixels)
- **icon32.png** (32x32 pixels)
- **icon48.png** (48x48 pixels)
- **icon128.png** (128x128 pixels)

## How to Create Icons

### Option 1: Use Online Tool (Easiest)
1. Go to https://favicon.io/favicon-generator/
2. Choose "Text" and enter: 🥋
3. Choose background color: #3B82F6 (blue)
4. Download the generated icons
5. Rename them to match the sizes above
6. Place them in this folder
7. Run `npm run build` to copy them to dist/

### Option 2: Use ImageMagick (If Installed)
```bash
# From project root:
./create-icons.sh
npm run build
```

### Option 3: Use Figma/Sketch/Photoshop
1. Create a 128x128 px artboard with blue background (#3B82F6)
2. Add the 🥋 emoji in white centered
3. Export as PNG at 128x128
4. Resize for other sizes (48, 32, 16)
5. Save in this folder

### Temporary Solution
For testing, you can use any PNG images at these sizes. The extension will work without proper icons, but the icon won't look as good in the Chrome toolbar.

## After Creating Icons

Don't forget to rebuild the extension to copy the icons to the dist folder:
```bash
npm run build
```

Then reload the extension in Chrome (chrome://extensions/).
