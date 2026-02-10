console.log('✅ Node.js is working!');
console.log('Current directory:', process.cwd());
console.log('Node version:', process.version);

// Try to load environment
require('dotenv').config();
console.log('📋 Env loaded');
console.log('PORT:', process.env.PORT || '5000 (default)');

// Done
setTimeout(() => {
  console.log('✅ Test completed successfully');
  process.exit(0);
}, 1000);
