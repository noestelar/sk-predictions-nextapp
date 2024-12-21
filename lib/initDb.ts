import { put, list } from '@vercel/blob';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const DB_PATH = '/tmp/database.db';

export async function initializeDatabase() {
    if (process.env.ENVIRONMENT === 'production') {
        try {
            // Try to download existing database from Blob storage
            const { blobs } = await list();
            const dbBlob = blobs.find(b => b.pathname === 'database.db');
            if (dbBlob) {
                const response = await fetch(dbBlob.url);
                const buffer = await response.arrayBuffer();
                fs.writeFileSync(DB_PATH, Buffer.from(buffer));
            } else {
                // If no database exists, run migrations and seed
                process.env.DATABASE_URL = `file:${DB_PATH}`;
                execSync('npx prisma migrate deploy');
                execSync('npx prisma db seed');

                // Save the newly created database to blob storage
                const dbBuffer = fs.readFileSync(DB_PATH);
                await put('database.db', dbBuffer, { access: 'public' });
            }
        } catch (error) {
            console.error('Database initialization error:', error);
            throw error;
        }
    }
}