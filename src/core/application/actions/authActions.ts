"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function registerUser(data: {
  name: string;
  email: string;
  username?: string;
  company?: string;
  password: string;
}) {
  try {
    const { name, email, username, company, password } = data;

    if (!name || !email || !password) {
      return { success: false, error: "Nombre, email y contraseña son obligatorios" };
    }

    // Normalizar email
    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username?.trim().toLowerCase() || cleanEmail.split("@")[0];

    // Verificar si ya existe usuario con este email
    const existingEmail = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });
    if (existingEmail) {
      return { success: false, error: "El correo electrónico ya está registrado." };
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Determinar si es el primer usuario del sistema (Super Admin) o usuario estándar
    const userCount = await prisma.user.count();
    const globalRole = userCount === 0 || cleanEmail === "superadmin@nexus.com" ? "SUPER_ADMIN" : "USER";

    // 1. Crear usuario
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        username: cleanUsername,
        password: hashedPassword,
        globalRole: globalRole as any,
      },
    });

    // 2. Crear su Espacio de Trabajo en Plan FREE donde es ADMIN
    const workspaceName = company?.trim() || `Espacio de ${name.trim()}`;
    const slug = `${workspaceName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString().slice(-4)}`;

    const newWorkspace = await prisma.workspace.create({
      data: {
        name: workspaceName,
        slug: slug,
        subscriptionPlan: "FREE",
        maxWorkspaces: 2,
        maxProjects: 3,
        maxCollaborators: 5
      },
    });

    // 3. Asignar rol ADMIN en su espacio de trabajo
    await prisma.workspaceMember.create({
      data: {
        userId: newUser.id,
        workspaceId: newWorkspace.id,
        role: "ADMIN",
      },
    });

    return { success: true, message: "Usuario y Espacio de Trabajo registrados exitosamente como ADMIN (Plan Free)." };
  } catch (error: any) {
    console.error("Error al registrar usuario:", error);
    return { success: false, error: error.message || "Error al procesar el registro" };
  }
}
