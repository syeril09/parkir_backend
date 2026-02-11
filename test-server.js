#!/usr/bin/env node

const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Backend running' }));
});

server.listen(5000, 'localhost', () => {
  console.log('🚀 Backend server running on http://localhost:5000');
  console.log('Press Ctrl+C to stop...\n');
});

server.on('error', (err) => {
  console.error('Server error:', err);
});
