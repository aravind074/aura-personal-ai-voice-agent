/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { api } from './services/apiClient.js';
import { audioService } from './services/audioService.js';
import { notificationService, NotificationPermissionState } from './services/notificationService.js';
import {
  auth,
  signInWithGoogle,
  logOut,
  onAuthStateChanged,
  User,
  db as firestoreDb
} from './services/firebase.js';
import { doc, setDoc } from 'firebase/firestore';
import {
  AgentStatus,
  Message,
  Task,
  CalendarEvent,
  Reminder,
  Note,
  Memory,
  DocumentItem,
  Project,
  Settings,
} from './types/index.js';

// Layout & Voice
import { Navbar, ActiveTab } from './components/layout/Navbar.js';
import { MobileNav } from './components/layout/MobileNav.js';
import { VoiceOrb } from './components/voice/VoiceOrb.js';
import { WaveformVisualizer } from './components/voice/WaveformVisualizer.js';
import { VoiceControls } from './components/voice/VoiceControls.js';
import { ConversationFeed } from './components/chat/ConversationFeed.js';
import { ReminderToast } from './components/notifications/ReminderToast.js';

// Views
import { PersonalDashboard } from './components/dashboard/PersonalDashboard.js';
import { TaskManagerView } from './components/tasks/TaskManagerView.js';
import { CalendarView } from './components/calendar/CalendarView.js';
import { DocumentKnowledgeView } from './components/documents/DocumentKnowledgeView.js';
import { ResearchWorkstation } from './components/research/ResearchWorkstation.js';
import { CodingWorkspace } from './components/coding/CodingWorkspace.js';
import { DataAnalysisView } from './components/data/DataAnalysisView.js';
import { ProjectsView } from './components/projects/ProjectsView.js';
import { MemoryManagerView } from './components/memory/MemoryManagerView.js';
import { NotesView } from './components/notes/NotesView.js';
import { SettingsModal } from './components/settings/SettingsModal.js';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('voice');
  const [agentStatus, setAgentStatus] = useState<AgentStatus>('IDLE');
  const [statusDetail, setStatusDetail] = useState<string>('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');

  // Active Reminder Alert Toast state
  const [activeReminderAlert, setActiveReminderAlert] = useState<Reminder | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermissionState>('default');

  // Entities
  const [messages, setMessages] = useState<Message[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const remindersRef = useRef<Reminder[]>([]);
  remindersRef.current = reminders;
  const [notes, setNotes] = useState<Note[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isOfflineSimulation, setIsOfflineSimulation] = useState(false);
  const isOffline = !isOnline || isOfflineSimulation;
  const [isWakeWordEnabled, setIsWakeWordEnabled] = useState(true);

  // Monitor Firebase Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const userRef = doc(firestoreDb, 'users', user.uid);
          await setDoc(userRef, {
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            lastLogin: new Date().toISOString(),
          }, { merge: true });
        } catch (e) {
          console.warn('Firestore user profile sync:', e);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Monitor network connectivity changes in real time
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync wake word listening with audioService
  useEffect(() => {
    audioService.enableWakeWord(isWakeWordEnabled);
  }, [isWakeWordEnabled]);

  // Check initial notification permission
  useEffect(() => {
    setNotificationPermission(notificationService.getPermissionState());
  }, []);

  // Load initial app data
  const loadData = useCallback(async () => {
    try {
      const [
        statusRes,
        msgRes,
        tasksRes,
        calRes,
        remRes,
        notesRes,
        docsRes,
        projRes,
        memRes,
        settingsRes,
      ] = await Promise.all([
        api.getStatus().catch(() => ({ demoMode: true })),
        api.getMessages().catch(() => ({ messages: [] })),
        api.getTasks().catch(() => ({ tasks: [] })),
        api.getCalendarEvents().catch(() => ({ events: [] })),
        api.getReminders().catch(() => ({ reminders: [] })),
        api.getNotes().catch(() => ({ notes: [] })),
        api.getDocuments().catch(() => ({ documents: [] })),
        api.getProjects().catch(() => ({ projects: [] })),
        api.getMemories().catch(() => ({ memories: [] })),
        api.getSettings().catch(() => null),
      ]);

      if (statusRes) setIsDemoMode(statusRes.demoMode);
      if (msgRes?.messages) setMessages(msgRes.messages);
      if (tasksRes?.tasks) setTasks(tasksRes.tasks);
      if (calRes?.events) setCalendarEvents(calRes.events);
      if (remRes?.reminders) setReminders(remRes.reminders);
      if (notesRes?.notes) setNotes(notesRes.notes);
      if (docsRes?.documents) setDocuments(docsRes.documents);
      if (projRes?.projects) setProjects(projRes.projects);
      if (memRes?.memories) setMemories(memRes.memories);
      if (settingsRes?.settings) setSettings(settingsRes.settings);
    } catch (err) {
      console.error('Failed to load initial application state:', err);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Start Reminder Watcher for Computer & Phone Notifications
  useEffect(() => {
    notificationService.setOnReminderTriggered((reminder) => {
      setActiveReminderAlert(reminder);
    });

    notificationService.startReminderWatcher(
      () => remindersRef.current,
      (updatedReminders) => {
        setReminders(updatedReminders);
      },
      async () => {
        const res = await api.getReminders();
        if (res?.reminders) {
          setReminders(res.reminders);
        }
      }
    );

    return () => {
      notificationService.stopReminderWatcher();
    };
  }, []);

  // Request Notification Permissions for Phone & Desktop Push
  const handleRequestNotificationPermission = async () => {
    const granted = await notificationService.requestPermission();
    setNotificationPermission(notificationService.getPermissionState());
    if (granted) {
      // Test reminder notification confirmation
      notificationService.sendSystemNotification(
        '✅ Phone & Computer Reminders Active',
        'AURA will now send proactive push notifications whenever your reminders or events are due.'
      );
    }
  };

  // Reminder Toast Actions
  const handleSnoozeReminder = async (reminderId: string, minutes: number) => {
    const target = reminders.find((r) => r.id === reminderId);
    if (!target) return;
    const newDate = new Date(Date.now() + minutes * 60 * 1000).toISOString();
    await api.updateReminder(reminderId, { datetime: newDate, triggered: false });
    setActiveReminderAlert(null);
    loadData();
  };

  const handleCompleteReminder = async (reminderId: string) => {
    await api.updateReminder(reminderId, { completed: true });
    setActiveReminderAlert(null);
    loadData();
  };

  // Stable reference for sending message to prevent stale closures and repeated re-bindings
  const handleSendMessageRef = useRef<(text: string, fromVoice?: boolean) => Promise<void>>(async () => {});

  // Send message to agent orchestration backend
  const handleSendMessage = useCallback(async (text: string, fromVoice = false) => {
    if (!text.trim()) return;

    // Immediately stop listening
    audioService.stopListening();
    setInterimTranscript('');
    setAgentStatus('THINKING');
    setStatusDetail('Reasoning about request...');

    // Optimistic user message in UI
    const tempUserMsg: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const lower = text.toLowerCase();
      if (lower.includes('search') || lower.includes('research') || lower.includes('best') || lower.includes('laptop')) {
        setAgentStatus('SEARCHING');
        setStatusDetail('Searching web & comparing sources...');
      } else if (lower.includes('calendar') || lower.includes('schedule') || lower.includes('task') || lower.includes('remind') || lower.includes('email')) {
        setAgentStatus('USING_TOOL');
        setStatusDetail('Executing tool action...');
      }

      const currentName = currentUser?.displayName || currentUser?.email?.split('@')[0] || '';
      const response = await api.sendChatMessage(text, fromVoice, isOffline, currentName);

      // Refresh messages
      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== tempUserMsg.id);
        return [...filtered, tempUserMsg, response.message];
      });

      // Refresh background stores (tasks, calendar, reminders, etc.)
      loadData();

      // Speak response if from voice or sound enabled
      if (!isMuted && response.spokenText) {
        setAgentStatus('GENERATING');
        setStatusDetail('Preparing voice audio...');

        // Try getting Gemini TTS audio first if enabled
        let ttsAudio: string | undefined;
        if (settings?.voice.engine === 'gemini-tts') {
          try {
            const ttsRes = await api.getTTSAudio(response.spokenText);
            if (ttsRes.audio) {
              ttsAudio = ttsRes.audio;
            }
          } catch (e) {
            console.warn('TTS request error:', e);
          }
        }

        setAgentStatus('SPEAKING');
        await audioService.speak(response.spokenText, ttsAudio);

        // Auto-listen if enabled in settings
        if (settings?.voice.autoListening) {
          setTimeout(() => {
            audioService.startListening();
          }, 450);
        } else {
          setAgentStatus('IDLE');
        }
      } else {
        setAgentStatus('IDLE');
      }
    } catch (err: any) {
      console.error('Agent message error:', err);
      setAgentStatus('ERROR');
      setStatusDetail(err.message || 'Error processing request');
      setTimeout(() => setAgentStatus('IDLE'), 3500);
    }
  }, [isOffline, isMuted, settings, loadData, currentUser]);

  // Keep ref updated
  useEffect(() => {
    handleSendMessageRef.current = handleSendMessage;
  }, [handleSendMessage]);

  // Voice Interaction & Audio Service Setup - initialized once with stable ref
  useEffect(() => {
    audioService.setCallbacks(
      (transcript: string, isFinal: boolean) => {
        if (isFinal) {
          setInterimTranscript('');
          handleSendMessageRef.current(transcript, true);
        } else {
          setInterimTranscript(transcript);
        }
      },
      (speaking: boolean, listening: boolean) => {
        setIsSpeaking(speaking);
        setIsListening(listening);
        if (speaking) {
          setAgentStatus('SPEAKING');
        } else if (listening) {
          setAgentStatus('LISTENING');
        } else {
          setAgentStatus((prev) => (prev === 'SPEAKING' || prev === 'LISTENING' ? 'IDLE' : prev));
        }
      },
      () => {
        // Siri / Hey Google Wake Word Detected
        setActiveTab('voice');
        setAgentStatus('LISTENING');
        setStatusDetail("Hey! I'm listening...");
      }
    );
  }, []);

  const handleToggleListen = async () => {
    if (isListening) {
      audioService.stopListening();
    } else {
      const ok = await audioService.startListening();
      if (!ok) {
        setAgentStatus('ERROR');
        setStatusDetail('Microphone access denied or not available');
        setTimeout(() => setAgentStatus('IDLE'), 3000);
      }
    }
  };

  const handleInterrupt = () => {
    audioService.interrupt();
    setAgentStatus('LISTENING');
  };

  const handleStopSpeaking = () => {
    audioService.stopSpeaking();
    setAgentStatus('IDLE');
  };

  const handleClearMessages = async () => {
    await api.clearMessages();
    setMessages([
      {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: 'Conversation history cleared. How may I assist you today?',
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  const handlePlayAudio = (text: string) => {
    audioService.speak(text);
  };

  const handleConfirmAction = async (actionType: string, payload: any, approved: boolean) => {
    const res = await api.confirmAction(actionType, payload, approved);
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-confirm-${Date.now()}`,
        role: 'assistant',
        content: res.message,
        timestamp: new Date().toISOString(),
      },
    ]);
    if (!isMuted) audioService.speak(res.message);
  };

  // Trigger voice command from other views
  const handleTriggerVoiceCommand = (cmd: string) => {
    setActiveTab('voice');
    handleSendMessage(cmd, true);
  };

  // Entity Handlers
  const handleAddTask = async (task: Partial<Task>) => {
    const res = await api.createTask(task);
    setTasks((prev) => [res.task, ...prev]);
  };

  const handleUpdateTask = async (id: string, updates: Partial<Task>) => {
    const res = await api.updateTask(id, updates);
    setTasks((prev) => prev.map((t) => (t.id === id ? res.task : t)));
  };

  const handleDeleteTask = async (id: string) => {
    await api.deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleCreateEvent = async (event: Partial<CalendarEvent>) => {
    const res = await api.createCalendarEvent(event);
    setCalendarEvents((prev) => [...prev, res.event]);
  };

  const handleDeleteEvent = async (id: string) => {
    await api.deleteCalendarEvent(id);
    setCalendarEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const handleCreateNote = async (note: Partial<Note>) => {
    const res = await api.createNote(note);
    setNotes((prev) => [res.note, ...prev]);
  };

  const handleDeleteNote = async (id: string) => {
    await api.deleteNote(id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleAddMemory = async (mem: Partial<Memory>) => {
    const res = await api.createMemory(mem);
    setMemories((prev) => [res.memory, ...prev]);
  };

  const handleDeleteMemory = async (id: string) => {
    await api.deleteMemory(id);
    setMemories((prev) => prev.filter((m) => m.id !== id));
  };

  const handleClearAllMemories = async () => {
    await api.confirmAction('wipe_memory', {}, true);
    setMemories([]);
  };

  const handleUploadDocument = async (doc: { name: string; content: string; type: string }) => {
    const res = await api.uploadDocument(doc);
    setDocuments((prev) => [res.document, ...prev]);
  };

  const handleSaveSettings = async (newSettings: Settings) => {
    setSettings(newSettings);
    setIsDemoMode(newSettings.integrations.demoMode);
    await api.updateSettings(newSettings);
  };

  const handleExportData = () => {
    const exportBundle = {
      app: 'AURA — Personal AI Voice Agent',
      exportedAt: new Date().toISOString(),
      tasks,
      calendarEvents,
      reminders,
      notes,
      memories,
      documents: documents.map((d) => ({ name: d.name, type: d.type, chunkCount: d.chunkCount })),
      messages,
      projects,
    };
    const blob = new Blob([JSON.stringify(exportBundle, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AURA_Data_Export_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const pendingReminders = reminders.filter((r) => !r.completed);

  return (
    <div className="min-h-screen bg-[#090b10] text-slate-100 flex flex-col font-sans pb-16 lg:pb-0">
      {/* Top Header Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        agentStatus={agentStatus}
        isDemoMode={isDemoMode}
        onOpenSettings={() => setIsSettingsOpen(true)}
        pendingRemindersCount={pendingReminders.length}
        isOffline={isOffline}
        onToggleOfflineSimulation={() => setIsOfflineSimulation(!isOfflineSimulation)}
        isWakeWordEnabled={isWakeWordEnabled}
        onToggleWakeWord={() => setIsWakeWordEnabled(!isWakeWordEnabled)}
        user={currentUser}
        onSignIn={signInWithGoogle}
        onSignOut={logOut}
        notificationPermission={notificationPermission}
        onRequestNotificationPermission={handleRequestNotificationPermission}
      />

      {/* Real-time Reminder Alert Notification Toast for Computer & Phone */}
      {activeReminderAlert && (
        <ReminderToast
          reminder={activeReminderAlert}
          onSnooze={handleSnoozeReminder}
          onComplete={handleCompleteReminder}
          onDismiss={() => setActiveReminderAlert(null)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col pb-20 lg:pb-0 min-h-0">
        {activeTab === 'voice' && (
          <div className="flex-1 flex flex-col h-[calc(100dvh-65px-5rem)] lg:h-[calc(100dvh-65px)] overflow-hidden">
            {/* Upper Voice Interaction Showcase */}
            <div className="flex-shrink-0 bg-gradient-to-b from-slate-950 via-slate-900/60 to-transparent pt-3 sm:pt-4 pb-2 border-b border-slate-800/60">
              <VoiceOrb
                status={agentStatus}
                isListening={isListening}
                isSpeaking={isSpeaking}
                onToggleListen={handleToggleListen}
                onInterrupt={handleInterrupt}
                statusDetail={statusDetail}
                isWakeWordEnabled={isWakeWordEnabled}
              />

              <WaveformVisualizer
                status={agentStatus}
                isActive={isListening || isSpeaking}
              />

              <VoiceControls
                isSpeaking={isSpeaking}
                isListening={isListening}
                onStopSpeaking={handleStopSpeaking}
                onInterrupt={handleInterrupt}
                onClearConversation={handleClearMessages}
                onToggleMute={() => setIsMuted(!isMuted)}
                isMuted={isMuted}
              />
            </div>

            {/* Conversational Stream & Alternative Text Input */}
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              <ConversationFeed
                messages={messages}
                interimTranscript={interimTranscript}
                isListening={isListening}
                onSendMessage={(txt) => handleSendMessage(txt, false)}
                onPlayAudio={handlePlayAudio}
                onConfirmAction={handleConfirmAction}
                onStartListening={handleToggleListen}
              />
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <PersonalDashboard
            tasks={tasks}
            events={calendarEvents}
            reminders={reminders}
            documents={documents}
            onTriggerVoiceCommand={handleTriggerVoiceCommand}
            setActiveTab={setActiveTab}
            onAddTaskPrompt={() => setActiveTab('tasks')}
            onAddReminderPrompt={() => handleTriggerVoiceCommand('Remind me tomorrow at 10 AM to submit my assignment')}
            user={currentUser}
            onSignIn={signInWithGoogle}
          />
        )}

        {activeTab === 'tasks' && (
          <TaskManagerView
            tasks={tasks}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            onTriggerVoice={handleTriggerVoiceCommand}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarView
            events={calendarEvents}
            onCreateEvent={handleCreateEvent}
            onDeleteEvent={handleDeleteEvent}
            onTriggerVoice={handleTriggerVoiceCommand}
          />
        )}

        {activeTab === 'notes' && (
          <NotesView
            notes={notes}
            onCreateNote={handleCreateNote}
            onDeleteNote={handleDeleteNote}
            onTriggerVoice={handleTriggerVoiceCommand}
          />
        )}

        {activeTab === 'documents' && (
          <DocumentKnowledgeView
            documents={documents}
            onUploadDocument={handleUploadDocument}
            onTriggerVoice={handleTriggerVoiceCommand}
          />
        )}

        {activeTab === 'research' && (
          <ResearchWorkstation onTriggerVoice={handleTriggerVoiceCommand} />
        )}

        {activeTab === 'coding' && (
          <CodingWorkspace onTriggerVoice={handleTriggerVoiceCommand} />
        )}

        {activeTab === 'data' && (
          <DataAnalysisView onTriggerVoice={handleTriggerVoiceCommand} />
        )}

        {activeTab === 'projects' && (
          <ProjectsView
            projects={projects}
            onTriggerVoice={handleTriggerVoiceCommand}
          />
        )}

        {activeTab === 'memory' && (
          <MemoryManagerView
            memories={memories}
            onAddMemory={handleAddMemory}
            onDeleteMemory={handleDeleteMemory}
            onClearAllMemories={handleClearAllMemories}
            onTriggerVoice={handleTriggerVoiceCommand}
          />
        )}
      </main>

      {/* Settings Modal */}
      {settings && (
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          settings={settings}
          onSaveSettings={handleSaveSettings}
          onClearHistory={handleClearMessages}
          onClearMemories={handleClearAllMemories}
          onExportData={handleExportData}
          user={currentUser}
          onSignIn={signInWithGoogle}
          onSignOut={logOut}
        />
      )}

      {/* Mobile Nav for compact screens */}
      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
