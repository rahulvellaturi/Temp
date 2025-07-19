#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const COVERAGE_THRESHOLD = 90;
const COVERAGE_DIR = path.join(__dirname, '../coverage');
const COVERAGE_JSON_PATH = path.join(COVERAGE_DIR, 'coverage-final.json');
const REPORT_OUTPUT_PATH = path.join(__dirname, '../coverage-report.html');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function generateCoverageReport() {
  console.log(colorize('🧪 Generating Comprehensive Coverage Report...', 'blue'));
  
  try {
    // Run Jest with coverage
    console.log(colorize('Running Jest tests with coverage...', 'yellow'));
    execSync('npm run test:coverage', { stdio: 'inherit' });
    
    // Check if coverage file exists
    if (!fs.existsSync(COVERAGE_JSON_PATH)) {
      throw new Error('Coverage file not found. Make sure Jest coverage is enabled.');
    }
    
    // Read coverage data
    const coverageData = JSON.parse(fs.readFileSync(COVERAGE_JSON_PATH, 'utf8'));
    
    // Analyze coverage
    const analysis = analyzeCoverage(coverageData);
    
    // Generate HTML report
    const htmlReport = generateHTMLReport(analysis);
    fs.writeFileSync(REPORT_OUTPUT_PATH, htmlReport);
    
    // Print summary
    printSummary(analysis);
    
    // Check if coverage meets threshold
    const passed = checkCoverageThreshold(analysis);
    
    console.log(colorize(`\n📊 Coverage report generated: ${REPORT_OUTPUT_PATH}`, 'blue'));
    
    if (passed) {
      console.log(colorize('✅ All coverage thresholds met!', 'green'));
      process.exit(0);
    } else {
      console.log(colorize('❌ Coverage thresholds not met!', 'red'));
      process.exit(1);
    }
    
  } catch (error) {
    console.error(colorize(`Error generating coverage report: ${error.message}`, 'red'));
    process.exit(1);
  }
}

function analyzeCoverage(coverageData) {
  const analysis = {
    summary: {
      statements: { total: 0, covered: 0, percentage: 0 },
      branches: { total: 0, covered: 0, percentage: 0 },
      functions: { total: 0, covered: 0, percentage: 0 },
      lines: { total: 0, covered: 0, percentage: 0 }
    },
    files: [],
    failingFiles: [],
    passingFiles: []
  };
  
  Object.entries(coverageData).forEach(([filePath, fileData]) => {
    // Skip node_modules and test files
    if (filePath.includes('node_modules') || filePath.includes('.test.') || filePath.includes('setupTests')) {
      return;
    }
    
    const fileName = path.basename(filePath);
    const relativePath = path.relative(process.cwd(), filePath);
    
    const fileAnalysis = {
      path: relativePath,
      name: fileName,
      statements: calculatePercentage(fileData.s),
      branches: calculatePercentage(fileData.b),
      functions: calculatePercentage(fileData.f),
      lines: calculatePercentage(fileData.l)
    };
    
    // Add to summary
    analysis.summary.statements.total += fileAnalysis.statements.total;
    analysis.summary.statements.covered += fileAnalysis.statements.covered;
    analysis.summary.branches.total += fileAnalysis.branches.total;
    analysis.summary.branches.covered += fileAnalysis.branches.covered;
    analysis.summary.functions.total += fileAnalysis.functions.total;
    analysis.summary.functions.covered += fileAnalysis.functions.covered;
    analysis.summary.lines.total += fileAnalysis.lines.total;
    analysis.summary.lines.covered += fileAnalysis.lines.covered;
    
    // Check if file passes threshold
    const minPercentage = Math.min(
      fileAnalysis.statements.percentage,
      fileAnalysis.branches.percentage,
      fileAnalysis.functions.percentage,
      fileAnalysis.lines.percentage
    );
    
    if (minPercentage >= COVERAGE_THRESHOLD) {
      analysis.passingFiles.push(fileAnalysis);
    } else {
      analysis.failingFiles.push(fileAnalysis);
    }
    
    analysis.files.push(fileAnalysis);
  });
  
  // Calculate summary percentages
  analysis.summary.statements.percentage = (analysis.summary.statements.covered / analysis.summary.statements.total) * 100;
  analysis.summary.branches.percentage = (analysis.summary.branches.covered / analysis.summary.branches.total) * 100;
  analysis.summary.functions.percentage = (analysis.summary.functions.covered / analysis.summary.functions.total) * 100;
  analysis.summary.lines.percentage = (analysis.summary.lines.covered / analysis.summary.lines.total) * 100;
  
  return analysis;
}

function calculatePercentage(data) {
  if (!data || typeof data !== 'object') {
    return { total: 0, covered: 0, percentage: 100 };
  }
  
  const values = Object.values(data);
  const total = values.length;
  const covered = values.filter(count => count > 0).length;
  const percentage = total > 0 ? (covered / total) * 100 : 100;
  
  return { total, covered, percentage: Math.round(percentage * 100) / 100 };
}

