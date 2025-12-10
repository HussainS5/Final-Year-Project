const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const reportPath = path.join(__dirname, 'report.txt');

// Clear previous report
if (fs.existsSync(reportPath)) {
  fs.unlinkSync(reportPath);
}

// Create report file
const reportStream = fs.createWriteStream(reportPath, { flags: 'a' });

const writeToReport = (data) => {
  reportStream.write(data);
  console.log(data);
};

writeToReport('='.repeat(80) + '\n');
writeToReport('PLAYWRIGHT TEST REPORT\n');
writeToReport('='.repeat(80) + '\n');
writeToReport(`Test Run Started: ${new Date().toISOString()}\n\n`);

// Run Playwright tests with JSON reporter for detailed results
const testProcess = exec('npx playwright test --reporter=list,json', {
  cwd: path.join(__dirname, '..'),
  maxBuffer: 1024 * 1024 * 10 // 10MB buffer
});

let stdout = '';
let stderr = '';

testProcess.stdout.on('data', (data) => {
  const output = data.toString();
  stdout += output;
  writeToReport(output);
});

testProcess.stderr.on('data', (data) => {
  const output = data.toString();
  stderr += output;
  writeToReport(output);
});

testProcess.on('close', (code) => {
  writeToReport('\n' + '='.repeat(80) + '\n');
  writeToReport(`Test Run Completed: ${new Date().toISOString()}\n`);
  writeToReport(`Exit Code: ${code}\n`);
  writeToReport('='.repeat(80) + '\n\n');

  // Try to read JSON results if available
  const jsonResultsPath = path.join(__dirname, 'test-results.json');
  if (fs.existsSync(jsonResultsPath)) {
    try {
      const results = JSON.parse(fs.readFileSync(jsonResultsPath, 'utf8'));
      writeToReport('\nTEST SUMMARY\n');
      writeToReport('-'.repeat(80) + '\n');
      writeToReport(`Total Tests: ${results.stats.total}\n`);
      writeToReport(`Passed: ${results.stats.expected}\n`);
      writeToReport(`Failed: ${results.stats.unexpected}\n`);
      writeToReport(`Skipped: ${results.stats.skipped}\n`);
      writeToReport(`Duration: ${(results.stats.duration / 1000).toFixed(2)}s\n`);
      writeToReport('-'.repeat(80) + '\n\n');

      if (results.stats.unexpected > 0) {
        writeToReport('FAILED TESTS:\n');
        writeToReport('-'.repeat(80) + '\n');
        results.suites.forEach(suite => {
          suite.specs.forEach(spec => {
            spec.tests.forEach(test => {
              if (test.results.some(r => r.status === 'failed')) {
                writeToReport(`\n${spec.title} > ${test.title}\n`);
                test.results.forEach(result => {
                  if (result.status === 'failed') {
                    writeToReport(`  Status: ${result.status}\n`);
                    if (result.error) {
                      writeToReport(`  Error: ${result.error.message}\n`);
                    }
                  }
                });
              }
            });
          });
        });
        writeToReport('\n');
      }
    } catch (err) {
      writeToReport(`\nCould not parse JSON results: ${err.message}\n`);
    }
  }

  reportStream.end();
  process.exit(code);
});

testProcess.on('error', (error) => {
  writeToReport(`\nError running tests: ${error.message}\n`);
  reportStream.end();
  process.exit(1);
});

