"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MessageSquare, X, Maximize2, Send, Users, Circle, Loader2 } from "lucide-react";
import { getConversations, getMessages, sendMessage, ConversationSummary, MessageItem } from "@/core/application/actions/chatActions";
import { getPusherClient } from "@/lib/pusherClient";
import { useSession } from "next-auth/react";

// Sound synthesizer for message notification
function playWidgetChime() {
  try {
    if (typeof window === "undefined") return;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {}
}

export function FloatingChatWidget() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [totalUnread, setTotalUnread] = useState(0);

  const currentUserId = (session?.user as any)?.id || "";

  const refreshConversations = () => {
    getConversations().then((res) => {
      if (res.success) {
        setConversations(res.conversations);
        const unread = res.conversations.reduce((acc, c) => acc + c.unreadCount, 0);
        setTotalUnread(unread);
        if (res.conversations.length > 0 && !activeConvId) {
          setActiveConvId(res.conversations[0].id);
        }
      }
    });
  };

  useEffect(() => {
    if (!session?.user) return;
    refreshConversations();
  }, [session, isOpen]);

  // Global user channel listener for new messages & unread counter
  useEffect(() => {
    const pusher = getPusherClient();
    if (!pusher || !currentUserId) return;

    const userChannel = pusher.subscribe(`chat-user-${currentUserId}`);
    userChannel.bind("new-message-notification", (data: { conversationId: string; message: MessageItem }) => {
      if (data.message.senderId !== currentUserId) {
        playWidgetChime();
      }
      refreshConversations();
    });

    userChannel.bind("conversation-created", () => {
      refreshConversations();
    });

    return () => {
      userChannel.unbind_all();
      pusher.unsubscribe(`chat-user-${currentUserId}`);
    };
  }, [currentUserId]);

  useEffect(() => {
    if (!activeConvId || !isOpen) return;
    getMessages(activeConvId).then((res) => {
      if (res.success) {
        setMessages(res.messages);
      }
    });
  }, [activeConvId, isOpen]);

  // Real-time Pusher listener for active conversation in floating widget
  useEffect(() => {
    const pusher = getPusherClient();
    if (!pusher || !activeConvId) return;

    const channel = pusher.subscribe(`chat-conversation-${activeConvId}`);
    channel.bind("new-message", (msg: MessageItem) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, { ...msg, isMine: msg.senderId === currentUserId }];
      });
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`chat-conversation-${activeConvId}`);
    };
  }, [activeConvId, currentUserId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConvId || sending) return;

    const content = inputText.trim();
    setInputText("");
    setSending(true);

    try {
      const res = await sendMessage({
        conversationId: activeConvId,
        content,
      });
      if (res.success && res.message) {
        setMessages((prev) => [...prev, res.message!]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  const activeConv = conversations.find((c) => c.id === activeConvId);

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="relative p-3.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/40 hover:scale-105 transition-all cursor-pointer flex items-center justify-center"
          title="Abrir Chat"
        >
          <MessageSquare className="w-6 h-6" />
          {totalUnread > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center ring-2 ring-white dark:ring-[#0b0e1a] animate-pulse">
              {totalUnread}
            </span>
          )}
        </button>
      ) : (
        <div className="w-[calc(100vw-2rem)] sm:w-96 max-w-[380px] h-[480px] max-h-[calc(100vh-6rem)] rounded-2xl bg-white dark:bg-[#0b0e1a] border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
          {/* Header */}
          <div className="p-3 px-4 bg-indigo-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <h4 className="font-bold text-xs truncate">
                {activeConv ? activeConv.title : "Chat Nexus"}
              </h4>
            </div>

            <div className="flex items-center gap-1.5">
              <Link
                href="/chat"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                title="Expandir a pantalla completa"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
                title="Cerrar"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Conversation Bar if multiple */}
          {conversations.length > 1 && (
            <div className="p-2 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto">
              {conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveConvId(c.id)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold shrink-0 transition-colors cursor-pointer ${
                    c.id === activeConvId
                      ? "bg-indigo-600 text-white"
                      : "bg-white dark:bg-[#121626] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
                  }`}
                >
                  {c.title}
                </button>
              ))}
            </div>
          )}

          {/* Messages Thread */}
          <div className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs bg-slate-50/50 dark:bg-[#070a14]">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-400">
                <Users className="w-8 h-8 opacity-40 mb-1" />
                <p className="text-[11px]">No hay mensajes en esta conversación</p>
                <Link
                  href="/chat"
                  onClick={() => setIsOpen(false)}
                  className="mt-2 text-[10px] font-bold text-indigo-500 hover:underline"
                >
                  Ver todos los contactos
                </Link>
              </div>
            ) : (
              messages.map((m) => {
                const isMine = m.isMine || m.senderId === currentUserId;
                return (
                  <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] p-2.5 rounded-xl ${
                        isMine
                          ? "bg-indigo-600 text-white rounded-br-xs"
                          : "bg-white dark:bg-[#121626] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-bl-xs"
                      }`}
                    >
                      <p className="break-words">{m.content}</p>
                      <span className={`block text-[8px] mt-1 text-right ${isMine ? "text-indigo-200" : "text-slate-400"}`}>
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-2.5 bg-white dark:bg-[#0b0e1a] border-t border-slate-200 dark:border-slate-800 flex items-center gap-1.5">
            <input
              type="text"
              placeholder="Escribe un mensaje..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || sending}
              className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 cursor-pointer"
            >
              {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
