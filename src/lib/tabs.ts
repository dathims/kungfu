import type { TabInfo } from '@/types';

export async function getCurrentTab(): Promise<chrome.tabs.Tab | null> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab || null;
}

export async function getTabInfo(): Promise<TabInfo> {
  const tab = await getCurrentTab();
  return {
    url: tab?.url || '',
    title: tab?.title || 'Unknown',
    favIconUrl: tab?.favIconUrl
  };
}

export async function sendMessageToTab<T = any>(message: any): Promise<T> {
  const tab = await getCurrentTab();
  if (!tab?.id) {
    throw new Error('No active tab found');
  }
  return await chrome.tabs.sendMessage(tab.id, message);
}

export async function executeScript<T = any>(func: () => T): Promise<T> {
  const tab = await getCurrentTab();
  if (!tab?.id) {
    throw new Error('No active tab found');
  }

  const results = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: func
  });

  return results[0]?.result as T;
}

export async function captureVisibleTab(): Promise<string> {
  const tab = await getCurrentTab();
  if (!tab?.windowId) {
    throw new Error('No active window found');
  }

  return await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' });
}
