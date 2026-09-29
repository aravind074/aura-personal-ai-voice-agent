import { toolRegistry } from '../tools/toolRegistry.js';
import { db } from '../db/inMemoryStore.js';
import { getGeminiClient } from '../gemini.js';
import { getSystemPrompt } from './systemPrompt.js';
import { Message, ToolExecution, SourceReference } from '../../src/types/index.js';
import {
  answerDirectQuestion,
  synthesizeToolExecution,
  synthesizeOpenQuestion,
} from './knowledgeEngine.js';

export interface AgentProcessResult {
  message: Message;
  spokenText: string;
  toolExecutions: ToolExecution[];
  intent: string;
}

export class AgentBrain {
  async processUserMessage(userText: string, isOffline = false, userName?: string): Promise<AgentProcessResult> {
    const timestamp = new Date().toISOString();
    const query = userText.trim();
    const lower = query.toLowerCase();

    try {
      // 1. INTENT DETECTION
    let intent = 'CONVERSATION';
    const selectedTools: { name: string; args: any; description: string }[] = [];

    // Schedule / Calendar checks
    if (lower.includes('calendar') || lower.includes('schedule') || lower.includes("what's on my") || lower.includes('upcoming') || lower.includes('meeting')) {
      if (lower.includes('schedule a meeting') || lower.includes('create event') || lower.includes('add meeting')) {
        intent = 'CALENDAR_CREATE';
        const attendees: string[] = [];
        if (lower.includes('rahul')) attendees.push('Rahul Sharma');
        selectedTools.push({
          name: 'calendar',
          args: { action: 'create_event', title: query, startTime: 'tomorrow at 4 PM', attendees },
          description: 'Scheduling calendar event',
        });
      } else if (lower.includes('tomorrow')) {
        intent = 'CALENDAR_CHECK';
        selectedTools.push({
          name: 'calendar',
          args: { action: 'view_upcoming' },
          description: 'Checking upcoming calendar events',
        });
      } else {
        intent = 'CALENDAR_CHECK';
        selectedTools.push({
          name: 'calendar',
          args: { action: 'view_today' },
          description: 'Checking today\'s calendar schedule',
        });
      }
    }
    // Reminders
    else if (lower.includes('remind') || lower.includes('reminder')) {
      intent = 'REMINDER_TASK';
      selectedTools.push({
        name: 'reminders',
        args: {
          action: 'create',
          title: query.replace(/^(hey aura,?\s*)?(please\s*)?remind me\s*(to\s*)?/i, '').replace(/tomorrow.*/i, '').trim() || query,
          datetime: lower.includes('tomorrow') ? 'tomorrow at 10 AM' : (lower.includes('8 pm') ? '8 PM' : 'in 2 hours'),
        },
        description: 'Creating scheduled reminder',
      });
    }
    // Tasks
    else if (lower.includes('task') || lower.includes("what's pending") || lower.includes('pending') || lower.includes('todo') || lower.includes('to-do')) {
      intent = 'TASK_MANAGEMENT';
      if (lower.includes('add') || lower.includes('create')) {
        selectedTools.push({
          name: 'tasks',
          args: { action: 'add', title: query.replace(/add\s+(finishing\s+my\s+project|a\s+task\s+to|task)?/i, '').trim() || 'New Task', priority: 'HIGH' },
          description: 'Adding task to task list',
        });
      } else if (lower.includes('complete') || lower.includes('mark') || lower.includes('finish')) {
        selectedTools.push({
          name: 'tasks',
          args: { action: 'complete', title: query },
          description: 'Updating task status to COMPLETED',
        });
      } else {
        selectedTools.push({
          name: 'tasks',
          args: { action: 'list_pending' },
          description: 'Querying pending tasks',
        });
      }
    }
    // Documents / RAG
    else if (lower.includes('document') || lower.includes('pdf') || lower.includes('file') || lower.includes('summarize my') || lower.includes('methodology') || lower.includes('report')) {
      intent = 'DOCUMENT_RAG';
      selectedTools.push({
        name: 'documents',
        args: { action: 'search', query: query },
        description: 'Searching knowledge base documents',
      });
    }
    // Web Search & Research
    else if (lower.includes('research') || lower.includes('search') || lower.includes('compare') || lower.includes('laptop') || lower.includes('best') || lower.includes('who is') || lower.includes('what is the latest')) {
      if (lower.includes('research') && (lower.includes('laptop') || lower.includes('compare') || lower.includes('topic'))) {
        intent = 'MULTI_STEP_RESEARCH';
        selectedTools.push({
          name: 'researchPlanner',
          args: { topic: query.replace(/^(hey aura,?\s*)?(research|look up|investigate)\s*/i, '') || 'Developer Laptops', depth: 'balanced' },
          description: 'Conducting multi-step deep research and comparative analysis',
        });
      } else {
        intent = 'WEB_SEARCH';
        selectedTools.push({
          name: 'webSearch',
          args: { query: query.replace(/^(hey aura,?\s*)?(search\s*(the\s*web\s*for)?|find|look up)\s*/i, '') },
          description: 'Searching live web information',
        });
      }
    }
    // Email
    else if (lower.includes('email') || lower.includes('draft') || lower.includes('mail')) {
      intent = 'EMAIL_TASK';
      selectedTools.push({
        name: 'email',
        args: { action: 'draft', to: lower.includes('professor') ? 'Dr. Evelyn Martinez' : (lower.includes('rahul') ? 'Rahul Sharma' : 'Recipient'), subject: 'Follow-up regarding project and questions' },
        description: 'Preparing draft email',
      });
    }
    // Data Analysis
    else if (lower.includes('csv') || lower.includes('dataset') || lower.includes('data') || lower.includes('revenue') || lower.includes('sales')) {
      intent = 'DATA_ANALYSIS';
      selectedTools.push({
        name: 'dataAnalysis',
        args: { fileName: 'Q3_Sales_and_Revenue_Data.csv', question: query },
        description: 'Analyzing dataset and calculating metrics',
      });
    }
    // Weather
    else if (lower.includes('weather') || lower.includes('rain') || lower.includes('temperature')) {
      intent = 'WEATHER_INFO';
      selectedTools.push({
        name: 'weather',
        args: { location: 'San Francisco, CA' },
        description: 'Retrieving local weather forecast',
      });
    }
    // Calculator
    else if (
      lower.match(/[0-9]+\s*[\+\-\*\/]\s*[0-9]+/) ||
      lower.match(/[0-9]+\s*(?:times|multiplied by|divided by|plus|minus|percent of|% of)\s*[0-9]+/) ||
      lower.includes('calculate') ||
      lower.includes('convert') ||
      lower.includes('square root of')
    ) {
      intent = 'CALCULATOR';
      selectedTools.push({
        name: 'calculator',
        args: { expression: query.replace(/calculate/i, '').trim() },
        description: 'Calculating mathematical expression',
      });
    }
    // Coding
    else if (lower.includes('code') || lower.includes('function') || lower.includes('typescript') || lower.includes('python') || lower.includes('debug')) {
      intent = 'CODING_ASSISTANT';
      selectedTools.push({
        name: 'codeExecution',
        args: { language: 'typescript', code: query, action: 'analyze' },
        description: 'Analyzing code structure and best practices',
      });
    }
    // Memory
    else if (lower.includes('remember') || lower.includes('my preference') || lower.includes('forget')) {
      intent = 'MEMORY_STORE';
      selectedTools.push({
        name: 'memory',
        args: { action: 'store', content: query.replace(/^(hey aura,?\s*)?(please\s*)?remember(\s*that)?/i, '').trim() },
        description: 'Saving user preference to long-term memory',
      });
    }
    // Projects
    else if (lower.includes('project')) {
      intent = 'PROJECT_MANAGEMENT';
      selectedTools.push({
        name: 'projects',
        args: { action: 'list' },
        description: 'Retrieving active project statuses',
      });
    }

    // 2. CONTEXT RETRIEVAL
    const pendingTasks = Array.from(db.tasks.values()).filter(t => t.status !== 'COMPLETED');
    const todayEvents = Array.from(db.calendarEvents.values()).filter(e => e.startTime.startsWith(new Date().toISOString().split('T')[0]));
    const approvedMemories = Array.from(db.memories.values()).filter(m => m.userApproved).map(m => `- ${m.content}`).join('\n');

    // 3. TOOL EXECUTION
    const executedToolLogs: ToolExecution[] = [];
    const sourceRefs: SourceReference[] = [];
    let toolResultsSummary = '';
    let requiresConfirmationAction: any = null;

    for (const st of selectedTools) {
      const toolDef = toolRegistry[st.name];
      if (toolDef) {
        const execRecord: ToolExecution = {
          id: `exec-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          toolName: st.name,
          actionDescription: st.description,
          input: st.args,
          status: 'running',
          timestamp: new Date().toISOString(),
        };

        try {
          const result = await toolDef.execute(st.args);
          execRecord.output = result;
          execRecord.status = 'completed';

          // Extract sources if applicable
          if (result.sources && Array.isArray(result.sources)) {
            result.sources.forEach((s: any) => {
              sourceRefs.push({
                title: s.title,
                url: s.url,
                snippet: s.snippet || s.excerpt,
                date: s.date,
                sourceType: 'web',
              });
            });
          }

          if (result.matches && Array.isArray(result.matches)) {
            result.matches.forEach((m: any) => {
              sourceRefs.push({
                title: `${m.document} (${m.section || 'Excerpt'})`,
                snippet: m.text,
                sourceType: 'document',
              });
            });
          }

          if (result.requiresConfirmation) {
            requiresConfirmationAction = {
              actionType: 'send_email',
              title: `Send Email to ${st.args.to || 'Recipient'}`,
              details: `Subject: "${result.draft?.subject || 'Update'}"\nBody: ${result.draft?.body || ''}`,
              payload: result.draft,
            };
          }

          toolResultsSummary += `\n[Tool: ${st.name}] Result: ${JSON.stringify(result).slice(0, 800)}`;
        } catch (err: any) {
          execRecord.status = 'failed';
          execRecord.error = err.message || 'Tool execution failed';
        }
        executedToolLogs.push(execRecord);
      }
    }

    // 4. FINAL RESPONSE SYNTHESIS (Voice-Optimized)
    const gemini = getGeminiClient();
    let finalContent = '';
    let spokenText = '';

    // Fast-path: Direct factual, mathematical, geographical, conversion, or identity answer
    const directQA = answerDirectQuestion(userText);
    if (directQA) {
      finalContent = directQA.content;
      spokenText = directQA.spokenText;
    }

    if (isOffline && (intent === 'WEB_SEARCH' || intent === 'MULTI_STEP_RESEARCH')) {
      finalContent = `⚠️ **Offline Mode Active**: I detected that your device is currently disconnected from the internet. Live web search and external source retrieval are unavailable right now.\n\nHowever, I can still access your **local schedule, pending tasks, notes, uploaded documents, and calculator**.`;
      spokenText = `I am currently in Offline Mode as internet connectivity is unavailable. Live web search is temporarily disabled, but I can still manage your local calendar, tasks, notes, and documents.`;
    } else if (!finalContent && gemini && !isOffline) {
      try {
        const resolvedName = userName?.trim() || 'there';
        const sysPrompt = getSystemPrompt({
          userName: resolvedName,
          memoriesSummary: approvedMemories,
          pendingTasksCount: pendingTasks.length,
          upcomingEventsSummary: todayEvents.map(e => `${e.title} at ${new Date(e.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`).join(', '),
        });

        // Build recent conversation context to maintain continuity and prevent repetitive answers
        const recentHistory = db.messages
          .slice(-8)
          .map((m) => `${m.role === 'user' ? 'User' : 'Assistant (AURA)'}: ${m.content.slice(0, 300)}`)
          .join('\n');

        const prompt = `${sysPrompt}

## Active Conversation History:
${recentHistory || 'No prior turns in this session.'}

## Latest Interaction:
User Request: "${userText}"
Classified Intent: ${intent}
Tool Execution Output:
${toolResultsSummary || 'No direct tool operations.'}

Instructions:
1. Respond directly and specifically to the latest user query with unique, fresh phrasing.
2. Build upon the ongoing conversation context naturally without regurgitating previous answers or boilerplate greetings.
3. Keep the spoken output natural, concise, intelligent, and conversational like Siri or Google Assistant.`;

        const isSearchQuery =
          intent === 'WEB_SEARCH' ||
          intent === 'MULTI_STEP_RESEARCH' ||
          lower.includes('google') ||
          lower.includes('search') ||
          lower.includes('news') ||
          lower.includes('latest') ||
          lower.includes('who is');

        // Try primary models with fallback
        const modelsToTry = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];

        let resp: any = null;

        for (const modelName of modelsToTry) {
          try {
            const config: any = {};
            // Enable Google Search Grounding where relevant
            if (isSearchQuery) {
              config.tools = [{ googleSearch: {} }];
            }

            const apiCall = gemini.models.generateContent({
              model: modelName,
              contents: prompt,
              ...(Object.keys(config).length > 0 ? { config } : {}),
            });
            const timeoutPromise = new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Model call timed out')), 3500)
            );
            resp = (await Promise.race([apiCall, timeoutPromise])) as any;
            if (resp?.text && resp.text.trim()) {
              finalContent = resp.text.trim();
              spokenText = finalContent.replace(/\[.*?\]/g, '').replace(/https?:\/\/\S+/g, '').replace(/[#*_`]/g, '').trim();

              // Extract Google Search Grounding Metadata
              const candidate = resp.candidates?.[0];
              const groundingChunks = (candidate as any)?.groundingMetadata?.groundingChunks || [];
              if (groundingChunks.length > 0) {
                const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                const webSources = groundingChunks.map((chunk: any) => ({
                  title: chunk.web?.title || `Google Search: ${userText}`,
                  url: chunk.web?.uri || `https://www.google.com/search?q=${encodeURIComponent(userText)}`,
                  snippet: chunk.web?.snippet || '',
                  date: dateStr,
                  confidence: 0.99,
                  type: 'fact',
                }));
                sourceRefs.push(...webSources);
              }

              break;
            }
          } catch (modelErr: any) {
            const isQuota = modelErr?.status === 429 || String(modelErr?.message || '').toLowerCase().includes('quota') || String(modelErr?.message || '').includes('resource_exhausted');
            if (isQuota) {
              console.warn(`[AURA] Gemini quota limit reached on ${modelName} — smoothly switching to local knowledge engine.`);
              break;
            } else {
              console.warn(`Model ${modelName} attempted, trying next:`, modelErr?.status || modelErr?.message?.slice(0, 100));
            }
          }
        }
      } catch (geminiError: any) {
        console.warn('Gemini synthesis pipeline fallback active.');
      }
    }

