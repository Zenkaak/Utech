import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList, CheckCircle2, Clock, ChevronRight, ChevronLeft,
  Cpu, Copy, Check, Calendar, Hash, ShieldCheck, Activity,
  Search, Filter, Download, RotateCcw,
  TrendingUp, Smartphone, AlertTriangle, CreditCard, X,
  ChevronDown, ChevronUp, Eye, Zap, Info,
} from 'lucide-react';
import { useOrders, Order } from '../context/OrdersContext';

/* ────────── helpers ────────── */

const STAGE_LABELS = [
  { key: 'received',   label: 'Received',   sub: 'Request logged'     },
  { key: 'queued',     label: 'Queued',      sub: 'Awaiting processor' },
  { key: 'processing', label: 'Processing',  sub: 'In progress'        },
  { key: 'complete',   label: 'Complete',    sub: 'Unlock delivered'   },
];

function stageIndex(status: Order['status']) {
  if (status === 'queued')     return 1;
  if (status === 'processing') return 2;
  if (status === 'success')    return 3;
  return 0;
}

type FilterKey = 'all' | 'success' | 'processing' | 'queued';
const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all',        label: 'All Orders' },
  { key: 'success',    label: 'Completed'  },
  { key: 'processing', label: 'Processing' },
  { key: 'queued',     label: 'In Queue'   },
];

function statusMeta(status: string) {
  if (status === 'success')
    return {
      icon: CheckCircle2, iconClass: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      badge: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
      bar: 'bg-gradient-to-r from-emerald-500 to-green-400',
      label: 'Completed',
    };
  if (status === 'processing')
    return {
      icon: Cpu, iconClass: 'text-primary',
      bg: 'bg-primary/10 border-primary/20',
      badge: 'border-primary/30 text-primary bg-primary/10',
      bar: 'bg-gradient-to-r from-primary to-cyan-400',
      label: 'Processing',
    };
  return {
    icon: Clock, iconClass: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
    badge: 'border-amber-500/30 text-amber-400 bg-amber-500/10',
    bar: 'bg-gradient-to-r from-amber-500 to-yellow-400',
    label: 'In Queue',
  };
}

/* ────────── payment warning banner ────────── */

function PaymentWarningBanner({ imei }: { imei: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: 0.25 }}
      className="relative overflow-hidden rounded-xl border border-amber-500/40 bg-amber-500/8"
    >
      <div className="h-1 w-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500" />
      <div className="p-4 sm:p-5 flex gap-4 items-start">
        <div className="shrink-0 w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className="font-bold text-sm text-amber-300 uppercase tracking-wide">Payment Required — Action Needed</span>
            <span className="text-[10px] font-mono bg-amber-500/15 border border-amber-500/25 text-amber-400 px-1.5 py-0.5 rounded">URGENT</span>
          </div>
          <p className="text-sm text-foreground leading-relaxed mb-1">
            The Warning Unlock for device with IMEI{' '}
            <span className="font-mono font-bold text-amber-300 bg-amber-500/10 px-1 rounded">{imei}</span>{' '}
            has been <span className="text-emerald-400 font-semibold">completed successfully</span>.
            However, <span className="font-semibold text-amber-300">payment has not yet been received</span>.
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed mb-4">
            Unlock instructions are being withheld until payment is confirmed. Please complete your payment promptly
            to receive the full unlock instructions for this device.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" className="gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-[0_0_16px_rgba(245,158,11,0.25)]">
              <CreditCard className="w-3.5 h-3.5" />Complete Payment
            </Button>
            <Button size="sm" variant="outline" className="gap-2 text-xs border-amber-500/30 text-amber-400 hover:bg-amber-500/10">
              <Info className="w-3.5 h-3.5" />View Details
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ────────── order detail ────────── */

