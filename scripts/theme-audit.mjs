import fs from 'fs';
import chalk from 'chalk';

const FILTERS = {
  unusedColors  : /bg-red-5(?!00)/,
  misAlignedGap : /class="[^"]*(?:min-h|mb-8)\s[^"]*"/,
  maxWidth      : /max-w-\['\d+px'\]/,
  headerGap     : /pt-1[6-9]|pt-2[0-4]/, // Large top padding that might cause gaps
  inconsistentSpacing: /(?:pt|pb|mt|mb)-[0-9]+/g,
  hardcodedColors: /#[0-9a-fA-F]{3,6}/g,
  missingResponsive: /className="[^"]*(?:text-|bg-|p-|m-)[^"]*"/g
};

const ROOT = './src';
let issues = [];

console.log(chalk.blue('🔍 TaleForge Theme Audit Starting...\n'));

// Scan all TypeScript/TSX files
for await (const f of await fs.promises.readdir(ROOT, {recursive: true})) {
  if (!f.endsWith('.tsx') && !f.endsWith('.ts')) continue;
  
  const filePath = `${ROOT}/${f}`;
  const code = fs.readFileSync(filePath, 'utf8');
  
  Object.entries(FILTERS).forEach(([name, regex]) => {
    const matches = code.match(regex);
    if (matches) {
      const lineNumber = code.split('\n').findIndex(l => l.includes(matches[0])) + 1;
      issues.push({
        file: f,
        line: lineNumber,
        type: name,
        match: matches[0],
        severity: name === 'headerGap' ? 'HIGH' : 'MEDIUM'
      });
    }
  });
}

// Group issues by type
const groupedIssues = issues.reduce((acc, issue) => {
  if (!acc[issue.type]) acc[issue.type] = [];
  acc[issue.type].push(issue);
  return acc;
}, {});

console.log(chalk.red('⚡ QUICK SCAN RESULTS\n'));

Object.entries(groupedIssues).forEach(([type, typeIssues]) => {
  console.log(chalk.yellow(`📋 ${type.toUpperCase()} (${typeIssues.length} issues):`));
  typeIssues.forEach(i => {
    const severityColor = i.severity === 'HIGH' ? chalk.red : chalk.yellow;
    console.log(`  ${severityColor(i.file + ':' + i.line)} → ${i.match.substring(0, 50)}...`);
  });
  console.log('');
});

// Save detailed report
fs.writeFileSync('theme-issues.json', JSON.stringify(issues, null, 2));
console.log(chalk.green('📄 Detailed report saved to theme-issues.json'));

// Summary
const highPriorityIssues = issues.filter(i => i.severity === 'HIGH');
console.log(chalk.red(`\n🚨 HIGH PRIORITY: ${highPriorityIssues.length} issues need immediate attention`));

if (issues.length > 30) {
  console.log(chalk.blue("🔍 Large delta detected, consider using automated UX tools..."));
}

console.log(chalk.green('\n✅ Theme audit complete!')); 