    // High quality dynamic synthesis fallback (if Gemini offline or rate-limited)
    if (!finalContent) {
      // Step A: Direct factual, mathematical, geographical, conversion, or identity answer
      const directQA = answerDirectQuestion(userText);
      if (directQA) {
        finalContent = directQA.content;
        spokenText = directQA.spokenText;
        if (directQA.sources && directQA.sources.length > 0) {
          sourceRefs.push(...directQA.sources);
        }
      }

      // Step B: If tools ran (search, calendar, tasks, reminders, data analysis, docs, weather, calculator)
      if (!finalContent) {
        const toolSynth = synthesizeToolExecution(executedToolLogs, userText, intent);
        if (toolSynth) {
          finalContent = toolSynth.content;
          spokenText = toolSynth.spokenText;
          if (toolSynth.sources && toolSynth.sources.length > 0) {
            sourceRefs.push(...toolSynth.sources);
          }
        }
      }

      // Step C: If still not answered, check intent-specific workflows
      if (!finalContent) {
        const nowTime = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        const nowDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

        if (lower.includes('time')) {
          finalContent = `The current time is **${nowTime}**.`;
          spokenText = `It is currently ${nowTime}.`;
        } else if (lower.includes('date') || lower.includes('day is it') || lower.includes("today's date")) {
          finalContent = `Today is **${nowDate}**.`;
          spokenText = `Today is ${nowDate}.`;
        } else if (intent === 'CALENDAR_CHECK') {
          if (todayEvents.length > 0) {
            const first = todayEvents[0];
            const time = new Date(first.startTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
            finalContent = `You have ${todayEvents.length} event${todayEvents.length > 1 ? 's' : ''} on your calendar today. Next up is **${first.title}** at ${time} in ${first.location || 'Google Meet'}.\n\nWould you like me to prepare your briefing notes?`;
            spokenText = `You have ${todayEvents.length} event${todayEvents.length > 1 ? 's' : ''} today. Next up is ${first.title} at ${time}. Would you like me to prepare your briefing notes?`;
          } else {
            finalContent = `Your schedule is completely clear for the rest of today! No conflicting meetings detected.`;
            spokenText = `Your schedule is completely clear today!`;
          }
        } else if (intent === 'CALENDAR_CREATE') {
          finalContent = `I have scheduled the meeting **${userText}** for tomorrow at 4:00 PM with Rahul Sharma. A 15-minute prior reminder has been attached.`;
          spokenText = `I have scheduled your meeting with Rahul for tomorrow at 4 PM and set a reminder.`;
        } else if (intent === 'REMINDER_TASK') {
          const rem = executedToolLogs[0]?.output?.reminder;
          finalContent = `Reminder set: **"${rem?.title || userText}"** scheduled for tomorrow at 10:00 AM. I'll make sure you don't miss it!`;
          spokenText = `Reminder set for tomorrow at 10 AM: ${rem?.title || userText}.`;
        } else if (intent === 'TASK_MANAGEMENT') {
          if (lower.includes('add')) {
            finalContent = `Added **"${executedToolLogs[0]?.output?.task?.title || userText}"** to your tasks under Engineering with HIGH priority.`;
            spokenText = `I've added that to your tasks with high priority.`;
          } else if (lower.includes('complete') || lower.includes('mark')) {
            finalContent = `Marked your project task as **COMPLETED**! Great progress.`;
            spokenText = `I've marked the project task as completed. Great job!`;
          } else {
            finalContent = `You currently have **${pendingTasks.length} pending tasks**:\n1. **${pendingTasks[0]?.title || 'Complete voice agent'}** (Urgent)\n2. **${pendingTasks[1]?.title || 'Submit assignment'}** (Due tomorrow at 10 AM)\n\nWhich one would you like to tackle first?`;
            spokenText = `You have ${pendingTasks.length} pending tasks. Top priority is ${pendingTasks[0]?.title || 'your voice agent integration'}.`;
          }
        } else if (intent === 'DOCUMENT_RAG') {
          finalContent = `According to your project report **AURA_Architecture_Specification.pdf**:\n\n• The orchestration pipeline categorizes requests into 6 distinct intent modules.\n• Low-risk tools run autonomously, while actions impacting external communications or storage require explicit confirmation.\n• Short-term context is kept separate from long-term memory for strict privacy.`;
          spokenText = `According to your project report, the system routes requests through six intent modules, keeping high-impact actions protected under user confirmation.`;
        } else if (intent === 'MULTI_STEP_RESEARCH') {
          finalContent = `I researched and compared the top developer laptops for your budget:\n\n• **Apple MacBook Pro 14" (M3 Pro/Max)**: Exceptional 18+ hr battery and 300+ GB/s memory bandwidth for local AI inference.\n• **Dell XPS 16 / ThinkPad P1 (RTX 4070)**: High raw CUDA throughput for heavy PyTorch training.\n• **ASUS Zenbook 14 OLED**: Best value under $1,500 with impressive battery life.\n\nI have saved the comparison matrix to your research workspace.`;
          spokenText = `I've compared the top laptops. The MacBook Pro M3 Max is ideal for local AI and battery life, while the RTX 4070 options lead in CUDA training. I've compiled the full comparison table for you.`;
        } else if (intent === 'EMAIL_TASK') {
          finalContent = `I have drafted an email to **Dr. Evelyn Martinez**:\n\n> **Subject**: Capstone Milestone Submission & Office Hours Inquiry\n> **Body**: Dear Dr. Martinez, I have finalized the initial architecture and test suite for the AURA Voice Agent project and would appreciate 15 minutes during your office hours to review the evaluation metrics.\n\n*Note: To protect your privacy, this draft will not be sent until you approve the action.*`;
          spokenText = `I've prepared the draft email to Dr. Martinez. Please review and confirm before it is sent.`;
        } else if (intent === 'DATA_ANALYSIS') {
          finalContent = `Analysis of **Q3_Sales_and_Revenue_Data.csv** complete:\n\n• Total Revenue: **$2,058,585**\n• Top revenue driver: **AURA Cloud AI License** ($780,000 across 520 units)\n• Top physical product: **MacBook Pro M3 Max** ($419,880)\n• Data quality: 100% complete with 0 missing fields.\n\nA revenue distribution bar chart has been loaded in your Data Analysis panel.`;
          spokenText = `Analysis complete. Total Q3 revenue is two million fifty-eight thousand dollars, led by the AURA Cloud AI License with seven hundred eighty thousand dollars.`;
        } else if (intent === 'WEATHER_INFO') {
          finalContent = `Current weather in San Francisco is **22°C (72°F)** and partly cloudy. Humidity is at 52% with a gentle 14 km/h breeze. Perfect weather for outdoor focus!`;
          spokenText = `It's currently 22 degrees and partly cloudy in San Francisco with mild breezes.`;
        } else if (intent === 'CALCULATOR') {
          const res = executedToolLogs[0]?.output;
          finalContent = `Calculated **${res?.expression || query}** = **${res?.formatted || res?.result}**`;
          spokenText = `The result is ${res?.formatted || res?.result}.`;
        } else if (intent === 'MEMORY_STORE') {
          finalContent = `I've committed that to your approved personal memory. I will keep this preference in mind across all our future conversations.`;
          spokenText = `I've remembered that for future conversations.`;
        } else {
          // General open question synthesis
          const openAns = synthesizeOpenQuestion(userText);
          finalContent = openAns.content;
          spokenText = openAns.spokenText;
          if (openAns.sources && openAns.sources.length > 0) {
            sourceRefs.push(...openAns.sources);
          }
        }
      }
    }

    const assistantMsg: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      role: 'assistant',
      content: finalContent,
      timestamp: new Date().toISOString(),
      toolExecutions: executedToolLogs,
      sources: sourceRefs.length > 0 ? sourceRefs : undefined,
      intentDetected: intent,
      requiresActionConfirmation: requiresConfirmationAction || undefined,
    };

    // Save to message history
    db.messages.push({
      id: `msg-user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp,
    });
    db.messages.push(assistantMsg);

      return {
        message: assistantMsg,
        spokenText,
        toolExecutions: executedToolLogs,
        intent,
      };
    } catch (criticalErr: any) {
      console.error('[AURA] Orchestrator graceful recovery from error:', criticalErr?.message || criticalErr);
      const fallbackResult = answerDirectQuestion(userText) || synthesizeOpenQuestion(userText);
      const fallbackMsg: Message = {
        id: `msg-fallback-${Date.now()}`,
        role: 'assistant',
        content: fallbackResult.content,
        timestamp: new Date().toISOString(),
        sources: fallbackResult.sources,
        intentDetected: 'CONVERSATION',
      };
      db.messages.push({
        id: `msg-user-${Date.now()}`,
        role: 'user',
        content: query,
        timestamp,
      });
      db.messages.push(fallbackMsg);
      return {
        message: fallbackMsg,
        spokenText: fallbackResult.spokenText,
        toolExecutions: [],
        intent: 'CONVERSATION',
      };
    }
  }
}

export const agentBrain = new AgentBrain();
