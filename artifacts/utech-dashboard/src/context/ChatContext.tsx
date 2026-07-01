import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

export interface ChatMessage {
  id: string;
  from: 'user' | 'admin';
  text: string;
  timestamp: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  read?: boolean;
}

interface ChatContextValue {
  messages: ChatMessage[];
  unreadCount: number;
  isOnline: boolean;
  sendMessage: (text: string, file?: { url: string; name: string; type: string }) => void;
  replyAsAdmin: (text: string, file?: { url: string; name: string; type: string }) => void;
  markAllRead: () => void;
  clearChat: () => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);
const STORAGE_KEY = 'utech_chat_messages';
const UNREAD_KEY  = 'utech_chat_unread';

function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function nowStr() {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

const WELCOME: ChatMessage = {
  id: 'welcome',
  from: 'admin',
  text: "👋 Hi! We're live and ready to help. How can we assist you today?",
  timestamp: nowStr(),
  read: true,
};

function loadMessages(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ChatMessage[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return [WELCOME];
}

function loadUnread(): number {
  try { return Number(localStorage.getItem(UNREAD_KEY)) || 0; } catch { return 0; }
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages]       = useState<ChatMessage[]>(loadMessages);
  const [unreadCount, setUnreadCount] = useState<number>(loadUnread);
  const isOnline = true;

  // Persist messages whenever they change
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages)); } catch {}
  }, [messages]);

  // Persist unread count
  useEffect(() => {
    try { localStorage.setItem(UNREAD_KEY, String(unreadCount)); } catch {}
  }, [unreadCount]);

  // Cross-tab sync — pick up messages sent from admin panel in another tab
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const updated = JSON.parse(e.newValue) as ChatMessage[];
          if (Array.isArray(updated)) setMessages(updated);
        } catch {}
      }
      if (e.key === UNREAD_KEY && e.newValue !== null) {
        setUnreadCount(Number(e.newValue) || 0);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const sendMessage = useCallback((text: string, file?: { url: string; name: string; type: string }) => {
    const msg: ChatMessage = {
      id: genId(), from: 'user', text, timestamp: nowStr(),
      ...(file ? { fileUrl: file.url, fileName: file.name, fileType: file.type } : {}),
      read: false,
    };
    setMessages(prev => [...prev, msg]);
    setUnreadCount(prev => prev + 1);
  }, []);

  const replyAsAdmin = useCallback((text: string, file?: { url: string; name: string; type: string }) => {
    const msg: ChatMessage = {
      id: genId(), from: 'admin', text, timestamp: nowStr(),
      ...(file ? { fileUrl: file.url, fileName: file.name, fileType: file.type } : {}),
      read: true,
    };
    setMessages(prev => [...prev, msg]);
  }, []);

  const markAllRead = useCallback(() => {
    setMessages(prev => prev.map(m => ({ ...m, read: true })));
    setUnreadCount(0);
  }, []);

  const clearChat = useCallback(() => {
    setMessages([WELCOME]);
    setUnreadCount(0);
  }, []);

  return (
    <ChatContext.Provider value={{ messages, unreadCount, isOnline, sendMessage, replyAsAdmin, markAllRead, clearChat }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
}
