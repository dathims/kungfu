// Background service worker for Kungfu extension

console.log('Kungfu service worker loaded');

// Open side panel on extension icon click
chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    chrome.sidePanel.open({ tabId: tab.id });
  }
});

// Handle messages from content script and sidepanel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CAPTURE_VISIBLE_TAB') {
    handleCaptureVisibleTab(sender, sendResponse);
    return true; // Will respond asynchronously
  }

  if (message.type === 'SAVE_AREA_SCREENSHOT') {
    handleSaveAreaScreenshot(message, sendResponse);
    return true;
  }

  return false;
});

async function handleCaptureVisibleTab(
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: any) => void
) {
  try {
    if (!sender.tab?.windowId) {
      throw new Error('No window ID found');
    }

    const dataUrl = await chrome.tabs.captureVisibleTab(sender.tab.windowId, {
      format: 'png'
    });

    sendResponse(dataUrl);
  } catch (error) {
    console.error('Capture error:', error);
    sendResponse({ error: (error as Error).message });
  }
}

async function handleSaveAreaScreenshot(
  message: any,
  sendResponse: (response: any) => void
) {
  try {
    // The saving is handled by the sidepanel, we just acknowledge
    sendResponse({ success: true });

    // Optionally, notify the sidepanel that a new screenshot is ready
    chrome.runtime.sendMessage({
      type: 'AREA_SCREENSHOT_CAPTURED',
      dataUrl: message.dataUrl,
      dimensions: message.dimensions
    });
  } catch (error) {
    console.error('Save error:', error);
    sendResponse({ error: (error as Error).message });
  }
}

// Context menu for quick access
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'kungfu-open-sidebar',
    title: 'Open Kungfu Sidebar',
    contexts: ['page', 'selection']
  });

  chrome.contextMenus.create({
    id: 'kungfu-take-screenshot',
    title: 'Take Screenshot',
    contexts: ['page']
  });

  chrome.contextMenus.create({
    id: 'kungfu-create-note',
    title: 'Create Note',
    contexts: ['selection']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!tab?.id) return;

  if (info.menuItemId === 'kungfu-open-sidebar') {
    chrome.sidePanel.open({ tabId: tab.id });
  }

  if (info.menuItemId === 'kungfu-take-screenshot') {
    chrome.sidePanel.open({ tabId: tab.id });
    // Send message to sidepanel to trigger screenshot
    setTimeout(() => {
      chrome.runtime.sendMessage({ type: 'TRIGGER_SCREENSHOT' });
    }, 500);
  }

  if (info.menuItemId === 'kungfu-create-note') {
    chrome.sidePanel.open({ tabId: tab.id });
    // Send message with selected text
    setTimeout(() => {
      chrome.runtime.sendMessage({
        type: 'TRIGGER_NOTE',
        selectedText: info.selectionText
      });
    }, 500);
  }
});

// Keep service worker alive
let keepAliveInterval: NodeJS.Timeout | null = null;

function keepAlive() {
  if (keepAliveInterval === null) {
    keepAliveInterval = setInterval(() => {
      chrome.runtime.getPlatformInfo(() => {
        // Just a ping to keep alive
      });
    }, 20000); // Every 20 seconds
  }
}

chrome.runtime.onStartup.addListener(() => {
  keepAlive();
});

chrome.runtime.onConnect.addListener(() => {
  keepAlive();
});

keepAlive();