function OrderDetail({ order, onBack, onNavigate }: { order: Order; onBack: () => void; onNavigate: (page: string) => void }) {
  const [copied, setCopied] = useState<string | null>(null);
  const [showAllEvents, setShowAllEvents] = useState(false);
  const meta   = statusMeta(order.status);
  const stage  = stageIndex(order.status);
  const Icon   = meta.icon;
  const isBulk = order.imeis.length > 1;
  const progress = order.progress ?? Math.round((stage / 3) * 100);
  const displayedEvents = showAllEvents ? order.events : order.events.slice(-6);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.2 }} className="flex flex-col gap-5"
    >
      {/* back + export */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5 text-xs text-muted-foreground hover:text-foreground -ml-1">
          <ChevronLeft className="w-4 h-4" />Back to Orders
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs border-border">
          <Download className="w-3.5 h-3.5" />Export PDF
        </Button>
      </div>

      {/* ── Payment warning (shown when payment pending) ── */}
      <AnimatePresence>
        {order.paymentPendingImei && (
          <PaymentWarningBanner key="pw" imei={order.paymentPendingImei} />
        )}
      </AnimatePresence>

      {/* ── Success celebration for batch ── */}
      {order.status === 'success' && isBulk && (
        <motion.div
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-xl border border-emerald-500/30 bg-emerald-950/20"
        >
          <div className="h-1 bg-gradient-to-r from-emerald-500 to-green-400" />
          <div className="p-4 sm:p-5 flex gap-4 items-center">
            <div className="shrink-0 w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-emerald-400 mb-0.5">Batch Order Completed Successfully</p>
              <p className="text-xs text-muted-foreground">
                Orders for all <span className="font-bold text-foreground">{order.imeis.length} devices</span> have been completed successfully.
                Unlock instructions have been dispatched for all confirmed devices.
              </p>
            </div>
            <div className="shrink-0 text-right hidden sm:block">
              <p className="text-2xl font-black font-mono text-emerald-400">{order.imeis.length}/5</p>
              <p className="text-[10px] text-muted-foreground font-mono uppercase">completed</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Hero card ── */}
      <Card className="border-border bg-card/50 overflow-hidden">
        <div className={`h-1 ${meta.bar}`} />
        <div className="p-5">
          <div className="flex items-start gap-4 mb-5 flex-wrap">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${meta.bg}`}>
              {order.status === 'processing'
                ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}>
                    <Icon className={`w-5 h-5 ${meta.iconClass}`} />
                  </motion.div>
                : <Icon className={`w-5 h-5 ${meta.iconClass}`} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-mono text-lg font-black text-foreground">{order.ref}</span>
                <Badge variant="outline" className={`text-[10px] uppercase tracking-wider ${meta.badge}`}>{meta.label}</Badge>
                {isBulk && (
                  <span className="text-[10px] font-semibold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.5 rounded-full">
                    {order.imeis.length} devices
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground font-mono">{order.id} · {order.carrier} · {order.region}</p>
            </div>
            <div className="shrink-0 text-right hidden sm:block">
              <p className="text-3xl font-black font-mono text-foreground">{progress}%</p>
              <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Progress</p>
            </div>
          </div>

          {/* progress bar */}
          <div className="mb-5">
            <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${meta.bar}`}
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
              />
            </div>
          </div>

          {/* stage tracker */}
          <div className="relative flex items-center justify-between mb-5">
            <div className="absolute left-0 right-0 top-3 h-0.5 bg-secondary mx-6" />
            {STAGE_LABELS.map((s, i) => {
              const done    = i <= stage;
              const current = i === stage && order.status !== 'success';
              return (
                <div key={s.key} className="relative z-10 flex flex-col items-center gap-1.5">
                  <motion.div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      done
                        ? order.status === 'success' ? 'bg-emerald-500 border-emerald-400' : 'bg-primary border-primary'
                        : 'bg-background border-border'
                    }`}
                    animate={current ? { scale: [1, 1.15, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 1.4 }}
                  >
                    {done
                      ? <Check className="w-3 h-3 text-white" />
                      : <span className="w-1.5 h-1.5 rounded-full bg-border" />}
                  </motion.div>
                  <div className="text-center hidden sm:block">
                    <p className={`text-[10px] font-semibold ${done ? 'text-foreground' : 'text-muted-foreground'}`}>{s.label}</p>
                    <p className="text-[9px] text-muted-foreground">{s.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* meta grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: Calendar,    label: 'Submitted',    value: order.submittedAt, copy: false, copyKey: '' },
              { icon: Clock,       label: 'Last Updated', value: order.updatedAt,   copy: false, copyKey: '' },
              { icon: Hash,        label: 'Order ID',     value: order.id,          copy: true,  copyKey: 'id'  },
              { icon: ShieldCheck, label: 'Reference',    value: order.ref,         copy: true,  copyKey: 'ref' },
            ].map(({ icon: Ic, label, value, copy: doCopy, copyKey }) => (
              <div key={label} className="p-3 rounded-lg bg-secondary/30 border border-border/50">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Ic className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold">{label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-mono font-semibold text-foreground truncate">{value}</span>
                  {doCopy && (
                    <button onClick={() => copy(value, copyKey)} className="shrink-0 text-muted-foreground hover:text-foreground transition-colors">
                      {copied === copyKey ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* ── IMEI list ── */}
      <Card className="border-border bg-card/50 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">Device IMEIs</span>
            <span className="text-[10px] bg-secondary border border-border px-1.5 py-0.5 rounded font-mono">{order.imeis.length}</span>
          </div>
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground hover:text-foreground h-7">
            <Copy className="w-3 h-3" />Copy All
          </Button>
        </div>
        <div className="p-4 flex flex-col gap-2">
          {order.imeis.map((imei, i) => (
            <motion.div
              key={imei}
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-center justify-between gap-3 p-3 rounded-lg border transition-colors ${
                order.status === 'success'
                  ? 'bg-emerald-500/5 border-emerald-500/15 hover:border-emerald-500/30'
                  : 'bg-secondary/20 border-border/50 hover:border-border'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[9px] font-bold ${
                  order.status === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-primary/20 text-primary'
                }`}>{i + 1}</div>
                <span className="font-mono text-xs text-foreground truncate">{imei}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {order.status === 'success' ? (
                  <span className="flex items-center gap-1 text-[9px] font-semibold text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" />Unlocked
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[9px] font-semibold text-primary">
                    <Cpu className="w-3 h-3" />Processing
                  </span>
                )}
                <button onClick={() => copy(imei, imei)} className="text-muted-foreground hover:text-foreground transition-colors">
                  {copied === imei ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* ── Activity timeline ── */}
      <Card className="border-border bg-card/50 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">Activity Timeline</span>
            <span className="text-[10px] bg-secondary border border-border px-1.5 py-0.5 rounded font-mono">{order.events.length}</span>
          </div>
          {order.events.length > 6 && (
            <button onClick={() => setShowAllEvents(!showAllEvents)} className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors">
              {showAllEvents ? <><ChevronUp className="w-3 h-3" />Show less</> : <><ChevronDown className="w-3 h-3" />Show all</>}
            </button>
          )}
        </div>
        <div className="p-4">
          <div className="relative">
            <div className="absolute left-[18px] top-3 bottom-3 w-px bg-border" />
            <div className="flex flex-col gap-3">
              <AnimatePresence initial={false}>
                {displayedEvents.map((ev, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex gap-3 items-start pl-1"
                  >
                    <div className={`relative z-10 w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                      ev.type === 'ok'   ? 'bg-emerald-500/10 border-emerald-500/20' :
                      ev.type === 'warn' ? 'bg-amber-500/10 border-amber-500/20' :
                                          'bg-primary/10 border-primary/20'
                    }`}>
                      {ev.type === 'ok'   && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      {ev.type === 'info' && <Info          className="w-4 h-4 text-primary"     />}
                      {ev.type === 'warn' && <AlertTriangle className="w-4 h-4 text-amber-400"   />}
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                      <p className={`text-xs leading-snug font-medium ${
                        ev.type === 'warn' ? 'text-amber-300' : 'text-foreground/90'
                      }`}>{ev.msg}</p>
                      <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{ev.time}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </Card>

      {/* ── Actions ── */}
      <div className="flex flex-wrap gap-3 pb-4">
        <Button onClick={() => onNavigate('request')} className="gap-2 text-sm">
          <Zap className="w-4 h-4" />New Request
        </Button>
        <Button variant="outline" className="gap-2 text-sm border-border text-muted-foreground hover:text-foreground">
          <RotateCcw className="w-4 h-4" />Re-submit
        </Button>
        <Button variant="outline" className="gap-2 text-sm border-border text-muted-foreground hover:text-foreground">
          <Download className="w-4 h-4" />Export PDF
        </Button>
      </div>
    </motion.div>
  );
}

/* ────────── order card ────────── */

function OrderCard({ order, onClick }: { order: Order; onClick: () => void }) {
  const meta   = statusMeta(order.status);
  const stage  = stageIndex(order.status);
  const Icon   = meta.icon;
  const isBulk = order.imeis.length > 1;
  const progress = order.progress ?? Math.round((stage / 3) * 100);
  const hasWarning = !!order.paymentPendingImei;

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -1, transition: { duration: 0.15 } }}
      whileTap={{ scale: 0.995 }}
      className={`group w-full text-left p-4 rounded-xl border transition-all duration-200 ${
        hasWarning
          ? 'bg-amber-500/5 border-amber-500/25 hover:border-amber-500/50'
          : order.status === 'success'
            ? 'bg-card/50 border-emerald-500/15 hover:border-emerald-500/35 hover:bg-card/80'
            : 'bg-card/50 border-border hover:border-primary/30 hover:bg-card/80'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${meta.bg}`}>
          {order.status === 'processing'
            ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}>
                <Icon className={`w-4 h-4 ${meta.iconClass}`} />
              </motion.div>
            : <Icon className={`w-4 h-4 ${meta.iconClass}`} />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="font-mono text-sm font-bold text-foreground">{order.ref}</span>
            <span className="text-[10px] font-mono text-muted-foreground bg-secondary/50 px-1.5 py-0.5 rounded">{order.id}</span>
            {isBulk && (
              <span className="text-[9px] font-semibold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.5 rounded-full">
                {order.imeis.length} devices
              </span>
            )}
            {hasWarning && (
              <span className="flex items-center gap-1 text-[9px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/25 px-1.5 py-0.5 rounded-full">
                <AlertTriangle className="w-2.5 h-2.5" />Payment Due
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono mb-2 flex-wrap">
            <span>{isBulk ? order.imeis[0] + ' +' + (order.imeis.length - 1) : order.imeis[0]}</span>
            <span className="opacity-40">·</span>
            <span>{order.carrier}</span>
            <span className="opacity-40">·</span>
            <span>{order.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1 rounded-full bg-secondary overflow-hidden">
              <div className={`h-full rounded-full ${meta.bar}`} style={{ width: `${progress}%` }} />
            </div>
            <span className="text-[9px] text-muted-foreground font-mono shrink-0">{progress}%</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="outline" className={`text-[9px] uppercase tracking-wider hidden sm:flex ${meta.badge}`}>
            {meta.label}
          </Badge>
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </motion.button>
  );
}

/* ────────── main page ────────── */

export function HistoryPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { orders } = useOrders();
  const [selected, setSelected] = useState<Order | null>(null);
  const [filter, setFilter]     = useState<FilterKey>('all');
  const [search, setSearch]     = useState('');
  const [sortDir, setSortDir]   = useState<'desc' | 'asc'>('desc');

  const stats = useMemo(() => ({
    total:      orders.length,
    completed:  orders.filter(o => o.status === 'success').length,
    processing: orders.filter(o => o.status === 'processing').length,
    queued:     orders.filter(o => o.status === 'queued').length,
    rate:       orders.length > 0
      ? Math.round((orders.filter(o => o.status === 'success').length / orders.length) * 100) : 0,
  }), [orders]);

  const filtered = useMemo(() => {
    let list = orders;
    if (filter !== 'all') list = list.filter(o => o.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(o =>
        o.id.toLowerCase().includes(q) ||
        o.ref.toLowerCase().includes(q) ||
        o.carrier.toLowerCase().includes(q) ||
        o.imeis.some(im => im.includes(q))
      );
    }
    list = [...list].sort((a, b) => {
      const da = new Date(a.date).getTime();
      const db = new Date(b.date).getTime();
      return sortDir === 'desc' ? db - da : da - db;
    });
    return list;
  }, [orders, filter, search, sortDir]);

  if (selected) {
    return (
      <AnimatePresence mode="wait">
        <OrderDetail key={selected.id} order={selected} onBack={() => setSelected(null)} onNavigate={onNavigate} />
      </AnimatePresence>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="flex flex-col gap-5">

      {/* header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-black text-foreground tracking-tight">Order History</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Track and manage all your unlock requests</p>
        </div>
        <Button onClick={() => onNavigate('request')} size="sm" className="gap-2 text-xs font-semibold">
          <Zap className="w-3.5 h-3.5" />New Request
        </Button>
      </div>

      {/* payment warnings */}
      <AnimatePresence>
        {orders.filter(o => o.paymentPendingImei).map(o => (
          <PaymentWarningBanner key={o.id} imei={o.paymentPendingImei!} />
        ))}
      </AnimatePresence>

      {/* stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total Orders', value: stats.total,      icon: ClipboardList, color: 'text-foreground',  bg: 'bg-secondary/30'   },
          { label: 'Completed',    value: stats.completed,  icon: CheckCircle2,  color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Processing',   value: stats.processing, icon: Cpu,           color: 'text-primary',     bg: 'bg-primary/10'     },
          { label: 'In Queue',     value: stats.queued,     icon: Clock,         color: 'text-amber-400',   bg: 'bg-amber-500/10'   },
          { label: 'Success Rate', value: `${stats.rate}%`, icon: TrendingUp,    color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        ].map(({ label, value, icon: Ic, color, bg }) => (
          <motion.div key={label} whileHover={{ y: -1, transition: { duration: 0.15 } }}
            className={`${bg} rounded-xl p-3.5 border border-border/50 cursor-default`}>
            <Ic className={`w-4 h-4 ${color} mb-1.5`} />
            <p className={`text-xl font-black font-mono ${color}`}>{value}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by IMEI, order ID, ref, or carrier…"
            className="w-full h-9 pl-9 pr-9 bg-secondary/30 border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:bg-secondary/50 transition-all font-mono"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-1 bg-secondary/30 border border-border rounded-lg p-1">
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all ${
                filter === f.key ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}>{f.label}</button>
          ))}
        </div>
        <button
          onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}
          className="flex items-center gap-1.5 px-3 h-9 bg-secondary/30 border border-border rounded-lg text-[11px] text-muted-foreground hover:text-foreground transition-colors"
        >
          <Filter className="w-3.5 h-3.5" />
          {sortDir === 'desc' ? 'Newest first' : 'Oldest first'}
        </button>
      </div>

      {/* orders list */}
      <div className="flex flex-col gap-2.5">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="py-16 flex flex-col items-center gap-3 text-center">
              <div className="w-12 h-12 rounded-2xl bg-secondary/50 border border-border flex items-center justify-center">
                <Eye className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">No orders found</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {search ? 'Try a different search term or clear filters' : 'No orders in this category yet'}
                </p>
              </div>
              {search && (
                <Button size="sm" variant="outline" onClick={() => setSearch('')} className="text-xs">Clear search</Button>
              )}
            </motion.div>
          ) : (
            filtered.map((order, i) => (
              <motion.div key={order.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }} transition={{ delay: i * 0.04 }}>
                <OrderCard order={order} onClick={() => setSelected(order)} />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {filtered.length > 0 && (
        <p className="text-center text-[10px] text-muted-foreground font-mono py-2">
          Showing {filtered.length} of {orders.length} orders
        </p>
      )}
    </motion.div>
  );
}
