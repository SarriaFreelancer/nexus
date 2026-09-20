"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  MessageSquare, 
  Send, 
  Paperclip, 
  Search, 
  Users, 
  User, 
  Check, 
  CheckCheck, 
  Loader2, 
  Smile, 
  FileText, 
  Download, 
  X, 
  Phone, 
  Video, 
  Info, 
  Circle,
  Plus,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Building,
  Volume2,
  VolumeX
} from "lucide-react";
import { 
  getWorkspaceContacts, 
  getConversations, 
  getMessages, 
  sendMessage, 
  getOrCreateDirectConversation,
  markConversationAsRead,
  broadcastTyping,
  ContactItem, 
  ConversationSummary, 
  MessageItem 
} from "@/core/application/actions/chatActions";
import { getPusherClient, initPusherBeams } from "@/lib/pusherClient";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { useSession } from "next-auth/react";

// Web Audio API notification sound generator (Crisp modern chime)
function playMessageNotificationSound() {
  try {
    if (typeof window === "undefined") return;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    
    // Tone 1
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    gain1.gain.setValueAtTime(0.15, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.35);

    // Tone 2 (Harmonic chime)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.08); // A5
    gain2.gain.setValueAtTime(0.2, ctx.currentTime + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.08);
    osc2.stop(ctx.currentTime + 0.45);
  } catch (e) {
    // AudioContext blocked or not supported
  }
}

interface ChatClientProps {
  initialContacts: ContactItem[];
  initialConversations: ConversationSummary[];
  currentUserId: string;
}

