const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('password123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@permitpro.com' },
    update: {},
    create: {
      email: 'admin@permitpro.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'Admin',
    },
  });

  // Create regular user
  const userPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'user@permitpro.com' },
    update: {},
    create: {
      email: 'user@permitpro.com',
      name: 'Regular User',
      password: userPassword,
      role: 'User',
    },
  });

  console.log({ admin, user });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
