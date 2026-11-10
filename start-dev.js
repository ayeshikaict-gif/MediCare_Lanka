const { spawn } = require('child_process');
const path = require('path');

console.log('====================================================');
console.log('Starting MediCare Lanka Full-Stack Application...');
console.log('====================================================');

const backend = spawn(process.execPath, ['src/server.js'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit'
});

const frontend = spawn(process.execPath, [path.join('node_modules', 'vite', 'bin', 'vite.js')], {
  cwd: path.join(__dirname, 'frontend'),
  stdio: 'inherit'
});

const shutdown = () => {
  console.log('\nShutting down servers...');
  backend.kill();
  frontend.kill();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

backend.on('exit', (code) => {
  if (code !== null && code !== 0) {
    console.error(`Backend exited with code ${code}`);
  }
});

frontend.on('exit', (code) => {
  if (code !== null && code !== 0) {
    console.error(`Frontend exited with code ${code}`);
  }
});
