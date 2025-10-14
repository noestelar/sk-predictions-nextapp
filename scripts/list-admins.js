/**
 * Script to list all admin users
 * Usage: node scripts/list-admins.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function listAdmins() {
  try {
    const admins = await prisma.user.findMany({
      where: { isAdmin: true },
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
      },
    });

    if (admins.length === 0) {
      console.log('ℹ️  No admin users found');
      process.exit(0);
    }

    console.log(`\n📋 Admin Users (${admins.length}):\n`);
    admins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.name || 'No name'}`);
      console.log(`   Email: ${admin.email || 'No email'}`);
      console.log(`   ID: ${admin.id}\n`);
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

listAdmins();

