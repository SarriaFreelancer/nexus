import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const user = await prisma.user.findFirst({
    where: { email: 'sarriafreelancer7@gmail.com' },
    include: { memberships: { include: { workspace: true } } }
  });
  console.log(JSON.stringify(user?.memberships.map(m => ({ id: m.id, workspaceId: m.workspaceId, name: m.workspace.name })), null, 2));
}
run().catch(console.error).finally(() => prisma.$disconnect());
