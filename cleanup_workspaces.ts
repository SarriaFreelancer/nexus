import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanup() {
  const users = await prisma.user.findMany({
    include: {
      memberships: {
        include: { workspace: true },
        orderBy: { workspace: { createdAt: 'asc' } }
      }
    }
  });

  let deleted = 0;
  for (const user of users) {
    // If a user has multiple personal workspaces (named "Espacio de...")
    const personalMemberships = user.memberships.filter(m => 
      m.workspace.name.startsWith("Espacio de") && m.role === "ADMIN"
    );

    if (personalMemberships.length > 1) {
      // Keep the first one, delete the rest
      for (let i = 1; i < personalMemberships.length; i++) {
        const wsId = personalMemberships[i].workspaceId;
        
        // Ensure no other members in this workspace before deleting
        const membersCount = await prisma.workspaceMember.count({ where: { workspaceId: wsId } });
        if (membersCount === 1) {
          await prisma.workspace.delete({ where: { id: wsId } });
          deleted++;
          console.log(`Deleted duplicate workspace ${wsId} for user ${user.email}`);
        }
      }
    }
  }
  
  console.log(`Cleanup complete. Deleted ${deleted} workspaces.`);
}

cleanup().catch(console.error).finally(() => prisma.$disconnect());
