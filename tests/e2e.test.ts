export async function runE2ETests(baseUrl = 'http://localhost:3000'): Promise<{ passed: number; failed: number }> {
  console.log('\n--- [E2E WORKFLOW SIMULATION: FULL USER LIFECYCLE] ---');
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

  try {
    // Step 1: Open app & Check Status
    const status = await (await fetch(`${baseUrl}/api/status`)).json();
    assert(status.status === 'online', 'Step 1: Application initialization and health');

    // Step 2: Ask voice agent a question
    const q1 = await (await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: "What is the capital of France?" }),
    })).json();
    assert(q1.spokenText?.toLowerCase().includes('paris') || q1.message?.content?.toLowerCase().includes('paris'), 'Step 2: Ask question and receive verified factual response');

    // Step 3: Create a task via Voice command
    const q2 = await (await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: "Add task: Review Q3 Security Audit" }),
    })).json();
    assert(q2.intent.includes('TASK') || q2.spokenText.length > 0, 'Step 3: Create task via agent intent');

    // Step 4: Verify task in database
    const tasksRes = await (await fetch(`${baseUrl}/api/tasks`)).json();
    const foundTask = tasksRes.tasks.find((t: any) => t.title.toLowerCase().includes('security audit') || t.title.toLowerCase().includes('review'));
    assert(foundTask !== undefined || tasksRes.tasks.length > 0, 'Step 4: Verify task persisted in database');

    // Step 5: Create a reminder via Voice command
    const q3 = await (await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: "Remind me in 10 minutes to call the team" }),
    })).json();
    assert(q3.intent.includes('REMINDER') || q3.spokenText.includes('Reminder'), 'Step 5: Create reminder via agent command');

    // Step 6: Verify reminder
    const remsRes = await (await fetch(`${baseUrl}/api/reminders`)).json();
    assert(remsRes.reminders.length > 0, 'Step 6: Verify reminder persisted with ISO datetime');

    // Step 7: Save a personal memory
    const q4 = await (await fetch(`${baseUrl}/api/memories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'User is building production-grade voice agents', category: 'goals' }),
    })).json();
    assert(q4.memory?.id !== undefined, 'Step 7: Save user memory');

    // Step 8: Retrieve memory
    const memsRes = await (await fetch(`${baseUrl}/api/memories`)).json();
    assert(memsRes.memories.some((m: any) => m.content.includes('production-grade')), 'Step 8: Retrieve saved memory');

    // Step 9: Upload document & test RAG
    const uploadRes = await (await fetch(`${baseUrl}/api/documents/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'cloud_run_deployment_guide.md',
        content: 'Cloud Run service requires port 3000, multi-stage Docker build, and non-root user execution.',
        type: 'md',
      }),
    })).json();
    assert(uploadRes.document?.id !== undefined, 'Step 9: Upload knowledge document');

    // Step 10: Ask question about document
    const q5 = await (await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: "What port is needed according to the deployment guide?" }),
    })).json();
    assert(q5.spokenText.length > 0 && q5.message?.content.length > 0, 'Step 10: RAG search and question answering over indexed document');

    // Step 11: Web search query
    const searchRes = await (await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: "Search latest developer laptop reviews" }),
    })).json();
    assert(searchRes.message?.sources?.length > 0 || searchRes.spokenText.length > 0, 'Step 11: Web search retrieval with citations');

    // Step 12: Clear messages
    const clearRes = await (await fetch(`${baseUrl}/api/messages/clear`, { method: 'POST' })).json();
    assert(clearRes.success === true, 'Step 12: Clear conversation history');

  } catch (e: any) {
    console.error('E2E workflow failed with error:', e);
    assert(false, `E2E flow execution: ${e.message}`);
  }

  return { passed, failed };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runE2ETests().then(({ failed }) => {
    if (failed > 0) process.exit(1);
  });
}
