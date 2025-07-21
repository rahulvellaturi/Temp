#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const colorize = (text, color) => `${colors[color]}${text}${colors.reset}`;

// Configuration
const COVERAGE_THRESHOLD = 90;
const COVERAGE_PATH = path.join(__dirname, '..', 'coverage');
const COVERAGE_JSON_PATH = path.join(COVERAGE_PATH, 'coverage-final.json');
const COVERAGE_HTML_PATH = path.join(COVERAGE_PATH, 'lcov-report', 'index.html');

// Helper functions
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const runCommand = (command, options = {}) => {
  try {
    const result = execSync(command, { 
      encoding: 'utf8', 
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options 
    });
    return result;
  } catch (error) {
    if (!options.silent) {
      console.error(colorize(`Error running command: ${command}`, 'red'));
      console.error(colorize(error.message, 'red'));
    }
    throw error;
  }
};

const formatPercentage = (value) => {
  const percentage = Math.round(value * 100) / 100;
  const color = percentage >= COVERAGE_THRESHOLD ? 'green' : 'red';
  return colorize(`${percentage.toFixed(2)}%`, color);
};

const formatNumber = (value) => {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Main coverage analysis function
const analyzeCoverage = () => {
  console.log(colorize('\n🧪 Jest + Enzyme Coverage Analysis', 'bold'));
  console.log(colorize('=' .repeat(50), 'cyan'));
  
  // Check if coverage data exists
  if (!fs.existsSync(COVERAGE_JSON_PATH)) {
    console.log(colorize('\n❌ Coverage data not found. Running tests first...', 'yellow'));
    runTests();
  }
  
  // Read coverage data
  const coverageData = JSON.parse(fs.readFileSync(COVERAGE_JSON_PATH, 'utf8'));
  
  // Analyze coverage by file
  const fileResults = [];
  let totalFiles = 0;
  let passedFiles = 0;
  let totalStatements = 0;
  let coveredStatements = 0;
  let totalBranches = 0;
  let coveredBranches = 0;
  let totalFunctions = 0;
  let coveredFunctions = 0;
  let totalLines = 0;
  let coveredLines = 0;
  
  console.log(colorize('\n📊 Per-File Coverage Analysis:', 'bold'));
  console.log(colorize('-'.repeat(80), 'cyan'));
  console.log(colorize(
    '| File | Statements | Branches | Functions | Lines | Status |', 
    'white'
  ));
  console.log(colorize('-'.repeat(80), 'cyan'));
  
  for (const [filePath, fileData] of Object.entries(coverageData)) {
    // Skip non-source files
    if (!filePath.includes('/src/') || filePath.includes('/__tests__/')) {
      continue;
    }
    
    const relativePath = filePath.replace(process.cwd(), '').substring(1);
    const fileName = path.basename(filePath);
    
    // Calculate coverage percentages
    const statements = fileData.s;
    const branches = fileData.b;
    const functions = fileData.f;
    const lines = fileData.getLineCoverage();
    
    const statementCoverage = calculateCoverage(statements);
    const branchCoverage = calculateCoverage(branches);
    const functionCoverage = calculateCoverage(functions);
    const lineCoverage = calculateCoverage(lines);
    
    // Aggregate totals
    totalFiles++;
    totalStatements += Object.keys(statements).length;
    coveredStatements += Object.values(statements).filter(count => count > 0).length;
    totalBranches += Object.keys(branches).length;
    coveredBranches += Object.values(branches).flat().filter(count => count > 0).length;
    totalFunctions += Object.keys(functions).length;
    coveredFunctions += Object.values(functions).filter(count => count > 0).length;
    totalLines += Object.keys(lines).length;
    coveredLines += Object.values(lines).filter(count => count > 0).length;
    
    // Check if file passes threshold
    const minCoverage = Math.min(
      statementCoverage,
      branchCoverage,
      functionCoverage,
      lineCoverage
    );
    
    const passed = minCoverage >= COVERAGE_THRESHOLD;
    if (passed) passedFiles++;
    
    const status = passed 
      ? colorize('✅ PASS', 'green') 
      : colorize('❌ FAIL', 'red');
    
    // Store file result
    fileResults.push({
      path: relativePath,
      fileName,
      statementCoverage,
      branchCoverage,
      functionCoverage,
      lineCoverage,
      minCoverage,
      passed
    });
    
    // Display file result
    const displayName = fileName.length > 25 ? fileName.substring(0, 22) + '...' : fileName;
    console.log(
      `| ${displayName.padEnd(25)} | ` +
      `${formatPercentage(statementCoverage).padEnd(15)} | ` +
      `${formatPercentage(branchCoverage).padEnd(12)} | ` +
      `${formatPercentage(functionCoverage).padEnd(13)} | ` +
      `${formatPercentage(lineCoverage).padEnd(9)} | ` +
      `${status} |`
    );
  }
  
  console.log(colorize('-'.repeat(80), 'cyan'));
  
  // Calculate overall coverage
  const overallStatementCoverage = (coveredStatements / totalStatements) * 100;
  const overallBranchCoverage = (coveredBranches / totalBranches) * 100;
  const overallFunctionCoverage = (coveredFunctions / totalFunctions) * 100;
  const overallLineCoverage = (coveredLines / totalLines) * 100;
  
  // Display summary
  console.log(colorize('\n📈 Coverage Summary:', 'bold'));
  console.log(colorize('-'.repeat(40), 'cyan'));
  console.log(`Total Files: ${colorize(formatNumber(totalFiles), 'white')}`);
  console.log(`Passed Files: ${colorize(formatNumber(passedFiles), passedFiles === totalFiles ? 'green' : 'red')}`);
  console.log(`Failed Files: ${colorize(formatNumber(totalFiles - passedFiles), totalFiles === passedFiles ? 'green' : 'red')}`);
  console.log(`Pass Rate: ${formatPercentage((passedFiles / totalFiles) * 100)}`);
  
  console.log(colorize('\n🎯 Overall Coverage:', 'bold'));
  console.log(`Statements: ${formatPercentage(overallStatementCoverage)} (${formatNumber(coveredStatements)}/${formatNumber(totalStatements)})`);
  console.log(`Branches: ${formatPercentage(overallBranchCoverage)} (${formatNumber(coveredBranches)}/${formatNumber(totalBranches)})`);
  console.log(`Functions: ${formatPercentage(overallFunctionCoverage)} (${formatNumber(coveredFunctions)}/${formatNumber(totalFunctions)})`);
  console.log(`Lines: ${formatPercentage(overallLineCoverage)} (${formatNumber(coveredLines)}/${formatNumber(totalLines)})`);
  
  // Display failed files
  const failedFiles = fileResults.filter(file => !file.passed);
  if (failedFiles.length > 0) {
    console.log(colorize('\n❌ Files Below 90% Coverage:', 'red'));
    console.log(colorize('-'.repeat(60), 'red'));
    failedFiles.forEach(file => {
      console.log(colorize(`${file.fileName}:`, 'red'));
      console.log(`  Minimum Coverage: ${formatPercentage(file.minCoverage)}`);
      console.log(`  Statements: ${formatPercentage(file.statementCoverage)}`);
      console.log(`  Branches: ${formatPercentage(file.branchCoverage)}`);
      console.log(`  Functions: ${formatPercentage(file.functionCoverage)}`);
      console.log(`  Lines: ${formatPercentage(file.lineCoverage)}`);
      console.log('');
    });
  }
  
  // Generate detailed HTML report
  generateDetailedReport(fileResults, {
    totalFiles,
    passedFiles,
    overallStatementCoverage,
    overallBranchCoverage,
    overallFunctionCoverage,
    overallLineCoverage
  });
  
  // Exit with appropriate code
  const allPassed = passedFiles === totalFiles;
  const overallPassed = Math.min(
    overallStatementCoverage,
    overallBranchCoverage,
    overallFunctionCoverage,
    overallLineCoverage
  ) >= COVERAGE_THRESHOLD;
  
  if (allPassed && overallPassed) {
    console.log(colorize('\n🎉 All files meet the 90% coverage requirement!', 'green'));
    console.log(colorize('✨ Coverage report generated successfully!', 'green'));
    return true;
  } else {
    console.log(colorize('\n💥 Coverage requirements not met!', 'red'));
    console.log(colorize('📝 Please improve test coverage for failed files.', 'yellow'));
    return false;
  }
};

const calculateCoverage = (coverageData) => {
  if (typeof coverageData === 'object') {
    const values = Object.values(coverageData);
    if (values.length === 0) return 100;
    
    // Handle branches (nested arrays)
    if (Array.isArray(values[0])) {
      const flatValues = values.flat();
      const covered = flatValues.filter(count => count > 0).length;
      return (covered / flatValues.length) * 100;
    }
    
    // Handle statements, functions, lines
    const covered = values.filter(count => count > 0).length;
    return (covered / values.length) * 100;
  }
  
  return 100;
};

const runTests = () => {
  console.log(colorize('\n🚀 Running Jest tests with coverage...', 'blue'));
  
  try {
    runCommand('npm run test:coverage', { cwd: path.dirname(__dirname) });
  } catch (error) {
    console.log(colorize('⚠️  Test execution completed with some issues.', 'yellow'));
    console.log(colorize('📊 Proceeding with coverage analysis...', 'blue'));
  }
};

const generateDetailedReport = (fileResults, summary) => {
  const reportPath = path.join(COVERAGE_PATH, 'detailed-report.html');
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Jest + Enzyme Coverage Report - AssureMe Insurance Platform</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
        }
        
        .header p {
            font-size: 1.1rem;
            opacity: 0.9;
        }
        
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .summary-card {
            background: white;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            text-align: center;
        }
        
        .summary-card h3 {
            font-size: 1.2rem;
            margin-bottom: 15px;
            color: #666;
        }
        
        .summary-card .value {
            font-size: 2.5rem;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .summary-card .label {
            font-size: 0.9rem;
            color: #888;
        }
        
        .pass { color: #10b981; }
        .fail { color: #ef4444; }
        .warning { color: #f59e0b; }
        
        .table-container {
            background: white;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        
        .table-header {
            background: #f8fafc;
            padding: 20px;
            border-bottom: 1px solid #e2e8f0;
        }
        
        .table-header h2 {
            font-size: 1.5rem;
            color: #374151;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
        }
        
        th, td {
            padding: 12px 15px;
            text-align: left;
            border-bottom: 1px solid #e2e8f0;
        }
        
        th {
            background: #f8fafc;
            font-weight: 600;
            color: #374151;
        }
        
        tr:hover {
            background: #f8fafc;
        }
        
        .status-badge {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8rem;
            font-weight: 600;
        }
        
        .status-pass {
            background: #dcfce7;
            color: #166534;
        }
        
        .status-fail {
            background: #fecaca;
            color: #991b1b;
        }
        
        .coverage-bar {
            width: 100px;
            height: 8px;
            background: #e5e7eb;
            border-radius: 4px;
            overflow: hidden;
            display: inline-block;
            margin-right: 10px;
        }
        
        .coverage-fill {
            height: 100%;
            transition: width 0.3s ease;
        }
        
        .coverage-high { background: #10b981; }
        .coverage-medium { background: #f59e0b; }
        .coverage-low { background: #ef4444; }
        
        .footer {
            text-align: center;
            margin-top: 40px;
            padding: 20px;
            color: #666;
        }
        
        .footer a {
            color: #667eea;
            text-decoration: none;
        }
        
        .footer a:hover {
            text-decoration: underline;
        }
        
        @media (max-width: 768px) {
            .container {
                padding: 10px;
            }
            
            .header h1 {
                font-size: 2rem;
            }
            
            .summary {
                grid-template-columns: 1fr;
            }
            
            table {
                font-size: 0.9rem;
            }
            
            th, td {
                padding: 8px 10px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 Jest + Enzyme Coverage Report</h1>
            <p>AssureMe Insurance Platform - Comprehensive Unit Testing</p>
            <p>Generated: ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="summary">
            <div class="summary-card">
                <h3>Total Files</h3>
                <div class="value">${summary.totalFiles}</div>
                <div class="label">Components & Modules</div>
            </div>
            
            <div class="summary-card">
                <h3>Passed Files</h3>
                <div class="value ${summary.passedFiles === summary.totalFiles ? 'pass' : 'fail'}">
                    ${summary.passedFiles}
                </div>
                <div class="label">≥90% Coverage</div>
            </div>
            
            <div class="summary-card">
                <h3>Pass Rate</h3>
                <div class="value ${summary.passedFiles === summary.totalFiles ? 'pass' : 'fail'}">
                    ${Math.round((summary.passedFiles / summary.totalFiles) * 100)}%
                </div>
                <div class="label">Success Rate</div>
            </div>
            
            <div class="summary-card">
                <h3>Overall Coverage</h3>
                <div class="value ${Math.min(summary.overallStatementCoverage, summary.overallBranchCoverage, summary.overallFunctionCoverage, summary.overallLineCoverage) >= 90 ? 'pass' : 'fail'}">
                    ${Math.round(Math.min(summary.overallStatementCoverage, summary.overallBranchCoverage, summary.overallFunctionCoverage, summary.overallLineCoverage))}%
                </div>
                <div class="label">Minimum Coverage</div>
            </div>
        </div>
        
        <div class="table-container">
            <div class="table-header">
                <h2>📊 Detailed Coverage by File</h2>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>File</th>
                        <th>Statements</th>
                        <th>Branches</th>
                        <th>Functions</th>
                        <th>Lines</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${fileResults.map(file => {
                      const getCoverageClass = (coverage) => {
                        if (coverage >= 90) return 'coverage-high';
                        if (coverage >= 75) return 'coverage-medium';
                        return 'coverage-low';
                      };
                      
                      return `
                        <tr>
                            <td><strong>${file.fileName}</strong><br><small style="color: #666;">${file.path}</small></td>
                            <td>
                                <div class="coverage-bar">
                                    <div class="coverage-fill ${getCoverageClass(file.statementCoverage)}" style="width: ${file.statementCoverage}%"></div>
                                </div>
                                ${file.statementCoverage.toFixed(1)}%
                            </td>
                            <td>
                                <div class="coverage-bar">
                                    <div class="coverage-fill ${getCoverageClass(file.branchCoverage)}" style="width: ${file.branchCoverage}%"></div>
                                </div>
                                ${file.branchCoverage.toFixed(1)}%
                            </td>
                            <td>
                                <div class="coverage-bar">
                                    <div class="coverage-fill ${getCoverageClass(file.functionCoverage)}" style="width: ${file.functionCoverage}%"></div>
                                </div>
                                ${file.functionCoverage.toFixed(1)}%
                            </td>
                            <td>
                                <div class="coverage-bar">
                                    <div class="coverage-fill ${getCoverageClass(file.lineCoverage)}" style="width: ${file.lineCoverage}%"></div>
                                </div>
                                ${file.lineCoverage.toFixed(1)}%
                            </td>
                            <td>
                                <span class="status-badge ${file.passed ? 'status-pass' : 'status-fail'}">
                                    ${file.passed ? '✅ PASS' : '❌ FAIL'}
                                </span>
                            </td>
                        </tr>
                      `;
                    }).join('')}
                </tbody>
            </table>
        </div>
        
        <div class="footer">
            <p>
                Generated by <strong>Jest + Enzyme Coverage Reporter</strong> | 
                <a href="${COVERAGE_HTML_PATH}" target="_blank">View Detailed LCOV Report</a>
            </p>
            <p style="margin-top: 10px; font-size: 0.9rem;">
                🎯 Coverage Threshold: 90% | 🧪 Test Framework: Jest + Enzyme
            </p>
        </div>
    </div>
</body>
</html>
  `;
  
  ensureDirectoryExists(path.dirname(reportPath));
  fs.writeFileSync(reportPath, html);
  
  console.log(colorize(`\n📄 Detailed HTML report generated: ${reportPath}`, 'blue'));
};

// Main execution
const main = () => {
  try {
    const success = analyzeCoverage();
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error(colorize('\n💥 Coverage analysis failed:', 'red'));
    console.error(colorize(error.message, 'red'));
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  analyzeCoverage,
  runTests,
  calculateCoverage,
  COVERAGE_THRESHOLD
};