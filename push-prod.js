import { execSync } from 'child_process';

// Get the production URL from Vercel environment
const prodDbUrl = process.env.POSTGRES_URL_NON_POOLING;

if (!prodDbUrl) {
  console.error('Error: POSTGRES_URL_NON_POOLING environment variable is not set');
  process.exit(1);
}

try {
  // Push the schema to production
  console.log('Pushing schema to production database...');
  execSync(`npx prisma db push --schema ./prisma/schema.prisma`, {
    env: { ...process.env, DATABASE_URL: prodDbUrl },
    stdio: 'inherit'
  });

  console.log('Schema push completed successfully!');
} catch (error) {
  console.error('Error pushing schema:', error);
  process.exit(1);
} 