const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['info', 'warn', 'error']
});

async function connectWithRetry(retries = 6, delayMs = 3000) {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`DB: connect attempt ${i + 1}/${retries}...`);
      await prisma.$connect();
      console.log('DB: connected ✔️');
      return;
    } catch (err) {
      console.error(`DB: connect failed (${i + 1}):`, err.message || err);
      if (i < retries - 1) {
        await new Promise(r => setTimeout(r, delayMs));
      }
    }
  }
  console.warn('DB: all connect attempts failed — continuing without blocking startup.');
}

connectWithRetry().catch(err => {
  console.error('DB: unexpected error in connectWithRetry:', err && err.stack ? err.stack : err);
});

function isReady() {
  return true;
}

module.exports = { prisma, isReady };
