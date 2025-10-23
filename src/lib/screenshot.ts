import { storage } from './storage';
import { captureVisibleTab, getCurrentTab, sendMessageToTab } from './tabs';
import { generateId } from './utils';
import type { Screenshot } from '@/types';

export async function captureFullPage(): Promise<Screenshot> {
  const dataUrl = await captureVisibleTab();
  const tab = await getCurrentTab();

  const img = new Image();
  img.src = dataUrl;

  await new Promise((resolve) => {
    img.onload = resolve;
  });

  const screenshot: Screenshot = {
    id: generateId(),
    dataUrl,
    url: tab?.url || '',
    title: tab?.title || 'Untitled',
    timestamp: Date.now(),
    type: 'full',
    dimensions: {
      width: img.width,
      height: img.height
    }
  };

  await storage.saveScreenshot(screenshot);
  return screenshot;
}

export async function captureArea(): Promise<void> {
  // Send message to content script to show selection overlay
  await sendMessageToTab({
    type: 'SHOW_SCREENSHOT_OVERLAY'
  });
}

export async function saveAreaScreenshot(
  dataUrl: string,
  dimensions: { width: number; height: number }
): Promise<Screenshot> {
  const tab = await getCurrentTab();

  const screenshot: Screenshot = {
    id: generateId(),
    dataUrl,
    url: tab?.url || '',
    title: tab?.title || 'Untitled',
    timestamp: Date.now(),
    type: 'area',
    dimensions
  };

  await storage.saveScreenshot(screenshot);
  return screenshot;
}

export async function getAllScreenshots(): Promise<Screenshot[]> {
  return await storage.getScreenshots();
}

export async function getScreenshotsForCurrentPage(): Promise<Screenshot[]> {
  const tab = await getCurrentTab();
  if (!tab?.url) return [];
  return await storage.getScreenshotsByUrl(tab.url);
}

export async function deleteScreenshot(id: string): Promise<void> {
  await storage.deleteScreenshot(id);
}

export function downloadScreenshot(screenshot: Screenshot): void {
  const link = document.createElement('a');
  link.href = screenshot.dataUrl;
  link.download = `kungfu-screenshot-${screenshot.timestamp}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function copyScreenshotToClipboard(screenshot: Screenshot): Promise<void> {
  return new Promise((resolve, reject) => {
    fetch(screenshot.dataUrl)
      .then(res => res.blob())
      .then(blob => {
        return navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
      })
      .then(resolve)
      .catch(reject);
  });
}
