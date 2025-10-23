# Installation Guide for Kungfu Chrome Extension

## ✅ What's Done

The extension is fully built and ready to load! Here's what's included:

### Features Implemented
- ✅ **Notes System**: Create, save, and manage notes with markdown support
- ✅ **Screenshot Tool**: Full-page and area selection screenshots
- ✅ **Live Transcription**: Real-time audio-to-text using Web Speech API
- ✅ **AI Summaries**: Page summarization with Chrome AI (Gemini Nano)
- ✅ **Sidebar UI**: Clean, minimaliste interface with shadcn/ui styling
- ✅ **Storage**: IndexedDB for large data, Chrome Storage for settings
- ✅ **Background Service Worker**: Handles context menus and messaging
- ✅ **Content Script**: Manages screenshot overlays

## 📋 Prerequisites

1. **Google Chrome** (version 120 or higher)
2. **Developer Mode** enabled in Chrome Extensions

## 🚀 Installation Steps

### 1. Load the Extension in Chrome

1. Open Chrome and navigate to: `chrome://extensions/`
2. Enable **Developer mode** (toggle in top right)
3. Click **"Load unpacked"**
4. Select the `dist` folder from this project
5. The Kungfu extension should now appear in your extensions list

### 2. Create Extension Icons (Optional but Recommended)

The extension currently uses placeholder icons. To create proper icons:

**Option A - Use the emoji directly:**
Create 4 PNG files with the 🥋 emoji at these sizes:
- `public/icons/icon16.png` (16x16 pixels)
- `public/icons/icon32.png` (32x32 pixels)
- `public/icons/icon48.png` (48x48 pixels)
- `public/icons/icon128.png` (128x128 pixels)

**Option B - Use an online tool:**
1. Go to https://favicon.io/ or similar
2. Upload an image or create an icon
3. Download the generated icons
4. Rename them to match the sizes above
5. Place them in `public/icons/`
6. Rebuild: `npm run build`
7. Reload the extension in Chrome

### 3. Enable Chrome AI (Required for Summary Feature)

Chrome AI is experimental and needs manual activation:

1. Open a new tab and go to: `chrome://flags/#optimization-guide-on-device-model`
2. Set to **"Enabled"**
3. Go to: `chrome://flags/#prompt-api-for-gemini-nano`
4. Set to **"Enabled"**
5. **Restart Chrome**
6. After restart, open DevTools (F12)
7. In the console, run:
   ```javascript
   await window.ai.languageModel.create()
   ```
8. Wait for the Gemini Nano model to download (may take 5-10 minutes)
9. Once downloaded, the Summary feature will work!

### 4. Grant Permissions

When you first use certain features, Chrome will ask for permissions:

- **Microphone**: Required for transcription feature
- **Tab Access**: Required for screenshots and page summaries
- **Storage**: Required to save your notes and data

## 🎯 Using the Extension

### Opening the Sidebar

Three ways to open:
1. Click the Kungfu icon in Chrome toolbar
2. Keyboard shortcut: `Ctrl+Shift+K` (Windows/Linux) or `Cmd+Shift+K` (Mac)
3. Right-click on any page → "Open Kungfu Sidebar"

### Taking Notes

1. Open the sidebar and click the **Notes** tab
2. Enter a title and content (markdown supported!)
3. Click **"Save Note"**
4. Your note is automatically associated with the current page URL

### Taking Screenshots

1. Click the **Screenshots** tab
2. Choose:
   - **Full Page**: Captures entire visible area instantly
   - **Select Area**: Click and drag to select a region
3. Download or delete screenshots from the list

### Live Transcription

1. Click the **Transcribe** tab
2. Click **"Start Transcription"**
3. Allow microphone access when prompted
4. Start speaking - text appears in real-time
5. Click **"Stop Transcription"** when done

### AI Page Summary

1. Navigate to any article or page with text content
2. Click the **Summary** tab
3. Click **"Generate Summary"**
4. Wait a few seconds for the AI to process
5. View and save the summary

## 🔧 Development

If you want to modify the extension:

```bash
# Install dependencies
npm install

# Development mode (watch for changes)
npm run dev

# Build for production
npm run build

# Type check
npm run type-check
```

After making changes:
1. Run `npm run build`
2. Go to `chrome://extensions/`
3. Click the refresh icon on the Kungfu extension

## 📁 Project Structure

```
kungfu/
├── dist/                    # Built extension (load this in Chrome)
├── src/
│   ├── sidepanel/          # Main UI
│   ├── background/         # Service worker
│   ├── content/            # Content scripts
│   ├── components/         # UI components
│   ├── lib/                # Core features
│   └── types/              # TypeScript types
├── public/
│   ├── manifest.json       # Extension config
│   └── icons/              # Extension icons
└── README.md               # Full documentation
```

## 🐛 Troubleshooting

### Extension won't load
- Make sure you selected the `dist` folder, not the project root
- Check Chrome DevTools console for errors
- Try rebuilding: `npm run build`

### Screenshots not working
- Ensure the extension has tab access permissions
- Try refreshing the target page
- Some sites (like `chrome://`) can't be captured

### Transcription not starting
- Check microphone permissions in Chrome settings
- Ensure your browser supports Web Speech API
- Try in an Incognito window to rule out extension conflicts

### Summary not generating
- Verify Chrome AI flags are enabled (see step 3)
- Ensure Gemini Nano model has downloaded
- Check DevTools console for error messages
- Try on a page with substantial text content

### "Chrome AI not available" error
- Complete step 3 above to enable Chrome AI
- Restart Chrome after enabling flags
- Download the model using DevTools console command

## 🔒 Privacy & Security

- **All data stays local** - stored in your browser's IndexedDB
- **No external servers** - Chrome AI runs entirely on your device
- **No tracking** - no analytics or telemetry
- **No third-party services** - 100% offline after initial setup

## 📝 Data Management

### Export your data
```javascript
// Open DevTools console in sidebar, run:
const data = await storage.exportData();
console.log(data); // Copy this JSON
```

### Import data
```javascript
// Open DevTools console in sidebar, run:
await storage.importData('paste your JSON here');
```

### Clear all data
```javascript
// Open DevTools console in sidebar, run:
await storage.clearAll();
```

## 🎉 You're All Set!

The extension is now ready to use. Enjoy your AI-powered web assistant!

For questions or issues, check the README.md or open an issue on GitHub.
