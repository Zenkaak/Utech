import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle, X, Send, Paperclip, Download, FileText,
  CheckCheck, Plus, RotateCcw, ChevronRight, Trash2,
} from 'lucide-react';
import { useChat } from '../context/ChatContext';

type View = 'choice' | 'chat';

interface ChatWidgetProps {
  onNavigate?: (page: string, anchor?: string) => void;
}

/** Parse message text and render @t# / @p# as clickable tags */
function MessageText({
  text,
  onNavigate,
}: {
  text: string;
  onNavigate?: (page: string, anchor?: string) => void;
}) {
  const parts = text.split(/(@[tTpP]\d+)/g);
  return (
    <>
      {parts.map((part, i) => {
        const tMatch = part.match(/^@[tT](\d+)$/);
        const pMatch = part.match(/^@[pP](\d+)$/);
        if (tMatch) {
          const num = tMatch[1];
          return (
            <button
              key={i}
              onClick={() => onNavigate?.('terms', `term-${num}`)}
              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-primary/20 border border-primary/40 text-primary text-[10px] font-mono font-bold hover:bg-primary/30 transition-colors cursor-pointer mx-0.5"
              title={`View Term ${num}`}
            >
              @t{num}
            </button>
          );
        }
        if (pMatch) {
          const num = pMatch[1];
          return (
            <button
              key={i}
              onClick={() => onNavigate?.('privacy', `policy-${num}`)}
              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-mono font-bold hover:bg-emerald-500/30 transition-colors cursor-pointer mx-0.5"
              title={`View Policy ${num}`}
            >
              @p{num}
            </button>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

export function ChatWidget({ onNavigate }: ChatWidgetProps) {
  const { messages, unreadCount, isOnline, sendMessage, markAllRead, clearChat, loading } = useChat();

  const [open, setOpen]     = useState(false);
  const [view, setView]     = useState<View>('choice');
  const [text, setText]     = useState('');
  const [clearing, setClearing] = useState(false);

  const bottomRef    = useRef<HTMLDivElement>(null);
  const fileRef      = useRef<HTMLInputElement>(null);
  const textareaRef  = useRef<HTMLTextAreaElement>(null);

  const hasHistory = messages.length > 0;

  useEffect(() => {
    if (open) {
      markAllRead();
      if (!hasHistory) {
        setView('chat');
      }
    }
  }, [open]);

  useEffect(() => {
    if (open && view === 'chat') {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
    }
  }, [open, view, messages.length]);

  const openWidget = () => {
    if (!open) {
      setView(hasHistory ? 'choice' : 'chat');
    }
    setOpen(o => !o);
  };

  const handleSend = () => {
    const t = text.trim();
    if (!t) return;
    sendMessage(t);
    setText('');
    textareaRef.current?.focus();
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    sendMessage(`[File attached: ${file.name}]`, { url, name: file.name, type: file.type });
    e.target.value = '';
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = async () => {
    setClearing(true);
    await clearChat();
    setClearing(false);
    setView('chat');
  };

  const isImage = (type?: string) => type?.startsWith('image/');

  const lastMsg = messages[messages.length - 1];
  const previewText = lastMsg
    ? lastMsg.text.length > 52 ? lastMsg.text.slice(0, 52) + '…' : lastMsg.text
    : null;

  return (
    <>
      {/* Floating button */}
      <div className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-50 flex flex-col items-end gap-2">
        <AnimatePresence>
          {!open && unreadCount === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.9 }}
              transition={{ delay: 1.5, duration: 0.3 }}
              className="bg-card border border-primary/30 rounded-2xl px-3 py-2 shadow-lg text-xs text-foreground max-w-[180px] text-center"
            >
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0" />
                <span className="font-semibold">We're live — chat with us!</span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          data-chat-toggle
          onClick={openWidget}
          className="relative w-14 h-14 rounded-2xl bg-primary shadow-[0_0_24px_rgba(2,132,199,0.4)] hover:shadow-[0_0_32px_rgba(2,132,199,0.6)] flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <AnimatePresence mode="wait">
            {open
              ? <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <X className="w-6 h-6 text-white" />
                </motion.div>
              : <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <MessageCircle className="w-6 h-6 text-white" />
                </motion.div>
            }
          </AnimatePresence>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 border-2 border-background flex items-center justify-center text-[9px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-400 border-2 border-background">
            <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-60" />
          </span>
        </button>
      </div>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className="fixed bottom-36 right-4 lg:bottom-24 lg:right-6 z-50 w-[340px] max-w-[calc(100vw-2rem)] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            style={{ height: view === 'choice' ? 'auto' : '440px' }}
          >
            {/* Header */}
            <div className="h-14 border-b border-border px-4 flex items-center gap-3 bg-card/90 shrink-0">
              <div className="relative w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-primary" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border border-card" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-foreground">UTECH Support</p>
                <p className="text-[10px] text-green-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  We're live — here to help
                </p>
              </div>
              {view === 'chat' && hasHistory && (
                <button
                  onClick={() => setView('choice')}
                  title="Chat options"
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors mr-0.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ── Choice screen ── */}
            <AnimatePresence mode="wait">
              {view === 'choice' && (
                <motion.div
                  key="choice"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="flex flex-col p-4 gap-3"
                >
                  <p className="text-[11px] text-muted-foreground px-1 mb-1">
                    You have an existing conversation with our team.
                  </p>

                  {/* Continue */}
                  <button
                    onClick={() => setView('chat')}
                    className="flex items-center gap-3 p-4 rounded-2xl border border-primary/25 bg-primary/6 hover:bg-primary/12 hover:border-primary/40 transition-all group text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <MessageCircle className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground">Continue conversation</p>
                      {previewText && (
                        <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                          {lastMsg?.from === 'user' ? 'You: ' : 'Support: '}{previewText}
                        </p>
                      )}
                      <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                        {messages.length} message{messages.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>

                  {/* New chat */}
                  <button
                    onClick={handleNewChat}
                    disabled={clearing}
                    className="flex items-center gap-3 p-4 rounded-2xl border border-border/60 bg-secondary/20 hover:bg-secondary/40 hover:border-border transition-all group text-left disabled:opacity-50"
                  >
                    <div className="w-10 h-10 rounded-xl bg-secondary/60 border border-border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      {clearing
                        ? <RotateCcw className="w-5 h-5 text-muted-foreground animate-spin" />
                        : <Plus className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground">Start new chat</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Clear history and begin a fresh conversation
                      </p>
                    </div>
                    <Trash2 className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-red-400/70 transition-colors shrink-0" />
                  </button>
                </motion.div>
              )}

              {/* ── Chat screen ── */}
              {view === 'chat' && (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="flex-1 flex flex-col overflow-hidden"
                >
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2">
                    {messages.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-6">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                          <MessageCircle className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">How can we help?</p>
                          <p className="text-[11px] text-muted-foreground mt-1">Send a message to get started</p>
                        </div>
                      </div>
                    )}
                    {messages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] ${msg.from === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                          {msg.fileUrl && isImage(msg.fileType) ? (
                            <a href={msg.fileUrl} target="_blank" rel="noreferrer" className={`rounded-xl overflow-hidden border ${msg.from === 'user' ? 'border-primary/30' : 'border-border'}`}>
                              <img src={msg.fileUrl} alt={msg.fileName} className="max-w-[180px] max-h-[120px] object-cover" />
                            </a>
                          ) : msg.fileUrl ? (
                            <a href={msg.fileUrl} download={msg.fileName}
                              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-colors ${
                                msg.from === 'user'
                                  ? 'bg-primary/15 border-primary/25 text-primary hover:bg-primary/25'
                                  : 'bg-secondary/40 border-border hover:bg-secondary/70 text-foreground'
                              }`}>
                              <FileText className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate max-w-[140px]">{msg.fileName}</span>
                              <Download className="w-3 h-3 shrink-0" />
                            </a>
                          ) : null}
                          {!msg.fileUrl && (
                            <div className={`px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                              msg.from === 'user'
                                ? 'bg-primary text-white rounded-tr-sm shadow-[0_0_12px_rgba(2,132,199,0.2)]'
                                : 'bg-secondary/60 text-foreground border border-border/60 rounded-tl-sm'
                            }`}>
                              <MessageText text={msg.text} onNavigate={onNavigate} />
                            </div>
                          )}
                          <div className={`flex items-center gap-1 px-1 ${msg.from === 'user' ? 'flex-row-reverse' : ''}`}>
                            <span className="text-[9px] text-muted-foreground font-mono">{msg.timestamp}</span>
                            {msg.from === 'user' && <CheckCheck className="w-3 h-3 text-primary/60" />}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={bottomRef} />
                  </div>

                  {/* Input */}
                  <div className="shrink-0 border-t border-border bg-card/60 p-3">
                    <div className="flex gap-2 items-end">
                      <div className="flex-1 bg-secondary/30 border border-border rounded-xl px-3 py-2 flex flex-col gap-1">
                        <textarea
                          ref={textareaRef}
                          value={text}
                          onChange={e => setText(e.target.value)}
                          onKeyDown={handleKey}
                          placeholder="Type a message…"
                          rows={1}
                          className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground resize-none focus:outline-none"
                          style={{ minHeight: '20px', maxHeight: '80px' }}
                        />
                        <div className="flex items-center gap-2 mt-0.5">
                          <button
                            onClick={() => fileRef.current?.click()}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            title="Attach file"
                          >
                            <Paperclip className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-[9px] text-muted-foreground/50">Attach file or image</span>
                        </div>
                      </div>
                      <button
                        onClick={handleSend}
                        disabled={!text.trim()}
                        className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0 disabled:opacity-40 hover:bg-primary/90 transition-all shadow-[0_0_12px_rgba(2,132,199,0.3)] disabled:shadow-none"
                      >
                        <Send className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <input ref={fileRef} type="file" accept="image/*,application/pdf,.txt,.doc,.docx" className="hidden" onChange={handleFile} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