function printSummary(analysis) {
  console.log(colorize('\n📊 COVERAGE SUMMARY', 'bold'));
  console.log('='.repeat(50));
  
  const { summary } = analysis;
  
  console.log(`Statements: ${formatPercentage(summary.statements.percentage)} (${summary.statements.covered}/${summary.statements.total})`);
  console.log(`Branches:   ${formatPercentage(summary.branches.percentage)} (${summary.branches.covered}/${summary.branches.total})`);
  console.log(`Functions:  ${formatPercentage(summary.functions.percentage)} (${summary.functions.covered}/${summary.functions.total})`);
  console.log(`Lines:      ${formatPercentage(summary.lines.percentage)} (${summary.lines.covered}/${summary.lines.total})`);
  
  console.log(colorize('\n📈 FILE BREAKDOWN', 'bold'));
  console.log('='.repeat(50));
  
  console.log(colorize(`✅ Passing Files (>=${COVERAGE_THRESHOLD}%): ${analysis.passingFiles.length}`, 'green'));
  analysis.passingFiles.forEach(file => {
    const minPercentage = Math.min(
      file.statements.percentage,
      file.branches.percentage,
      file.functions.percentage,
      file.lines.percentage
    );
    console.log(`  ${colorize('✓', 'green')} ${file.name} (${minPercentage.toFixed(1)}%)`);
  });
  
  if (analysis.failingFiles.length > 0) {
    console.log(colorize(`\n❌ Failing Files (<${COVERAGE_THRESHOLD}%): ${analysis.failingFiles.length}`, 'red'));
    analysis.failingFiles.forEach(file => {
      const minPercentage = Math.min(
        file.statements.percentage,
        file.branches.percentage,
        file.functions.percentage,
        file.lines.percentage
      );
      console.log(`  ${colorize('✗', 'red')} ${file.name} (${minPercentage.toFixed(1)}%)`);
      console.log(`    Statements: ${formatPercentage(file.statements.percentage)}`);
      console.log(`    Branches:   ${formatPercentage(file.branches.percentage)}`);
      console.log(`    Functions:  ${formatPercentage(file.functions.percentage)}`);
      console.log(`    Lines:      ${formatPercentage(file.lines.percentage)}`);
    });
  }
}

function formatPercentage(percentage) {
  const color = percentage >= COVERAGE_THRESHOLD ? 'green' : 'red';
  return colorize(`${percentage.toFixed(1)}%`, color);
}

function checkCoverageThreshold(analysis) {
  const { summary } = analysis;
  return (
    summary.statements.percentage >= COVERAGE_THRESHOLD &&
    summary.branches.percentage >= COVERAGE_THRESHOLD &&
    summary.functions.percentage >= COVERAGE_THRESHOLD &&
    summary.lines.percentage >= COVERAGE_THRESHOLD &&
    analysis.failingFiles.length === 0
  );
}

