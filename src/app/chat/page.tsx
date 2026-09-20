import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getWorkspaceContacts, getConversations } from "@/core/application/actions/chatActions";
import { ChatClient } from "./ChatClient";

export const dynamic = "force-dynamic";

export default async function ChatPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  const userId = (session.user as any).id || "";

  const [contactsRes, conversationsRes] = await Promise.all([
    getWorkspaceContacts(),
    getConversations(),
  ]);

  const contacts = contactsRes.success ? contactsRes.contacts : [];
  const conversations = conversationsRes.success ? conversationsRes.conversations : [];

  return (
    <div className="space-y-4 max-w-[1700px] mx-auto pb-4">
      <ChatClient
        initialContacts={contacts}
        initialConversations={conversations}
        currentUserId={userId}
      />
    </div>
  );
}
