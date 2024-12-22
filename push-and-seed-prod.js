import { execSync } from 'child_process';

// Get the production URL from environment
const prodDbUrl = process.env.POSTGRES_PRISMA_URL;

if (!prodDbUrl) {
  console.error('Error: POSTGRES_PRISMA_URL environment variable is not set');
  process.exit(1);
}

try {
  // Push the schema to production
  console.log('Pushing schema to production database...');
  execSync('npx prisma db push --schema ./prisma/schema.prisma', {
    env: { ...process.env, DATABASE_URL: prodDbUrl },
    stdio: 'inherit'
  });

  // Run the seed script
  console.log('\nRunning database seed...');
  execSync('npx prisma db seed', {
    env: { ...process.env, DATABASE_URL: prodDbUrl },
    stdio: 'inherit'
  });

  console.log('\nDatabase setup completed successfully!');
} catch (error) {
  console.error('Error:', error);
  process.exit(1);
} 