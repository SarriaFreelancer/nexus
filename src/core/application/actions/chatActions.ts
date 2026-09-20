"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentWorkspace } from "@/lib/serverAuth";
import { triggerPusherEvent } from "@/lib/pusherServer";
import { revalidatePath } from "next/cache";

export interface ContactItem {
  id: string; // userId if member, or clientId if client
  type: "MEMBER" | "CLIENT";
  name: string;
  email?: string | null;
  avatarUrl?: string | null;
  roleOrCompany: string;
  userId?: string | null; // actual User.id for direct chat
}

export interface ConversationSummary {
  id: string;
  type: "DIRECT" | "GROUP";
  title?: string | null;
  lastMessageAt: string;
  lastMessage?: {
    id: string;
    content: string;
    senderId: string;
    senderName: string;
    createdAt: string;
    fileUrl?: string | null;
  } | null;
  unreadCount: number;
  otherParticipant?: {
    id: string;
    name: string;
    email?: string | null;
    avatarUrl?: string | null;
    role?: string | null;
  } | null;
  participants: Array<{
    id: string;
    name: string;
    avatarUrl?: string | null;
    role?: string | null;
  }>;
}

export interface MessageItem {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string | null;
  content: string;
  fileUrl?: string | null;
  fileName?: string | null;
  fileType?: string | null;
  createdAt: string;
  isMine: boolean;
}

/**
 * Obtiene todos los contactos del Workspace (Colaboradores y Clientes)
 */
export async function getWorkspaceContacts(): Promise<{ success: boolean; contacts: ContactItem[]; currentUserId?: string; error?: string }> {
  try {
    const authData = await getCurrentWorkspace();
    const user = authData.user as any;
    const workspace = authData.workspace;

    // 1. Obtener miembros del workspace
    const members = await prisma.workspaceMember.findMany({
      where: { workspaceId: workspace.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            globalRole: true,
          },
        },
      },
    });

    // 2. Obtener clientes del workspace
    const clients = await prisma.client.findMany({
      where: { workspaceId: workspace.id },
    });

    const contacts: ContactItem[] = [];

    // Formatear miembros (excluyendo al usuario actual de la lista de contactos para no chatear consigo mismo)
    for (const m of members) {
      if (m.user.id !== user.id) {
        contacts.push({
          id: m.user.id,
          userId: m.user.id,
          type: "MEMBER",
          name: m.user.name || m.user.email || "Usuario",
          email: m.user.email,
          avatarUrl: m.user.avatarUrl,
          roleOrCompany: m.role || "Equipo",
        });
      }
    }

    // Formatear clientes
    for (const c of clients) {
      // Buscar si existe un User con el email del cliente
      const linkedUser = c.email
        ? await prisma.user.findUnique({ where: { email: c.email } })
        : null;

      contacts.push({
        id: c.id,
        userId: linkedUser?.id || null,
        type: "CLIENT",
        name: c.contactName ? `${c.contactName} (${c.company})` : c.company,
        email: c.email,
        avatarUrl: null,
        roleOrCompany: `Cliente: ${c.company}`,
      });
    }

    return { success: true, contacts, currentUserId: user.id };
  } catch (error: any) {
    console.error("Error in getWorkspaceContacts:", error);
    return { success: false, contacts: [], error: error.message || "Error al obtener contactos" };
  }
}

/**
 * Obtiene o crea una conversación directa (1 a 1) entre el usuario actual y el contacto destino
 */
export async function getOrCreateDirectConversation(targetUserId: string): Promise<{ success: boolean; conversationId?: string; error?: string }> {
  try {
    const authData = await getCurrentWorkspace();
    const user = authData.user as any;
    const workspace = authData.workspace;

    if (user.id === targetUserId) {
      return { success: false, error: "No puedes iniciar un chat contigo mismo" };
    }

    // Buscar si ya existe una conversación directa entre ambos usuarios
    const existingConversations = await prisma.conversation.findMany({
      where: {
        type: "DIRECT",
        AND: [
          { participants: { some: { userId: user.id } } },
          { participants: { some: { userId: targetUserId } } },
        ],
      },
      include: {
        participants: true,
      },
    });

    if (existingConversations.length > 0) {
      return { success: true, conversationId: existingConversations[0].id };
    }

    // Crear nueva conversación directa
    const newConv = await prisma.conversation.create({
      data: {
        workspaceId: workspace.id,
        type: "DIRECT",
        participants: {
          create: [
            { userId: user.id },
            { userId: targetUserId },
          ],
        },
      },
    });

    // Notificar a través de Pusher sobre la nueva conversación
    await Promise.all([
      triggerPusherEvent(`chat-workspace-${workspace.id}`, "conversation-created", {
        conversationId: newConv.id,
        creatorId: user.id,
        targetUserId,
      }),
      triggerPusherEvent(`chat-user-${user.id}`, "conversation-created", {
        conversationId: newConv.id,
      }),
      triggerPusherEvent(`chat-user-${targetUserId}`, "conversation-created", {
        conversationId: newConv.id,
      }),
    ]);

    revalidatePath("/chat");
    return { success: true, conversationId: newConv.id };
  } catch (error: any) {
    console.error("Error in getOrCreateDirectConversation:", error);
    return { success: false, error: error.message || "Error al iniciar conversación" };
  }
}

