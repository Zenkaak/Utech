import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList, CheckCircle2, Clock, ChevronRight, ChevronLeft,
  Cpu, Copy, Check, Calendar, Hash, ShieldCheck, Activity,
  Search, Download, RotateCcw,
  TrendingUp, Smartphone, AlertTriangle, CreditCard, X,
  ChevronDown, ChevronUp, Zap, Info, Mail, Send,
  AlertCircle, BadgeCheck, Lock, SlidersHorizontal,
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
  { key: 'all',        label: 'All'        },
  { key: 'success',    label: 'Completed'  },
  { key: 'processing', label: 'Processing' },
  { key: 'queued',     label: 'Queued'     },
];

function statusMeta(status: string) {
  if (status === 'success')
    return {
      icon: CheckCircle2, iconClass: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      badge: 'border-emerald-500/25 text-emerald-400 bg-emerald-500/8',
      bar: 'bg-gradient-to-r from-emerald-500 to-green-400',
      label: 'Completed',
      dot: 'bg-emerald-400',
    };
  if (status === 'processing')
    return {
      icon: Cpu, iconClass: 'text-primary',
      bg: 'bg-primary/10 border-primary/20',
      badge: 'border-primary/25 text-primary bg-primary/8',
      bar: 'bg-gradient-to-r from-primary to-cyan-400',
      label: 'Processing',
      dot: 'bg-primary',
    };
  return {
    icon: Clock, iconClass: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
    badge: 'border-amber-500/25 text-amber-400 bg-amber-500/8',
    bar: 'bg-gradient-to-r from-amber-500 to-yellow-400',
    label: 'In Queue',
    dot: 'bg-amber-400',
  };
}

/* ────────── payment warning banner ────────── */

