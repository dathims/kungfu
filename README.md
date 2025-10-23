# 🥋 Kungfu - Chrome Extension

AI-powered Chrome sidebar extension for web navigation assistance with notes, screenshots, transcription, and AI summaries.

## Features

### 📝 Notes
- Create and save notes with markdown support
- Automatic page URL tracking
- Search through your notes
- Markdown rendering (bold, italic, headers, lists, links)

### 📸 Screenshots
- **Full page screenshot**: Capture the entire visible area
- **Area selection**: Select a specific region to capture
- Download screenshots
- Copy to clipboard
- Organized by timestamp and URL

### 🎤 Transcription
- Live audio transcription using Web Speech API
- Real-time text display
- Save transcriptions for later reference
- Support for multiple languages

### ✨ AI Summary
- Generate page summaries using Chrome AI (Gemini Nano)
- Automatic content extraction
- Save summaries for quick reference
- View summaries for any visited page

## Tech Stack

- **TypeScript** - Type-safe code
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first styling (shadcn/ui inspired)
- **IndexedDB** (via Dexie.js) - Local storage for screenshots and large data
- **Chrome Storage API** - Settings and metadata
- **Chrome AI (Gemini Nano)** - On-device AI summaries
- **Web Speech API** - Voice transcription

## Installation

### Development

1. Install dependencies:
```bash
npm install
```

2. Build the extension:
```bash
npm run build
```

3. Load in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

### Chrome AI Setup (Required for Summaries)

Chrome AI is experimental and requires manual enablement:

1. Go to `chrome://flags/#optimization-guide-on-device-model`
2. Set to "Enabled"
3. Go to `chrome://flags/#prompt-api-for-gemini-nano`
4. Set to "Enabled"
5. Restart Chrome
6. Open DevTools and run: `await window.ai.languageModel.create()`
7. Wait for the model to download (may take a few minutes)

## Usage

### Opening the Sidebar

- Click the Kungfu extension icon in Chrome toolbar
- Use keyboard shortcut: `Ctrl+Shift+K` (Windows/Linux) or `Cmd+Shift+K` (Mac)
- Right-click on a page and select "Open Kungfu Sidebar"

### Quick Actions

- Right-click on selected text → "Create Note" to instantly save a note
- Right-click anywhere → "Take Screenshot" to open the screenshot tool

### Features

**Notes:**
1. Click on the Notes tab
2. Enter a title and content (markdown supported)
3. Click "Save Note"

**Screenshots:**
1. Click on the Screenshots tab
2. Choose "Full Page" or "Select Area"
3. For area selection, click and drag to select the region
4. Download or delete screenshots as needed

**Transcription:**
1. Click on the Transcribe tab
2. Click "Start Transcription"
3. Allow microphone access when prompted
4. Speak naturally - text appears in real-time
5. Click "Stop Transcription" when done

**Summary:**
1. Click on the Summary tab
2. Click "Generate Summary"
3. Wait for the AI to analyze the page (a few seconds)
4. View and save the summary

## Development

### Project Structure

```
kungfu/
├── src/
│   ├── sidepanel/          # Main UI
│   │   ├── index.html
│   │   ├── main.ts
│   │   └── styles.css
│   ├── content/            # Content scripts
│   │   └── content-script.ts
│   ├── background/         # Service worker
│   │   └── service-worker.ts
│   ├── components/         # UI components
│   │   ├── ui/
│   │   └── icons.ts
│   ├── lib/                # Core functionality
│   │   ├── storage.ts      # IndexedDB + Chrome Storage
│   │   ├── notes.ts        # Notes management
│   │   ├── screenshot.ts   # Screenshot capture
│   │   ├── transcription.ts # Speech-to-text
│   │   ├── ai.ts           # Chrome AI integration
│   │   ├── tabs.ts         # Tab management
│   │   └── utils.ts        # Utilities
│   └── types/              # TypeScript types
└── public/
    ├── manifest.json
    └── icons/
```

### Scripts

- `npm run dev` - Start development server (watch mode)
- `npm run build` - Build for production
- `npm run type-check` - Run TypeScript type checking

### Key APIs Used

- **Chrome Side Panel API**: For the sidebar interface
- **Chrome Tabs API**: For page interaction and screenshots
- **Chrome Storage API**: For settings persistence
- **IndexedDB (Dexie)**: For large data storage
- **Chrome AI (Gemini Nano)**: For on-device AI summaries
- **Web Speech API**: For live transcription
- **Chrome Scripting API**: For content script injection

## Permissions

The extension requires the following permissions:

- `sidePanel`: Display the sidebar interface
- `storage`: Save settings and preferences
- `activeTab`: Access current tab information
- `scripting`: Inject content scripts for screenshots
- `tabs`: Capture screenshots
- `tabCapture`: Audio capture for transcription
- `contextMenus`: Right-click menu integration
- `<all_urls>`: Access any page for full functionality

## Privacy

- **All data stays local**: Notes, screenshots, transcriptions, and summaries are stored in your browser's IndexedDB
- **No external servers**: Chrome AI runs entirely on your device (no cloud API calls)
- **No tracking**: The extension does not collect or send any analytics or usage data
- **No third-party services**: All features work offline (after initial Chrome AI model download)

## Troubleshooting

### Chrome AI not working

1. Ensure you've enabled the flags (see Installation section)
2. Wait for the Gemini Nano model to download (check DevTools console)
3. Try restarting Chrome
4. Check if your Chrome version supports on-device AI (Chrome 120+)

### Transcription not working

1. Ensure microphone permissions are granted
2. Check if your browser supports Web Speech API
3. Try a different browser if issues persist (Chrome/Edge recommended)

### Screenshots not capturing

1. Ensure the extension has access to the current tab
2. Try refreshing the page
3. Check if the page allows screenshot capture (some sites block it)

## Contributing

This project is open for improvements! Feel free to:

- Report bugs
- Suggest new features
- Submit pull requests

## License

MIT

## Credits

Built with ❤️ using:
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Dexie.js](https://dexie.org/)
- [Chrome Extensions API](https://developer.chrome.com/docs/extensions/)
