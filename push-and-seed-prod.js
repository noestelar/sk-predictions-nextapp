import { execSync } from 'child_process';

// Get the production URL from environment
const prodDbUrl = process.env.POSTGRES_URL_NON_POOLING;

if (!prodDbUrl) {
  console.error('Error: POSTGRES_URL_NON_POOLING environment variable is not set');
  process.exit(1);
}

try {
  // Push the schema to production
  console.log('Pushing schema to production database...');
  execSync(`DATABASE_URL="${prodDbUrl}" npx prisma db push --schema ./prisma/schema.prisma`, {
    stdio: 'inherit'
  });

  // Run the seed script
  console.log('\nRunning database seed...');
  execSync(`DATABASE_URL="${prodDbUrl}" npx prisma db seed`, {
    stdio: 'inherit'
  });

  console.log('\nDatabase setup completed successfully!');
} catch (error) {
  console.error('Error:', error);
  process.exit(1);
} 