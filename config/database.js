const { PrismaClient } = require('@prisma/client');

console.log('📦 Loading Prisma Client...');

let prisma;

try {
  prisma = new PrismaClient();
  console.log('✅ Prisma Client created');
} catch (err) {
  console.error('❌ Failed to create Prisma Client:', err.message);
  process.exit(1);
}

// Connect in background
(async () => {
  try {
    await prisma.$connect();
    console.log('🟢 Database connected!');
  } catch (err) {
    console.error('⚠️ DB connection failed (non-blocking):', err.message);
  }
})();

module.exports = { prisma };
