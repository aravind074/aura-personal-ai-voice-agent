# AURA — Personal AI Voice Agent
> **Your intelligent voice-powered personal assistant**

AURA is a production-grade personal AI voice agent web application built with TypeScript, React, Express, Tailwind CSS, and the `@google/genai` SDK. AURA understands natural language speech, reasons through multi-step tasks, uses specialized tools, retrieves document knowledge via RAG chunking, maintains user-approved long-term memory, and executes authorized workflows.

---

## 🌟 Key Architecture & Capabilities

### 1. Voice-First Experience
- **Real-Time Speech Ingestion**: Web Speech API speech recognition with interim transcription streaming.
- **Dynamic Waveform Visualizer**: Canvas-based real-time 32-band audio spectrum analyzer tracking microphone input and synthesized speech.
- **Central Voice Orb**: Visual pulsing halos and distinct animated state badges:
  `STANDBY` • `LISTENING` • `THINKING` • `SEARCHING` • `USING_TOOL` • `GENERATING` • `SPEAKING` • `ERROR`
- **Instant Interruption**: User can tap the orb or speak to immediately cut off speech playback and take back conversational control.
- **Voice Response Options**:
  - Direct server-side neural text-to-speech with Gemini (`gemini-3.8-flash-lite-tts`).
  - Zero-latency natural browser speech synthesis with voice, pitch, and speed controls.

### 2. The Agent Brain
The agent processes requests through a rigorous 7-stage pipeline:
```
USER SPEECH / TEXT REQUEST
            ↓
     INTENT DETECTION
 (Calendar, Tasks, Reminders, RAG, Web Search, Email, Data, Code, Memory)
            ↓
     CONTEXT RETRIEVAL
 (Long-Term Memories, Pending Tasks, Today's Calendar, Document Chunks)
            ↓
       TASK PLANNING
            ↓
      TOOL SELECTION
            ↓
      TOOL EXECUTION
 (Autonomous for low-risk actions; confirmation prompt for high-impact actions)
            ↓
   RESULT VERIFICATION
            ↓
FINAL VOICE-OPTIMIZED RESPONSE
```

### 3. Integrated Tool Suite
1. **Web Search**: Multi-source research with dates, fact vs opinion classification, and verifiable source citations.
2. **Calendar**: Schedule view, meeting creator with attendee resolution, and automated free-time conflict detector.
3. **Reminders**: One-time, recurring, deadline, and task-linked alerts.
4. **Task Manager**: Kanban/list tracking with priorities (`URGENT`, `HIGH`, `MEDIUM`, `LOW`), categories, and statuses (`TODO`, `IN_PROGRESS`, `BLOCKED`, `COMPLETED`, `CANCELLED`).
5. **Notes**: Rich notes with pinned view, search, and categorization.
6. **Knowledge Base (RAG)**: Multi-format document parser (PDF, DOCX, TXT, CSV, MD), automatic semantic paragraph chunking, and vector-style keyword similarity search.
7. **Email System**: Drafts messages with recipient contact resolution; enforces user confirmation before mock/real sending.
8. **Contacts**: Personal directory with phone numbers, emails, and notes.
9. **Weather**: Real-time atmospheric metrics, UV index, wind speeds, and 3-day forecast for any location.
10. **Calculator & Unit Converter**: Safe mathematical evaluation and numerical transformations.
11. **Coding Assistant**: Virtual multi-file workspace (`agentOrchestrator.ts`, `schema.sql`, `dataPipeline.py`), syntax viewer, and virtual execution sandbox.
12. **Data Analysis**: Dataset profiling, schema detection, missing value verification, statistical summaries, and interactive revenue charts.
13. **Personal Memory**: Segregated short-term conversational context vs user-approved long-term preferences, goals, and facts.
14. **Research Planner**: Multi-step inquiry decomposition, source credibility comparison matrix, and executive synthesis.
15. **Project Mode**: Long-term milestone tracking, linked tasks, progress indicators, and activity logs.

### 4. Safety & User Control
- **Low-Risk vs High-Impact**: Routine calculations, calendar queries, and web searches execute autonomously. High-impact operations (sending emails, deleting tasks/data, wiping memories) trigger an **Action Confirmation** modal preserving user consent.
- **Privacy First**: Sensitive credentials or secrets are never retained in long-term memory. Users can wipe all memories or export their entire data profile as JSON at any time.
- **Demo Mode**: Full local simulation mode works instantly even when external API credentials are not attached, with transparent indicators so users know when data is simulated.

---

## 🛠️ Technology Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Motion, Lucide React
- **Audio**: Web Speech API (`SpeechRecognition`, `SpeechSynthesis`), Web Audio API (`AudioContext`, `AnalyserNode`)
- **Backend**: Node.js, Express, `tsx`
- **AI SDK**: `@google/genai` (Gemini 3.8 Flash, Gemini 3.8 Flash Lite TTS, Gemini 3.5 Transcribe)
- **Tooling**: Vite 8, esbuild

---

## 🚀 Running Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Provide your `GEMINI_API_KEY` (if testing against live Gemini API), or leave empty to automatically run in high-fidelity **Demo Mode**.

### 3. Start Development Server
```bash
npm run dev
```
The server will start on `http://localhost:3000` with both the Express API and Vite frontend running concurrently.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 💬 Sample Voice Commands
Try speaking or typing any of these requests:
- *"Hey Aura, what's on my schedule today?"*
- *"Schedule a meeting with Rahul tomorrow at 4 PM."*
- *"What tasks are pending?"*
- *"Remind me tomorrow at 10 AM to submit my assignment."*
- *"Summarize my project report."*
- *"Research the best laptops under budget and compare them."*
- *"Draft an email to my professor regarding office hours."*
- *"Analyze my Q3 sales dataset and tell me which product generated the most revenue."*
- *"Remember that I prefer concise answers and TypeScript code snippets."*
- *"Explain this code and optimize it."*
