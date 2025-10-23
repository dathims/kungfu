export interface Note {
  id: string;
  title: string;
  content: string;
  url: string;
  timestamp: number;
  tags?: string[];
}

export interface Screenshot {
  id: string;
  dataUrl: string;
  url: string;
  title: string;
  timestamp: number;
  type: 'full' | 'area';
  dimensions?: {
    width: number;
    height: number;
  };
}

export interface Transcription {
  id: string;
  url: string;
  title: string;
  text: string;
  timestamp: number;
  isLive: boolean;
}

export interface PageSummary {
  id: string;
  url: string;
  title: string;
  summary: string;
  timestamp: number;
}

export interface TabInfo {
  url: string;
  title: string;
  favIconUrl?: string;
}

export type Tool = 'notes' | 'screenshots' | 'transcription' | 'summary';

export interface ChromeAICapabilities {
  available: boolean;
  canCreateTextSession: boolean;
}

export interface StorageData {
  notes: Note[];
  screenshots: Screenshot[];
  transcriptions: Transcription[];
  summaries: PageSummary[];
  settings: AppSettings;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  autoSummary: boolean;
  transcriptionLanguage: string;
}