/**
 * Lista todas las conversaciones activas del usuario en el workspace
 */
export async function getConversations(): Promise<{ success: boolean; conversations: ConversationSummary[]; error?: string }> {
  try {
    const authData = await getCurrentWorkspace();
    const user = authData.user as any;
    const workspace = authData.workspace;

    const convs = await prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId: user.id },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                globalRole: true,
              },
            },
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        lastMessageAt: "desc",
      },
    });

    const result: ConversationSummary[] = [];

    for (const conv of convs) {
      const myParticipant = conv.participants.find((p) => p.userId === user.id);
      const otherParticipant = conv.participants.find((p) => p.userId !== user.id)?.user || null;

      // Calcular mensajes no leídos
      let unreadCount = 0;
      if (myParticipant) {
        unreadCount = await prisma.chatMessage.count({
          where: {
            conversationId: conv.id,
            senderId: { not: user.id },
            createdAt: { gt: myParticipant.lastReadAt },
          },
        });
      }

      const lastMsg = conv.messages[0] || null;

      result.push({
        id: conv.id,
        type: conv.type as "DIRECT" | "GROUP",
        title: conv.title || (otherParticipant ? otherParticipant.name : "Conversación"),
        lastMessageAt: conv.lastMessageAt.toISOString(),
        lastMessage: lastMsg
          ? {
              id: lastMsg.id,
              content: lastMsg.content,
              senderId: lastMsg.senderId,
              senderName: lastMsg.sender?.name || "Usuario",
              createdAt: lastMsg.createdAt.toISOString(),
              fileUrl: lastMsg.fileUrl,
            }
          : null,
        unreadCount,
        otherParticipant: otherParticipant
          ? {
              id: otherParticipant.id,
              name: otherParticipant.name,
              email: otherParticipant.email,
              avatarUrl: otherParticipant.avatarUrl,
              role: otherParticipant.globalRole,
            }
          : null,
        participants: conv.participants.map((p) => ({
          id: p.user.id,
          name: p.user.name,
          avatarUrl: p.user.avatarUrl,
          role: p.user.globalRole,
        })),
      });
    }

    return { success: true, conversations: result };
  } catch (error: any) {
    console.error("Error in getConversations:", error);
    return { success: false, conversations: [], error: error.message || "Error al obtener conversaciones" };
  }
}

/**
 * Obtiene el historial de mensajes de una conversación
 */
export async function getMessages(conversationId: string, limit: number = 60): Promise<{ success: boolean; messages: MessageItem[]; error?: string }> {
  try {
    const authData = await getCurrentWorkspace();
    const user = authData.user as any;
    const workspace = authData.workspace;

    // Validar pertenencia
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: user.id,
        },
      },
    });

    if (!participant) {
      return { success: false, messages: [], error: "No tienes acceso a esta conversación" };
    }

    const rawMessages = await prisma.chatMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      take: limit,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Marcar como leída automáticamente al abrirla
    await prisma.conversationParticipant.update({
      where: {
        conversationId_userId: {
          conversationId,
          userId: user.id,
        },
      },
      data: {
        lastReadAt: new Date(),
      },
    });

    const messages: MessageItem[] = rawMessages.map((m) => ({
      id: m.id,
      conversationId: m.conversationId,
      senderId: m.senderId,
      senderName: m.sender?.name || "Usuario",
      senderAvatar: m.sender?.avatarUrl,
      content: m.content,
      fileUrl: m.fileUrl,
      fileName: m.fileName,
      fileType: m.fileType,
      createdAt: m.createdAt.toISOString(),
      isMine: m.senderId === user.id,
    }));

    return { success: true, messages };
  } catch (error: any) {
    console.error("Error in getMessages:", error);
    return { success: false, messages: [], error: error.message || "Error al obtener mensajes" };
  }
}

