const { PrismaClient } = require('@prisma/client');

console.log('Loading Prisma...');

const prisma = new PrismaClient();

console.log('Prisma created, connecting...');

prisma.$connect()
  .then(() => console.log('Database connected!'))
  .catch(e => console.error('DB connection error:', e.message));

module.exports = { prisma };