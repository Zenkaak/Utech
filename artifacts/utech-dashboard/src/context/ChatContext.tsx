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
  loading: boolean;
  sendMessage: (text: string, file?: { url: string; name: string; type: string }) => Promise<void>;
  replyAsAdmin: (text: string, file?: { url: string; name: string; type: string }) => Promise<void>;
  markAllRead: () => Promise<void>;
  clearChat: () => Promise<void>;
}

const ChatContext = createContext<ChatContextValue | null>(null);

const API = '/api';

async function apiFetch(path: string, opts?: RequestInit) {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (!res.ok) throw new Error(`API ${path} failed: ${res.status}`);
  return res.json();
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages]       = useState<ChatMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading]         = useState(true);
  const isOnline = true;

  const fetchMessages = useCallback(async () => {
    try {
      const data = await apiFetch('/chat') as ChatMessage[];
      setMessages(data);
      setUnreadCount(data.filter(m => m.from === 'user' && !m.read).length);
    } catch (e) {
      console.error('ChatContext fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5_000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  const sendMessage = useCallback(async (text: string, file?: { url: string; name: string; type: string }) => {
    const optimistic: ChatMessage = {
      id: `opt-${Date.now()}`,
      from: 'user', text,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      ...(file ? { fileUrl: file.url, fileName: file.name, fileType: file.type } : {}),
      read: false,
    };
    setMessages(prev => [...prev, optimistic]);
    setUnreadCount(prev => prev + 1);
    try {
      await apiFetch('/chat', {
        method: 'POST',
        body: JSON.stringify({ from: 'user', text, ...file ? { fileUrl: file.url, fileName: file.name, fileType: file.type } : {} }),
      });
      await fetchMessages();
    } catch (e) {
      console.error('sendMessage error:', e);
    }
  }, [fetchMessages]);

  const replyAsAdmin = useCallback(async (text: string, file?: { url: string; name: string; type: string }) => {
    const optimistic: ChatMessage = {
      id: `opt-admin-${Date.now()}`,
      from: 'admin', text,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      ...(file ? { fileUrl: file.url, fileName: file.name, fileType: file.type } : {}),
      read: true,
    };
    setMessages(prev => [...prev, optimistic]);
    try {
      await apiFetch('/chat', {
        method: 'POST',
        body: JSON.stringify({ from: 'admin', text, ...file ? { fileUrl: file.url, fileName: file.name, fileType: file.type } : {} }),
      });
      await fetchMessages();
    } catch (e) {
      console.error('replyAsAdmin error:', e);
    }
  }, [fetchMessages]);

  const markAllRead = useCallback(async () => {
    setMessages(prev => prev.map(m => ({ ...m, read: true })));
    setUnreadCount(0);
    try {
      await apiFetch('/chat/mark-all-read', { method: 'POST' });
    } catch (e) {
      console.error('markAllRead error:', e);
    }
  }, []);

  const clearChat = useCallback(async () => {
    try {
      await apiFetch('/chat', { method: 'DELETE' });
      await fetchMessages();
    } catch (e) {
      console.error('clearChat error:', e);
    }
  }, [fetchMessages]);

  return (
    <ChatContext.Provider value={{ messages, unreadCount, isOnline, loading, sendMessage, replyAsAdmin, markAllRead, clearChat }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
}
