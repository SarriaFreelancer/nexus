import { getServerSession } from "next-auth/next";
import { cookies } from "next/headers";
import { authOptions } from "./auth";
import { prisma } from "./prisma";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}

export async function getCurrentWorkspace() {
  const user = await getCurrentUser();
  if (!(user as any)?.id) {
    throw new Error("UNAUTHORIZED");
  }

  const userId = (user as any).id;
  const userEmail = (user as any).email;

  // Buscar usuario en base de datos por ID o Email de forma segura
  const dbUser = await prisma.user.findFirst({
    where: {
      OR: [
        { id: userId },
        ...(userEmail ? [{ email: userEmail }] : [])
      ]
    }
  });

  const effectiveUserId = dbUser ? dbUser.id : userId;

  const cookieStore = await cookies();
  const activeWorkspaceId = cookieStore.get("active_workspace_id")?.value;

  let membership: any = null;

  if (activeWorkspaceId) {
    membership = await prisma.workspaceMember.findFirst({
      where: { userId: effectiveUserId, workspaceId: activeWorkspaceId },
      include: { workspace: true },
    });
  }

  if (!membership) {
    membership = await prisma.workspaceMember.findFirst({
      where: { userId: effectiveUserId },
      include: { workspace: true },
    });

    if (membership) {
      try {
        cookieStore.set("active_workspace_id", membership.workspaceId, { path: "/" });
      } catch (e) {
        // Ignore cookie write errors during RSC render
      }
    }
  }

  if (!membership) {
    // Si el usuario no tiene ninguna membresía, se genera su espacio personal
    const newWorkspace = await prisma.workspace.create({
      data: {
        name: `Espacio de ${(user as any).name || 'Trabajo'}`,
        slug: `espacio-${effectiveUserId.substring(0, 8)}-${Date.now().toString().slice(-4)}`,
        subscriptionPlan: "FREE",
      }
    });

    membership = await prisma.workspaceMember.create({
      data: {
        userId: effectiveUserId,
        workspaceId: newWorkspace.id,
        role: "ADMIN"
      },
      include: { workspace: true }
    });

    try {
      cookieStore.set("active_workspace_id", newWorkspace.id, { path: "/" });
    } catch (e) {}
  }

  return {
    workspace: membership.workspace,
    role: membership.role,
    user: dbUser || user,
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
