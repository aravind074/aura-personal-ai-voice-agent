export type AgentStatus = 
  | 'IDLE'
  | 'LISTENING' 
  | 'THINKING' 
  | 'SEARCHING' 
  | 'USING_TOOL' 
  | 'GENERATING' 
  | 'SPEAKING' 
  | 'COMPLETED' 
  | 'ERROR';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'BLOCKED' | 'COMPLETED' | 'CANCELLED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string;
  category: string;
  tags: string[];
  projectId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  location?: string;
  attendees?: string[];
  reminderMinutesBefore?: number;
  category?: 'work' | 'personal' | 'meeting' | 'health' | 'learning';
}

export interface Reminder {
  id: string;
  title: string;
  datetime: string;
  recurring?: 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';
  recurringDays?: string[];
  type: 'one-time' | 'recurring' | 'deadline' | 'task';
  completed: boolean;
  taskId?: string;
  notes?: string;
  triggered?: boolean;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export type MemoryCategory = 'personal' | 'work' | 'preferences' | 'goals' | 'contacts' | 'facts';

export interface Memory {
  id: string;
  content: string;
  category: MemoryCategory;
  importance: 'low' | 'medium' | 'high';
  source: 'user_input' | 'agent_inferred' | 'conversation';
  userApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  goals: string[];
  tasks: Task[];
  notes: string[];
  files: string[];
  deadline?: string;
  progress: number; // 0 to 100
  activityHistory: {
    id: string;
    timestamp: string;
    action: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface DocumentChunk {
  id: string;
  text: string;
  pageOrSection?: string;
  metadata?: Record<string, any>;
}

export interface DocumentItem {
  id: string;
  name: string;
  type: 'pdf' | 'docx' | 'txt' | 'csv' | 'xlsx' | 'md' | 'image';
  size: number;
  summary?: string;
  chunkCount: number;
  chunks?: DocumentChunk[];
  uploadedAt: string;
}

export interface EmailDraft {
  id: string;
  to: string;
  subject: string;
  body: string;
  status: 'draft' | 'ready_to_send' | 'sent';
  requiresConfirmation: boolean;
  createdAt: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  company?: string;
  notes?: string;
}

export interface ToolExecution {
  id: string;
  toolName: string;
  actionDescription: string;
  input: Record<string, any>;
  output?: any;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'requires_confirmation';
  error?: string;
  timestamp: string;
}

export interface SourceReference {
  title: string;
  url?: string;
  snippet?: string;
  date?: string;
  sourceType?: 'web' | 'document' | 'memory' | 'calendar' | 'task';
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  toolExecutions?: ToolExecution[];
  sources?: SourceReference[];
  intentDetected?: string;
  spokenAudioUrl?: string;
  requiresActionConfirmation?: {
    actionType: 'send_email' | 'delete_data' | 'cancel_event' | 'wipe_memory';
    title: string;
    details: string;
    payload: any;
  };
}

export interface ResearchPlan {
  id: string;
  topic: string;
  status: 'planning' | 'gathering' | 'analyzing' | 'synthesizing' | 'completed';
  questions: string[];
  sources: { title: string; url: string; credibility: string; excerpt: string; date?: string }[];
  keyFindings: string[];
  comparisonTable?: {
    headers: string[];
    rows: string[][];
  };
  disagreements?: string[];
  summary: string;
  generatedAt: string;
}

export interface DataAnalysisResult {
  fileName: string;
  rowCount: number;
  columnCount: number;
  columns: { name: string; type: 'string' | 'number' | 'date' | 'boolean'; sampleValues: any[]; missingCount: number }[];
  summaryStats: Record<string, { min: number; max: number; mean: number; median: number; stdDev: number }>;
  outliers?: { column: string; value: any; rowIdx: number; reason: string }[];
  correlations?: { col1: string; col2: string; coefficient: number }[];
  chartData?: {
    type: 'bar' | 'line' | 'pie';
    title: string;
    labels: string[];
    datasets: { label: string; data: number[]; color?: string }[];
  }[];
  aiInsights: string[];
}

export interface CodeWorkspaceState {
  activeFile: string;
  files: {
    path: string;
    language: string;
    content: string;
  }[];
  output: string;
  isRunning: boolean;
}

export interface Settings {
  voice: {
    engine: 'gemini-tts' | 'browser-tts';
    voiceName: string;
    rate: number;
    pitch: number;
    volume: number;
    autoListening: boolean;
    pushToTalk: boolean;
    interruptSpeakingOnVoice: boolean;
  };
  ai: {
    model: string;
    temperature: number;
    responseLength: 'concise' | 'balanced' | 'comprehensive';
    webSearchEnabled: boolean;
    thinkingBudget: 'low' | 'normal' | 'high';
  };
  memory: {
    enabled: boolean;
    autoApproveSafeMemories: boolean;
  };
  privacy: {
    saveConversationHistory: boolean;
    localDataOnly: boolean;
  };
  integrations: {
    googleCalendar: boolean;
    gmail: boolean;
    googleDrive: boolean;
    demoMode: boolean;
  };
  appearance: {
    theme: 'dark' | 'light';
    accentColor: 'cyan' | 'indigo' | 'emerald' | 'amber';
  };
}
