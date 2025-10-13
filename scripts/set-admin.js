/**
 * Script to set a user as admin
 * Usage: node scripts/set-admin.js <email>
 * Example: node scripts/set-admin.js user@example.com
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setAdmin(email) {
  if (!email) {
    console.error('❌ Error: Please provide an email address');
    console.log('Usage: node scripts/set-admin.js <email>');
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

    if (user.isAdmin) {
      console.log(`ℹ️  User "${user.name || email}" is already an admin`);
      process.exit(0);
    }

    await prisma.user.update({
      where: { email },
      data: { isAdmin: true },
    });

    console.log(`✅ Successfully set "${user.name || email}" as admin`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

const email = process.argv[2];
setAdmin(email);

