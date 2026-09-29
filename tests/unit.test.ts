import { toolRegistry } from '../backend/tools/toolRegistry.js';
import { db } from '../backend/db/inMemoryStore.js';
import { answerDirectQuestion, synthesizeOpenQuestion } from '../backend/agents/knowledgeEngine.js';

export async function runUnitTests(): Promise<{ passed: number; failed: number }> {
  console.log('\n--- [UNIT TESTS: TOOLS & CORE UTILITIES] ---');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${testName}`);
      failed++;
    }
  }

  // 1. Calculator Tool
  const calc1 = await toolRegistry.calculator.execute({ expression: '25 * 4 + 10' });
  assert(calc1.result === 110, 'Calculator: basic arithmetic');

  const calc2 = await toolRegistry.calculator.execute({ expression: 'sqrt(144)' });
  assert(calc2.result === 12, 'Calculator: sqrt function');

  // 2. Tasks Tool
  const initialTaskCount = db.tasks.size;
  const createdTask = await toolRegistry.tasks.execute({
    action: 'create',
    title: 'Unit Test Task',
    priority: 'HIGH',
    category: 'Engineering',
  });
  assert(createdTask.task?.title === 'Unit Test Task', 'Tasks: create task');
  assert(db.tasks.size === initialTaskCount + 1, 'Tasks: store persistence');

  const completedTask = await toolRegistry.tasks.execute({
    action: 'complete',
    taskId: createdTask.task.id,
  });
  assert(completedTask.task?.status === 'COMPLETED', 'Tasks: complete task');

  // 3. Calendar Tool
  const freeSlots = await toolRegistry.calendar.execute({ action: 'find_free_time' });
  assert(Array.isArray(freeSlots.availableSlots), 'Calendar: find free time slots');

  const todayEvents = await toolRegistry.calendar.execute({ action: 'view_today' });
  assert(Array.isArray(todayEvents.events), 'Calendar: view today events');

  // 4. Reminders Tool
  const rem = await toolRegistry.reminders.execute({
    action: 'set',
    title: 'Water Plants',
    datetime: new Date(Date.now() + 3600000).toISOString(),
    type: 'one-time',
  });
  assert(rem.reminder?.title === 'Water Plants', 'Reminders: set reminder');

  // 5. Memory Tool
  const initialMems = db.memories.size;
  const mem = await toolRegistry.memory.execute({
    action: 'store',
    content: 'User prefers dark mode and concise voice responses.',
    category: 'preferences',
  });
  assert(mem.memory?.content.includes('dark mode'), 'Memory: store personal fact');
  assert(db.memories.size === initialMems + 1, 'Memory: increment count');

  // 6. Knowledge Engine Direct Q&A
  const qa1 = answerDirectQuestion('What is 15% of 200?');
  assert(qa1 !== null && qa1.content.includes('30'), 'KnowledgeEngine: direct percentage calculation');

  const qa2 = answerDirectQuestion('Who created you?');
  assert(qa2 !== null && qa2.spokenText.length > 0, 'KnowledgeEngine: identity question');

  const synth = synthesizeOpenQuestion('Compare Python vs TypeScript for backend microservices');
  assert(synth.content.includes('TypeScript') && (synth.sources?.length ?? 0) > 0, 'KnowledgeEngine: technical synthesis');

  // 7. Documents (RAG)
  const docResult = await toolRegistry.documents.execute({
    action: 'search',
    query: 'architecture',
  });
  assert(docResult.matches !== undefined, 'Documents: semantic search chunk lookup');

  // 8. Research Planner
  const plan = await toolRegistry.researchPlanner.execute({
    topic: 'Quantum Computing Progress 2026',
    depth: 'deep',
  });
  assert(plan.questions && plan.questions.length >= 3, 'ResearchPlanner: multi-question research plan generated');
  assert(plan.sources && plan.sources.length >= 2, 'ResearchPlanner: verified sources comparison');

  // 9. Data Analysis
  const analysis = await toolRegistry.dataAnalysis.execute({
    fileName: 'quarterly_metrics.csv',
    question: 'What was the peak month?',
  });
  assert(analysis.keyInsights && analysis.keyInsights.length > 0, 'DataAnalysis: key insights extraction');
  assert(analysis.chartRecommendation && analysis.chartRecommendation.values.length > 0, 'DataAnalysis: chart series generated');

  return { passed, failed };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runUnitTests().then(({ failed }) => {
    if (failed > 0) process.exit(1);
  });
}
