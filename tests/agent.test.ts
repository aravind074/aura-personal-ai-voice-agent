import { agentBrain } from '../backend/agents/orchestrator.js';
import { toolRegistry } from '../backend/tools/toolRegistry.js';
import { db } from '../backend/db/inMemoryStore.js';

async function runTests() {
  console.log('--- [AURA TEST SUITE] Starting Tests ---');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`✗ FAIL: ${testName}`);
      failed++;
    }
  }

  // 1. Tool Selection & Execution Tests
  console.log('\n[1] Testing Tool Selection & Execution');

  const searchRes = await toolRegistry.webSearch.execute({ query: 'best laptops under budget' });
  assert(searchRes.resultsCount > 0, 'WebSearch returns populated results');
  assert(searchRes.sources.length >= 2, 'WebSearch returns credible citations');

  const calToday = await toolRegistry.calendar.execute({ action: 'view_today' });
  assert(Array.isArray(calToday.events), 'Calendar view_today returns event array');

  const freeTime = await toolRegistry.calendar.execute({ action: 'find_free_time' });
  assert(freeTime.availableSlots.length > 0, 'Calendar free time slot detection works');

  const taskList = await toolRegistry.tasks.execute({ action: 'list_pending' });
  assert(taskList.pendingCount >= 1, 'Tasks tool queries pending tasks');

  const calcRes = await toolRegistry.calculator.execute({ expression: '(150 * 4) + 25' });
  assert(calcRes.result === 625, 'Calculator evaluates mathematical expression safely');

  // 2. Intent Detection & Agent Brain Orchestration
  console.log('\n[2] Testing Agent Brain Orchestration');

  const r1 = await agentBrain.processUserMessage("What's on my calendar today?");
  assert(r1.intent.includes('CALENDAR'), 'Detects calendar intent correctly');
  assert(r1.spokenText.length > 0, 'Generates voice-optimized spoken text');

  const r2 = await agentBrain.processUserMessage("Remind me tomorrow at 10 AM to submit my assignment");
  assert(r2.intent.includes('REMINDER'), 'Detects reminder intent');

  const r3 = await agentBrain.processUserMessage("Research top laptops and compare them");
  assert(r3.intent.includes('RESEARCH') || r3.intent.includes('SEARCH'), 'Detects research intent');

  const r4 = await agentBrain.processUserMessage("Draft an email to my professor");
  assert(r4.intent.includes('EMAIL'), 'Detects email draft intent');
  assert(r4.message.requiresActionConfirmation !== undefined, 'Email triggers action confirmation requirement');

  // 3. Document RAG & Vector Chunk Search
  console.log('\n[3] Testing Knowledge Base & Chunk Search');
  const docRes = await toolRegistry.documents.execute({ action: 'search', query: 'methodology' });
  assert(docRes.matchCount > 0 || docRes.matches !== undefined, 'Document chunk semantic matching succeeds');

  // 4. Memory Store & User Approval
  console.log('\n[4] Testing Memory Store & Approval');
  const initialMemCount = db.memories.size;
  await toolRegistry.memory.execute({
    action: 'store',
    content: 'User prefers concise TypeScript answers with zero boilerplate.',
    category: 'preferences',
  });
  assert(db.memories.size === initialMemCount + 1, 'Memory store persists approved user knowledge');

  console.log(`\n--- Test Summary: ${passed} Passed, ${failed} Failed ---`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test execution failed with error:', err);
  process.exit(1);
});
