import { useState, useEffect, useRef } from 'react';
import { useOrders, Order } from '../context/OrdersContext';
import { useChat, ChatMessage } from '../context/ChatContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Lock, ShieldCheck, Coins, Save,
  CheckCircle2, Cpu, Clock, Eye, Plus, Trash2,
  List, FileText, Smartphone, PlusCircle, Settings2,
  AlertCircle, Info, X, ChevronDown, ChevronUp, Timer,
  MessageCircle, Send, Paperclip, Download, CheckCheck, User,
} from 'lucide-react';
import { useCountdown } from '../hooks/useCountdown';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const ADMIN_PIN = 'utech2026';

function stageToProgress(status: Order['status']) {
  if (status === 'queued')     return 33;
  if (status === 'processing') return 67;
  if (status === 'success')    return 100;
  return 0;
}

function genOrderId(orders: Order[]) {
  const nums = orders.map(o => parseInt(o.id.replace('ORD-', '')) || 0);
  return `ORD-${Math.max(0, ...nums) + 1}`;
}

function genRef() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return 'UTK-' + Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function nowTime() {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function nowDate() {
  return new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

type AdminTab = 'edit' | 'log' | 'imei' | 'new' | 'manage' | 'chat';

const TABS: { key: AdminTab; label: string; icon: typeof Settings2 }[] = [
  { key: 'edit',   label: 'Edit Order',    icon: Settings2    },
  { key: 'log',    label: 'Activity Log',  icon: FileText     },
  { key: 'imei',   label: 'IMEIs',         icon: Smartphone   },
  { key: 'new',    label: 'New Order',     icon: PlusCircle   },
  { key: 'manage', label: 'Manage Orders', icon: List         },
  { key: 'chat',   label: 'Live Chat',     icon: MessageCircle },
];

/* ── Admin Chat Tab ── */
function AdminChatTab() {
  const { messages, unreadCount, replyAsAdmin, markAllRead, clearChat } = useChat();
  const [reply, setReply]   = useState('');
  const bottomRef           = useRef<HTMLDivElement>(null);
  const fileRef             = useRef<HTMLInputElement>(null);

  useEffect(() => {
    markAllRead();
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const send = () => {
    const t = reply.trim();
    if (!t) return;
    replyAsAdmin(t);
    setReply('');
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    replyAsAdmin(`[Admin shared a file: ${file.name}]`, { url, name: file.name, type: file.type });
    e.target.value = '';
  };

  const isImage = (type?: string) => type?.startsWith('image/');

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-1">
          <MessageCircle className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">User Conversations</span>
          <span className="flex items-center gap-1 text-[10px] text-green-400 bg-green-500/10 border border-green-500/20 px-1.5 py-0.5 rounded-full font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />Live
          </span>
        </div>
        {unreadCount > 0 && (
          <span className="text-[10px] bg-red-500 text-white font-bold px-1.5 py-0.5 rounded-full">
            {unreadCount} unread
          </span>
        )}
        <Button variant="ghost" size="sm" onClick={clearChat} className="text-xs text-muted-foreground h-7">
          Clear chat
        </Button>
      </div>

      {/* Messages */}
      <div className="h-[340px] overflow-y-auto bg-background/40 rounded-xl border border-border p-3 flex flex-col gap-2">
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-2.5 items-end ${msg.from === 'admin' ? 'justify-end' : 'justify-start'}`}>
            {msg.from === 'user' && (
              <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0 mb-1">
                <User className="w-3 h-3 text-primary" />
              </div>
            )}
            <div className={`max-w-[75%] flex flex-col gap-0.5 ${msg.from === 'admin' ? 'items-end' : 'items-start'}`}>
              <span className="text-[9px] text-muted-foreground font-mono px-1">
                {msg.from === 'admin' ? 'You (Admin)' : 'User'} · {msg.timestamp}
              </span>
              {msg.fileUrl && isImage(msg.fileType) ? (
                <a href={msg.fileUrl} target="_blank" rel="noreferrer" className="rounded-xl overflow-hidden border border-border">
                  <img src={msg.fileUrl} alt={msg.fileName} className="max-w-[180px] max-h-[120px] object-cover" />
                </a>
              ) : msg.fileUrl ? (
                <a href={msg.fileUrl} download={msg.fileName}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium ${
                    msg.from === 'admin'
                      ? 'bg-primary/15 border-primary/25 text-primary'
                      : 'bg-secondary/50 border-border text-foreground'
                  }`}>
                  <FileText className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate max-w-[140px]">{msg.fileName}</span>
                  <Download className="w-3 h-3 shrink-0" />
                </a>
              ) : (
                <div className={`px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                  msg.from === 'admin'
                    ? 'bg-primary text-white rounded-tr-sm'
                    : 'bg-secondary/60 text-foreground border border-border/60 rounded-tl-sm'
                }`}>
                  {msg.text}
                </div>
              )}
              {msg.from === 'admin' && (
                <div className="flex items-center gap-1 px-1">
                  <CheckCheck className="w-3 h-3 text-primary/60" />
                  <span className="text-[9px] text-muted-foreground">Sent</span>
                </div>
              )}
            </div>
            {msg.from === 'admin' && (
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 mb-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Reply input */}
      <div className="flex gap-2 items-end">
        <div className="flex-1 bg-secondary/30 border border-border rounded-xl px-3 py-2">
          <textarea
            value={reply}
            onChange={e => setReply(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Type a reply as admin…"
            rows={2}
            className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground resize-none focus:outline-none"
          />
          <div className="flex items-center gap-2 mt-1">
            <button onClick={() => fileRef.current?.click()} className="text-muted-foreground hover:text-foreground transition-colors" title="Send file">
              <Paperclip className="w-3.5 h-3.5" />
            </button>
            <span className="text-[9px] text-muted-foreground/50">Share files or images with user</span>
          </div>
        </div>
        <Button onClick={send} disabled={!reply.trim()} size="sm" className="gap-1.5 self-end h-10">
          <Send className="w-3.5 h-3.5" />Reply
        </Button>
      </div>
      <input ref={fileRef} type="file" accept="image/*,application/pdf,.txt,.doc,.docx" className="hidden" onChange={handleFile} />
      <p className="text-[10px] text-muted-foreground text-center font-mono">
        Replies appear instantly in the user's chat widget
      </p>
    </div>
  );
}

/* ── Pin Gate ── */
function PinGate({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState('');
  const [err, setErr] = useState(false);

  const tryUnlock = () => {
    if (pin === ADMIN_PIN) { onUnlock(); }
    else { setErr(true); setTimeout(() => setErr(false), 1500); }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="w-full max-w-sm">
        <Card className="p-8 border-border bg-card/80 space-y-5">
          <div className="flex flex-col items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Lock className="w-5 h-5 text-primary" />
            </div>
            <div className="text-center">
              <h2 className="font-bold text-foreground">Admin Access</h2>
              <p className="text-xs text-muted-foreground mt-1">Enter your PIN to continue</p>
            </div>
          </div>
          <Input type="password" placeholder="Admin PIN" value={pin}
            onChange={e => setPin(e.target.value)} onKeyDown={e => e.key === 'Enter' && tryUnlock()}
            className={`text-center tracking-widest text-lg ${err ? 'border-red-500 focus-visible:ring-red-500' : ''}`} autoFocus />
          {err && <p className="text-xs text-red-400 text-center -mt-2">Incorrect PIN — try again</p>}
          <Button className="w-full" onClick={tryUnlock}><ShieldCheck className="w-4 h-4 mr-2" />Unlock</Button>
        </Card>
      </motion.div>
    </div>
  );
}

/* ── Edit Order Tab ── */
function EditTab({ selectedId, orders, updateOrder }: {
  selectedId: string;
  orders: Order[];
  updateOrder: (id: string, u: Partial<Omit<Order, 'id'>>) => void;
}) {
  const order = orders.find(o => o.id === selectedId);
  const [status,   setStatus]   = useState<Order['status']>('processing');
  const [alert,    setAlert]    = useState<'none' | 'low' | 'exhausted'>('none');
  const [progress, setProgress] = useState(67);
  const [carrier,  setCarrier]  = useState('');
  const [region,   setRegion]   = useState('');
  const [updatedAt, setUpdatedAt] = useState('');
  const [cdHours,  setCdHours]  = useState('2');
  const [cdMins,   setCdMins]   = useState('0');
  const countdown = useCountdown(order?.countdownUntil);

  useEffect(() => {
    if (order) {
      setStatus(order.status);
      setAlert((order.creditAlert ?? 'none') as 'none' | 'low' | 'exhausted');
      setProgress(order.progress ?? stageToProgress(order.status));
      setCarrier(order.carrier);
      setRegion(order.region);
      setUpdatedAt(order.updatedAt);
    }
  }, [selectedId]);

  const apply = () => {
    updateOrder(selectedId, {
      status,
      creditAlert: alert === 'none' ? undefined : alert,
      progress,
      carrier,
      region,
      updatedAt,
    });
    toast.success(`${selectedId} updated`);
  };

  if (!order) return null;

  return (
    <div className="space-y-4">
      {/* Status */}
      <div className="space-y-1.5">
        <label className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Status</label>
        <div className="flex gap-2">
          {(['queued', 'processing', 'success'] as const).map(s => (
            <button key={s} onClick={() => setStatus(s)}
              className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all flex items-center justify-center gap-1.5 ${
                status === s
                  ? s === 'success'    ? 'bg-green-500/20 border-green-500/40 text-green-400'
                  : s === 'processing' ? 'bg-primary/20 border-primary/40 text-primary'
                                       : 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400'
                  : 'bg-secondary/50 border-border text-muted-foreground hover:bg-secondary'
              }`}>
              {s === 'success' && <CheckCircle2 className="w-3 h-3" />}
              {s === 'processing' && <Cpu className="w-3 h-3" />}
              {s === 'queued' && <Clock className="w-3 h-3" />}
              {s === 'success' ? 'Completed' : s === 'processing' ? 'Processing' : 'Queued'}
            </button>
          ))}
        </div>
      </div>

      {/* Credit Alert */}
      <div className="space-y-1.5">
        <label className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Credit Alert</label>
        <div className="flex gap-2">
          {(['none', 'low', 'exhausted'] as const).map(a => (
            <button key={a} onClick={() => setAlert(a)}
              className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all capitalize ${
                alert === a
                  ? a === 'exhausted' ? 'bg-red-500/20 border-red-500/40 text-red-400'
                  : a === 'low'       ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400'
                                      : 'bg-secondary/80 border-border/80 text-foreground'
                  : 'bg-secondary/50 border-border text-muted-foreground hover:bg-secondary'
              }`}>
              {a === 'none' ? 'None' : a === 'low' ? '⚠ Low' : '🔴 Exhausted'}
            </button>
          ))}
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-1.5">
        <div className="flex justify-between">
          <label className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Progress</label>
          <span className="text-xs font-bold font-mono">{progress}%</span>
        </div>
        <input type="range" min={0} max={100} value={progress}
          onChange={e => setProgress(Number(e.target.value))} className="w-full accent-primary cursor-pointer" />
        <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
          <div style={{ width: `${progress}%` }} className={`h-full rounded-full transition-all ${
            status === 'success' ? 'bg-green-500' : alert === 'exhausted' ? 'bg-red-500' : 'bg-primary'
          }`} />
        </div>
      </div>

      {/* Carrier & Region */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Carrier</label>
          <Input value={carrier} onChange={e => setCarrier(e.target.value)} placeholder="e.g. AT&T USA" />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Region</label>
          <Input value={region} onChange={e => setRegion(e.target.value)} placeholder="e.g. North America" />
        </div>
      </div>

      {/* Updated At */}
      <div className="space-y-1.5">
        <label className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Last Updated</label>
        <div className="flex gap-2">
          <Input value={updatedAt} onChange={e => setUpdatedAt(e.target.value)} placeholder="e.g. Jun 23, 2026 9:14 AM" className="flex-1" />
          <Button variant="outline" size="sm" onClick={() => setUpdatedAt(nowDate())} className="shrink-0 text-xs">Now</Button>
        </div>
      </div>

      {/* Processing Window Countdown */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider flex items-center gap-1.5">
            <Timer className="w-3 h-3" />Processing Window Countdown
          </label>
          {countdown.active && (
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
              countdown.expired  ? 'text-red-400 bg-red-500/10 border-red-500/20' :
              countdown.remaining < 10 * 60_000 ? 'text-red-400 bg-red-500/10 border-red-500/20' :
              countdown.remaining < 30 * 60_000 ? 'text-orange-400 bg-orange-500/10 border-orange-500/20' :
                                                   'text-amber-400 bg-amber-500/10 border-amber-500/20'
            }`}>
              {countdown.expired ? 'EXPIRED' : countdown.formatted}
            </span>
          )}
        </div>
        <div className="flex gap-2 items-center">
          <div className="flex gap-1.5 items-center flex-1">
            <Input type="number" min={0} max={99} value={cdHours}
              onChange={e => setCdHours(e.target.value)} className="w-20 text-center font-mono" />
            <span className="text-xs text-muted-foreground">h</span>
            <Input type="number" min={0} max={59} value={cdMins}
              onChange={e => setCdMins(e.target.value)} className="w-20 text-center font-mono" />
            <span className="text-xs text-muted-foreground">m</span>
          </div>
          <Button size="sm" onClick={() => {
            const h = parseInt(cdHours) || 0;
            const m = parseInt(cdMins)  || 0;
            if (h === 0 && m === 0) { toast.error('Set a duration'); return; }
            updateOrder(selectedId, { countdownUntil: Date.now() + h * 3_600_000 + m * 60_000 });
            toast.success(`Countdown started: ${h}h ${m}m`);
          }} className="shrink-0 gap-1.5">
            <Timer className="w-3.5 h-3.5" />Start
          </Button>
          {countdown.active && (
            <Button size="sm" variant="outline" onClick={() => {
              updateOrder(selectedId, { countdownUntil: undefined });
              toast.success('Countdown cleared');
            }} className="shrink-0 border-red-500/30 text-red-400 hover:bg-red-500/10">
              <X className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground/60 font-mono">
          UTC-synced — same countdown from any timezone
        </p>
      </div>

      <Button onClick={apply} className="w-full gap-2 mt-2">
        <Save className="w-4 h-4" />Apply Changes
      </Button>

      {/* Preview */}
      <div className="rounded-xl bg-secondary/30 border border-border p-4 space-y-2">
        <div className="flex items-center gap-1.5 mb-2">
          <Eye className="w-3 h-3 text-muted-foreground" />
          <span className="text-[9px] text-muted-foreground font-mono uppercase tracking-wider">Preview</span>
        </div>
        <div className="flex justify-between text-xs"><span className="text-muted-foreground">Order</span><span className="font-mono">{order.id}</span></div>
        <div className="flex justify-between text-xs"><span className="text-muted-foreground">Ref</span><span className="font-mono">{order.ref}</span></div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Status</span>
          <span className={`font-semibold ${status === 'success' ? 'text-green-400' : status === 'processing' ? 'text-primary' : 'text-yellow-400'}`}>
            {status === 'success' ? 'Completed' : status === 'processing' ? 'Processing' : 'Queued'}
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Credit Alert</span>
          <span className={alert === 'exhausted' ? 'text-red-400 font-semibold' : alert === 'low' ? 'text-yellow-400 font-semibold' : 'text-muted-foreground'}>
            {alert === 'none' ? '—' : alert}
          </span>
        </div>
        <div className="flex justify-between text-xs"><span className="text-muted-foreground">Carrier</span><span>{carrier || '—'}</span></div>
        <div className="flex justify-between text-xs"><span className="text-muted-foreground">Region</span><span>{region || '—'}</span></div>
        <div className="mt-2">
          <div className="flex justify-between text-[10px] text-muted-foreground mb-1"><span>Progress</span><span>{progress}%</span></div>
          <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
            <div style={{ width: `${progress}%` }} className={`h-full rounded-full ${status === 'success' ? 'bg-green-500' : alert === 'exhausted' ? 'bg-red-500' : 'bg-primary'}`} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Activity Log Tab ── */
function LogTab({ selectedId, orders, addEvent, removeEvent }: {
  selectedId: string;
  orders: Order[];
  addEvent: (id: string, e: Order['events'][number]) => void;
  removeEvent: (id: string, i: number) => void;
}) {
  const order = orders.find(o => o.id === selectedId);
  const [msg,  setMsg]  = useState('');
  const [time, setTime] = useState('');
  const [type, setType] = useState<'ok' | 'info' | 'warn'>('info');

  if (!order) return null;

  const addEntry = () => {
    if (!msg.trim()) { toast.error('Enter a message'); return; }
    addEvent(selectedId, { time: time || nowTime(), msg: msg.trim(), type });
    setMsg('');
    setTime('');
    toast.success('Event added');
  };

  const typeConfig = {
    ok:   { label: 'Success',  color: 'text-green-400',  bg: 'bg-green-500/10 border-green-500/20',  icon: CheckCircle2 },
    info: { label: 'Info',     color: 'text-primary',    bg: 'bg-primary/10 border-primary/20',      icon: Info         },
    warn: { label: 'Warning',  color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20', icon: AlertCircle  },
  };

  return (
    <div className="space-y-4">
      {/* Add new event */}
      <div className="rounded-xl border border-border bg-secondary/20 p-4 space-y-3">
        <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Add New Event</p>
        <div className="flex gap-2">
          {(['ok', 'info', 'warn'] as const).map(t => {
            const cfg = typeConfig[t];
            return (
              <button key={t} onClick={() => setType(t)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  type === t ? `${cfg.bg} ${cfg.color}` : 'bg-secondary/50 border-border text-muted-foreground hover:bg-secondary'
                }`}>
                {cfg.label}
              </button>
            );
          })}
        </div>
        <div className="flex gap-2">
          <Input value={time} onChange={e => setTime(e.target.value)} placeholder="Time (auto)" className="w-28 shrink-0 text-xs font-mono" />
          <Button variant="outline" size="sm" onClick={() => setTime(nowTime())} className="shrink-0 text-xs">Now</Button>
        </div>
        <div className="flex gap-2">
          <Input value={msg} onChange={e => setMsg(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addEntry()}
            placeholder="Event message…" className="flex-1" />
          <Button onClick={addEntry} className="shrink-0 gap-1.5"><Plus className="w-3.5 h-3.5" />Add</Button>
        </div>
      </div>

      {/* Event list */}
      <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
        {order.events.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-6">No events yet.</p>
        )}
        <AnimatePresence>
          {[...order.events].reverse().map((ev, ri) => {
            const i = order.events.length - 1 - ri;
            const cfg = typeConfig[ev.type];
            const Icon = cfg.icon;
            return (
              <motion.div key={i}
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.15 }}
                className={`flex items-start gap-3 p-3 rounded-lg border ${cfg.bg} group`}>
                <Icon className={`w-3.5 h-3.5 ${cfg.color} shrink-0 mt-0.5`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground leading-snug">{ev.msg}</p>
                  <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{ev.time}</p>
                </div>
                <button onClick={() => { removeEvent(selectedId, i); toast.success('Event removed'); }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 w-6 h-6 flex items-center justify-center rounded hover:bg-red-500/20 text-muted-foreground hover:text-red-400">
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── IMEI Tab ── */
function ImeiTab({ selectedId, orders, updateOrder }: {
  selectedId: string;
  orders: Order[];
  updateOrder: (id: string, u: Partial<Omit<Order, 'id'>>) => void;
}) {
  const order = orders.find(o => o.id === selectedId);
  const [newImei, setNewImei] = useState('');

  if (!order) return null;

  const addImei = () => {
    const v = newImei.trim().replace(/\D/g, '');
    if (v.length !== 15) { toast.error('IMEI must be exactly 15 digits'); return; }
    if (order.imeis.includes(v)) { toast.error('IMEI already in this order'); return; }
    updateOrder(selectedId, { imeis: [...order.imeis, v] });
    setNewImei('');
    toast.success('IMEI added');
  };

  const removeImei = (imei: string) => {
    if (order.imeis.length <= 1) { toast.error('Order must have at least one IMEI'); return; }
    updateOrder(selectedId, { imeis: order.imeis.filter(i => i !== imei) });
    toast.success('IMEI removed');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{order.imeis.length} IMEI{order.imeis.length !== 1 ? 's' : ''} in this order</p>
        <Badge className="bg-secondary border border-border text-muted-foreground text-[10px]">
          {order.id}
        </Badge>
      </div>

      {/* Add IMEI */}
      <div className="flex gap-2">
        <Input
          value={newImei}
          onChange={e => setNewImei(e.target.value.replace(/\D/g, '').slice(0, 15))}
          onKeyDown={e => e.key === 'Enter' && addImei()}
          placeholder="15-digit IMEI"
          className="flex-1 font-mono text-sm"
        />
        <Button onClick={addImei} className="gap-1.5 shrink-0"><Plus className="w-3.5 h-3.5" />Add</Button>
      </div>

      {/* IMEI list */}
      <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
        <AnimatePresence>
          {order.imeis.map((imei, i) => (
            <motion.div key={imei}
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.12, delay: i * 0.03 }}
              className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border group">
              <Smartphone className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <span className="flex-1 font-mono text-sm text-foreground">{imei}</span>
              <span className="text-[9px] text-muted-foreground font-mono">#{i + 1}</span>
              <button onClick={() => removeImei(imei)}
                className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 flex items-center justify-center rounded hover:bg-red-500/20 text-muted-foreground hover:text-red-400">
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── New Order Tab ── */
function NewOrderTab({ orders, addOrder }: { orders: Order[]; addOrder: (o: Order) => void }) {
  const [id,       setId]       = useState(() => genOrderId(orders));
  const [ref,      setRef]      = useState(() => genRef());
  const [carrier,  setCarrier]  = useState('');
  const [region,   setRegion]   = useState('');
  const [status,   setStatus]   = useState<Order['status']>('queued');
  const [imeiText, setImeiText] = useState('');

  const submit = () => {
    const imeis = imeiText.split(/[\n,\s]+/).map(s => s.replace(/\D/g, '')).filter(s => s.length === 15);
    if (!carrier.trim()) { toast.error('Enter a carrier'); return; }
    if (imeis.length === 0) { toast.error('Enter at least one valid 15-digit IMEI'); return; }

    const now = nowDate();
    const order: Order = {
      id,
      imeis,
      carrier: carrier.trim(),
      status,
      date: now,
      submittedAt: now,
      updatedAt: now,
      region: region.trim() || 'Unknown',
      ref,
      events: [
        { time: nowTime(), msg: 'Request received and logged', type: 'ok' },
        { time: nowTime(), msg: `IMEI${imeis.length > 1 ? 's' : ''} validated`, type: 'ok' },
        { time: nowTime(), msg: `Carrier lock confirmed — ${carrier.trim()}`, type: 'ok' },
        { time: nowTime(), msg: status === 'queued' ? 'Job queued — awaiting processor slot' : 'Processing started — unlock cluster active', type: 'info' },
      ],
    };

    addOrder(order);
    toast.success(`Order ${id} created`);
    setId(genOrderId([...orders, order]));
    setRef(genRef());
    setCarrier('');
    setRegion('');
    setImeiText('');
    setStatus('queued');
  };

  return (
    <div className="space-y-4">
      {/* IDs */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Order ID</label>
          <div className="flex gap-1.5">
            <Input value={id} onChange={e => setId(e.target.value)} className="font-mono text-xs flex-1" />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Reference ID</label>
          <div className="flex gap-1.5">
            <Input value={ref} onChange={e => setRef(e.target.value)} className="font-mono text-xs flex-1" />
            <Button variant="outline" size="sm" onClick={() => setRef(genRef())} className="shrink-0 text-[10px] px-2">↺</Button>
          </div>
        </div>
      </div>

      {/* Carrier & Region */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Carrier</label>
          <Input value={carrier} onChange={e => setCarrier(e.target.value)} placeholder="e.g. AT&T USA" />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Region</label>
          <Input value={region} onChange={e => setRegion(e.target.value)} placeholder="e.g. North America" />
        </div>
      </div>

      {/* Status */}
      <div className="space-y-1.5">
        <label className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Initial Status</label>
        <div className="flex gap-2">
          {(['queued', 'processing', 'success'] as const).map(s => (
            <button key={s} onClick={() => setStatus(s)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                status === s
                  ? s === 'success'    ? 'bg-green-500/20 border-green-500/40 text-green-400'
                  : s === 'processing' ? 'bg-primary/20 border-primary/40 text-primary'
                                       : 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400'
                  : 'bg-secondary/50 border-border text-muted-foreground hover:bg-secondary'
              }`}>
              {s === 'success' ? 'Completed' : s === 'processing' ? 'Processing' : 'Queued'}
            </button>
          ))}
        </div>
      </div>

      {/* IMEIs */}
      <div className="space-y-1.5">
        <label className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
          IMEIs <span className="normal-case text-muted-foreground/60">(one per line, or comma-separated)</span>
        </label>
        <textarea
          value={imeiText}
          onChange={e => setImeiText(e.target.value)}
          placeholder={'353875189689979\n352456789012345'}
          rows={4}
          className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
        />
        <p className="text-[10px] text-muted-foreground">
          {imeiText.split(/[\n,\s]+/).filter(s => s.replace(/\D/g, '').length === 15).length} valid IMEI(s) detected
        </p>
      </div>

      <Button onClick={submit} className="w-full gap-2">
        <Plus className="w-4 h-4" />Create Order
      </Button>
    </div>
  );
}

/* ── Manage Orders Tab ── */
function ManageTab({ orders, deleteOrder, updateOrder }: {
  orders: Order[];
  deleteOrder: (id: string) => void;
  updateOrder: (id: string, u: Partial<Omit<Order, 'id'>>) => void;
}) {
  const [confirm, setConfirm] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const statusColor = (s: string) =>
    s === 'success' ? 'text-green-400 bg-green-500/10 border-green-500/20' :
    s === 'processing' ? 'text-primary bg-primary/10 border-primary/20' :
                         'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';

  return (
    <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
      {orders.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-8">No orders.</p>
      )}
      {orders.map(o => (
        <div key={o.id} className="rounded-xl border border-border bg-card/50 overflow-hidden">
          {/* Row */}
          <div className="flex items-center gap-3 p-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold text-foreground">{o.id}</span>
                <span className="text-[10px] text-muted-foreground font-mono bg-secondary/50 px-1.5 py-0.5 rounded">{o.ref}</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-muted-foreground">{o.carrier}</span>
                <span className="text-[9px] text-muted-foreground/40">·</span>
                <span className="text-[10px] text-muted-foreground">{o.imeis.length} IMEI{o.imeis.length !== 1 ? 's' : ''}</span>
              </div>
            </div>

            {/* Quick status buttons */}
            <div className="flex gap-1 shrink-0">
              {(['queued', 'processing', 'success'] as const).map(s => (
                <button key={s} onClick={() => { updateOrder(o.id, { status: s }); toast.success(`${o.id} → ${s}`); }}
                  title={s}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-all ${
                    o.status === s ? statusColor(s) : 'border-border text-muted-foreground hover:bg-secondary'
                  }`}>
                  {s === 'success'    ? <CheckCircle2 className="w-3 h-3" /> :
                   s === 'processing' ? <Cpu          className="w-3 h-3" /> :
                                        <Clock        className="w-3 h-3" />}
                </button>
              ))}
            </div>

            {/* Expand */}
            <button onClick={() => setExpanded(expanded === o.id ? null : o.id)}
              className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-all">
              {expanded === o.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {/* Delete */}
            {confirm === o.id ? (
              <div className="flex gap-1">
                <button onClick={() => { deleteOrder(o.id); setConfirm(null); toast.success(`${o.id} deleted`); }}
                  className="px-2 py-1 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 text-[10px] font-semibold hover:bg-red-500/30">
                  Confirm
                </button>
                <button onClick={() => setConfirm(null)}
                  className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:bg-secondary rounded-lg">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button onClick={() => setConfirm(o.id)}
                className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Expanded IMEI list */}
          <AnimatePresence>
            {expanded === o.id && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                className="overflow-hidden border-t border-border">
                <div className="p-3 bg-secondary/20 space-y-1">
                  {o.imeis.map((imei, i) => (
                    <div key={imei} className="flex items-center gap-2 text-[11px]">
                      <span className="text-muted-foreground font-mono w-5 text-right">{i+1}.</span>
                      <span className="font-mono text-foreground">{imei}</span>
                    </div>
                  ))}
                  <p className="text-[10px] text-muted-foreground pt-1 font-mono">{o.date}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

/* ── Credit Panel ── */
function CreditsPanel({ credits, adjustCredits, setCredits }: {
  credits: number;
  adjustCredits: (d: number) => void;
  setCredits: (n: number) => void;
}) {
  const [amt, setAmt]         = useState('');
  const [direct, setDirect]   = useState(String(credits));

  useEffect(() => { setDirect(String(credits)); }, [credits]);

  const add = () => {
    const v = parseFloat(amt);
    if (isNaN(v) || v <= 0) { toast.error('Enter a valid amount'); return; }
    adjustCredits(v); setAmt(''); toast.success(`+${v} CR added`);
  };
  const deduct = () => {
    const v = parseFloat(amt);
    if (isNaN(v) || v <= 0) { toast.error('Enter a valid amount'); return; }
    adjustCredits(-v); setAmt(''); toast.success(`-${v} CR deducted`);
  };
  const setDirect_ = () => {
    const v = parseFloat(direct);
    if (isNaN(v) || v < 0) { toast.error('Enter a valid balance'); return; }
    setCredits(v); toast.success(`Balance set to ${v} CR`);
  };

  return (
    <Card className="p-5 border-border bg-card/50 space-y-5 sticky top-0">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <Coins className="w-4 h-4 text-primary" />Credit Balance
      </h3>

      <div className="flex items-center justify-between p-4 rounded-xl bg-primary/5 border border-primary/20">
        <div>
          <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider mb-1">Current</p>
          <p className="text-3xl font-bold font-mono text-primary">{credits} CR</p>
        </div>
        <Coins className="w-8 h-8 text-primary/20" />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Add or Deduct</label>
        <Input type="number" min={0} step={0.1} placeholder="Amount"
          value={amt} onChange={e => setAmt(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()} />
        <div className="flex gap-2">
          <Button variant="outline" onClick={add} className="flex-1 border-green-500/40 text-green-400 hover:bg-green-500/10">+ Add</Button>
          <Button variant="outline" onClick={deduct} className="flex-1 border-red-500/40 text-red-400 hover:bg-red-500/10">− Deduct</Button>
        </div>
      </div>

      <div className="border-t border-border pt-4 space-y-2">
        <label className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Set Directly</label>
        <div className="flex gap-2">
          <Input type="number" min={0} step={0.1} placeholder="New balance"
            value={direct} onChange={e => setDirect(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && setDirect_()} className="flex-1" />
          <Button onClick={setDirect_} className="shrink-0">Set</Button>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Quick Presets</label>
        <div className="flex flex-wrap gap-1.5">
          {[0, 0.9, 5, 10, 25, 50, 100].map(v => (
            <button key={v} onClick={() => { setCredits(v); toast.success(`Balance → ${v} CR`); }}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono border transition-all ${
                credits === v ? 'bg-primary/20 border-primary/40 text-primary' : 'bg-secondary/60 border-border text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}>
              {v} CR
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-secondary/20 border border-border/60 p-3">
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          Changes apply instantly — the credit badge and all order warnings update in real time.
        </p>
      </div>
    </Card>
  );
}

/* ── Main Admin Page ── */
export function AdminPage() {
  const { orders, credits, updateOrder, addOrder, deleteOrder, addEvent, removeEvent, adjustCredits, setCredits } = useOrders();

  const [unlocked, setUnlocked] = useState(false);
  const [tab, setTab]           = useState<AdminTab>('edit');
  const [selectedId, setSelectedId] = useState(orders[0]?.id ?? '');

  if (!unlocked) return <PinGate onUnlock={() => setUnlocked(true)} />;

  const orderTabs: AdminTab[] = ['edit', 'log', 'imei'];
  const showOrderSelector = orderTabs.includes(tab);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }} className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-primary" />
        <h2 className="font-bold text-lg text-foreground">Admin Panel</h2>
        <Badge className="bg-primary/10 border border-primary/30 text-primary text-[10px] px-2 py-0.5 rounded-full font-mono">RESTRICTED</Badge>
        <span className="ml-auto text-[10px] text-muted-foreground font-mono">{orders.length} orders</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: tabbed panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tab bar */}
          <div className="flex gap-1 bg-secondary/30 border border-border rounded-xl p-1 flex-wrap">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => setTab(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  tab === key ? 'bg-card text-foreground shadow-sm border border-border' : 'text-muted-foreground hover:text-foreground'
                }`}>
                <Icon className="w-3 h-3" />{label}
              </button>
            ))}
          </div>

          <Card className="p-5 border-border bg-card/50 space-y-4">
            {/* Order selector (shown for order-specific tabs) */}
            {showOrderSelector && (
              <div className="space-y-1.5">
                <label className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Select Order</label>
                <select value={selectedId} onChange={e => setSelectedId(e.target.value)}
                  className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer">
                  {orders.map(o => (
                    <option key={o.id} value={o.id}>
                      {o.id} — {o.ref} ({o.status}){o.creditAlert ? ` ⚠ ${o.creditAlert}` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Tab content */}
            <AnimatePresence mode="wait">
              <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.12 }}>
                {tab === 'edit'   && <EditTab      selectedId={selectedId} orders={orders} updateOrder={updateOrder} />}
                {tab === 'log'    && <LogTab      selectedId={selectedId} orders={orders} addEvent={addEvent} removeEvent={removeEvent} />}
                {tab === 'imei'   && <ImeiTab     selectedId={selectedId} orders={orders} updateOrder={updateOrder} />}
                {tab === 'new'    && <NewOrderTab orders={orders} addOrder={addOrder} />}
                {tab === 'manage' && <ManageTab   orders={orders} deleteOrder={deleteOrder} updateOrder={updateOrder} />}
                {tab === 'chat'   && <AdminChatTab />}
              </motion.div>
            </AnimatePresence>
          </Card>
        </div>

        {/* Right: credits panel */}
        <div>
          <CreditsPanel credits={credits} adjustCredits={adjustCredits} setCredits={setCredits} />
        </div>
      </div>
    </motion.div>
  );
}
