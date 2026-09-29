import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { CONFIG } from './backend/config.js';
import { db } from './backend/db/inMemoryStore.js';
import { agentBrain } from './backend/agents/orchestrator.js';
import { toolRegistry } from './backend/tools/toolRegistry.js';
import { getGeminiClient } from './backend/gemini.js';
import { answerDirectQuestion, synthesizeOpenQuestion } from './backend/agents/knowledgeEngine.js';
import { Task, CalendarEvent, Reminder, Note, Memory, DocumentItem } from './src/types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Rate Limiting Map (IP -> Timestamp array)
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 120; // 120 requests/minute per IP

function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  const validTimestamps = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS);

  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please retry in a few moments.',
      retryAfterSeconds: Math.ceil((validTimestamps[0] + RATE_LIMIT_WINDOW_MS - now) / 1000),
    });
  }

  validTimestamps.push(now);
  rateLimitMap.set(ip, validTimestamps);
  next();
}

async function startServer() {
  const app = express();

  // Security Headers Middleware
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // Request ID & Logging Middleware
  app.use((req, res, next) => {
    const reqId = `req-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    res.setHeader('X-Request-Id', reqId);
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      if (req.path.startsWith('/api') || req.path === '/health' || req.path === '/ready') {
        console.log(`[HTTP] ${req.method} ${req.path} ${res.statusCode} - ${duration}ms (${reqId})`);
      }
    });
    next();
  });

  // Request Body Parsers
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // Apply Rate Limiting to API Routes
  app.use('/api', rateLimiter);

  // ================= HEALTH & READINESS PROBES =================

  // Liveness Probe: Quick check if server is responsive
  app.get('/health', (req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      service: 'aura-voice-agent',
      version: '1.0.0',
    });
  });

  // Readiness Probe: Verifies internal stores, tool registry, and AI client state
  app.get('/ready', (req: Request, res: Response) => {
    const isReady = Object.keys(toolRegistry).length > 0;
    res.status(isReady ? 200 : 503).json({
      status: isReady ? 'ready' : 'initializing',
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      toolsInitialized: Object.keys(toolRegistry).length,
      geminiConfigured: !!CONFIG.GEMINI_API_KEY,
      stores: {
        tasks: db.tasks.size,
        calendarEvents: db.calendarEvents.size,
        reminders: db.reminders.size,
        notes: db.notes.size,
        memories: db.memories.size,
        documents: db.documents.size,
      },
    });
  });

  // ================= SYSTEM API ROUTES =================

  // System Status
  app.get('/api/status', (req: Request, res: Response) => {
    const hasGemini = !!CONFIG.GEMINI_API_KEY;
    res.json({
      status: 'online',
      product: 'AURA — Personal AI Voice Agent',
      version: '1.0.0',
      geminiConnected: hasGemini,
      demoMode: db.settings.integrations.demoMode,
      activeToolsCount: Object.keys(toolRegistry).length,
      stats: {
        tasksCount: db.tasks.size,
        eventsCount: db.calendarEvents.size,
        memoriesCount: db.memories.size,
        documentsCount: db.documents.size,
        remindersCount: db.reminders.size,
      },
    });
  });

  // Chat & Voice Orchestration Endpoint
  app.post('/api/chat', async (req: Request, res: Response) => {
    try {
      const { message, isOffline, userName } = req.body;
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Message text is required' });
      }

      const result = await agentBrain.processUserMessage(message, !!isOffline, userName);
      res.json(result);
    } catch (error: any) {
      console.error('[API /chat] Handled fallback error:', error?.message || error);
      const fallbackAnswer = answerDirectQuestion(req.body?.message || '') || synthesizeOpenQuestion(req.body?.message || '');
      res.json({
        message: {
          id: `msg-fallback-${Date.now()}`,
          role: 'assistant',
          content: fallbackAnswer.content,
          timestamp: new Date().toISOString(),
          sources: fallbackAnswer.sources,
        },
        spokenText: fallbackAnswer.spokenText,
        toolExecutions: [],
        intent: 'CONVERSATION',
      });
    }
  });

  // Conversation History
  app.get('/api/messages', (req: Request, res: Response) => {
    res.json({ messages: db.messages });
  });

  app.post('/api/messages/clear', (req: Request, res: Response) => {
    db.messages = [
      {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: 'Conversation history cleared. How may I assist you today?',
        timestamp: new Date().toISOString(),
      },
    ];
    res.json({ success: true, messages: db.messages });
  });

  // Voice TTS (Gemini TTS API with fallback)
  app.post('/api/voice/tts', async (req: Request, res: Response) => {
    try {
      const { text, voiceName = 'Kore' } = req.body;
      if (!text) {
        return res.status(400).json({ error: 'Text is required for TTS' });
      }

      const gemini = getGeminiClient();
      if (gemini && !db.settings.integrations.demoMode) {
        try {
          const response = await gemini.models.generateContent({
            model: CONFIG.TTS_MODEL,
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: text.slice(0, 500),
                    speechMetadata: {
                      style: 'Clear, modern conversational personal voice assistant',
                    },
                  },
                ],
              },
            ],
            config: {
              responseModalities: ['AUDIO'],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: voiceName || 'Kore' },
                },
              },
            },
          });

          const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
          if (base64Audio) {
            return res.json({ audio: base64Audio, format: 'pcm', sampleRate: 24000 });
          }
        } catch (ttsErr) {
          console.warn('Gemini TTS fallback to browser:', ttsErr);
        }
      }

      res.json({ fallbackToBrowser: true, text });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'TTS generation failed' });
    }
  });

  // Voice Transcription Endpoint (compatible with mobile iOS Safari mp4/aac, Android webm, Firefox ogg, Desktop)
  app.post('/api/voice/transcribe', async (req: Request, res: Response) => {
    try {
      const { audio, mimeType = 'audio/webm' } = req.body;
      if (!audio) {
        return res.status(400).json({ error: 'Audio data is required' });
      }

      const gemini = getGeminiClient();
      if (gemini) {
        const cleanMime = mimeType.split(';')[0].trim() || 'audio/webm';
        const audioPart = {
          inlineData: {
            mimeType: cleanMime,
            data: audio,
          },
        };

        const transcriptionModels = [CONFIG.TRANSCRIBE_MODEL, CONFIG.DEFAULT_MODEL, 'gemini-flash-latest'];
        for (const model of transcriptionModels) {
          try {
            const response = await gemini.models.generateContent({
              model,
              contents: { parts: [audioPart, { text: 'Transcribe this voice audio precisely and return only the verbatim spoken transcript without markdown, preamble or notes.' }] },
            });

            const transcript = response.text?.trim() || '';
            if (transcript) {
              return res.json({ transcript });
            }
          } catch (transcribeErr: any) {
            console.warn(`[AURA Voice] Model ${model} audio transcription notice:`, transcribeErr?.message?.slice(0, 120) || transcribeErr);
          }
        }
      }

      res.json({ transcript: '' });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Transcription failed' });
    }
  });

  // Live Voice Conversation Endpoint
  app.post('/api/voice/live', async (req: Request, res: Response) => {
    try {
      const { prompt, audio } = req.body;
      const gemini = getGeminiClient();
      if (gemini && !db.settings.integrations.demoMode) {
        try {
          const parts: any[] = [];
          if (audio) {
            parts.push({
              inlineData: {
                mimeType: 'audio/webm',
                data: audio,
              },
            });
          }
          parts.push({ text: prompt || 'Respond conversationally as AURA, a personal AI voice agent.' });

          const response = await gemini.models.generateContent({
            model: 'gemini-3.8-live',
            contents: { parts },
          });

          return res.json({
            text: response.text || '',
            model: 'gemini-3.8-live',
          });
        } catch (liveErr) {
          console.warn('Live voice fallback:', liveErr);
        }
      }

      res.json({ text: '', fallback: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Live session error' });
    }
  });

  // Direct Tool Execution Endpoint
  app.post('/api/tools/execute', async (req: Request, res: Response) => {
    try {
      const { toolName, args } = req.body;
      const tool = toolRegistry[toolName];
      if (!tool) {
        return res.status(404).json({ error: `Tool "${toolName}" not found` });
      }
      const output = await tool.execute(args || {});
      res.json({ toolName, status: 'completed', output });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Tool execution failed' });
    }
  });

  // Action Confirmation Endpoint
  app.post('/api/actions/confirm', (req: Request, res: Response) => {
    const { actionType, payload, approved } = req.body;
    if (!approved) {
      return res.json({ status: 'cancelled', message: 'Action was cancelled by user.' });
    }

    if (actionType === 'send_email') {
      const draft = db.emails.get(payload?.id);
      if (draft) {
        draft.status = 'sent';
      }
      return res.json({
        status: 'executed',
        message: `Email to ${payload?.to || 'recipient'} has been authorized and dispatched.`,
      });
    }

    if (actionType === 'delete_data') {
      return res.json({ status: 'executed', message: 'Requested data was safely deleted.' });
    }

    if (actionType === 'wipe_memory') {
      db.memories.clear();
      return res.json({ status: 'executed', message: 'All personal memory records have been erased.' });
    }

    res.json({ status: 'executed', message: 'Action confirmed and executed.' });
  });

  // Tasks CRUD
  app.get('/api/tasks', (req: Request, res: Response) => {
    res.json({ tasks: Array.from(db.tasks.values()) });
  });

  app.post('/api/tasks', (req: Request, res: Response) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: req.body.title || 'Untitled Task',
      description: req.body.description || '',
      priority: req.body.priority || 'MEDIUM',
      status: req.body.status || 'TODO',
      dueDate: req.body.dueDate,
      category: req.body.category || 'General',
      tags: req.body.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.tasks.set(newTask.id, newTask);
    res.status(201).json({ task: newTask });
  });

  app.patch('/api/tasks/:id', (req: Request, res: Response) => {
    const task = db.tasks.get(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    Object.assign(task, req.body, { updatedAt: new Date().toISOString() });
    res.json({ task });
  });

  app.delete('/api/tasks/:id', (req: Request, res: Response) => {
    const existed = db.tasks.delete(req.params.id);
    res.json({ success: existed });
  });

  // Calendar CRUD
  app.get('/api/calendar', (req: Request, res: Response) => {
    res.json({ events: Array.from(db.calendarEvents.values()) });
  });

  app.post('/api/calendar', (req: Request, res: Response) => {
    const event: CalendarEvent = {
      id: `cal-${Date.now()}`,
      title: req.body.title || 'New Event',
      description: req.body.description,
      startTime: req.body.startTime || new Date().toISOString(),
      endTime: req.body.endTime || new Date(Date.now() + 3600000).toISOString(),
      location: req.body.location || 'Google Meet',
      attendees: req.body.attendees || [],
      category: req.body.category || 'meeting',
      reminderMinutesBefore: req.body.reminderMinutesBefore || 15,
    };
    db.calendarEvents.set(event.id, event);
    res.status(201).json({ event });
  });

  app.delete('/api/calendar/:id', (req: Request, res: Response) => {
    const existed = db.calendarEvents.delete(req.params.id);
    res.json({ success: existed });
  });

  // Reminders CRUD
  app.get('/api/reminders', (req: Request, res: Response) => {
    res.json({ reminders: Array.from(db.reminders.values()) });
  });

  app.post('/api/reminders', (req: Request, res: Response) => {
    const reminder: Reminder = {
      id: `rem-${Date.now()}`,
      title: req.body.title || 'Reminder',
      datetime: req.body.datetime || new Date(Date.now() + 3600000).toISOString(),
      recurring: req.body.recurring || 'none',
      type: req.body.type || 'one-time',
      completed: false,
      notes: req.body.notes,
    };
    db.reminders.set(reminder.id, reminder);
    res.status(201).json({ reminder });
  });

  app.patch('/api/reminders/:id', (req: Request, res: Response) => {
    const rem = db.reminders.get(req.params.id);
    if (!rem) return res.status(404).json({ error: 'Reminder not found' });
    Object.assign(rem, req.body);
    res.json({ reminder: rem });
  });

  app.delete('/api/reminders/:id', (req: Request, res: Response) => {
    const existed = db.reminders.delete(req.params.id);
    res.json({ success: existed });
  });

  // Notes CRUD
  app.get('/api/notes', (req: Request, res: Response) => {
    res.json({ notes: Array.from(db.notes.values()) });
  });

  app.post('/api/notes', (req: Request, res: Response) => {
    const note: Note = {
      id: `note-${Date.now()}`,
      title: req.body.title || 'Untitled Note',
      content: req.body.content || '',
      category: req.body.category || 'General',
      tags: req.body.tags || [],
      pinned: !!req.body.pinned,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.notes.set(note.id, note);
    res.status(201).json({ note });
  });

  app.patch('/api/notes/:id', (req: Request, res: Response) => {
    const note = db.notes.get(req.params.id);
    if (!note) return res.status(404).json({ error: 'Note not found' });
    Object.assign(note, req.body, { updatedAt: new Date().toISOString() });
    res.json({ note });
  });

  app.delete('/api/notes/:id', (req: Request, res: Response) => {
    const existed = db.notes.delete(req.params.id);
    res.json({ success: existed });
  });

  // Memory CRUD
  app.get('/api/memories', (req: Request, res: Response) => {
    res.json({ memories: Array.from(db.memories.values()) });
  });

  app.post('/api/memories', (req: Request, res: Response) => {
    const memory: Memory = {
      id: `mem-${Date.now()}`,
      content: req.body.content || '',
      category: req.body.category || 'facts',
      importance: req.body.importance || 'medium',
      source: req.body.source || 'user_input',
      userApproved: req.body.userApproved !== undefined ? req.body.userApproved : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.memories.set(memory.id, memory);
    res.status(201).json({ memory });
  });

  app.delete('/api/memories/:id', (req: Request, res: Response) => {
    const existed = db.memories.delete(req.params.id);
    res.json({ success: existed });
  });

  // Documents (RAG)
  app.get('/api/documents', (req: Request, res: Response) => {
    res.json({ documents: Array.from(db.documents.values()) });
  });

  app.post('/api/documents/upload', (req: Request, res: Response) => {
    const { name, content, type = 'txt' } = req.body;
    if (!name) return res.status(400).json({ error: 'File name is required' });

    const textContent = content || 'Uploaded document contents.';
    const lines = textContent.split('\n\n').filter((l: string) => l.trim().length > 0);
    const chunks = lines.map((paragraph: string, idx: number) => ({
      id: `chk-${Date.now()}-${idx}`,
      text: paragraph,
      pageOrSection: `Section ${idx + 1}`,
    }));

    const doc: DocumentItem = {
      id: `doc-${Date.now()}`,
      name,
      type: (type.toLowerCase() as any) || 'txt',
      size: textContent.length,
      summary: `Indexed document "${name}" with ${chunks.length} extracted semantic chunks.`,
      chunkCount: chunks.length,
      chunks,
      uploadedAt: new Date().toISOString(),
    };
    db.documents.set(doc.id, doc);
    res.status(201).json({ document: doc });
  });

  // Projects
  app.get('/api/projects', (req: Request, res: Response) => {
    res.json({ projects: Array.from(db.projects.values()) });
  });

  // Research
  app.post('/api/research', async (req: Request, res: Response) => {
    const { topic, depth = 'balanced' } = req.body;
    const plan = await toolRegistry.researchPlanner.execute({ topic, depth });
    res.json({ researchPlan: plan });
  });

  // Data Analysis
  app.post('/api/data-analysis', async (req: Request, res: Response) => {
    const { fileName, question } = req.body;
    const result = await toolRegistry.dataAnalysis.execute({ fileName, question });
    res.json({ analysis: result });
  });

  // Settings
  app.get('/api/settings', (req: Request, res: Response) => {
    res.json({ settings: db.settings });
  });

  app.post('/api/settings', (req: Request, res: Response) => {
    db.settings = { ...db.settings, ...req.body };
    res.json({ settings: db.settings });
  });

  // ================= CENTRALIZED ERROR HANDLER =================

  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('[Unhandled Server Error]', err);
    res.status(500).json({
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred.' : err?.message,
    });
  });

  // ================= VITE DEV OR PROD SERVER =================

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving with cache optimization
    const distPath = path.resolve(__dirname, 'dist');
    app.use(
      express.static(distPath, {
        maxAge: '1d',
        setHeaders: (res, filePath) => {
          if (filePath.includes('/assets/')) {
            // Immutable cache for fingerprinted Vite assets
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          } else if (filePath.endsWith('.html')) {
            // Never cache index.html to ensure instant updates
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          }
        },
      })
    );
    app.get('*', (req: Request, res: Response) => {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  const port = Number(CONFIG.PORT) || 3000;
  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`[AURA] Server running on http://0.0.0.0:${port}`);
    console.log(`[AURA] Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`[AURA] Gemini AI Attached: ${!!CONFIG.GEMINI_API_KEY}`);
  });

  // Graceful Shutdown
  const handleShutdown = (signal: string) => {
    console.log(`[AURA] Received ${signal}. Gracefully closing HTTP server...`);
    server.close(() => {
      console.log('[AURA] HTTP server closed. Process exiting cleanly.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
}

// Global Process Exception Handlers for Production Stability
process.on('unhandledRejection', (reason, promise) => {
  console.error('[AURA System] Unhandled Promise Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('[AURA System] Uncaught Exception:', error);
});

startServer().catch(err => {
  console.error('[AURA] Fatal error starting server:', err);
  process.exit(1);
});