function PaymentWarningBanner({
  imei, onNavigate, onViewOrder,
}: { imei: string; onNavigate: (page: string) => void; onViewOrder?: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: 0.25 }}
      className="relative overflow-hidden rounded-xl border border-amber-500/35 bg-amber-500/6"
    >
      <div className="h-0.5 w-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500" />
      <div className="p-4 sm:p-5 flex gap-4 items-start">
        <div className="shrink-0 w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className="font-bold text-sm text-amber-300">Payment Required — Action Needed</span>
            <span className="text-[9px] font-bold font-mono bg-amber-500/15 border border-amber-500/25 text-amber-400 px-1.5 py-0.5 rounded uppercase tracking-wider">URGENT</span>
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed mb-1">
            Unlock for IMEI{' '}
            <span className="font-mono font-bold text-amber-300 bg-amber-500/10 px-1 rounded text-xs">{imei}</span>{' '}
            is complete but <span className="font-semibold text-amber-300">payment has not been received</span>.
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed mb-4">
            Unlock instructions are withheld until payment is confirmed. Complete payment promptly to receive full instructions.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              className="gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-[0_0_16px_rgba(245,158,11,0.2)] transition-all"
              onClick={() => onNavigate('topup')}
            >
              <CreditCard className="w-3.5 h-3.5" />Complete Payment
            </Button>
            {onViewOrder && (
              <Button size="sm" variant="outline"
                className="gap-2 text-xs border-amber-500/25 text-amber-400 hover:bg-amber-500/10"
                onClick={onViewOrder}
              >
                <Info className="w-3.5 h-3.5" />View Order
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ────────── batch success + instructions-blocked panel ────────── */

function BatchSuccessPanel({
  order, onNavigate, instructionsEmail, setInstructionsEmail, instructionsSent, setInstructionsSent, copied, setCopied,
}: {
  order: Order; onNavigate: (page: string) => void;
  instructionsEmail: string; setInstructionsEmail: (v: string) => void;
  instructionsSent: boolean; setInstructionsSent: (v: boolean) => void;
  copied: string | null; setCopied: (v: string | null) => void;
}) {
  return (
    <div className="flex flex-col gap-4">

      {/* all devices unlocked */}
      <motion.div
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-emerald-500/30"
        style={{ background: 'linear-gradient(135deg,rgba(16,185,129,0.08) 0%,rgba(5,150,105,0.04) 60%,transparent 100%)' }}
      >
        <div className="h-0.5 bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400" />
        <div className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/12 border-2 border-emerald-500/35 flex items-center justify-center"
                  style={{ boxShadow: '0 0 20px rgba(16,185,129,0.15)' }}>
                  <BadgeCheck className="w-6 h-6 text-emerald-400" />
                </div>
                <motion.div
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-background flex items-center justify-center"
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.2 }}
                >
                  <Check className="w-2.5 h-2.5 text-white" />
                </motion.div>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <p className="font-black text-base text-emerald-400">All {order.imeis.length} Devices Unlocked</p>
                  <span className="text-[9px] font-bold bg-emerald-500/12 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full uppercase tracking-widest">Batch Complete</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Every device in order <span className="font-mono font-bold text-foreground">{order.ref}</span> has been successfully unlocked.
                </p>
              </div>
            </div>
            <div className="shrink-0 sm:pl-4 sm:border-l sm:border-emerald-500/20">
              <motion.p
                className="text-4xl font-black font-mono text-emerald-400 leading-none"
                initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.15 }}
              >{order.imeis.length}/{order.imeis.length}</motion.p>
              <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider mt-0.5">devices unlocked</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {order.imeis.map((imei, i) => (
              <motion.div key={imei}
                initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.06 }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/12"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="font-mono text-[11px] text-foreground/80 flex-1 truncate">{imei}</span>
                <span className="text-[9px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full shrink-0">Unlocked</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* instructions blocked */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="relative overflow-hidden rounded-2xl border border-amber-500/35"
        style={{ background: 'linear-gradient(135deg,rgba(245,158,11,0.07) 0%,rgba(234,88,12,0.04) 100%)' }}
      >
        <div className="h-0.5 bg-gradient-to-r from-amber-400 via-orange-400 to-red-400" />
        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-3 mb-5">
            <div className="shrink-0 w-9 h-9 rounded-xl bg-amber-500/12 border border-amber-500/25 flex items-center justify-center">
              <Lock className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <p className="font-bold text-sm text-amber-300">Instructions Cannot Be Sent</p>
                <span className="text-[9px] font-bold font-mono bg-amber-500/12 border border-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded uppercase tracking-wider">PAYMENT PENDING</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                All {order.imeis.length} confirmed unlocks are complete, but dispatch is <span className="text-amber-300 font-semibold">blocked</span> — a 6th device completed its unlock process without payment.
              </p>
            </div>
          </div>

          {order.paymentPendingImei && (
            <div className="rounded-xl border border-red-500/25 bg-red-500/5 p-4 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <p className="text-xs font-bold text-red-300 uppercase tracking-wide">Device Missing Payment</p>
              </div>
              <div className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-red-500/6 border border-red-500/15 mb-3">
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-red-400/50 font-semibold mb-1">IMEI</p>
                  <span className="font-mono text-sm font-bold text-foreground/90 tracking-wide">{order.paymentPendingImei}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[9px] font-bold text-red-400 bg-red-500/12 border border-red-500/20 px-2 py-1 rounded-full uppercase">Unpaid</span>
                  <button
                    onClick={() => { navigator.clipboard.writeText(order.paymentPendingImei!); setCopied('pend-imei'); setTimeout(() => setCopied(null), 2000); }}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {copied === 'pend-imei' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between px-1">
                <span className="text-xs text-muted-foreground">Verification fee due:</span>
                <span className="text-xl font-black text-amber-300 font-mono">$48.00 USD</span>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-border/50 bg-card/40 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Mail className="w-3.5 h-3.5 text-primary" />
              <p className="text-xs font-semibold text-foreground">Send Unlock Instructions</p>
            </div>
            {!instructionsSent ? (
              <div className="flex flex-col gap-3">
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Enter your email — you'll be prompted to complete the $48.00 payment before instructions are dispatched.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                      type="email"
                      value={instructionsEmail}
                      onChange={e => setInstructionsEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full h-9 pl-9 pr-3 bg-secondary/30 border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:bg-secondary/50 transition-all"
                    />
                  </div>
                  <Button size="sm" className="gap-2 text-xs font-bold shrink-0"
                    onClick={() => { if (instructionsEmail.trim()) setInstructionsSent(true); }}
                    disabled={!instructionsEmail.trim()}>
                    <Send className="w-3.5 h-3.5" />Send
                  </Button>
                </div>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3">
                <div className="rounded-lg border border-amber-500/25 bg-amber-500/6 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <p className="text-xs font-bold text-amber-300">Payment Required Before Dispatch</p>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">
                    Instructions are queued for <span className="font-semibold text-foreground">{instructionsEmail}</span>.
                    To release them, complete the <span className="font-black text-amber-300">$48.00 USD</span> payment for IMEI:
                  </p>
                  <p className="font-mono text-sm font-bold text-foreground/90 bg-secondary/40 border border-border px-3 py-2 rounded-lg mb-3 text-center tracking-widest">
                    {order.paymentPendingImei}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm"
                      className="gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-[0_0_16px_rgba(245,158,11,0.25)] flex-1 sm:flex-none"
                      onClick={() => onNavigate('topup')}>
                      <CreditCard className="w-3.5 h-3.5" />Pay $48.00 &amp; Release
                    </Button>
                    <Button size="sm" variant="outline" className="gap-2 text-xs border-border text-muted-foreground"
                      onClick={() => { setInstructionsSent(false); setInstructionsEmail(''); }}>
                      <X className="w-3 h-3" />Cancel
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ────────── order detail ────────── */

function OrderDetail({ order, onBack, onNavigate }: { order: Order; onBack: () => void; onNavigate: (page: string) => void }) {
  const [copied, setCopied]                       = useState<string | null>(null);
  const [showAllEvents, setShowAllEvents]         = useState(false);
  const [instructionsEmail, setInstructionsEmail] = useState('');
  const [instructionsSent, setInstructionsSent]   = useState(false);
  const meta    = statusMeta(order.status);
  const stage   = stageIndex(order.status);
  const Icon    = meta.icon;
  const isBulk  = order.imeis.length > 1;
  const progress = order.progress ?? Math.round((stage / 3) * 100);
  const displayedEvents = showAllEvents ? order.events : order.events.slice(-6);
  const isBatchWithPayment = order.status === 'success' && isBulk && !!order.paymentPendingImei;

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }} className="flex flex-col gap-5"
    >
      {/* nav bar */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5 text-xs text-muted-foreground hover:text-foreground -ml-1">
          <ChevronLeft className="w-4 h-4" />Back to Orders
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs border-border/60 text-muted-foreground hover:text-foreground">
          <Download className="w-3.5 h-3.5" />Export PDF
        </Button>
      </div>

      {isBatchWithPayment && (
        <BatchSuccessPanel
          order={order} onNavigate={onNavigate}
          instructionsEmail={instructionsEmail} setInstructionsEmail={setInstructionsEmail}
          instructionsSent={instructionsSent} setInstructionsSent={setInstructionsSent}
          copied={copied} setCopied={setCopied}
        />
      )}

      {!isBatchWithPayment && order.paymentPendingImei && (
        <AnimatePresence>
          <PaymentWarningBanner key="pw" imei={order.paymentPendingImei} onNavigate={onNavigate} />
        </AnimatePresence>
      )}

      {/* hero card */}
      <Card className="border-border/60 bg-card/50 overflow-hidden">
        <div className={`h-0.5 ${meta.bar}`} />
        <div className="p-5 sm:p-6">
          {/* header row */}
          <div className="flex items-start gap-4 mb-5 flex-wrap">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${meta.bg}`}>
              {order.status === 'processing'
                ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}>
                    <Icon className={`w-5 h-5 ${meta.iconClass}`} />
                  </motion.div>
                : <Icon className={`w-5 h-5 ${meta.iconClass}`} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-mono text-lg font-black text-foreground tracking-tight">{order.ref}</span>
                <Badge variant="outline" className={`text-[9px] uppercase tracking-widest font-bold ${meta.badge}`}>{meta.label}</Badge>
                {isBulk && (
                  <span className="text-[9px] font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-1.5 py-0.5 rounded-full">
                    {order.imeis.length} devices
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground font-mono">{order.id} · {order.carrier} · {order.region}</p>
            </div>
            <div className="shrink-0 text-right hidden sm:block">
              <p className="text-3xl font-black font-mono text-foreground">{progress}%</p>
              <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">Progress</p>
            </div>
          </div>

          {/* progress bar */}
          <div className="mb-6">
            <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
              <motion.div className={`h-full rounded-full ${meta.bar}`}
                initial={{ width: '0%' }} animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }} />
            </div>
          </div>

          {/* stage tracker */}
          <div className="relative flex items-center justify-between mb-6">
            <div className="absolute left-0 right-0 top-3 h-px bg-border/60 mx-5" />
            {STAGE_LABELS.map((s, i) => {
              const done    = i <= stage;
              const current = i === stage && order.status !== 'success';
              return (
                <div key={s.key} className="relative z-10 flex flex-col items-center gap-1.5">
                  <motion.div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      done ? order.status === 'success' ? 'bg-emerald-500 border-emerald-400' : 'bg-primary border-primary' : 'bg-background border-border/60'
                    }`}
                    animate={current ? { scale: [1, 1.15, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 1.4 }}
                  >
                    {done ? <Check className="w-3 h-3 text-white" /> : <span className="w-1.5 h-1.5 rounded-full bg-border" />}
                  </motion.div>
                  <div className="text-center hidden sm:block">
                    <p className={`text-[10px] font-semibold ${done ? 'text-foreground' : 'text-muted-foreground'}`}>{s.label}</p>
                    <p className="text-[9px] text-muted-foreground/60">{s.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* meta grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { icon: Calendar,    label: 'Submitted',    value: order.submittedAt, doCopy: false, copyKey: '' },
              { icon: Clock,       label: 'Last Updated', value: order.updatedAt,   doCopy: false, copyKey: '' },
              { icon: Hash,        label: 'Order ID',     value: order.id,          doCopy: true,  copyKey: 'id'  },
              { icon: ShieldCheck, label: 'Reference',    value: order.ref,         doCopy: true,  copyKey: 'ref' },
            ].map(({ icon: Ic, label, value, doCopy, copyKey }) => (
              <div key={label} className="p-3 rounded-lg bg-secondary/20 border border-border/40">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Ic className="w-3 h-3 text-muted-foreground/60" />
                  <span className="text-[9px] uppercase tracking-widest text-muted-foreground/70 font-semibold">{label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-mono font-semibold text-foreground/90 truncate">{value}</span>
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

      {/* IMEI list */}
      <Card className="border-border/60 bg-card/50 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Smartphone className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="text-sm font-semibold text-foreground">Device IMEIs</span>
            <span className="text-[10px] bg-secondary/60 border border-border/50 px-1.5 py-0.5 rounded font-mono text-muted-foreground">{order.imeis.length}</span>
          </div>
          <Button variant="ghost" size="sm"
            onClick={() => { navigator.clipboard.writeText(order.imeis.join('\n')); setCopied('all'); setTimeout(() => setCopied(null), 2000); }}
            className="gap-1.5 text-xs text-muted-foreground hover:text-foreground h-7">
            {copied === 'all' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            Copy All
          </Button>
        </div>
        <div className="p-4 flex flex-col gap-1.5">
          {order.imeis.map((imei, i) => (
            <motion.div key={imei}
              initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`flex items-center justify-between gap-3 p-3 rounded-lg border transition-colors ${
                order.status === 'success'
                  ? 'bg-emerald-500/4 border-emerald-500/12 hover:border-emerald-500/25'
                  : 'bg-secondary/15 border-border/40 hover:border-border/70'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[9px] font-bold ${
                  order.status === 'success' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-primary/15 text-primary'
                }`}>{i + 1}</div>
                <span className="font-mono text-xs text-foreground/80 truncate">{imei}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {order.status === 'success'
                  ? <span className="flex items-center gap-1 text-[9px] font-semibold text-emerald-400"><CheckCircle2 className="w-3 h-3" />Unlocked</span>
                  : <span className="flex items-center gap-1 text-[9px] font-semibold text-primary"><Cpu className="w-3 h-3" />Processing</span>}
                <button onClick={() => copy(imei, imei)} className="text-muted-foreground/50 hover:text-foreground transition-colors">
                  {copied === imei ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* activity timeline */}
      <Card className="border-border/60 bg-card/50 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Activity className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="text-sm font-semibold text-foreground">Activity Timeline</span>
            <span className="text-[10px] bg-secondary/60 border border-border/50 px-1.5 py-0.5 rounded font-mono text-muted-foreground">{order.events.length}</span>
          </div>
          {order.events.length > 6 && (
            <button onClick={() => setShowAllEvents(!showAllEvents)}
              className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors">
              {showAllEvents ? <><ChevronUp className="w-3 h-3" />Show less</> : <><ChevronDown className="w-3 h-3" />Show all</>}
            </button>
          )}
        </div>
        <div className="p-4">
          <div className="relative">
            <div className="absolute left-[19px] top-3 bottom-3 w-px bg-border/40" />
            <div className="flex flex-col gap-3">
              <AnimatePresence initial={false}>
                {displayedEvents.map((ev, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex gap-3 items-start pl-1"
                  >
                    <div className={`relative z-10 w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                      ev.type === 'ok' ? 'bg-emerald-500/8 border-emerald-500/18' : ev.type === 'warn' ? 'bg-amber-500/8 border-amber-500/18' : 'bg-primary/8 border-primary/18'
                    }`}>
                      {ev.type === 'ok'   && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      {ev.type === 'info' && <Info          className="w-4 h-4 text-primary" />}
                      {ev.type === 'warn' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                    </div>
                    <div className="flex-1 min-w-0 pt-1.5">
                      <p className={`text-xs leading-snug font-medium ${ev.type === 'warn' ? 'text-amber-300' : 'text-foreground/85'}`}>{ev.msg}</p>
                      <p className="text-[10px] text-muted-foreground/60 font-mono mt-0.5">{ev.time}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </Card>

      {/* send instructions (single-device) */}
      {order.status === 'success' && !isBatchWithPayment && (
        <Card className="border-border/60 bg-card/50 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border/40 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Mail className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="text-sm font-semibold text-foreground">Send Unlock Instructions</span>
          </div>
          <div className="p-5">
            {!instructionsSent ? (
              <div className="flex flex-col gap-3">
                <p className="text-xs text-muted-foreground leading-relaxed">Enter your email address to receive the unlock instructions for this device.</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                      type="email"
                      value={instructionsEmail}
                      onChange={e => setInstructionsEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full h-9 pl-9 pr-3 bg-secondary/30 border border-border/60 rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-all"
                    />
                  </div>
                  <Button size="sm" className="gap-2 text-xs font-bold shrink-0"
                    onClick={() => { if (instructionsEmail.trim()) setInstructionsSent(true); }}
                    disabled={!instructionsEmail.trim()}>
                    <Send className="w-3.5 h-3.5" />Send Instructions
                  </Button>
                </div>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-3.5 rounded-lg bg-emerald-500/6 border border-emerald-500/18">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-emerald-400">Instructions Dispatched</p>
                  <p className="text-[11px] text-muted-foreground">Sent to <span className="font-semibold text-foreground">{instructionsEmail}</span></p>
                </div>
              </motion.div>
            )}
          </div>
        </Card>
      )}

      {/* action footer */}
      <div className="flex flex-wrap gap-2 pb-4">
        <Button onClick={() => onNavigate('request')} className="gap-2 text-sm font-semibold">
          <Zap className="w-4 h-4" />New Request
        </Button>
        <Button variant="outline" className="gap-2 text-sm border-border/60 text-muted-foreground hover:text-foreground">
          <RotateCcw className="w-4 h-4" />Re-submit
        </Button>
        <Button variant="outline" className="gap-2 text-sm border-border/60 text-muted-foreground hover:text-foreground">
          <Download className="w-4 h-4" />Export PDF
        </Button>
      </div>
    </motion.div>
  );
}

/* ────────── order card ────────── */

function OrderCard({ order, onClick }: { order: Order; onClick: () => void }) {
  const meta       = statusMeta(order.status);
  const stage      = stageIndex(order.status);
  const Icon       = meta.icon;
  const isBulk     = order.imeis.length > 1;
  const progress   = order.progress ?? Math.round((stage / 3) * 100);
  const hasWarning = !!order.paymentPendingImei;

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -1, transition: { duration: 0.12 } }}
      whileTap={{ scale: 0.998 }}
      className={`group w-full text-left p-4 rounded-xl border transition-all duration-200 ${
        hasWarning
          ? 'bg-amber-500/4 border-amber-500/20 hover:border-amber-500/40'
          : order.status === 'success'
          ? 'bg-card/40 border-emerald-500/12 hover:border-emerald-500/30 hover:bg-card/70'
          : 'bg-card/40 border-border/50 hover:border-primary/25 hover:bg-card/70'
      }`}
    >
      <div className="flex items-center gap-3">
        {/* status icon */}
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${meta.bg}`}>
          {order.status === 'processing'
            ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}>
                <Icon className={`w-4 h-4 ${meta.iconClass}`} />
              </motion.div>
            : <Icon className={`w-4 h-4 ${meta.iconClass}`} />}
        </div>

        {/* main info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className="font-mono text-sm font-bold text-foreground">{order.ref}</span>
            {isBulk && (
              <span className="text-[9px] font-bold text-violet-400 bg-violet-500/10 border border-violet-500/18 px-1.5 py-0.5 rounded-full">
                {order.imeis.length} devices
              </span>
            )}
            {hasWarning && (
              <span className="flex items-center gap-1 text-[9px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-full">
                <AlertTriangle className="w-2.5 h-2.5" />Payment Due
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60 font-mono mb-2 flex-wrap">
            <span className="truncate max-w-[110px]">{isBulk ? order.imeis[0] + ' +' + (order.imeis.length - 1) : order.imeis[0]}</span>
            <span className="opacity-40">·</span>
            <span>{order.carrier}</span>
            <span className="opacity-40">·</span>
            <span>{order.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1 rounded-full bg-white/6 overflow-hidden">
              <div className={`h-full rounded-full ${meta.bar}`} style={{ width: `${progress}%` }} />
            </div>
            <span className="text-[9px] text-muted-foreground/50 font-mono shrink-0 w-7 text-right">{progress}%</span>
          </div>
        </div>

        {/* right side */}
        <div className="flex items-center gap-2 shrink-0">
          <div className={`hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-full border text-[9px] font-bold uppercase tracking-wider ${meta.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${meta.dot} ${order.status === 'processing' ? 'animate-pulse' : ''}`} />
            {meta.label}
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </motion.button>
  );
}

/* ────────── main page ────────── */

export function HistoryPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { orders }  = useOrders();
  const [selected, setSelected] = useState<Order | null>(null);
  const [filter, setFilter]     = useState<FilterKey>('all');
  const [search, setSearch]     = useState('');
  const [sortDir, setSortDir]   = useState<'desc' | 'asc'>('desc');

  const stats = useMemo(() => ({
    total:      orders.length,
    completed:  orders.filter(o => o.status === 'success').length,
    processing: orders.filter(o => o.status === 'processing').length,
    queued:     orders.filter(o => o.status === 'queued').length,
    rate:       orders.length > 0 ? Math.round((orders.filter(o => o.status === 'success').length / orders.length) * 100) : 0,
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
    return [...list].sort((a, b) => {
      const da = new Date(a.date).getTime();
      const db = new Date(b.date).getTime();
      return sortDir === 'desc' ? db - da : da - db;
    });
  }, [orders, filter, search, sortDir]);

  if (selected) {
    return (
      <AnimatePresence mode="wait">
        <OrderDetail key={selected.id} order={selected} onBack={() => setSelected(null)} onNavigate={onNavigate} />
      </AnimatePresence>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }} className="flex flex-col gap-5">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-black text-foreground tracking-tight">Order History</h1>
          <p className="text-xs text-muted-foreground mt-0.5 font-mono">
            {stats.total} total orders · {stats.rate}% success rate
          </p>
        </div>
        <Button onClick={() => onNavigate('request')} size="sm" className="gap-2 text-xs font-semibold">
          <Zap className="w-3.5 h-3.5" />New Request
        </Button>
      </div>

      {/* ── Payment alerts ── */}
      <AnimatePresence>
        {orders.filter(o => o.paymentPendingImei).map(o => (
          <PaymentWarningBanner
            key={o.id}
            imei={o.paymentPendingImei!}
            onNavigate={onNavigate}
            onViewOrder={() => setSelected(o)}
          />
        ))}
      </AnimatePresence>

      {/* ── Stats strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {[
          { label: 'Total',      value: stats.total,        color: 'text-foreground',  border: 'border-border/50',         icon: ClipboardList },
          { label: 'Completed',  value: stats.completed,    color: 'text-emerald-400', border: 'border-emerald-500/15',    icon: CheckCircle2  },
          { label: 'Processing', value: stats.processing,   color: 'text-primary',     border: 'border-primary/15',        icon: Cpu           },
          { label: 'In Queue',   value: stats.queued,       color: 'text-amber-400',   border: 'border-amber-500/15',      icon: Clock         },
          { label: 'Success',    value: `${stats.rate}%`,   color: 'text-emerald-400', border: 'border-emerald-500/15',    icon: TrendingUp    },
        ].map(({ label, value, color, border, icon: Ic }) => (
          <div key={label} className={`bg-card/40 rounded-xl p-3.5 border ${border} cursor-default`}>
            <Ic className={`w-3.5 h-3.5 ${color} mb-2 opacity-80`} />
            <p className={`text-xl font-black font-mono ${color} leading-none`}>{value}</p>
            <p className="text-[10px] text-muted-foreground/70 uppercase tracking-widest mt-1.5">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Search + filter bar ── */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search IMEI, order ID, reference, or carrier…"
            className="w-full h-9 pl-9 pr-9 bg-secondary/20 border border-border/50 rounded-lg text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40 focus:bg-secondary/40 transition-all font-mono"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 bg-secondary/20 border border-border/50 rounded-lg p-1">
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap ${
                filter === f.key ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground/70 hover:text-foreground'
              }`}>
              {f.label}
            </button>
          ))}
        </div>

        <button onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-secondary/20 border border-border/50 text-xs text-muted-foreground/70 hover:text-foreground transition-colors whitespace-nowrap">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          {sortDir === 'desc' ? 'Newest first' : 'Oldest first'}
        </button>
      </div>

      {/* ── Order list ── */}
      <div className="flex flex-col gap-1.5">
        <AnimatePresence initial={false}>
          {filtered.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <ClipboardList className="w-8 h-8 mb-3 opacity-20" />
              <p className="text-sm font-semibold mb-1">No orders found</p>
              <p className="text-xs opacity-50">Try adjusting your search or filter</p>
            </motion.div>
          ) : filtered.map((order, i) => (
            <motion.div key={order.id}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              transition={{ delay: i * 0.03 }}
              layout
            >
              <OrderCard order={order} onClick={() => setSelected(order)} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </motion.div>
  );
}
