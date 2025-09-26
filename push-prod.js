import { execSync } from 'child_process';

// Get the production URL from Vercel environment
const prodDbUrl = process.env.DATABASE_URL;

if (!prodDbUrl) {
  console.error('Error: DATABASE_URL environment variable is not set');
  process.exit(1);
}

try {
  // Push the schema to production
  console.log('Pushing schema to production database...');
  execSync(`pnpm dlx prisma db push --schema ./prisma/schema.prisma`, {
    env: { ...process.env, DATABASE_URL: prodDbUrl },
    stdio: 'inherit'
  });

  console.log('Schema push completed successfully!');
} catch (error) {
  console.error('Error pushing schema:', error);
  process.exit(1);
} 
