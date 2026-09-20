const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Starting Prisma Seed...");

  const superAdminEmail = "superadmin@nexus.com";
  let superAdmin = await prisma.user.findUnique({
    where: { email: superAdminEmail },
  });

  if (!superAdmin) {
    const passwordHash = await bcrypt.hash("Superadmin123", 10);
    superAdmin = await prisma.user.create({
      data: {
        email: superAdminEmail,
        name: "Super Admin",
        password: passwordHash,
        globalRole: "SUPER_ADMIN",
      },
    });
    console.log("Super Admin creado:", superAdmin.email);
  } else {
    console.log("Super Admin ya existe:", superAdmin.email);
  }

  const defaultWorkspaceSlug = "sarriatech-workspace";
  let workspace = await prisma.workspace.findUnique({
    where: { slug: defaultWorkspaceSlug },
  });

  if (!workspace) {
    workspace = await prisma.workspace.create({
      data: {
        name: "SarriaTech Workspace",
        slug: defaultWorkspaceSlug,
        subscriptionPlan: "FREE",
        maxWorkspaces: 5,
        maxProjects: 10,
        maxCollaborators: 20,
      },
    });
    console.log("Workspace principal creado:", workspace.name);
  }

  const membership = await prisma.workspaceMember.findFirst({
    where: {
      userId: superAdmin.id,
      workspaceId: workspace.id,
    },
  });

  if (!membership) {
    await prisma.workspaceMember.create({
      data: {
        userId: superAdmin.id,
        workspaceId: workspace.id,
        role: "ADMIN",
      },
    });
    console.log("Super Admin vinculado al workspace");
  }

  console.log("Seed completado exitosamente.");
}

main()
  .catch((e) => {
    console.error("Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
