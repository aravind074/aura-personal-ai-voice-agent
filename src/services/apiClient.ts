import {
  Message,
  Task,
  CalendarEvent,
  Reminder,
  Note,
  Memory,
  DocumentItem,
  Project,
  Settings,
  ResearchPlan,
  DataAnalysisResult,
  ToolExecution
} from '../types/index.js';

class ApiClient {
  async getStatus() {
    const res = await fetch('/api/status');
    return res.json();
  }

  async sendChatMessage(message: string, voiceMode = false, isOffline = false, userName?: string): Promise<{
    message: Message;
    spokenText: string;
    toolExecutions: ToolExecution[];
    intent: string;
  }> {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, voiceMode, isOffline, userName }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to send message');
    }
    return res.json();
  }

  async getMessages(): Promise<{ messages: Message[] }> {
    const res = await fetch('/api/messages');
    return res.json();
  }

  async clearMessages(): Promise<{ success: boolean; messages: Message[] }> {
    const res = await fetch('/api/messages/clear', { method: 'POST' });
    return res.json();
  }

  async getTTSAudio(text: string, voiceName?: string): Promise<{ audio?: string; format?: string; fallbackToBrowser?: boolean; text?: string }> {
    const res = await fetch('/api/voice/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voiceName }),
    });
    return res.json();
  }

  async transcribeAudio(audio: string, mimeType = 'audio/webm'): Promise<{ transcript: string }> {
    const res = await fetch('/api/voice/transcribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audio, mimeType }),
    });
    return res.json();
  }

  async liveConverse(prompt: string, audio?: string): Promise<{ text: string; model?: string }> {
    const res = await fetch('/api/voice/live', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, audio }),
    });
    return res.json();
  }

  async confirmAction(actionType: string, payload: any, approved: boolean): Promise<{ status: string; message: string }> {
    const res = await fetch('/api/actions/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actionType, payload, approved }),
    });
    return res.json();
  }

  // Tasks
  async getTasks(): Promise<{ tasks: Task[] }> {
    const res = await fetch('/api/tasks');
    return res.json();
  }

  async createTask(task: Partial<Task>): Promise<{ task: Task }> {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    });
    return res.json();
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<{ task: Task }> {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return res.json();
  }

  async deleteTask(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    return res.json();
  }

  // Calendar
  async getCalendarEvents(): Promise<{ events: CalendarEvent[] }> {
    const res = await fetch('/api/calendar');
    return res.json();
  }

  async createCalendarEvent(event: Partial<CalendarEvent>): Promise<{ event: CalendarEvent }> {
    const res = await fetch('/api/calendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });
    return res.json();
  }

  async deleteCalendarEvent(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/calendar/${id}`, { method: 'DELETE' });
    return res.json();
  }

  // Reminders
  async getReminders(): Promise<{ reminders: Reminder[] }> {
    const res = await fetch('/api/reminders');
    return res.json();
  }

  async createReminder(reminder: Partial<Reminder>): Promise<{ reminder: Reminder }> {
    const res = await fetch('/api/reminders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reminder),
    });
    return res.json();
  }

  async updateReminder(id: string, updates: Partial<Reminder>): Promise<{ reminder: Reminder }> {
    const res = await fetch(`/api/reminders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return res.json();
  }

  async deleteReminder(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/reminders/${id}`, { method: 'DELETE' });
    return res.json();
  }

  // Notes
  async getNotes(): Promise<{ notes: Note[] }> {
    const res = await fetch('/api/notes');
    return res.json();
  }

  async createNote(note: Partial<Note>): Promise<{ note: Note }> {
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(note),
    });
    return res.json();
  }

  async updateNote(id: string, updates: Partial<Note>): Promise<{ note: Note }> {
    const res = await fetch(`/api/notes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return res.json();
  }

  async deleteNote(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/notes/${id}`, { method: 'DELETE' });
    return res.json();
  }

  // Memories
  async getMemories(): Promise<{ memories: Memory[] }> {
    const res = await fetch('/api/memories');
    return res.json();
  }

  async createMemory(memory: Partial<Memory>): Promise<{ memory: Memory }> {
    const res = await fetch('/api/memories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(memory),
    });
    return res.json();
  }

  async deleteMemory(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/memories/${id}`, { method: 'DELETE' });
    return res.json();
  }

  // Documents
  async getDocuments(): Promise<{ documents: DocumentItem[] }> {
    const res = await fetch('/api/documents');
    return res.json();
  }

  async uploadDocument(doc: { name: string; content: string; type: string }): Promise<{ document: DocumentItem }> {
    const res = await fetch('/api/documents/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doc),
    });
    return res.json();
  }

  // Projects
  async getProjects(): Promise<{ projects: Project[] }> {
    const res = await fetch('/api/projects');
    return res.json();
  }

  // Research
  async startResearch(topic: string, depth = 'balanced'): Promise<{ researchPlan: ResearchPlan }> {
    const res = await fetch('/api/research', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, depth }),
    });
    return res.json();
  }

  // Data Analysis
  async analyzeData(fileName: string, question?: string): Promise<{ analysis: DataAnalysisResult }> {
    const res = await fetch('/api/data-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName, question }),
    });
    return res.json();
  }

  // Settings
  async getSettings(): Promise<{ settings: Settings }> {
    const res = await fetch('/api/settings');
    return res.json();
  }

  async updateSettings(settings: Partial<Settings>): Promise<{ settings: Settings }> {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    return res.json();
  }
}

export const api = new ApiClient();
