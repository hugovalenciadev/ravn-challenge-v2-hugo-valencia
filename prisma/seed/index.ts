import { PrismaClient } from '@prisma/client';
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();
const users = require('./data/users');
const roles = require('./data/roles');

async function main() {
  
  await prisma.role.createMany({
    data: roles.map((role) => {
      return { 
        name: role.name,
      };
    }),
    skipDuplicates: true,
  });
  

  await Promise.all(
    users.map(async (user) => {
      
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(user.password, salt);
      
      let userDb = await prisma.user.upsert({
        where: {
          email: user.email,
        },
        create: {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          password: hash,
        },
        update: {}
      })

      let roleDb = await prisma.role.findUnique({
        where: {
          name: user.role,
        }
      })

      await prisma.userRole.upsert({
        where: { 
          userId_roleId: {
            userId: userDb.id,
            roleId: roleDb.id,
          } },
        create: {
          userId: userDb.id,
          roleId: roleDb.id,
        },
        update: {},
      });
    }),
  );
  
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });