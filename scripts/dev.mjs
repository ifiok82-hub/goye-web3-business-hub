import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const nextBin = require.resolve('next/dist/bin/next');

const rawArgs = process.argv.slice(2);
let port = process.env.PORT || '3000';
let host = '0.0.0.0';
const extraArgs = [];

for (let i = 0; i < rawArgs.length; i++) {
  const arg = rawArgs[i];
  if (arg === '--port' || arg === '-p') {
    if (rawArgs[i + 1]) {
      port = rawArgs[++i];
    }
  } else if (arg.startsWith('--port=')) {
    port = arg.split('=')[1] || port;
  } else if (arg === '--host' || arg === '--hostname' || arg === '-H') {
    if (rawArgs[i + 1]) {
      host = rawArgs[++i];
    }
  } else if (arg.startsWith('--host=')) {
    host = arg.split('=')[1] || host;
  } else if (arg.startsWith('--hostname=')) {
    host = arg.split('=')[1] || host;
  } else {
    extraArgs.push(arg);
  }
}

const child = spawn(
  process.execPath,
  [nextBin, 'dev', '-p', String(port), '-H', String(host), ...extraArgs],
  { stdio: 'inherit', env: process.env }
);

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  } else {
    process.exit(code ?? 0);
  }
});
