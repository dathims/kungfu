import Dexie, { Table } from 'dexie';
import type { Note, Screenshot, Transcription, PageSummary, AppSettings } from '@/types';

// IndexedDB for large data (screenshots, transcriptions)
class KungfuDatabase extends Dexie {
  notes!: Table<Note, string>;
  screenshots!: Table<Screenshot, string>;
  transcriptions!: Table<Transcription, string>;
  summaries!: Table<PageSummary, string>;

  constructor() {
    super('kungfu-db');
    this.version(1).stores({
      notes: 'id, timestamp, url',
      screenshots: 'id, timestamp, url, type',
      transcriptions: 'id, timestamp, url',
      summaries: 'id, timestamp, url'
    });
  }
}

export const db = new KungfuDatabase();

// Chrome Storage for settings and metadata
const SETTINGS_KEY = 'kungfu_settings';

export const storage = {
  // Settings management
  async getSettings(): Promise<AppSettings> {
    const result = await chrome.storage.local.get(SETTINGS_KEY);
    return result[SETTINGS_KEY] || {
      theme: 'light',
      autoSummary: false,
      transcriptionLanguage: 'en-US'
    };
  },

  async setSettings(settings: Partial<AppSettings>): Promise<void> {
    const current = await this.getSettings();
    await chrome.storage.local.set({
      [SETTINGS_KEY]: { ...current, ...settings }
    });
  },

  // Notes
  async getNotes(): Promise<Note[]> {
    return await db.notes.orderBy('timestamp').reverse().toArray();
  },

  async getNote(id: string): Promise<Note | undefined> {
    return await db.notes.get(id);
  },

  async saveNote(note: Note): Promise<void> {
    await db.notes.put(note);
  },

  async deleteNote(id: string): Promise<void> {
    await db.notes.delete(id);
  },

  async getNotesByUrl(url: string): Promise<Note[]> {
    return await db.notes.where('url').equals(url).toArray();
  },

  // Screenshots
  async getScreenshots(): Promise<Screenshot[]> {
    return await db.screenshots.orderBy('timestamp').reverse().toArray();
  },

  async getScreenshot(id: string): Promise<Screenshot | undefined> {
    return await db.screenshots.get(id);
  },

  async saveScreenshot(screenshot: Screenshot): Promise<void> {
    await db.screenshots.put(screenshot);
  },

  async deleteScreenshot(id: string): Promise<void> {
    await db.screenshots.delete(id);
  },

  async getScreenshotsByUrl(url: string): Promise<Screenshot[]> {
    return await db.screenshots.where('url').equals(url).toArray();
  },

  // Transcriptions
  async getTranscriptions(): Promise<Transcription[]> {
    return await db.transcriptions.orderBy('timestamp').reverse().toArray();
  },

  async getTranscription(id: string): Promise<Transcription | undefined> {
    return await db.transcriptions.get(id);
  },

  async saveTranscription(transcription: Transcription): Promise<void> {
    await db.transcriptions.put(transcription);
  },

  async deleteTranscription(id: string): Promise<void> {
    await db.transcriptions.delete(id);
  },

  async getTranscriptionsByUrl(url: string): Promise<Transcription[]> {
    return await db.transcriptions.where('url').equals(url).toArray();
  },

  // Summaries
  async getSummaries(): Promise<PageSummary[]> {
    return await db.summaries.orderBy('timestamp').reverse().toArray();
  },

  async getSummary(id: string): Promise<PageSummary | undefined> {
    return await db.summaries.get(id);
  },

  async saveSummary(summary: PageSummary): Promise<void> {
    await db.summaries.put(summary);
  },

  async deleteSummary(id: string): Promise<void> {
    await db.summaries.delete(id);
  },

  async getSummaryByUrl(url: string): Promise<PageSummary | undefined> {
    const summaries = await db.summaries.where('url').equals(url).toArray();
    return summaries[0];
  },

  // Utility
  async clearAll(): Promise<void> {
    await db.notes.clear();
    await db.screenshots.clear();
    await db.transcriptions.clear();
    await db.summaries.clear();
    await chrome.storage.local.clear();
  },

  async exportData(): Promise<string> {
    const data = {
      notes: await this.getNotes(),
      screenshots: await this.getScreenshots(),
      transcriptions: await this.getTranscriptions(),
      summaries: await this.getSummaries(),
      settings: await this.getSettings()
    };
    return JSON.stringify(data, null, 2);
  },

  async importData(jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData);

      if (data.notes) {
        await db.notes.bulkPut(data.notes);
      }
      if (data.screenshots) {
        await db.screenshots.bulkPut(data.screenshots);
      }
      if (data.transcriptions) {
        await db.transcriptions.bulkPut(data.transcriptions);
      }
      if (data.summaries) {
        await db.summaries.bulkPut(data.summaries);
      }
      if (data.settings) {
        await this.setSettings(data.settings);
      }
    } catch (error) {
      throw new Error('Invalid import data format');
    }
  }
};
