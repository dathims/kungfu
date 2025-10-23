import './styles.css';
import { createButton } from '@/components/ui/button';
import { createCard } from '@/components/ui/card';
import { createTextarea } from '@/components/ui/textarea';
import { createInput } from '@/components/ui/input';
import { createIcon, icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { getTabInfo } from '@/lib/tabs';
import { storage } from '@/lib/storage';

// Import all feature modules
import * as notesModule from '@/lib/notes';
import * as screenshotModule from '@/lib/screenshot';
import * as transcriptionModule from '@/lib/transcription';
import * as aiModule from '@/lib/ai';
import { formatDate, extractDomain } from '@/lib/utils';

import type { Tool, Note, Screenshot, Transcription, PageSummary } from '@/types';

class KungfuApp {
  private app: HTMLElement;
  private currentTool: Tool = 'notes';
  private tabInfo: { url: string; title: string } = { url: '', title: '' };
  private theme: 'light' | 'dark' = 'dark';

  constructor() {
    this.app = document.getElementById('app')!;
    this.init();
  }

  async init() {
    this.tabInfo = await getTabInfo();
    await this.loadTheme();
    this.render();
    this.setupMessageListener();
    this.checkChromeAI();
  }

  private async loadTheme() {
    const settings = await storage.getSettings();
    this.theme = settings.theme === 'light' ? 'light' : 'dark';
    this.applyTheme();
  }

  private applyTheme() {
    const html = document.documentElement;
    if (this.theme === 'light') {
      html.classList.remove('dark');
      html.classList.add('light');
    } else {
      html.classList.remove('light');
      html.classList.add('dark');
    }
  }

  private async toggleTheme() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    this.applyTheme();
    await storage.setSettings({ theme: this.theme });
    this.render();
  }

  private async checkChromeAI() {
    const capabilities = await aiModule.checkChromeAI();
    if (!capabilities.available) {
      console.warn('Chrome AI is not available');
    }
  }

  private setupMessageListener() {
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === 'TRIGGER_SCREENSHOT') {
        this.currentTool = 'screenshots';
        this.render();
      }

      if (message.type === 'TRIGGER_NOTE') {
        this.currentTool = 'notes';
        this.render();
        // Pre-fill with selected text if provided
        if (message.selectedText) {
          setTimeout(() => {
            const contentTextarea = document.getElementById('note-content') as HTMLTextAreaElement;
            if (contentTextarea) {
              contentTextarea.value = message.selectedText;
            }
          }, 100);
        }
      }

      if (message.type === 'AREA_SCREENSHOT_CAPTURED') {
        // Refresh screenshots view
        if (this.currentTool === 'screenshots') {
          this.render();
        }
      }
    });
  }

  private render() {
    this.app.innerHTML = '';
    this.app.className = 'kungfu-container';

    // Header
    const header = this.createHeader();
    this.app.appendChild(header);

    // Tool tabs
    const tabs = this.createToolTabs();
    this.app.appendChild(tabs);

    // Content area
    const content = document.createElement('div');
    content.className = 'kungfu-content';

    switch (this.currentTool) {
      case 'notes':
        content.appendChild(this.createNotesView());
        break;
      case 'screenshots':
        content.appendChild(this.createScreenshotsView());
        break;
      case 'transcription':
        content.appendChild(this.createTranscriptionView());
        break;
      case 'summary':
        content.appendChild(this.createSummaryView());
        break;
    }

    this.app.appendChild(content);
  }

  private createHeader(): HTMLElement {
    const header = document.createElement('div');
    header.className = 'kungfu-header';

    const leftSection = document.createElement('div');
    leftSection.className = 'flex items-center gap-3';

    const title = document.createElement('div');
    title.className = 'flex items-center gap-2';

    const logo = document.createElement('span');
    logo.textContent = '🥋';
    logo.className = 'text-2xl';

    const titleText = document.createElement('h1');
    titleText.textContent = 'Kungfu';
    titleText.className = 'text-lg font-bold';

    title.appendChild(logo);
    title.appendChild(titleText);

    const pageInfo = document.createElement('div');
    pageInfo.className = 'text-xs text-muted-foreground truncate max-w-[150px]';
    pageInfo.textContent = extractDomain(this.tabInfo.url);
    pageInfo.title = this.tabInfo.url;

    leftSection.appendChild(title);
    leftSection.appendChild(pageInfo);

    // Theme toggle button
    const themeButton = createButton({
      variant: 'ghost',
      size: 'icon',
      className: 'h-9 w-9',
      children: createIcon(this.theme === 'dark' ? icons.sun : icons.moon, 'w-4 h-4'),
      onClick: () => this.toggleTheme()
    });

    header.appendChild(leftSection);
    header.appendChild(themeButton);

    return header;
  }

  private createToolTabs(): HTMLElement {
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'border-b bg-muted/10';

    const tabs = document.createElement('div');
    tabs.className = 'flex items-center justify-around';

    const tools: { tool: Tool; icon: string; label: string }[] = [
      { tool: 'notes', icon: icons.notes, label: 'Notes' },
      { tool: 'screenshots', icon: icons.camera, label: 'Screenshots' },
      { tool: 'transcription', icon: icons.mic, label: 'Transcribe' },
      { tool: 'summary', icon: icons.sparkles, label: 'Summary' }
    ];

    tools.forEach(({ tool, icon, label }) => {
      const tab = document.createElement('button');
      tab.className = cn(
        'flex flex-col items-center gap-1 px-4 py-3 flex-1 transition-colors hover:bg-accent',
        this.currentTool === tool && 'border-b-2 border-primary bg-accent'
      );

      const iconEl = createIcon(icon, 'w-5 h-5');
      const labelEl = document.createElement('span');
      labelEl.className = 'text-xs font-medium';
      labelEl.textContent = label;

      tab.appendChild(iconEl);
      tab.appendChild(labelEl);

      tab.addEventListener('click', () => {
        this.currentTool = tool;
        this.render();
      });

      tabs.appendChild(tab);
    });

    tabsContainer.appendChild(tabs);
    return tabsContainer;
  }

  private createNotesView(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'space-y-4';

    // Page context info
    const pageInfo = document.createElement('div');
    pageInfo.className = 'bg-muted/50 p-3 rounded-lg text-xs';
    const pageInfoText = document.createElement('p');
    pageInfoText.className = 'text-muted-foreground';
    pageInfoText.innerHTML = `<strong>Current page:</strong> ${extractDomain(this.tabInfo.url)}`;
    pageInfo.appendChild(pageInfoText);
    container.appendChild(pageInfo);

    // New note form
    const form = document.createElement('div');
    form.className = 'space-y-3';

    const titleInput = createInput({
      placeholder: 'Note title...',
      className: 'w-full'
    });
    titleInput.id = 'note-title';

    const contentTextarea = createTextarea({
      placeholder: 'Write your note here... (Markdown supported)',
      rows: 6,
      className: 'w-full'
    });
    contentTextarea.id = 'note-content';

    const saveButton = createButton({
      variant: 'default',
      className: 'w-full',
      children: 'Save Note for This Page',
      onClick: async () => {
        const title = titleInput.value.trim();
        const content = contentTextarea.value.trim();

        if (!title || !content) {
          alert('Please fill in both title and content');
          return;
        }

        saveButton.disabled = true;
        saveButton.textContent = 'Saving...';

        try {
          await notesModule.createNote(title, content);
          titleInput.value = '';
          contentTextarea.value = '';
          this.render();
        } catch (error) {
          alert('Failed to save note: ' + (error as Error).message);
        } finally {
          saveButton.disabled = false;
          saveButton.textContent = 'Save Note for This Page';
        }
      }
    });

    form.appendChild(titleInput);
    form.appendChild(contentTextarea);
    form.appendChild(saveButton);

    container.appendChild(form);

    // Notes sections
    const notesContainer = document.createElement('div');
    notesContainer.className = 'space-y-4';

    Promise.all([
      notesModule.getNotesForCurrentPage(),
      notesModule.getAllNotes()
    ]).then(([currentPageNotes, allNotes]) => {
      // Notes for current page
      if (currentPageNotes.length > 0) {
        const currentSection = document.createElement('div');
        currentSection.className = 'space-y-2';

        const currentHeader = document.createElement('h3');
        currentHeader.className = 'text-sm font-semibold text-primary flex items-center gap-2';
        currentHeader.innerHTML = `<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/></svg> Notes for this page (${currentPageNotes.length})`;
        currentSection.appendChild(currentHeader);

        currentPageNotes.forEach(note => {
          currentSection.appendChild(this.createNoteCard(note, true));
        });

        notesContainer.appendChild(currentSection);
      }

      // Other notes
      const otherNotes = allNotes.filter(note => note.url !== this.tabInfo.url);
      if (otherNotes.length > 0) {
        const otherSection = document.createElement('div');
        otherSection.className = 'space-y-2';

        const otherHeader = document.createElement('h3');
        otherHeader.className = 'text-sm font-semibold text-muted-foreground flex items-center gap-2';
        otherHeader.innerHTML = `<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0h8v12H6V4z" clip-rule="evenodd"/></svg> Other notes (${otherNotes.length})`;
        otherSection.appendChild(otherHeader);

        otherNotes.slice(0, 5).forEach(note => {
          otherSection.appendChild(this.createNoteCard(note, false));
        });

        if (otherNotes.length > 5) {
          const moreInfo = document.createElement('p');
          moreInfo.className = 'text-xs text-muted-foreground text-center py-2';
          moreInfo.textContent = `+ ${otherNotes.length - 5} more notes`;
          otherSection.appendChild(moreInfo);
        }

        notesContainer.appendChild(otherSection);
      }

      // Empty state
      if (allNotes.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'text-sm text-muted-foreground text-center py-8';
        empty.textContent = 'No notes yet. Create your first note!';
        notesContainer.appendChild(empty);
      }
    });

    container.appendChild(notesContainer);
    return container;
  }

  private createNoteCard(note: Note, isCurrentPage: boolean = false): HTMLElement {
    const card = createCard({ className: isCurrentPage ? 'p-4 border-primary/50' : 'p-4' });

    const header = document.createElement('div');
    header.className = 'flex items-start justify-between gap-2 mb-2';

    const titleContainer = document.createElement('div');
    titleContainer.className = 'flex-1';

    const titleEl = document.createElement('h3');
    titleEl.className = 'font-semibold text-sm';
    titleEl.textContent = note.title;
    titleContainer.appendChild(titleEl);

    // Show domain for notes from other pages
    if (!isCurrentPage) {
      const domainEl = document.createElement('p');
      domainEl.className = 'text-xs text-muted-foreground mt-1 flex items-center gap-1';
      domainEl.innerHTML = `<svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clip-rule="evenodd"/></svg> ${extractDomain(note.url)}`;
      titleContainer.appendChild(domainEl);
    }

    const deleteBtn = createButton({
      variant: 'ghost',
      size: 'icon',
      className: 'h-8 w-8 text-destructive hover:text-destructive',
      children: createIcon(icons.trash, 'w-4 h-4'),
      onClick: async () => {
        if (confirm('Delete this note?')) {
          await notesModule.deleteNote(note.id);
          this.render();
        }
      }
    });

    header.appendChild(titleContainer);
    header.appendChild(deleteBtn);

    const content = document.createElement('div');
    content.className = 'text-sm text-muted-foreground mb-2 line-clamp-3';
    content.innerHTML = notesModule.markdownToHtml(note.content);

    const meta = document.createElement('div');
    meta.className = 'text-xs text-muted-foreground';
    meta.textContent = formatDate(note.timestamp);

    card.appendChild(header);
    card.appendChild(content);
    card.appendChild(meta);

    return card;
  }

  private createScreenshotsView(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'space-y-4';

    // Screenshot buttons
    const buttons = document.createElement('div');
    buttons.className = 'grid grid-cols-2 gap-2';

    const fullPageBtn = createButton({
      variant: 'default',
      className: 'w-full',
      children: [createIcon(icons.camera, 'w-4 h-4 mr-2'), document.createTextNode('Full Page')],
      onClick: async () => {
        fullPageBtn.disabled = true;
        try {
          await screenshotModule.captureFullPage();
          this.render();
        } catch (error) {
          alert('Screenshot failed: ' + (error as Error).message);
        } finally {
          fullPageBtn.disabled = false;
        }
      }
    });

    const areaBtn = createButton({
      variant: 'secondary',
      className: 'w-full',
      children: [createIcon(icons.image, 'w-4 h-4 mr-2'), document.createTextNode('Select Area')],
      onClick: async () => {
        try {
          await screenshotModule.captureArea();
        } catch (error) {
          alert('Screenshot failed: ' + (error as Error).message);
        }
      }
    });

    buttons.appendChild(fullPageBtn);
    buttons.appendChild(areaBtn);
    container.appendChild(buttons);

    // Screenshots list
    const listContainer = document.createElement('div');
    listContainer.className = 'space-y-2';

    screenshotModule.getAllScreenshots().then(screenshots => {
      if (screenshots.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'text-sm text-muted-foreground text-center py-8';
        empty.textContent = 'No screenshots yet. Take your first screenshot!';
        listContainer.appendChild(empty);
      } else {
        screenshots.forEach(screenshot => {
          listContainer.appendChild(this.createScreenshotCard(screenshot));
        });
      }
    });

    container.appendChild(listContainer);
    return container;
  }

  private createScreenshotCard(screenshot: Screenshot): HTMLElement {
    const card = createCard({ className: 'p-3' });

    const img = document.createElement('img');
    img.src = screenshot.dataUrl;
    img.className = 'w-full rounded mb-2 cursor-pointer hover:opacity-90 transition-opacity';
    img.alt = screenshot.title;
    img.addEventListener('click', () => {
      window.open(screenshot.dataUrl, '_blank');
    });

    const actions = document.createElement('div');
    actions.className = 'flex items-center justify-between gap-2';

    const meta = document.createElement('div');
    meta.className = 'text-xs text-muted-foreground flex-1';
    meta.textContent = formatDate(screenshot.timestamp);

    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'flex gap-1';

    const downloadBtn = createButton({
      variant: 'ghost',
      size: 'icon',
      className: 'h-8 w-8',
      children: createIcon(icons.download, 'w-4 h-4'),
      onClick: () => screenshotModule.downloadScreenshot(screenshot)
    });

    const deleteBtn = createButton({
      variant: 'ghost',
      size: 'icon',
      className: 'h-8 w-8 text-destructive',
      children: createIcon(icons.trash, 'w-4 h-4'),
      onClick: async () => {
        if (confirm('Delete this screenshot?')) {
          await screenshotModule.deleteScreenshot(screenshot.id);
          this.render();
        }
      }
    });

    buttonsContainer.appendChild(downloadBtn);
    buttonsContainer.appendChild(deleteBtn);

    actions.appendChild(meta);
    actions.appendChild(buttonsContainer);

    card.appendChild(img);
    card.appendChild(actions);

    return card;
  }

  private createTranscriptionView(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'space-y-4';

    if (!transcriptionModule.transcriptionService.isAvailable()) {
      const warning = document.createElement('div');
      warning.className = 'bg-destructive/10 text-destructive p-4 rounded-lg text-sm';
      warning.textContent = 'Web Speech API is not available in your browser.';
      container.appendChild(warning);
      return container;
    }

    // Transcription controls
    const controls = document.createElement('div');
    controls.className = 'space-y-3';

    const liveTextContainer = document.createElement('div');
    liveTextContainer.className = 'bg-muted p-4 rounded-lg min-h-[100px] text-sm hidden';
    liveTextContainer.id = 'live-transcription';

    const startBtn = createButton({
      variant: 'default',
      className: 'w-full',
      children: [createIcon(icons.mic, 'w-4 h-4 mr-2'), document.createTextNode('Start Transcription')],
      onClick: async () => {
        try {
          liveTextContainer.textContent = 'Listening...';
          liveTextContainer.classList.remove('hidden');

          await transcriptionModule.startTranscription('en-US', (text) => {
            liveTextContainer.textContent = text || 'Listening...';
          });

          startBtn.style.display = 'none';
          stopBtn.style.display = 'block';
        } catch (error) {
          alert('Failed to start transcription: ' + (error as Error).message);
          liveTextContainer.classList.add('hidden');
        }
      }
    });

    const stopBtn = createButton({
      variant: 'destructive',
      className: 'w-full',
      children: [createIcon(icons.x, 'w-4 h-4 mr-2'), document.createTextNode('Stop Transcription')],
      onClick: async () => {
        try {
          await transcriptionModule.stopTranscription();
          startBtn.style.display = 'block';
          stopBtn.style.display = 'none';
          liveTextContainer.classList.add('hidden');
          this.render();
        } catch (error) {
          alert('Failed to stop transcription: ' + (error as Error).message);
        }
      }
    });
    stopBtn.style.display = 'none';

    controls.appendChild(liveTextContainer);
    controls.appendChild(startBtn);
    controls.appendChild(stopBtn);
    container.appendChild(controls);

    // Transcriptions list
    const listContainer = document.createElement('div');
    listContainer.className = 'space-y-2';

    transcriptionModule.getAllTranscriptions().then(transcriptions => {
      if (transcriptions.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'text-sm text-muted-foreground text-center py-8';
        empty.textContent = 'No transcriptions yet. Start your first transcription!';
        listContainer.appendChild(empty);
      } else {
        transcriptions.forEach(transcription => {
          listContainer.appendChild(this.createTranscriptionCard(transcription));
        });
      }
    });

    container.appendChild(listContainer);
    return container;
  }

  private createTranscriptionCard(transcription: Transcription): HTMLElement {
    const card = createCard({ className: 'p-4' });

    const header = document.createElement('div');
    header.className = 'flex items-start justify-between gap-2 mb-2';

    const titleEl = document.createElement('h3');
    titleEl.className = 'font-semibold text-sm flex-1';
    titleEl.textContent = transcription.title;

    const deleteBtn = createButton({
      variant: 'ghost',
      size: 'icon',
      className: 'h-8 w-8 text-destructive',
      children: createIcon(icons.trash, 'w-4 h-4'),
      onClick: async () => {
        if (confirm('Delete this transcription?')) {
          await transcriptionModule.deleteTranscription(transcription.id);
          this.render();
        }
      }
    });

    header.appendChild(titleEl);
    header.appendChild(deleteBtn);

    const content = document.createElement('div');
    content.className = 'text-sm text-muted-foreground mb-2 max-h-[100px] overflow-y-auto';
    content.textContent = transcription.text || 'No text transcribed';

    const meta = document.createElement('div');
    meta.className = 'text-xs text-muted-foreground';
    meta.textContent = formatDate(transcription.timestamp);

    card.appendChild(header);
    card.appendChild(content);
    card.appendChild(meta);

    return card;
  }

  private createSummaryView(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'space-y-4';

    // Generate summary button
    const generateBtn = createButton({
      variant: 'default',
      className: 'w-full',
      children: [createIcon(icons.sparkles, 'w-4 h-4 mr-2'), document.createTextNode('Generate Summary')],
      onClick: async () => {
        generateBtn.disabled = true;
        generateBtn.textContent = 'Generating...';

        try {
          await aiModule.generatePageSummary();
          this.render();
        } catch (error) {
          alert('Failed to generate summary: ' + (error as Error).message);
          generateBtn.disabled = false;
          generateBtn.textContent = 'Generate Summary';
        }
      }
    });

    container.appendChild(generateBtn);

    // Current page summary
    aiModule.getSummaryForCurrentPage().then(summary => {
      if (summary) {
        const card = this.createSummaryCard(summary, true);
        container.appendChild(card);
      }
    });

    // All summaries
    const listContainer = document.createElement('div');
    listContainer.className = 'space-y-2 mt-4';

    const listTitle = document.createElement('h3');
    listTitle.className = 'text-sm font-semibold mb-2';
    listTitle.textContent = 'Recent Summaries';
    container.appendChild(listTitle);

    aiModule.getAllSummaries().then(summaries => {
      if (summaries.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'text-sm text-muted-foreground text-center py-8';
        empty.textContent = 'No summaries yet. Generate your first summary!';
        listContainer.appendChild(empty);
      } else {
        summaries.slice(0, 10).forEach(summary => {
          if (summary.url !== this.tabInfo.url) {
            listContainer.appendChild(this.createSummaryCard(summary, false));
          }
        });
      }
    });

    container.appendChild(listContainer);
    return container;
  }

  private createSummaryCard(summary: PageSummary, isCurrentPage: boolean): HTMLElement {
    const card = createCard({ className: 'p-4' });

    const header = document.createElement('div');
    header.className = 'flex items-start justify-between gap-2 mb-2';

    const titleEl = document.createElement('h3');
    titleEl.className = 'font-semibold text-sm flex-1';
    titleEl.textContent = summary.title;
    if (isCurrentPage) {
      const badge = document.createElement('span');
      badge.className = 'ml-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded';
      badge.textContent = 'Current Page';
      titleEl.appendChild(badge);
    }

    const deleteBtn = createButton({
      variant: 'ghost',
      size: 'icon',
      className: 'h-8 w-8 text-destructive',
      children: createIcon(icons.trash, 'w-4 h-4'),
      onClick: async () => {
        if (confirm('Delete this summary?')) {
          await aiModule.deleteSummary(summary.id);
          this.render();
        }
      }
    });

    header.appendChild(titleEl);
    header.appendChild(deleteBtn);

    const content = document.createElement('div');
    content.className = 'text-sm text-muted-foreground mb-2';
    content.textContent = summary.summary;

    const meta = document.createElement('div');
    meta.className = 'text-xs text-muted-foreground';
    meta.textContent = formatDate(summary.timestamp);

    card.appendChild(header);
    card.appendChild(content);
    card.appendChild(meta);

    return card;
  }
}

// Initialize app
new KungfuApp();
