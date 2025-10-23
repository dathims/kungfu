import { storage } from './storage';
import { getCurrentTab } from './tabs';
import { generateId } from './utils';
import type { Transcription } from '@/types';

// Declare SpeechRecognition types
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export class TranscriptionService {
  private recognition: SpeechRecognition | null = null;
  private currentTranscription: Transcription | null = null;
  private onUpdate: ((text: string) => void) | null = null;

  constructor() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;
    }
  }

  isAvailable(): boolean {
    return this.recognition !== null;
  }

  async start(language: string = 'en-US', onUpdate?: (text: string) => void): Promise<string> {
    if (!this.recognition) {
      throw new Error('Web Speech API is not available in this browser');
    }

    if (this.currentTranscription) {
      throw new Error('Transcription is already running');
    }

    const tab = await getCurrentTab();
    this.onUpdate = onUpdate || null;

    this.currentTranscription = {
      id: generateId(),
      url: tab?.url || '',
      title: tab?.title || 'Untitled',
      text: '',
      timestamp: Date.now(),
      isLive: true
    };

    this.recognition.lang = language;

    return new Promise((resolve, reject) => {
      if (!this.recognition) return reject(new Error('Recognition not initialized'));

      this.recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        if (this.currentTranscription) {
          if (finalTranscript) {
            this.currentTranscription.text += finalTranscript;
          }

          const displayText = this.currentTranscription.text + interimTranscript;
          if (this.onUpdate) {
            this.onUpdate(displayText);
          }
        }
      };

      this.recognition!.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          reject(new Error('Microphone access denied. Please allow microphone access and try again.'));
        } else {
          reject(new Error('Speech recognition error: ' + event.error));
        }
      };

      this.recognition!.onend = () => {
        if (this.currentTranscription && this.currentTranscription.isLive && this.recognition) {
          // If it ended unexpectedly and we're still live, restart
          try {
            this.recognition.start();
          } catch (e) {
            console.error('Failed to restart recognition:', e);
          }
        }
      };

      try {
        if (this.recognition && this.currentTranscription) {
          this.recognition.start();
          resolve(this.currentTranscription.id);
        } else {
          reject(new Error('Recognition not initialized'));
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  async stop(): Promise<Transcription | null> {
    if (!this.recognition || !this.currentTranscription) {
      return null;
    }

    this.recognition.stop();
    this.currentTranscription.isLive = false;

    // Save to storage
    await storage.saveTranscription(this.currentTranscription);

    const result = this.currentTranscription;
    this.currentTranscription = null;
    this.onUpdate = null;

    return result;
  }

  isRunning(): boolean {
    return this.currentTranscription !== null && this.currentTranscription.isLive;
  }

  getCurrentText(): string {
    return this.currentTranscription?.text || '';
  }
}

// Singleton instance
export const transcriptionService = new TranscriptionService();

// Helper functions
export async function startTranscription(
  language: string = 'en-US',
  onUpdate?: (text: string) => void
): Promise<string> {
  return await transcriptionService.start(language, onUpdate);
}

export async function stopTranscription(): Promise<Transcription | null> {
  return await transcriptionService.stop();
}

export function isTranscribing(): boolean {
  return transcriptionService.isRunning();
}

export async function getAllTranscriptions(): Promise<Transcription[]> {
  return await storage.getTranscriptions();
}

export async function getTranscriptionsForCurrentPage(): Promise<Transcription[]> {
  const tab = await getCurrentTab();
  if (!tab?.url) return [];
  return await storage.getTranscriptionsByUrl(tab.url);
}

export async function deleteTranscription(id: string): Promise<void> {
  await storage.deleteTranscription(id);
}
