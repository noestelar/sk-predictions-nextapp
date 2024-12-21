import { PrismaClient } from '@prisma/client'
import { put, list } from '@vercel/blob';
import fs from 'fs';
import path from 'path';

declare global {
  var prisma: PrismaClient | undefined
}

const DB_PATH = '/tmp/database.db';

async function initializeDatabase() {
  if (process.env.ENVIRONMENT === 'production') {
    try {
      // Try to download existing database from Blob storage
      const { blobs } = await list();
      const dbBlob = blobs.find(b => b.pathname === 'database.db');
      if (dbBlob) {
        const response = await fetch(dbBlob.url);
        const buffer = await response.arrayBuffer();
        fs.writeFileSync(DB_PATH, Buffer.from(buffer));
      }
    } catch (error) {
      console.log('No existing database found in storage, creating new one');
    }
  }
}

// Function to save database to Blob storage
async function saveDatabase() {
  if (process.env.ENVIRONMENT === 'production') {
    const dbBuffer = fs.readFileSync(DB_PATH);
    await put('database.db', dbBuffer, { access: 'public' });
  }
}

let prisma: PrismaClient

if (process.env.ENVIRONMENT === 'production') {
  // Initialize database from Blob storage
  await initializeDatabase();

  // Update DATABASE_URL to use /tmp
  process.env.DATABASE_URL = `file:${DB_PATH}`;
  prisma = new PrismaClient();

  // Save database to Blob storage after each request
  prisma.$use(async (params: any, next: any) => {
    const result = await next(params);
    await saveDatabase();
    return result;
  });
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient()
  }
  prisma = global.prisma
}

export default prisma