const { join } = require('path');
const { existsSync } = require('fs');
const { spawn } = require('child_process');

function findJest() {
  const candidates = [
    join(process.cwd(), 'node_modules', 'jest', 'bin', 'jest.js'),
    join(process.cwd(), '..', 'node_modules', 'jest', 'bin', 'jest.js'),
    join(__dirname, 'node_modules', 'jest', 'bin', 'jest.js'),
    join(__dirname, '..', 'node_modules', 'jest', 'bin', 'jest.js'),
  ];
  for (const c of candidates) {
    if (existsSync(c)) return c;
  }
  return 'jest';
}

const args = ['--experimental-vm-modules', findJest(), ...process.argv.slice(2)];
const child = spawn(process.execPath, args, { stdio: 'inherit', env: process.env });
child.on('exit', (code) => process.exit(code ?? 0));
