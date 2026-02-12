const { PrismaClient } = require('@prisma/client');

console.log('📦 Initializing Prisma Client...');

const prisma = new PrismaClient({
  log: ['error'],
  errorFormat: 'pretty',
});

let connected = false;

async function initializeDatabase() {
  let retries = 0;
  const maxRetries = 10;
  const delayMs = 2000;

  while (retries < maxRetries && !connected) {
    try {
      console.log(`🔄 Database connect attempt ${retries + 1}/${maxRetries}...`);
      await prisma.$connect();
      console.log('✅ Database connected!');
      connected = true;
      return;
    } catch (error) {
      retries++;
      console.error(`❌ Connect failed (${retries}/${maxRetries}):`, error.message);
      
      if (retries < maxRetries) {
        console.log(`⏳ Retrying in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }

  console.warn('⚠️ Max retries reached - continuing without DB (will retry on request)');
  
  // Setup interval retry
  setInterval(async () => {
    if (!connected) {
      try {
        await prisma.$connect();
        console.log('✅ Database reconnected!');
        connected = true;
      } catch (err) {
        console.error('⏳ Still waiting for database...');
      }
    }
  }, 5000);
}

initializeDatabase();

process.on('SIGINT', async () => {
  console.log('Shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});

module.exports = { prisma };