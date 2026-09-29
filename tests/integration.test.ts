export async function runIntegrationTests(baseUrl = 'http://localhost:3000'): Promise<{ passed: number; failed: number }> {
  console.log('\n--- [INTEGRATION TESTS: REST API ENDPOINTS] ---');
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
    // 1. Health Probe
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200 && healthData.status === 'healthy', 'GET /health returns healthy');

    // 2. Readiness Probe
    const readyRes = await fetch(`${baseUrl}/ready`);
    const readyData = await readyRes.json();
    assert(readyRes.status === 200 && readyData.status === 'ready', 'GET /ready returns ready');

    // 3. Status
    const statusRes = await fetch(`${baseUrl}/api/status`);
    const statusData = await statusRes.json();
    assert(statusData.product.includes('AURA') && statusData.status === 'online', 'GET /api/status returns online status');

    // 4. Tasks REST CRUD
    const createTRes = await fetch(`${baseUrl}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Integration Test Task', priority: 'HIGH' }),
    });
    const taskData = await createTRes.json();
    assert(createTRes.status === 201 && taskData.task?.id, 'POST /api/tasks creates task');

    const updateTRes = await fetch(`${baseUrl}/api/tasks/${taskData.task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'COMPLETED' }),
    });
    const updateTData = await updateTRes.json();
    assert(updateTData.task?.status === 'COMPLETED', 'PATCH /api/tasks/:id updates status');

    // 5. Reminders REST CRUD
    const createRRes = await fetch(`${baseUrl}/api/reminders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Integration Reminder Test',
        datetime: new Date(Date.now() + 120000).toISOString(),
      }),
    });
    const remData = await createRRes.json();
    assert(createRRes.status === 201 && remData.reminder?.id, 'POST /api/reminders creates reminder');

    // 6. Calendar REST CRUD
    const createCalRes = await fetch(`${baseUrl}/api/calendar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Team Standup Integration Test',
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 1800000).toISOString(),
      }),
    });
    const calData = await createCalRes.json();
    assert(createCalRes.status === 201 && calData.event?.id, 'POST /api/calendar creates event');

    // 7. Notes REST CRUD
    const createNRes = await fetch(`${baseUrl}/api/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Release Notes v1.0.0',
        content: 'All systems verified and hardened for production.',
      }),
    });
    const noteData = await createNRes.json();
    assert(createNRes.status === 201 && noteData.note?.id, 'POST /api/notes creates note');

    // 8. Documents Upload & Semantic Indexing
    const createDRes = await fetch(`${baseUrl}/api/documents/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'architecture_specification.txt',
        content: 'AURA uses a modular multi-agent orchestration architecture with tool execution and speech synthesis.',
        type: 'txt',
      }),
    });
    const docData = await createDRes.json();
    assert(createDRes.status === 201 && docData.document?.chunkCount >= 1, 'POST /api/documents/upload indexes document chunks');

    // 9. Chat Orchestration
    const chatRes = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'What is 50 multiplied by 8?' }),
    });
    const chatData = await chatRes.json();
    assert(chatRes.status === 200 && (chatData.spokenText?.includes('400') || chatData.message?.content?.includes('400')), 'POST /api/chat handles direct math query');

    // 10. Action Confirmation
    const confirmRes = await fetch(`${baseUrl}/api/actions/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        actionType: 'send_email',
        payload: { to: 'colleague@enterprise.com' },
        approved: true,
      }),
    });
    const confirmData = await confirmRes.json();
    assert(confirmData.status === 'executed', 'POST /api/actions/confirm executes approved action');

  } catch (err: any) {
    console.error('Integration test failed with error:', err);
    assert(false, `API connection and execution: ${err.message}`);
  }

  return { passed, failed };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runIntegrationTests().then(({ failed }) => {
    if (failed > 0) process.exit(1);
  });
}
