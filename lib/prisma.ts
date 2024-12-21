import { PrismaClient } from '@prisma/client'
import { put } from '@vercel/blob';
import fs from 'fs';
import { initializeDatabase } from './initDb';

declare global {
  var prisma: PrismaClient | undefined
}

const DB_PATH = '/tmp/database.db';

let prisma: PrismaClient

if (process.env.ENVIRONMENT === 'production') {
  // Initialize database
  await initializeDatabase();
  
  // Update DATABASE_URL to use /tmp
  process.env.DATABASE_URL = `file:${DB_PATH}`;
  prisma = new PrismaClient();

  // Save database to Blob storage after each request
  prisma.$use(async (params: any, next: any) => {
    const result = await next(params);
    const dbBuffer = fs.readFileSync(DB_PATH);
    await put('database.db', dbBuffer, { access: 'public' });
    return result;
  });
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient()
  }
  prisma = global.prisma
}

export default prisma