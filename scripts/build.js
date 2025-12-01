#!/usr/bin/env node

/**
 * Cross-platform build script that filters baseline-browser-mapping warnings
 */

const spawn = require('cross-spawn');
const path = require('path');
const readline = require('readline');

// Set environment variables
process.env.BASELINE_BROWSER_MAPPING_WARN = 'false';
process.env.NODE_OPTIONS = '--no-warnings=ExperimentalWarning';

const projectRoot = path.resolve(__dirname, '..');

// Spawn next build process using cross-spawn (handles Windows properly)
const buildProcess = spawn('next', ['build'], {
  cwd: projectRoot,
  env: {
    ...process.env,
    BASELINE_BROWSER_MAPPING_WARN: 'false',
    NODE_OPTIONS: '--no-warnings=ExperimentalWarning',
  },
});

// Filter out baseline-browser-mapping warnings
const filterLine = (line) => {
  if (line.includes('[baseline-browser-mapping]')) {
    return false; // Filter out this line
  }
  return true; // Keep this line
};

// Handle stdout
const stdoutRl = readline.createInterface({
  input: buildProcess.stdout,
  crlfDelay: Infinity,
});

stdoutRl.on('line', (line) => {
  if (filterLine(line)) {
    console.log(line);
  }
});

// Handle stderr
const stderrRl = readline.createInterface({
  input: buildProcess.stderr,
  crlfDelay: Infinity,
});

stderrRl.on('line', (line) => {
  if (filterLine(line)) {
    console.error(line);
  }
});

buildProcess.on('error', (error) => {
  console.error('Build process error:', error);
  process.exit(1);
});

buildProcess.on('exit', (code) => {
  process.exit(code || 0);
});