function generateHTMLReport(analysis) {
  const { summary, files, passingFiles, failingFiles } = analysis;
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Coverage Report</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0; padding: 20px; background: #f5f5f5;
        }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: white; padding: 30px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric { background: white; padding: 20px; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .metric-value { font-size: 2em; font-weight: bold; margin-bottom: 10px; }
        .metric-label { color: #666; font-size: 0.9em; }
        .passing { color: #22c55e; }
        .failing { color: #ef4444; }
        .files-section { background: white; padding: 30px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .file-list { margin-top: 20px; }
        .file-item { padding: 15px; border: 1px solid #e5e7eb; border-radius: 6px; margin-bottom: 10px; }
        .file-item.passing { border-left: 4px solid #22c55e; background: #f0fdf4; }
        .file-item.failing { border-left: 4px solid #ef4444; background: #fef2f2; }
        .file-name { font-weight: bold; margin-bottom: 8px; }
        .file-path { color: #666; font-size: 0.9em; margin-bottom: 10px; }
        .file-metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
        .file-metric { text-align: center; }
        .file-metric-value { font-weight: bold; }
        .file-metric-label { font-size: 0.8em; color: #666; }
        h1, h2 { margin-top: 0; }
        .threshold-info { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px; margin-bottom: 20px; }
        .status-badge { padding: 4px 12px; border-radius: 20px; font-size: 0.8em; font-weight: bold; }
        .status-passing { background: #dcfce7; color: #166534; }
        .status-failing { background: #fee2e2; color: #991b1b; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 Test Coverage Report</h1>
            <p>Generated on ${new Date().toLocaleString()}</p>
            <div class="threshold-info">
                <strong>Coverage Threshold:</strong> ${COVERAGE_THRESHOLD}% minimum for all metrics
            </div>
        </div>

        <div class="summary">
            <div class="metric">
                <div class="metric-value ${summary.statements.percentage >= COVERAGE_THRESHOLD ? 'passing' : 'failing'}">
                    ${summary.statements.percentage.toFixed(1)}%
                </div>
                <div class="metric-label">Statements<br>(${summary.statements.covered}/${summary.statements.total})</div>
            </div>
            <div class="metric">
                <div class="metric-value ${summary.branches.percentage >= COVERAGE_THRESHOLD ? 'passing' : 'failing'}">
                    ${summary.branches.percentage.toFixed(1)}%
                </div>
                <div class="metric-label">Branches<br>(${summary.branches.covered}/${summary.branches.total})</div>
            </div>
            <div class="metric">
                <div class="metric-value ${summary.functions.percentage >= COVERAGE_THRESHOLD ? 'passing' : 'failing'}">
                    ${summary.functions.percentage.toFixed(1)}%
                </div>
                <div class="metric-label">Functions<br>(${summary.functions.covered}/${summary.functions.total})</div>
            </div>
            <div class="metric">
                <div class="metric-value ${summary.lines.percentage >= COVERAGE_THRESHOLD ? 'passing' : 'failing'}">
                    ${summary.lines.percentage.toFixed(1)}%
                </div>
                <div class="metric-label">Lines<br>(${summary.lines.covered}/${summary.lines.total})</div>
            </div>
        </div>

        <div class="files-section">
            <h2>📊 Overall Status</h2>
            <p>
                <span class="status-badge ${passingFiles.length === files.length ? 'status-passing' : 'status-failing'}">
                    ${passingFiles.length === files.length ? 'ALL TESTS PASSING' : 'SOME TESTS FAILING'}
                </span>
            </p>
            <p><strong>Passing Files:</strong> ${passingFiles.length} / ${files.length}</p>
            <p><strong>Failing Files:</strong> ${failingFiles.length} / ${files.length}</p>
        </div>

        ${passingFiles.length > 0 ? `
        <div class="files-section">
            <h2>✅ Passing Files (>=${COVERAGE_THRESHOLD}%)</h2>
            <div class="file-list">
                ${passingFiles.map(file => generateFileHTML(file, true)).join('')}
            </div>
        </div>
        ` : ''}

        ${failingFiles.length > 0 ? `
        <div class="files-section">
            <h2>❌ Failing Files (<${COVERAGE_THRESHOLD}%)</h2>
            <div class="file-list">
                ${failingFiles.map(file => generateFileHTML(file, false)).join('')}
            </div>
        </div>
        ` : ''}

        <div class="files-section">
            <h2>📁 All Files</h2>
            <div class="file-list">
                ${files.map(file => {
                  const minPercentage = Math.min(
                    file.statements.percentage,
                    file.branches.percentage,
                    file.functions.percentage,
                    file.lines.percentage
                  );
                  return generateFileHTML(file, minPercentage >= COVERAGE_THRESHOLD);
                }).join('')}
            </div>
        </div>
    </div>
</body>
</html>
  `;
}

function generateFileHTML(file, passing) {
  const minPercentage = Math.min(
    file.statements.percentage,
    file.branches.percentage,
    file.functions.percentage,
    file.lines.percentage
  );
  
  return `
    <div class="file-item ${passing ? 'passing' : 'failing'}">
        <div class="file-name">${file.name}</div>
        <div class="file-path">${file.path}</div>
        <div class="file-metrics">
            <div class="file-metric">
                <div class="file-metric-value ${file.statements.percentage >= COVERAGE_THRESHOLD ? 'passing' : 'failing'}">
                    ${file.statements.percentage.toFixed(1)}%
                </div>
                <div class="file-metric-label">Statements</div>
            </div>
            <div class="file-metric">
                <div class="file-metric-value ${file.branches.percentage >= COVERAGE_THRESHOLD ? 'passing' : 'failing'}">
                    ${file.branches.percentage.toFixed(1)}%
                </div>
                <div class="file-metric-label">Branches</div>
            </div>
            <div class="file-metric">
                <div class="file-metric-value ${file.functions.percentage >= COVERAGE_THRESHOLD ? 'passing' : 'failing'}">
                    ${file.functions.percentage.toFixed(1)}%
                </div>
                <div class="file-metric-label">Functions</div>
            </div>
            <div class="file-metric">
                <div class="file-metric-value ${file.lines.percentage >= COVERAGE_THRESHOLD ? 'passing' : 'failing'}">
                    ${file.lines.percentage.toFixed(1)}%
                </div>
                <div class="file-metric-label">Lines</div>
            </div>
        </div>
    </div>
  `;
}

// Run the script
if (require.main === module) {
  generateCoverageReport();
}

module.exports = { generateCoverageReport, analyzeCoverage };