/**
 * Envía un nuevo mensaje a la conversación y emite el evento en Pusher
 */
export async function sendMessage(params: {
  conversationId: string;
  content: string;
  fileUrl?: string | null;
  fileName?: string | null;
  fileType?: string | null;
}): Promise<{ success: boolean; message?: MessageItem; error?: string }> {
  try {
    const authData = await getCurrentWorkspace();
    const user = authData.user as any;
    const workspace = authData.workspace;
    const { conversationId, content, fileUrl, fileName, fileType } = params;

    if (!content.trim() && !fileUrl) {
      return { success: false, error: "El mensaje no puede estar vacío" };
    }

    // Validar pertenencia
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: user.id,
        },
      },
    });

    if (!participant) {
      return { success: false, error: "No eres participante de esta conversación" };
    }

    // 1. Guardar mensaje en base de datos
    const newMsg = await prisma.chatMessage.create({
      data: {
        conversationId,
        senderId: user.id,
        content: content.trim(),
        fileUrl: fileUrl || null,
        fileName: fileName || null,
        fileType: fileType || null,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    // 2. Actualizar timestamp de la conversación y lastReadAt del remitente
    const now = new Date();
    await Promise.all([
      prisma.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: now },
      }),
      prisma.conversationParticipant.update({
        where: {
          conversationId_userId: {
            conversationId,
            userId: user.id,
          },
        },
        data: { lastReadAt: now },
      }),
    ]);

    const formattedMessage: MessageItem = {
      id: newMsg.id,
      conversationId: newMsg.conversationId,
      senderId: newMsg.senderId,
      senderName: newMsg.sender?.name || user.name || "Usuario",
      senderAvatar: newMsg.sender?.avatarUrl || user.avatarUrl,
      content: newMsg.content,
      fileUrl: newMsg.fileUrl,
      fileName: newMsg.fileName,
      fileType: newMsg.fileType,
      createdAt: newMsg.createdAt.toISOString(),
      isMine: true,
    };

    // 3. Emitir evento en tiempo real a Pusher
    // Obtener todos los participantes para notificar a sus canales personales
    const participants = await prisma.conversationParticipant.findMany({
      where: { conversationId },
      select: { userId: true },
    });

    const triggerPromises: Promise<any>[] = [
      // Canal específico de la conversación
      triggerPusherEvent(`chat-conversation-${conversationId}`, "new-message", {
        ...formattedMessage,
        isMine: false,
      }),
      // Canal general del workspace
      triggerPusherEvent(`chat-workspace-${workspace.id}`, "conversation-updated", {
        conversationId,
        lastMessage: {
          id: formattedMessage.id,
          content: formattedMessage.content,
          senderId: formattedMessage.senderId,
          senderName: formattedMessage.senderName,
          createdAt: formattedMessage.createdAt,
          fileUrl: formattedMessage.fileUrl,
        },
        lastMessageAt: now.toISOString(),
      }),
    ];

    // Notificar al canal individual de cada participante
    for (const p of participants) {
      triggerPromises.push(
        triggerPusherEvent(`chat-user-${p.userId}`, "new-message-notification", {
          conversationId,
          message: formattedMessage,
        })
      );
    }

    await Promise.all(triggerPromises);

    return { success: true, message: formattedMessage };
  } catch (error: any) {
    console.error("Error in sendMessage:", error);
    return { success: false, error: error.message || "Error al enviar mensaje" };
  }
}

/**
 * Marca una conversación como leída
 */
export async function markConversationAsRead(conversationId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const authData = await getCurrentWorkspace();
    const user = authData.user as any;
    const workspace = authData.workspace;

    await prisma.conversationParticipant.update({
      where: {
        conversationId_userId: {
          conversationId,
          userId: user.id,
        },
      },
      data: {
        lastReadAt: new Date(),
      },
    });

    await triggerPusherEvent(`chat-conversation-${conversationId}`, "message-read", {
      conversationId,
      userId: user.id,
      readAt: new Date().toISOString(),
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error in markConversationAsRead:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Emite un evento de usuario escribiendo...
 */
export async function broadcastTyping(conversationId: string, isTyping: boolean): Promise<{ success: boolean }> {
  try {
    const authData = await getCurrentWorkspace();
    const user = authData.user as any;

    await triggerPusherEvent(`chat-conversation-${conversationId}`, "user-typing", {
      conversationId,
      userId: user.id,
      userName: user.name,
      isTyping,
    });

    return { success: true };
  } catch (e) {
    return { success: false };
  }
}
