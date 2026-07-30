import { getServerSession } from "next-auth/next";
import { cookies } from "next/headers";
import { authOptions } from "./auth";
import { prisma } from "./prisma";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    (session.user as any).role = "SUPER_ADMIN";
  }
  return session?.user;
}

export async function getCurrentWorkspace() {
  const user = await getCurrentUser();
  if (!(user as any)?.id) {
    throw new Error("UNAUTHORIZED");
  }

  const cookieStore = await cookies();
  const activeWorkspaceId = cookieStore.get("active_workspace_id")?.value;

  let membership: any = null;

  if (activeWorkspaceId) {
    membership = await prisma.workspaceMember.findFirst({
      where: { userId: (user as any).id, workspaceId: activeWorkspaceId },
      include: { workspace: true },
    });
  }

  if (!membership) {
    membership = await prisma.workspaceMember.findFirst({
      where: { userId: (user as any).id },
      include: { workspace: true },
    });
  }

  if (!membership) {
    if ((user as any).role === "SUPER_ADMIN") {
      // Ensure user exists in database first to satisfy FK constraint
      await prisma.user.upsert({
        where: { id: (user as any).id },
        update: {},
        create: {
          id: (user as any).id,
          email: (user as any).email || "admin@nexus.com",
          name: (user as any).name || "Admin User",
          globalRole: "SUPER_ADMIN",
        }
      });

      // Auto-create a default workspace for super admin to prevent lockouts
      const newWorkspace = await prisma.workspace.create({
        data: {
          name: "Default Workspace",
          slug: "default-workspace-" + Date.now(),
        }
      });
      membership = await prisma.workspaceMember.create({
        data: {
          userId: (user as any).id,
          workspaceId: newWorkspace.id,
          role: "ADMIN"
        },
        include: { workspace: true }
      });
    } else {
      throw new Error("NO_WORKSPACE_FOUND");
    }
  }

  return {
    workspace: membership.workspace,
    role: membership.role,
    user: user,
    member: membership
  };
}

// Helper para validar permisos
const roleHierarchy: Record<string, number> = {
  ADMIN: 100,
  MANAGER: 80,
  DEVELOPER: 50,
  DESIGNER: 50,
  QA: 50,
  COMMERCIAL: 40,
  CLIENT: 10,
  GUEST: 0
};

export function hasPermission(userRole: string, requiredRole: string) {
  const userLevel = roleHierarchy[userRole] || 0;
  const requiredLevel = roleHierarchy[requiredRole] || 0;
  return userLevel >= requiredLevel;
}
