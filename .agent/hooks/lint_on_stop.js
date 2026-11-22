const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

// Read Stop hook context from stdin (only if piped, avoid hanging if run interactively)
let inputRaw = '';
if (!process.stdin.isTTY) {
  try {
    inputRaw = fs.readFileSync(0, 'utf-8');
  } catch (e) {}
}

let context = {};
if (inputRaw && inputRaw.trim()) {
  try {
    context = JSON.parse(inputRaw);
  } catch (e) {}
}

const continuationActive = !!context.continuationActive;
const cwd = context.cwd || process.cwd();

function runCmd(cmd, options = {}) {
  try {
    const stdout = execSync(cmd, {
      cwd: options.cwd || cwd,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: options.timeout || 60000,
      env: { ...process.env, ...options.env },
    });
    return { success: true, output: stdout.trim() };
  } catch (err) {
    const combined = ((err.stdout || '') + '\n' + (err.stderr || '')).trim();
    return { success: false, output: combined };
  }
}

// Detect changed files via git
let changedFiles = [];
try {
  const statusOut = execSync('git status --porcelain', { cwd, encoding: 'utf-8' });
  const lines = statusOut.split('\n').filter(Boolean);
  changedFiles = lines.map(line => line.substring(3).trim());
} catch (e) {}

// If working tree is clean, check unpushed commits or last commit
if (changedFiles.length === 0) {
  try {
    const diffOut = execSync('git diff --name-only HEAD~1 HEAD', { cwd, encoding: 'utf-8' });
    changedFiles = diffOut.split('\n').filter(Boolean);
  } catch (e) {}
}

const hasBackendChanges = changedFiles.some(f => f.startsWith('backend/') || f.endsWith('.py'));
const hasFrontendChanges = changedFiles.some(
  f => f.startsWith('frontend/') || /\.(ts|tsx|js|jsx|css|json)$/.test(f)
);

let hasErrors = false;
const errorDetails = [];
const actionsTaken = [];

// 1. Process Backend if touched
if (hasBackendChanges) {
  const backendDir = path.join(cwd, 'backend');
  const venvScripts = path.join(backendDir, '.venv', 'Scripts');
  const ruffExe = path.join(venvScripts, 'ruff.exe');
  const pythonExe = path.join(venvScripts, 'python.exe');

  const ruffCmd = fs.existsSync(ruffExe) ? `"${ruffExe}"` : 'ruff';
  const pyCmd = fs.existsSync(pythonExe) ? `"${pythonExe}"` : 'python';

  // Step A: Ruff check --fix and format
  runCmd(`${ruffCmd} check --fix --no-cache app`, { cwd: backendDir });
  runCmd(`${ruffCmd} format --no-cache app`, { cwd: backendDir });
  actionsTaken.push('Ran ruff auto-fix and code formatter on backend/app');

  // Step B: Ruff final validation
  const ruffVerify = runCmd(`${ruffCmd} check --no-cache app`, { cwd: backendDir });
  if (!ruffVerify.success) {
    hasErrors = true;
    errorDetails.push(`[Backend Ruff Errors]\n${ruffVerify.output}`);
  }

  // Step C: Mypy type validation
  const mypyVerify = runCmd(`${pyCmd} -m mypy --cache-dir=nul app`, { cwd: backendDir });
  if (!mypyVerify.success) {
    hasErrors = true;
    errorDetails.push(`[Backend Mypy Type Errors]\n${mypyVerify.output}`);
  } else {
    actionsTaken.push('Backend mypy type checks passed (0 issues)');
  }
}

// 2. Process Frontend if touched
if (hasFrontendChanges) {
  const frontendDir = path.join(cwd, 'frontend');

  // Step A: ESLint auto-fix
  runCmd('npm run lint -- --fix', { cwd: frontendDir });
  actionsTaken.push('Ran eslint --fix on frontend');

  // Step B: ESLint final validation
  const eslintVerify = runCmd('npm run lint', { cwd: frontendDir });
  if (!eslintVerify.success) {
    hasErrors = true;
    errorDetails.push(`[Frontend ESLint Errors]\n${eslintVerify.output}`);
  } else {
    actionsTaken.push('Frontend eslint checks passed (0 errors)');
  }
}

// 3. Assemble Stop hook response
const response = {
  decision: 'allow',
  reason: 'Linter verification completed successfully.',
};

if (hasErrors) {
  if (!continuationActive) {
    // Intercept stop and instruct agent to fix remaining linter errors
    response.decision = 'continue';
    response.reason = `[Linter Hook] Automatic fixes applied, but remaining errors were detected:\n\n${errorDetails.join('\n\n')}\n\nPlease inspect and fix these issues before finishing.`;
  } else {
    // Avoid infinite loop if continuation was already active
    response.decision = 'allow';
    response.reason = `[Linter Hook Warning] Remaining errors noted (loop guard active):\n${errorDetails.join('\n\n')}`;
  }
} else if (actionsTaken.length > 0) {
  response.reason = `[Linter Hook] All lint & formatting checks passed:\n- ${actionsTaken.join('\n- ')}`;
} else {
  response.reason = '[Linter Hook] No backend or frontend code changes detected.';
}

// Output strictly JSON on stdout as required by the Antigravity Hook contract
console.log(JSON.stringify(response));
