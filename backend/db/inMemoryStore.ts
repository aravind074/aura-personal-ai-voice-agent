import {
  Task,
  CalendarEvent,
  Reminder,
  Note,
  Memory,
  Project,
  DocumentItem,
  Contact,
  EmailDraft,
  ResearchPlan,
  Message,
  Settings
} from '../../src/types/index.js';

class InMemoryDatabase {
  tasks: Map<string, Task> = new Map();
  calendarEvents: Map<string, CalendarEvent> = new Map();
  reminders: Map<string, Reminder> = new Map();
  notes: Map<string, Note> = new Map();
  memories: Map<string, Memory> = new Map();
  projects: Map<string, Project> = new Map();
  documents: Map<string, DocumentItem> = new Map();
  contacts: Map<string, Contact> = new Map();
  emails: Map<string, EmailDraft> = new Map();
  researchPlans: Map<string, ResearchPlan> = new Map();
  messages: Message[] = [];
  settings: Settings = {
    voice: {
      engine: 'browser-tts',
      voiceName: 'default',
      rate: 1.05,
      pitch: 1.0,
      volume: 1.0,
      autoListening: true,
      pushToTalk: false,
      interruptSpeakingOnVoice: true,
    },
    ai: {
      model: 'gemini-3.8-flash',
      temperature: 0.7,
      responseLength: 'concise',
      webSearchEnabled: true,
      thinkingBudget: 'normal',
    },
    memory: {
      enabled: true,
      autoApproveSafeMemories: true,
    },
    privacy: {
      saveConversationHistory: true,
      localDataOnly: false,
    },
    integrations: {
      googleCalendar: false,
      gmail: false,
      googleDrive: false,
      demoMode: false,
    },
    appearance: {
      theme: 'dark',
      accentColor: 'cyan',
    },
  };

  constructor() {
    this.seedInitialData();
  }

  seedInitialData() {
    // Start with a clean slate for real personal user content
    this.tasks.clear();
    this.calendarEvents.clear();
    this.reminders.clear();
    this.notes.clear();
    this.memories.clear();
    this.projects.clear();
    this.documents.clear();
    this.contacts.clear();
    this.emails.clear();
    this.researchPlans.clear();

    const now = new Date();
    this.messages = [
      {
        id: 'msg-welcome',
        role: 'assistant',
        content: `👋 Hello! I am **AURA**, your personal AI voice agent.

I can help manage your real calendar, create tasks, set reminders, take notes, upload and search documents, and research topics on the web.

Tap the microphone or type below to get started!`,
        timestamp: now.toISOString(),
      },
    ];
  }
}

export const db = new InMemoryDatabase();