export function ChatClient({ initialContacts, initialConversations, currentUserId }: ChatClientProps) {
  const { data: session } = useSession();
  const [contacts, setContacts] = useState<ContactItem[]>(initialContacts);
  const [conversations, setConversations] = useState<ConversationSummary[]>(initialConversations);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(initialConversations[0]?.id || null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "MEMBERS" | "CLIENTS">("ALL");
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [isTyping, setIsTyping] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<{ url: string; name: string; type: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Pusher Beams & Request browser Notification permission
  useEffect(() => {
    initPusherBeams(currentUserId);

    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission().catch(() => {});
      }
    }
  }, [currentUserId]);

  // Sync / refresh conversations
  const refreshConversations = () => {
    getConversations().then((res) => {
      if (res.success) setConversations(res.conversations);
    });
  };

  // Load messages when active conversation changes
  useEffect(() => {
    if (!activeConversationId) return;

    let isMounted = true;
    setLoadingMessages(true);

    getMessages(activeConversationId).then((res) => {
      if (isMounted && res.success) {
        setMessages(res.messages);
        setLoadingMessages(false);
        // Clear unread count locally for active conversation
        setConversations((prev) =>
          prev.map((c) => (c.id === activeConversationId ? { ...c, unreadCount: 0 } : c))
        );
      }
    });

    return () => {
      isMounted = false;
    };
  }, [activeConversationId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Real-time synchronization: Combined Pusher + Polling backup
  useEffect(() => {
    // 1. Polling de respaldo constante (cada 3s) para sincronizar lista de conversaciones y mensajes activos
    const syncInterval = setInterval(() => {
      // Actualizar lista de conversaciones
      getConversations().then((cRes) => {
        if (cRes.success) {
          setConversations(cRes.conversations);
        }
      });

      // Si hay conversación activa, actualizar mensajes
      if (activeConversationId) {
        getMessages(activeConversationId).then((mRes) => {
          if (mRes.success) {
            setMessages((prev) => {
              if (
                mRes.messages.length !== prev.length ||
                (mRes.messages.length > 0 &&
                  prev.length > 0 &&
                  mRes.messages[mRes.messages.length - 1].id !== prev[prev.length - 1].id)
              ) {
                return mRes.messages;
              }
              return prev;
            });
          }
        });
      }
    }, 3000);

    // 2. Eventos Pusher si está configurado
    const pusher = getPusherClient();
    let userChannel: any = null;
    let convChannel: any = null;

    if (pusher && currentUserId) {
      userChannel = pusher.subscribe(`chat-user-${currentUserId}`);

      userChannel.bind("new-message-notification", (data: { conversationId: string; message: MessageItem }) => {
        if (data.message.senderId !== currentUserId) {
          if (soundEnabled) {
            playMessageNotificationSound();
          }
          if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
            try {
              new Notification(`Nuevo mensaje de ${data.message.senderName}`, {
                body: data.message.content || "Ha enviado un archivo adjunto",
                icon: data.message.senderAvatar || "/favicon.ico",
              });
            } catch (e) {}
          }
        }
        refreshConversations();
      });

      userChannel.bind("conversation-created", () => {
        refreshConversations();
      });

      if (activeConversationId) {
        convChannel = pusher.subscribe(`chat-conversation-${activeConversationId}`);
        convChannel.bind("new-message", (msg: MessageItem) => {
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, { ...msg, isMine: msg.senderId === currentUserId }];
          });
          markConversationAsRead(activeConversationId);
        });

        convChannel.bind("user-typing", (data: { userId: string; userName: string; isTyping: boolean }) => {
          if (data.userId !== currentUserId) {
            setIsTyping(data.isTyping ? data.userName : null);
          }
        });
      }
    }

    return () => {
      clearInterval(syncInterval);
      if (pusher) {
        if (userChannel) {
          userChannel.unbind_all();
          pusher.unsubscribe(`chat-user-${currentUserId}`);
        }
        if (convChannel && activeConversationId) {
          convChannel.unbind_all();
          pusher.unsubscribe(`chat-conversation-${activeConversationId}`);
        }
      }
    };
  }, [activeConversationId, currentUserId, soundEnabled]);

  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  // Handle typing broadcast
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);

    if (activeConversationId) {
      broadcastTyping(activeConversationId, true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        broadcastTyping(activeConversationId, false);
      }, 2000);
    }
  };

  // Handle Send message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!messageInput.trim() && !selectedFile) || !activeConversationId || sending) return;

    const content = messageInput.trim();
    const file = selectedFile;

    // Optimistic message
    const tempId = "temp-" + Date.now();
    const optimisticMsg: MessageItem = {
      id: tempId,
      conversationId: activeConversationId,
      senderId: currentUserId,
      senderName: session?.user?.name || "Tú",
      senderAvatar: session?.user?.image,
      content: content,
      fileUrl: file?.url,
      fileName: file?.name,
      fileType: file?.type,
      createdAt: new Date().toISOString(),
      isMine: true,
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setMessageInput("");
    setSelectedFile(null);
    setSending(true);

    try {
      const res = await sendMessage({
        conversationId: activeConversationId,
        content,
        fileUrl: file?.url,
        fileName: file?.name,
        fileType: file?.type,
      });

      if (res.success && res.message) {
        // Replace optimistic with real message
        setMessages((prev) => prev.map((m) => (m.id === tempId ? res.message! : m)));
        // Refresh conversations list
        getConversations().then((cRes) => {
          if (cRes.success) setConversations(cRes.conversations);
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  // Handle start chat with a contact
  const handleStartChatWithContact = async (contact: ContactItem) => {
    setIsNewChatModalOpen(false);
    if (!contact.userId) {
      alert("Este contacto aún no tiene una cuenta de usuario vinculada en la plataforma.");
      return;
    }

    try {
      const res = await getOrCreateDirectConversation(contact.userId);
      if (res.success && res.conversationId) {
        const convListRes = await getConversations();
        if (convListRes.success) setConversations(convListRes.conversations);
        setActiveConversationId(res.conversationId);
      } else {
        alert(res.error || "No se pudo iniciar el chat");
      }
    } catch (e: any) {
      alert(e.message || "Error al iniciar conversación");
    }
  };

  // Handle file attachment upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setSelectedFile({
          url: data.url,
          name: file.name,
          type: file.type.startsWith("image/") ? "IMAGE" : "DOCUMENT",
        });
      } else {
        alert(data.error || "Error al subir archivo");
      }
    } catch (err: any) {
      alert(err.message || "Error al subir archivo");
    } finally {
      setIsUploading(false);
    }
  };

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    const title = c.title || "";
    const otherName = c.otherParticipant?.name || "";
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) || otherName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Filter contacts for modal
  const filteredContacts = contacts.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()));
    if (filterType === "MEMBERS") return matchesSearch && c.type === "MEMBER";
    if (filterType === "CLIENTS") return matchesSearch && c.type === "CLIENT";
    return matchesSearch;
  });

  return (
    <div className="h-[calc(100dvh-5.5rem)] md:h-[calc(100vh-5rem)] flex flex-col md:flex-row bg-slate-100 dark:bg-[#080b14] border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl relative">
      {/* LEFT PANEL: CONVERSATIONS & CONTACTS */}
      <div 
        className={`w-full md:w-80 lg:w-96 flex flex-col bg-white dark:bg-[#0b0e1a] border-r border-slate-200 dark:border-slate-800/80 shrink-0 h-full ${
          activeConversationId ? "hidden md:flex" : "flex"
        }`}
      >
        {/* Header */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="font-black text-slate-900 dark:text-slate-100 text-sm truncate">Mensajería</h2>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">Pusher Real-time Chat</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                soundEnabled
                  ? "bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-500 hover:bg-rose-500/20"
              }`}
              title={soundEnabled ? "Sonido activado (clic para silenciar)" : "Sonido silenciado (clic para activar)"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setIsNewChatModalOpen(true)}
              className="p-2 sm:px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              title="Nuevo chat"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nuevo Chat</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-slate-100 dark:border-slate-800/60">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar conversación o contacto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/40">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center mx-auto text-slate-400">
                <Users className="w-6 h-6" />
              </div>
              <p className="text-xs text-slate-500 font-medium">No hay conversaciones activas</p>
              <button
                onClick={() => setIsNewChatModalOpen(true)}
                className="px-3 py-1.5 text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 cursor-pointer"
              >
                Iniciar nuevo chat
              </button>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isActive = conv.id === activeConversationId;
              const other = conv.otherParticipant;
              const avatar = other?.avatarUrl || "https://api.dicebear.com/7.x/bottts/svg?seed=" + (other?.name || "User");

              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveConversationId(conv.id)}
                  className={`w-full p-3.5 flex items-start gap-3 text-left transition-all cursor-pointer ${
                    isActive
                      ? "bg-indigo-50/80 dark:bg-indigo-950/40 md:border-l-4 md:border-indigo-600"
                      : "hover:bg-slate-50 dark:hover:bg-slate-900/60 active:bg-slate-100"
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={avatar}
                      alt={other?.name || "Avatar"}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-800"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0b0e1a]" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                        {conv.title}
                      </h4>
                      {conv.lastMessage && (
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {conv.lastMessage ? (
                        <>
                          {conv.lastMessage.senderId === currentUserId ? "Tú: " : ""}
                          {conv.lastMessage.content || (conv.lastMessage.fileUrl ? "📎 Archivo adjunto" : "")}
                        </>
                      ) : (
                        <span className="italic text-slate-400">Conversación iniciada</span>
                      )}
                    </p>
                  </div>

                  {conv.unreadCount > 0 && (
                    <span className="shrink-0 px-2 py-0.5 rounded-full bg-indigo-600 text-white font-extrabold text-[10px] shadow-sm shadow-indigo-600/50">
                      {conv.unreadCount}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT PANEL: ACTIVE CHAT VIEW */}
      <div 
        className={`flex-1 flex flex-col bg-slate-50/50 dark:bg-[#090c16] min-w-0 h-full ${
          !activeConversationId ? "hidden md:flex" : "flex"
        }`}
      >
        {activeConversation ? (
          <>
            {/* Active Chat Header */}
            <div className="p-3 sm:p-3.5 px-3 sm:px-5 bg-white dark:bg-[#0b0e1a] border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                {/* Back button on Mobile */}
                <button
                  onClick={() => setActiveConversationId(null)}
                  className="md:hidden p-2 -ml-1 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                  title="Volver a la lista"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="relative shrink-0">
                  <img
                    src={
                      activeConversation.otherParticipant?.avatarUrl ||
                      "https://api.dicebear.com/7.x/bottts/svg?seed=" + (activeConversation.title || "User")
                    }
                    alt={activeConversation.title || "Avatar"}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500/30"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0b0e1a]" />
                </div>

                <div className="min-w-0">
                  <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate">
                    {activeConversation.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-500">
                    <span className="text-emerald-500 font-semibold flex items-center gap-1">
                      <Circle className="w-1.5 h-1.5 fill-emerald-500 shrink-0" /> En línea
                    </span>
                    {activeConversation.otherParticipant?.role && (
                      <>
                        <span>•</span>
                        <span className="truncate">{activeConversation.otherParticipant.role}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => setShowContactInfo(!showContactInfo)}
                  className={`p-2 rounded-xl transition-colors cursor-pointer ${
                    showContactInfo
                      ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                  title="Detalles del contacto"
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Info Drawer when showContactInfo is true */}
            {showContactInfo && activeConversation.otherParticipant && (
              <div className="bg-indigo-50/80 dark:bg-indigo-950/30 border-b border-indigo-100 dark:border-indigo-900/40 p-4 transition-all animate-in slide-in-from-top duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
                      {activeConversation.otherParticipant.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                        {activeConversation.otherParticipant.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {activeConversation.otherParticipant.email || "Sin email especificado"}
                      </p>
                    </div>
                  </div>
                  <Badge variant="indigo" className="text-[10px]">
                    {activeConversation.otherParticipant.role || "Participante"}
                  </Badge>
                </div>
              </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 p-3 sm:p-6 overflow-y-auto space-y-3 sm:space-y-4">
              {loadingMessages ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400 gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                  <span>Cargando mensajes...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-3 p-4">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                    <MessageSquare className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">¡Saluda a {activeConversation.title}!</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm">
                      Envía un mensaje para comenzar la conversación en tiempo real con este contacto.
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.isMine || msg.senderId === currentUserId;

                  return (
                    <div
                      key={msg.id}
                      className={`flex items-end gap-2 ${isMine ? "justify-end" : "justify-start"}`}
                    >
                      {!isMine && (
                        <img
                          src={msg.senderAvatar || "https://api.dicebear.com/7.x/bottts/svg?seed=" + msg.senderName}
                          alt={msg.senderName}
                          className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-800 shrink-0 mb-1"
                        />
                      )}

                      <div className={`max-w-[85%] sm:max-w-[70%] space-y-1 ${isMine ? "items-end" : "items-start"}`}>
                        {!isMine && (
                          <span className="text-[10px] font-bold text-slate-500 pl-1">{msg.senderName}</span>
                        )}

                        <div
                          className={`p-2.5 sm:p-3 rounded-2xl text-xs sm:text-[13px] shadow-sm leading-relaxed ${
                            isMine
                              ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-br-xs"
                              : "bg-white dark:bg-[#111627] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800/80 rounded-bl-xs"
                          }`}
                        >
                          {/* File / Image Attachment */}
                          {msg.fileUrl && (
                            <div className="mb-2">
                              {msg.fileType === "IMAGE" || msg.fileUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                                <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer">
                                  <img
                                    src={msg.fileUrl}
                                    alt="Adjunto"
                                    className="max-h-48 sm:max-h-60 rounded-xl object-cover hover:opacity-95 transition-opacity"
                                  />
                                </a>
                              ) : (
                                <a
                                  href={msg.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  download
                                  className={`flex items-center gap-2 p-2 rounded-xl border ${
                                    isMine
                                      ? "bg-indigo-800/60 border-indigo-400/30 text-white"
                                      : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                                  }`}
                                >
                                  <FileText className="w-5 h-5 shrink-0 text-indigo-400" />
                                  <span className="truncate text-xs font-semibold">{msg.fileName || "Descargar archivo"}</span>
                                  <Download className="w-4 h-4 shrink-0 opacity-70" />
                                </a>
                              )}
                            </div>
                          )}

                          {msg.content && <p className="whitespace-pre-wrap break-words">{msg.content}</p>}

                          <div className={`flex items-center justify-end gap-1 text-[9px] mt-1 ${isMine ? "text-indigo-200" : "text-slate-400"}`}>
                            <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                            {isMine && <CheckCheck className="w-3 h-3 text-indigo-300" />}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-center gap-2 text-xs text-slate-500 italic pl-10">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                  <span>{isTyping} está escribiendo...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Selected File Preview before sending */}
            {selectedFile && (
              <div className="px-4 py-2 bg-indigo-50/50 dark:bg-indigo-950/20 border-t border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between text-xs shrink-0">
                <div className="flex items-center gap-2 truncate">
                  <Paperclip className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{selectedFile.name}</span>
                </div>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="p-1 text-slate-400 hover:text-red-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Input Bar */}
            <form
              onSubmit={handleSendMessage}
              className="p-2.5 sm:p-4 bg-white dark:bg-[#0b0e1a] border-t border-slate-200 dark:border-slate-800/80 flex items-center gap-2 shrink-0"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="p-2 sm:p-2.5 rounded-xl text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                title="Adjuntar archivo o imagen"
              >
                {isUploading ? <Loader2 className="w-5 h-5 animate-spin text-indigo-500" /> : <Paperclip className="w-5 h-5" />}
              </button>

              <input
                type="text"
                value={messageInput}
                onChange={handleInputChange}
                placeholder="Escribe un mensaje..."
                className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />

              <button
                type="submit"
                disabled={(!messageInput.trim() && !selectedFile) || sending}
                className="p-2 sm:p-2.5 sm:px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5 disabled:opacity-40 cursor-pointer shrink-0"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span className="hidden sm:inline">Enviar</span>
              </button>
            </form>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-6 sm:p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shadow-inner">
              <MessageSquare className="w-8 h-8" />
            </div>
            <div className="space-y-1 max-w-sm">
              <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-100">Tus Mensajes en Nexus</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Selecciona una conversación del panel izquierdo o haz clic en "Nuevo Chat" para comunicarte en tiempo real con colaboradores o clientes.
              </p>
            </div>
            <button
              onClick={() => setIsNewChatModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Iniciar nuevo chat</span>
            </button>
          </div>
        )}
      </div>

      {/* MODAL: NUEVO CHAT / CONTACTOS */}
      <Modal
        isOpen={isNewChatModalOpen}
        onClose={() => setIsNewChatModalOpen(false)}
        title="Iniciar Nuevo Chat"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Selecciona un colaborador del equipo o cliente del workspace para abrir un chat directo.
          </p>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 pb-2">
            <button
              type="button"
              onClick={() => setFilterType("ALL")}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                filterType === "ALL"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              }`}
            >
              Todos ({contacts.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType("MEMBERS")}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                filterType === "MEMBERS"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              }`}
            >
              Equipo ({contacts.filter((c) => c.type === "MEMBER").length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType("CLIENTS")}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                filterType === "CLIENTS"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              }`}
            >
              Clientes ({contacts.filter((c) => c.type === "CLIENT").length})
            </button>
          </div>

          {/* Contact List in Modal */}
          <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl">
            {filteredContacts.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No se encontraron contactos en esta categoría.
              </div>
            ) : (
              filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => handleStartChatWithContact(contact)}
                  className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={contact.avatarUrl || "https://api.dicebear.com/7.x/bottts/svg?seed=" + contact.name}
                      alt={contact.name}
                      className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-800"
                    />
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">{contact.name}</h4>
                      <p className="text-[10px] text-slate-500">{contact.roleOrCompany}</p>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800">
                    Chatear
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
