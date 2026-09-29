import { runUnitTests } from './unit.test.js';
import { runIntegrationTests } from './integration.test.js';
import { runE2ETests } from './e2e.test.js';

async function main() {
  console.log('====================================================');
  console.log('       AURA PERSONAL AI AGENT TEST HARNESS         ');
  console.log('====================================================');

  const unit = await runUnitTests();
  const integration = await runIntegrationTests();
  const e2e = await runE2ETests();

  const totalPassed = unit.passed + integration.passed + e2e.passed;
  const totalFailed = unit.failed + integration.failed + e2e.failed;

  console.log('\n====================================================');
  console.log(`TOTAL PASSED: ${totalPassed}`);
  console.log(`TOTAL FAILED: ${totalFailed}`);
  console.log('====================================================');

  if (totalFailed > 0) {
    console.error('❌ TEST SUITE FAILED');
    process.exit(1);
  } else {
    console.log('✅ ALL TEST SUITES PASSED SUCCESSFULLY');
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('Fatal test harness error:', err);
  process.exit(1);
});
