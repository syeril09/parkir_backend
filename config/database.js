const { PrismaClient } = require('@prisma/client');

console.log('Loading Prisma...');
console.log('DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 50) + '...');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'production' ? ['error'] : ['info', 'warn', 'error'],
  errorFormat: 'pretty',
});

console.log('Prisma created, attempting connection...');

prisma.$connect()
  .then(() => {
    console.log('✅ Database connected successfully!');
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
    console.error('Error details:', err);
    // Don't exit, let app run anyway
  });

module.exports = { prisma };