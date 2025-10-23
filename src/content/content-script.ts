// Content script for Kungfu extension
// Handles screenshot area selection overlay

let overlay: HTMLDivElement | null = null;
let selectionBox: HTMLDivElement | null = null;
let startX = 0;
let startY = 0;
let isSelecting = false;

// Message listener
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'SHOW_SCREENSHOT_OVERLAY') {
    showScreenshotOverlay();
    sendResponse({ success: true });
  }
  return true;
});

function showScreenshotOverlay() {
  if (overlay) {
    return; // Already showing
  }

  // Create overlay
  overlay = document.createElement('div');
  overlay.id = 'kungfu-screenshot-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    z-index: 2147483647;
    cursor: crosshair;
  `;

  // Create instructions
  const instructions = document.createElement('div');
  instructions.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: white;
    color: black;
    padding: 12px 24px;
    border-radius: 8px;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 2147483648;
  `;
  instructions.textContent = 'Click and drag to select an area. Press ESC to cancel.';

  // Create selection box
  selectionBox = document.createElement('div');
  selectionBox.style.cssText = `
    position: fixed;
    border: 2px solid #3b82f6;
    background: rgba(59, 130, 246, 0.1);
    display: none;
    z-index: 2147483648;
  `;

  document.body.appendChild(overlay);
  document.body.appendChild(instructions);
  document.body.appendChild(selectionBox);

  // Event listeners
  overlay.addEventListener('mousedown', handleMouseDown);
  overlay.addEventListener('mousemove', handleMouseMove);
  overlay.addEventListener('mouseup', handleMouseUp);
  document.addEventListener('keydown', handleKeyDown);
}

function handleMouseDown(e: MouseEvent) {
  isSelecting = true;
  startX = e.clientX;
  startY = e.clientY;

  if (selectionBox) {
    selectionBox.style.left = startX + 'px';
    selectionBox.style.top = startY + 'px';
    selectionBox.style.width = '0px';
    selectionBox.style.height = '0px';
    selectionBox.style.display = 'block';
  }
}

function handleMouseMove(e: MouseEvent) {
  if (!isSelecting || !selectionBox) return;

  const currentX = e.clientX;
  const currentY = e.clientY;

  const width = Math.abs(currentX - startX);
  const height = Math.abs(currentY - startY);
  const left = Math.min(startX, currentX);
  const top = Math.min(startY, currentY);

  selectionBox.style.left = left + 'px';
  selectionBox.style.top = top + 'px';
  selectionBox.style.width = width + 'px';
  selectionBox.style.height = height + 'px';
}

async function handleMouseUp(e: MouseEvent) {
  if (!isSelecting || !selectionBox) return;

  isSelecting = false;

  const currentX = e.clientX;
  const currentY = e.clientY;

  const width = Math.abs(currentX - startX);
  const height = Math.abs(currentY - startY);
  const left = Math.min(startX, currentX);
  const top = Math.min(startY, currentY);

  // Minimum size check
  if (width < 10 || height < 10) {
    removeOverlay();
    return;
  }

  // Hide overlay temporarily for screenshot
  if (overlay) overlay.style.display = 'none';
  if (selectionBox) selectionBox.style.display = 'none';

  // Wait a bit for the overlay to hide
  await new Promise(resolve => setTimeout(resolve, 100));

  try {
    // Capture the visible tab
    const dataUrl = await chrome.runtime.sendMessage({ type: 'CAPTURE_VISIBLE_TAB' });

    // Create canvas to crop the image
    const img = new Image();
    img.src = dataUrl;

    await new Promise((resolve) => {
      img.onload = resolve;
    });

    // Calculate actual dimensions based on device pixel ratio
    const dpr = window.devicePixelRatio || 1;
    const canvas = document.createElement('canvas');
    canvas.width = width * dpr;
    canvas.height = height * dpr;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(
        img,
        left * dpr,
        top * dpr,
        width * dpr,
        height * dpr,
        0,
        0,
        width * dpr,
        height * dpr
      );

      const croppedDataUrl = canvas.toDataURL('image/png');

      // Send to background script to save
      await chrome.runtime.sendMessage({
        type: 'SAVE_AREA_SCREENSHOT',
        dataUrl: croppedDataUrl,
        dimensions: { width, height }
      });
    }
  } catch (error) {
    console.error('Screenshot error:', error);
  }

  removeOverlay();
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    removeOverlay();
  }
}

function removeOverlay() {
  if (overlay) {
    overlay.removeEventListener('mousedown', handleMouseDown);
    overlay.removeEventListener('mousemove', handleMouseMove);
    overlay.removeEventListener('mouseup', handleMouseUp);
    overlay.remove();
    overlay = null;
  }

  if (selectionBox) {
    selectionBox.remove();
    selectionBox = null;
  }

  document.removeEventListener('keydown', handleKeyDown);

  const instructions = document.querySelector('#kungfu-screenshot-overlay + div');
  if (instructions) {
    instructions.remove();
  }

  isSelecting = false;
}

console.log('Kungfu content script loaded');
