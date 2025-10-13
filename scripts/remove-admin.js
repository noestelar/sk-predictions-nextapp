/**
 * Script to remove admin privileges from a user
 * Usage: node scripts/remove-admin.js <email>
 * Example: node scripts/remove-admin.js user@example.com
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function removeAdmin(email) {
  if (!email) {
    console.error('❌ Error: Please provide an email address');
    console.log('Usage: node scripts/remove-admin.js <email>');
    process.exit(1);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.error(`❌ User with email "${email}" not found`);
      process.exit(1);
    }

    if (!user.isAdmin) {
      console.log(`ℹ️  User "${user.name || email}" is not an admin`);
      process.exit(0);
    }

    await prisma.user.update({
      where: { email },
      data: { isAdmin: false },
    });

    console.log(`✅ Successfully removed admin privileges from "${user.name || email}"`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

const email = process.argv[2];
removeAdmin(email);

