import { storage } from './storage';
import { getCurrentTab, executeScript } from './tabs';
import { generateId } from './utils';
import type { PageSummary, ChromeAICapabilities } from '@/types';

// Check Chrome AI availability
export async function checkChromeAI(): Promise<ChromeAICapabilities> {
  try {
    // @ts-ignore - Chrome AI is experimental
    const ai = window.ai;
    if (!ai) {
      return { available: false, canCreateTextSession: false };
    }

    // @ts-ignore
    const canCreate = (await ai.languageModel?.capabilities())?.available === 'readily';
    return {
      available: true,
      canCreateTextSession: canCreate
    };
  } catch {
    return { available: false, canCreateTextSession: false };
  }
}

// Extract page content for summarization
async function extractPageContent(): Promise<string> {
  return await executeScript(() => {
    // Remove scripts, styles, and other non-content elements
    const clone = document.cloneNode(true) as Document;
    const elementsToRemove = clone.querySelectorAll('script, style, noscript, iframe, nav, footer, header');
    elementsToRemove.forEach(el => el.remove());

    // Get text content
    const article = clone.querySelector('article') || clone.querySelector('main') || clone.body;
    let text = article?.textContent || '';

    // Clean up whitespace
    text = text.replace(/\s+/g, ' ').trim();

    // Limit to ~2000 words for better results
    const words = text.split(' ');
    if (words.length > 2000) {
      text = words.slice(0, 2000).join(' ') + '...';
    }

    return text;
  });
}

// Generate summary using Chrome AI
export async function generatePageSummary(): Promise<PageSummary> {
  const capabilities = await checkChromeAI();
  if (!capabilities.canCreateTextSession) {
    throw new Error('Chrome AI is not available. Please enable it in chrome://flags/#optimization-guide-on-device-model');
  }

  const tab = await getCurrentTab();
  const content = await extractPageContent();

  if (!content || content.length < 100) {
    throw new Error('Page content is too short to summarize');
  }

  try {
    // @ts-ignore - Chrome AI API
    const session = await window.ai.languageModel.create({
      systemPrompt: 'You are a helpful assistant that creates concise summaries of web pages. Keep summaries under 200 words and focus on the main points.'
    });

    // @ts-ignore
    const result = await session.prompt(
      `Please summarize the following web page content:\n\n${content}`
    );

    // @ts-ignore
    session.destroy();

    const summary: PageSummary = {
      id: generateId(),
      url: tab?.url || '',
      title: tab?.title || 'Untitled',
      summary: result.trim(),
      timestamp: Date.now()
    };

    await storage.saveSummary(summary);
    return summary;
  } catch (error) {
    throw new Error('Failed to generate summary: ' + (error as Error).message);
  }
}

export async function getSummaryForCurrentPage(): Promise<PageSummary | undefined> {
  const tab = await getCurrentTab();
  if (!tab?.url) return undefined;
  return await storage.getSummaryByUrl(tab.url);
}

export async function getAllSummaries(): Promise<PageSummary[]> {
  return await storage.getSummaries();
}

export async function deleteSummary(id: string): Promise<void> {
  await storage.deleteSummary(id);
}
