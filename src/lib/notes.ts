import { storage } from './storage';
import { getTabInfo } from './tabs';
import { generateId } from './utils';
import type { Note } from '@/types';

export async function createNote(title: string, content: string): Promise<Note> {
  const tabInfo = await getTabInfo();

  const note: Note = {
    id: generateId(),
    title,
    content,
    url: tabInfo.url,
    timestamp: Date.now(),
    tags: []
  };

  await storage.saveNote(note);
  return note;
}

export async function updateNote(id: string, updates: Partial<Note>): Promise<void> {
  const existing = await storage.getNote(id);
  if (!existing) {
    throw new Error('Note not found');
  }

  const updated: Note = {
    ...existing,
    ...updates
  };

  await storage.saveNote(updated);
}

export async function deleteNote(id: string): Promise<void> {
  await storage.deleteNote(id);
}

export async function getAllNotes(): Promise<Note[]> {
  return await storage.getNotes();
}

export async function getNotesForCurrentPage(): Promise<Note[]> {
  const tabInfo = await getTabInfo();
  return await storage.getNotesByUrl(tabInfo.url);
}

export async function searchNotes(query: string): Promise<Note[]> {
  const allNotes = await getAllNotes();
  const lowerQuery = query.toLowerCase();

  return allNotes.filter(note =>
    note.title.toLowerCase().includes(lowerQuery) ||
    note.content.toLowerCase().includes(lowerQuery) ||
    note.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

// Simple markdown to HTML converter
export function markdownToHtml(markdown: string): string {
  let html = markdown;

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-4 mb-2">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>');

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>');
  html = html.replace(/__(.*?)__/g, '<strong class="font-bold">$1</strong>');

  // Italic
  html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
  html = html.replace(/_(.*?)_/g, '<em class="italic">$1</em>');

  // Code
  html = html.replace(/`(.*?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline" target="_blank">$1</a>');

  // Line breaks
  html = html.replace(/\n/g, '<br>');

  // Lists
  html = html.replace(/^\* (.*$)/gim, '<li class="ml-4">• $1</li>');
  html = html.replace(/^\- (.*$)/gim, '<li class="ml-4">• $1</li>');

  return html;
}
