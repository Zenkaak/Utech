import { createContext, useContext, useState, useCallback, ReactNode, useRef } from 'react';

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

function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function nowStr() {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

const WELCOME: ChatMessage = {
  id: 'welcome',
  from: 'admin',
  text: '👋 Hi! We\'re live and ready to help. How can we assist you today?',
  timestamp: nowStr(),
  read: true,
};

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [unreadCount, setUnreadCount] = useState(0);
  const isOnline = true;

  const sendMessage = useCallback((text: string, file?: { url: string; name: string; type: string }) => {
    const msg: ChatMessage = {
      id: genId(),
      from: 'user',
      text,
      timestamp: nowStr(),
      ...(file ? { fileUrl: file.url, fileName: file.name, fileType: file.type } : {}),
      read: false,
    };
    setMessages(prev => [...prev, msg]);
    // simulate admin reading (mark unread after 1s so admin can see)
    setUnreadCount(prev => prev + 1);
  }, []);

  const replyAsAdmin = useCallback((text: string, file?: { url: string; name: string; type: string }) => {
    const msg: ChatMessage = {
      id: genId(),
      from: 'admin',
      text,
      timestamp: nowStr(),
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
