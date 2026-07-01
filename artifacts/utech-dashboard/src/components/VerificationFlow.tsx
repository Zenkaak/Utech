import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, Shield, Smartphone, AlertTriangle, ArrowRight,
  Copy, Check, Wifi, Calendar, Hash, Activity, Layers, ChevronDown, ChevronUp,
  XCircle, Clock, AlertCircle,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Order } from '../context/OrdersContext';

type Step = 'congrats' | 'imei' | 'countdown' | 'confirmed' | 'payment' | 'bitcoin' | 'tracking';

const ORDER_DATA = {
  id: 'ORD-20848',
  ref: 'UTK-ZHVXLCICB',
  carrier: 'Mixed',
  region: 'Mixed',
  submittedAt: 'Jun 29, 2026 8:56 AM',
  updatedAt: 'Jun 29, 2026 9:14 AM',
  devices: 5,
  imeis: ['353875189689979','353948891968208','356978861734589','353335934696683','352048091968208'],
  unpaidImei: '353114100731092',
  events: [
    { time: '08:56 AM', msg: 'Batch request received — 5 devices submitted', type: 'ok' as const },
    { time: '08:56 AM', msg: 'All 5 IMEIs validated via Luhn algorithm — PASS', type: 'ok' as const },
    { time: '08:56 AM', msg: 'Carrier locks identified per IMEI', type: 'ok' as const },
    { time: '08:57 AM', msg: 'Jobs queued — awaiting processor slot', type: 'info' as const },
    { time: '09:14 AM', msg: 'Processing started — unlock cluster active', type: 'info' as const },
    { time: '09:41 AM', msg: 'Processing paused — incomplete verification fee detected on IMEI 353114100731092', type: 'warn' as const },
  ],
};

const COUNTDOWN_KEY = 'utech_pause_deadline_ORD-20848';
const PAUSE_DURATION_MS = 3 * 60 * 60 * 1000; // 3 hours

function getDeadline(): number {
  try {
    const stored = localStorage.getItem(COUNTDOWN_KEY);
    if (stored) {
      const n = parseInt(stored, 10);
      if (!isNaN(n) && n > Date.now()) return n;
    }
  } catch {}
  const deadline = Date.now() + PAUSE_DURATION_MS;
  try { localStorage.setItem(COUNTDOWN_KEY, String(deadline)); } catch {}
  return deadline;
}

function useCountdown(deadline: number) {
  const [remaining, setRemaining] = useState(() => Math.max(0, deadline - Date.now()));
  useEffect(() => {
    const tick = () => setRemaining(Math.max(0, deadline - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadline]);
  const h = Math.floor(remaining / 3600000);
  const m = Math.floor((remaining % 3600000) / 60000);
  const s = Math.floor((remaining % 60000) / 1000);
  return { remaining, h, m, s, expired: remaining === 0 };
}

function TrackingDashboard({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const [copied, setCopied] = useState<string | null>(null);
  const [showImeis, setShowImeis] = useState(false);
  const [deadline] = useState(getDeadline);
  const { h, m, s, expired, remaining } = useCountdown(deadline);
  const totalMs = PAUSE_DURATION_MS;
  const pct = Math.max(0, (remaining / totalMs) * 100);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <motion.div
      key="tracking"
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-4">

      {/* ── URGENT ALERT BANNER ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="rounded-2xl overflow-hidden border border-red-500/40"
        style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.12) 0%, rgba(185,28,28,0.08) 100%)' }}>
        <div className="h-0.5 bg-gradient-to-r from-red-500 to-orange-500" />
        <div className="px-5 py-4 flex items-start gap-4">
          <motion.div
            animate={{ scale: [1, 1.12, 1] }}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
            className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center border border-red-500/50 mt-0.5"
            style={{ background: 'rgba(239,68,68,0.15)' }}>
            <AlertCircle className="w-5 h-5 text-red-400" />
          </motion.div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-red-400 mb-1">Action Required — Order Paused</p>
            <p className="text-[12px] leading-relaxed text-white/60"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}>
              Device with IMEI{' '}
              <span className="font-mono font-bold text-white/90 bg-red-500/15 px-1.5 py-0.5 rounded">
                {ORDER_DATA.unpaidImei}
              </span>{' '}
              has an <span className="font-semibold text-red-300">incomplete verification fee</span>.
              Settle the payment to resume processing.
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Main Apple-style card ── */}
      <div className="rounded-3xl overflow-hidden border border-white/10"
        style={{ background: 'linear-gradient(160deg, #1c1c1e 0%, #141416 60%, #1a1a1c 100%)' }}>

        {/* Header */}
        <div className="px-6 pt-8 pb-6 flex flex-col items-center text-center gap-4 border-b border-white/[0.07]">

          {/* Paused icon */}
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 16 }}
            className="relative flex items-center justify-center" style={{ width: 80, height: 80 }}>
            {[0, 1].map(i => (
              <motion.div key={i}
                className="absolute rounded-full border border-amber-500/25"
                style={{ width: 58 + i * 18, height: 58 + i * 18 }}
                animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.12, 0.4] }}
                transition={{ repeat: Infinity, duration: 2.8, delay: i * 0.5, ease: 'easeInOut' }}
              />
            ))}
            <div className="w-[52px] h-[52px] rounded-full border-2 border-amber-500/70 flex items-center justify-center z-10"
              style={{ background: 'rgba(245,158,11,0.12)', boxShadow: '0 0 20px rgba(245,158,11,0.2)' }}>
              <AlertTriangle className="w-6 h-6 text-amber-400" />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
            className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30"
              style={{ background: 'rgba(245,158,11,0.08)' }}>
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
                className="relative flex h-1.5 w-1.5">
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-400" />
              </motion.span>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400"
                style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}>
                Paused
              </span>
            </div>
            <h2 className="text-[22px] font-bold text-white tracking-tight"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif' }}>
              Order Tracking
            </h2>
            <p className="text-[13px] text-white/40"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}>
              {ORDER_DATA.id} · {ORDER_DATA.ref}
            </p>
          </motion.div>
        </div>

        {/* ── COUNTDOWN TO CANCELLATION ── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
          className="px-6 py-6 border-b border-white/[0.07]">

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-amber-400/70" />
              <span className="text-[10px] uppercase tracking-widest font-semibold text-amber-400/70"
                style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
                Auto-Cancel Countdown
              </span>
            </div>
            {expired ? (
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Order Canceled</span>
            ) : (
              <span className="text-[10px] text-white/30 font-mono">Resolve before timer expires</span>
            )}
          </div>

          {/* Big countdown display */}
          <div className="flex items-center justify-center gap-3 mb-4">
            {[{ val: pad(h), label: 'HRS' }, { val: pad(m), label: 'MIN' }, { val: pad(s), label: 'SEC' }].map(({ val, label }, i) => (
              <div key={label} className="flex items-center gap-3">
                <div className="flex flex-col items-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={val}
                      initial={{ y: -8, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 8, opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      className={`text-[44px] font-black tabular-nums leading-none ${expired ? 'text-red-400' : 'text-white'}`}
                      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif', letterSpacing: '-0.03em' }}>
                      {val}
                    </motion.div>
                  </AnimatePresence>
                  <span className="text-[9px] font-semibold uppercase tracking-widest text-white/25 mt-1"
                    style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>{label}</span>
                </div>
                {i < 2 && (
                  <motion.span
                    animate={{ opacity: [1, 0.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'easeInOut' }}
                    className="text-[32px] font-bold text-white/30 -mt-2"
                    style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>:</motion.span>
                )}
              </div>
            ))}
          </div>

          {/* Draining bar */}
          <div className="w-full h-2 rounded-full overflow-hidden mb-2"
            style={{ background: 'rgba(255,255,255,0.07)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: expired ? '#ef4444' : 'linear-gradient(90deg, #f59e0b, #ef4444)' }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
            />
          </div>
          <p className="text-center text-[10px] text-white/25 font-mono">
            {expired
              ? 'This order has been automatically canceled.'
              : 'Order will be automatically canceled if payment is not resolved in time.'}
          </p>
        </motion.div>

        {/* ── Payment issue detail ── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
          className="px-6 py-5 border-b border-white/[0.07]">
          <p className="text-[10px] uppercase tracking-widest text-white/25 mb-3 font-semibold"
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>Payment Issue</p>

          <div className="rounded-2xl overflow-hidden border border-red-500/20"
            style={{ background: 'rgba(239,68,68,0.06)' }}>
            <div className="px-4 py-3 border-b border-red-500/15 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-400" />
                <span className="text-[11px] font-semibold text-red-300"
                  style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
                  Verification Fee Incomplete
                </span>
              </div>
              <span className="text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border border-red-500/30 text-red-400"
                style={{ background: 'rgba(239,68,68,0.1)' }}>Unpaid</span>
            </div>
            <div className="px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-white/30 mb-1"
                  style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>AFFECTED IMEI</p>
                <p className="font-mono text-sm font-bold text-white/85">{ORDER_DATA.unpaidImei}</p>
              </div>
              <button onClick={() => copy(ORDER_DATA.unpaidImei, 'unpaid')}
                className="text-white/30 hover:text-white/60 transition-colors">
                {copied === 'unpaid' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </motion.div>


        {/* ── Pay Now CTA ── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.31 }}
          className="px-6 py-5 border-b border-white/[0.07]">
          <div className="rounded-2xl overflow-hidden border border-amber-500/25"
            style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(234,88,12,0.07) 100%)' }}>
            <div className="px-5 py-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-bold text-white/90"
                    style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif' }}>
                    Settle Verification Fee
                  </p>
                  <p className="text-[11px] text-white/40 mt-0.5"
                    style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}>
                    Required to resume processing for IMEI {ORDER_DATA.unpaidImei}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] text-white/30 mb-0.5"
                    style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>AMOUNT DUE</p>
                  <p className="text-[20px] font-black text-white tabular-nums"
                    style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif', letterSpacing: '-0.02em' }}>
                    $9.99
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigate?.('topup')}
                className="w-full py-3.5 rounded-xl text-[14px] font-bold text-black transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(180deg, #f59e0b 0%, #d97706 100%)',
                  boxShadow: '0 2px 20px rgba(245,158,11,0.4), 0 1px 0 rgba(255,255,255,0.15) inset',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                }}>
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
                Pay Now &amp; Resume Order
              </button>
              <p className="text-center text-[10px] text-white/20"
                style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
                Secure payment · Order resumes automatically after confirmation
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── Key order fields ── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.34 }}
          className="px-6 py-5 border-b border-white/[0.07] grid grid-cols-2 gap-3">

          <div className="col-span-2 flex items-center justify-between px-4 py-3 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-white/30" />
              <span className="text-[10px] uppercase tracking-wider text-white/30"
                style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>REF</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-white">{ORDER_DATA.ref}</span>
              <button onClick={() => copy(ORDER_DATA.ref, 'ref')} className="text-white/30 hover:text-white/70 transition-colors">
                {copied === 'ref' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 px-4 py-3 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center gap-1.5">
              <Wifi className="w-3 h-3 text-white/30" />
              <span className="text-[10px] uppercase tracking-wider text-white/30"
                style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>Carrier</span>
            </div>
            <span className="text-sm font-semibold text-white">{ORDER_DATA.carrier}</span>
          </div>

          <div className="flex flex-col gap-1.5 px-4 py-3 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center gap-1.5">
              <Layers className="w-3 h-3 text-white/30" />
              <span className="text-[10px] uppercase tracking-wider text-white/30"
                style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>Devices</span>
            </div>
            <span className="text-sm font-semibold text-white">{ORDER_DATA.devices}</span>
          </div>

          <div className="col-span-2 flex items-center justify-between px-4 py-3 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-white/30" />
              <span className="text-[10px] uppercase tracking-wider text-white/30"
                style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>Submitted</span>
            </div>
            <span className="text-sm font-semibold text-white">{ORDER_DATA.submittedAt}</span>
          </div>
        </motion.div>

        {/* ── Progress pipeline ── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="px-6 py-5 border-b border-white/[0.07]">
          <p className="text-[10px] uppercase tracking-widest text-white/25 mb-4 font-semibold"
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>Activation Progress</p>

          <div className="mb-5">
            <div className="flex justify-between mb-1.5">
              <span className="text-[10px] text-white/30 font-mono">Overall progress</span>
              <span className="text-[10px] font-bold font-mono text-amber-400">98%</span>
            </div>
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <motion.div className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #0A84FF 0%, #f59e0b 100%)' }}
                initial={{ width: 0 }}
                animate={{ width: '98%' }}
                transition={{ duration: 1.0, ease: 'easeOut', delay: 0.45 }}
              />
            </div>
          </div>

          {(() => {
            const stages = [
              { label: 'Received',   sub: 'Request logged',     done: true,   active: false, paused: false },
              { label: 'Queued',     sub: 'Awaiting processor', done: true,   active: false, paused: false },
              { label: 'Processing', sub: 'In progress',        done: false,  active: false, paused: true  },
              { label: 'Complete',   sub: 'Unlock delivered',   done: false,  active: false, paused: false },
            ];
            return (
              <div className="relative flex items-start justify-between">
                <div className="absolute top-4 left-4 right-4 h-px" style={{ background: 'rgba(255,255,255,0.08)', zIndex: 0 }} />
                {stages.map((s, idx) => (
                  <div key={idx} className="relative flex flex-col items-center gap-2 z-10" style={{ flex: 1 }}>
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center`} style={{
                      borderColor: s.done ? 'rgba(10,132,255,0.8)' : s.paused ? 'rgba(245,158,11,0.8)' : 'rgba(255,255,255,0.1)',
                      background: s.done ? 'rgba(10,132,255,0.15)' : s.paused ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.03)'
                    }}>
                      {s.done
                        ? <CheckCircle2 className="w-4 h-4 text-[#0A84FF]" />
                        : s.paused
                        ? <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 1.4 }}>
                            <AlertTriangle className="w-4 h-4 text-amber-400" />
                          </motion.div>
                        : <div className="w-2 h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />}
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-semibold uppercase tracking-wider" style={{
                        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                        color: s.done ? 'rgba(10,132,255,0.8)' : s.paused ? '#f59e0b' : 'rgba(255,255,255,0.2)'
                      }}>{s.label}</p>
                      <p className="text-[9px] font-mono mt-0.5 text-white/20">{s.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </motion.div>

        {/* ── IMEI list (collapsible) ── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.46 }}
          className="px-6 py-4 border-b border-white/[0.07]">
          <button onClick={() => setShowImeis(v => !v)}
            className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Hash className="w-3.5 h-3.5 text-white/30" />
              <span className="text-[10px] uppercase tracking-widest text-white/30 font-semibold"
                style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
                Submitted IMEIs ({ORDER_DATA.devices})
              </span>
            </div>
            {showImeis ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />}
          </button>

          <AnimatePresence>
            {showImeis && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }}
                className="overflow-hidden">
                <div className="mt-3 space-y-2">
                  {ORDER_DATA.imeis.map((imei, idx) => (
                    <div key={imei} className="flex items-center justify-between px-4 py-2.5 rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] font-mono text-white/20 w-4 text-right">#{idx + 1}</span>
                        <motion.div animate={{ scale: [1, 1.3, 1], opacity: [1, 0.4, 1] }}
                          transition={{ repeat: Infinity, duration: 1.8, delay: idx * 0.2 }}
                          className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        <span className="font-mono text-[12px] font-semibold text-white/80 tracking-wide">{imei}</span>
                      </div>
                      <button onClick={() => copy(imei, imei)} className="text-white/25 hover:text-white/60 transition-colors">
                        {copied === imei ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  ))}
                  {/* Unpaid device highlighted separately */}
                  <div className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-red-500/30"
                    style={{ background: 'rgba(239,68,68,0.08)' }}>
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] font-mono text-red-400/50 w-4 text-right">⚠</span>
                      <motion.div animate={{ opacity: [1, 0.2, 1] }}
                        transition={{ repeat: Infinity, duration: 0.9 }}
                        className="w-1.5 h-1.5 rounded-full bg-red-400" />
                      <span className="font-mono text-[12px] font-bold text-red-300 tracking-wide">{ORDER_DATA.unpaidImei}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-semibold text-red-400 uppercase tracking-wider">Unpaid</span>
                      <button onClick={() => copy(ORDER_DATA.unpaidImei, 'unpaid2')} className="text-red-400/40 hover:text-red-400 transition-colors">
                        {copied === 'unpaid2' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Event log ── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.52 }}
          className="px-6 py-5 border-b border-white/[0.07]">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-3.5 h-3.5 text-white/30" />
            <p className="text-[10px] uppercase tracking-widest text-white/30 font-semibold"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>Event Log</p>
          </div>
          <div className="flex flex-col gap-0">
            {ORDER_DATA.events.map((ev, i) => (
              <div key={i} className="flex gap-3 pb-3 last:pb-0 relative">
                {i < ORDER_DATA.events.length - 1 && (
                  <div className="absolute left-[10px] top-5 bottom-0 w-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
                )}
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 z-10 border`} style={{
                  borderColor: ev.type === 'ok' ? 'rgba(10,132,255,0.3)' : ev.type === 'warn' ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.1)',
                  background: ev.type === 'ok' ? 'rgba(10,132,255,0.12)' : ev.type === 'warn' ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.04)'
                }}>
                  {ev.type === 'ok'   && <CheckCircle2 className="w-3 h-3 text-[#0A84FF]" />}
                  {ev.type === 'info' && <Activity      className="w-3 h-3 text-white/40" />}
                  {ev.type === 'warn' && <AlertTriangle className="w-3 h-3 text-amber-400" />}
                </div>
                <div className="flex-1 pt-0.5">
                  <p className="text-[12px] leading-snug" style={{
                    color: ev.type === 'warn' ? 'rgba(251,191,36,0.85)' : 'rgba(255,255,255,0.65)',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif'
                  }}>{ev.msg}</p>
                  <p className="text-[9px] text-white/20 font-mono mt-0.5">{ev.time} · Jun 29, 2026</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="px-6 py-4 flex items-center justify-center gap-1.5">
          <Shield className="w-3 h-3 text-white/20" />
          <span className="text-[10px] text-white/20 font-mono">
            Secured by UTECH · Updated {ORDER_DATA.updatedAt}
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
}

export function VerificationFlow({ order, onNavigate }: { order: Order; onNavigate?: (page: string) => void }) {
  const [step, setStep]       = useState<Step>('congrats');
  const [imeis, setImeis]     = useState<string[]>(Array(order.imeis.length).fill(''));
  const [seconds, setSeconds] = useState(5);

  useEffect(() => {
    if (step !== 'countdown') return;
    if (seconds <= 0) { setStep('confirmed'); return; }
    const t = setTimeout(() => setSeconds(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [step, seconds]);

  const allFilled  = imeis.every(v => v.replace(/\D/g, '').length === 15);
  const filledCount = imeis.filter(v => v.replace(/\D/g, '').length === 15).length;

  const handleVerify = () => { setSeconds(5); setStep('countdown'); };

  return (
    <AnimatePresence mode="wait">

      {step === 'congrats' && (
        <motion.div key="congrats"
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.3 }}>
          <Card className="border-green-500/30 bg-gradient-to-br from-green-500/8 via-card/60 to-card/40 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-green-400 to-emerald-500" />
            <div className="p-6 sm:p-10 flex flex-col items-center text-center gap-6">

              <div className="relative flex items-center justify-center">
                <motion.div className="absolute w-28 h-28 rounded-full border-2 border-green-400/20"
                  animate={{ scale: [1, 1.35, 1.7], opacity: [0.5, 0.2, 0] }}
                  transition={{ repeat: Infinity, duration: 2.4, ease: 'easeOut' }} />
                <motion.div className="absolute w-20 h-20 rounded-full border-2 border-green-400/30"
                  animate={{ scale: [1, 1.3, 1.6], opacity: [0.6, 0.3, 0] }}
                  transition={{ repeat: Infinity, duration: 2.4, ease: 'easeOut', delay: 0.3 }} />
                <motion.div
                  initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 14, delay: 0.1 }}
                  className="w-20 h-20 rounded-full bg-green-500/15 border-2 border-green-500/40 flex items-center justify-center z-10">
                  <CheckCircle2 className="w-10 h-10 text-green-400" />
                </motion.div>
              </div>

              <div className="space-y-2">
                <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                  className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                  Congratulations! 🎉
                </motion.h2>
                <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                  className="text-base font-bold text-green-400">
                  Your order has been fulfilled.
                </motion.p>
                <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
                  className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
                  To complete your activation, please verify your devices. This only takes a moment.
                </motion.p>
              </div>

              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
                <Button
                  onClick={() => setStep('tracking')}
                  className="gap-2 px-8 py-2.5 text-sm font-bold bg-green-500 hover:bg-green-400 text-black shadow-[0_0_28px_rgba(34,197,94,0.35)] transition-all">
                  Track the Process <ArrowRight className="w-4 h-4" />
                </Button>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
                className="flex items-center gap-1.5 text-[10px] text-muted-foreground/40 font-mono">
                <Shield className="w-3 h-3" />
                Secured by UTECH Verification Protocol v3
              </motion.div>
            </div>
          </Card>
        </motion.div>
      )}

      {step === 'tracking' && <TrackingDashboard onNavigate={onNavigate} />}

      {step === 'imei' && (
        <motion.div key="imei"
          initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -28 }}
          transition={{ duration: 0.25 }}>
          <Card className="border-primary/30 bg-card/60 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-primary to-cyan-400" />
            <div className="p-5 sm:p-6 flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Device Verification</h3>
                  <p className="text-xs text-muted-foreground">
                    Enter your {order.imeis.length} device IMEI number{order.imeis.length > 1 ? 's' : ''} to complete activation
                  </p>
                </div>
              </div>
              <div className="space-y-2.5">
                {imeis.map((val, idx) => {
                  const digits = val.replace(/\D/g, '');
                  const ok = digits.length === 15;
                  return (
                    <motion.div key={idx} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.06 }} className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-muted-foreground w-5 text-right shrink-0 select-none">
                        #{idx + 1}
                      </span>
                      <Input value={val}
                        onChange={e => {
                          const next = [...imeis];
                          next[idx] = e.target.value.replace(/\D/g, '').slice(0, 15);
                          setImeis(next);
                        }}
                        placeholder={`Device ${idx + 1} — 15-digit IMEI`}
                        className={`font-mono text-sm flex-1 transition-all ${ok ? 'border-green-500/50 focus-visible:ring-green-500/30 bg-green-500/5' : ''}`}
                      />
                      <div className="w-5 shrink-0 flex items-center justify-center">
                        <AnimatePresence>
                          {ok && (
                            <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
                              exit={{ scale: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 15 }}>
                              <CheckCircle2 className="w-5 h-5 text-green-400" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {imeis.map((_, i) => (
                      <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${imeis[i].replace(/\D/g, '').length === 15 ? 'bg-green-400' : 'bg-secondary'}`} />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">{filledCount}/{order.imeis.length} confirmed</span>
                </div>
                <Button onClick={handleVerify} disabled={!allFilled} className="gap-2 font-semibold">
                  <Shield className="w-4 h-4" />Verify Devices
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {step === 'countdown' && (
        <motion.div key="countdown"
          initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.2 }}>
          <Card className="border-amber-500/40 bg-amber-950/20 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-amber-400 to-orange-400" />
            <div className="p-6 sm:p-10 flex flex-col items-center text-center gap-6">
              <motion.div animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 0.75, ease: 'easeInOut' }}
                className="w-16 h-16 rounded-full bg-amber-500/15 border-2 border-amber-500/50 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-amber-400" />
              </motion.div>
              <div className="space-y-1.5">
                <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-amber-400/60">Processing Verification</p>
                <h3 className="text-xl font-black text-amber-300 tracking-wide">⚠ DO NOT CLOSE THIS WINDOW ⚠</h3>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                  Syncing device data with Apple activation servers — interruption will require a full restart
                </p>
              </div>
              <AnimatePresence mode="wait">
                <motion.div key={seconds}
                  initial={{ scale: 1.6, opacity: 0, y: -8 }} animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.5, opacity: 0, y: 8 }} transition={{ duration: 0.25 }}
                  className="text-8xl font-black font-mono text-amber-300 tabular-nums leading-none w-28 text-center">
                  {seconds}
                </motion.div>
              </AnimatePresence>
              <p className="text-[11px] text-amber-400/40 font-mono -mt-3">seconds remaining</p>
              <div className="w-full max-w-xs space-y-1.5">
                <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
                  <motion.div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400"
                    initial={{ width: '100%' }} animate={{ width: '0%' }}
                    transition={{ duration: 5, ease: 'linear' }} />
                </div>
                <p className="text-[10px] text-muted-foreground/40 font-mono text-center">
                  Verifying with Apple activation servers…
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {step === 'confirmed' && (
        <motion.div key="confirmed"
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.3 }}>
          <Card className="border-green-500/30 bg-green-950/15 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-green-400 to-emerald-500" />
            <div className="p-6 sm:p-10 flex flex-col items-center text-center gap-6">
              <motion.div initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 250, damping: 14 }}
                className="w-20 h-20 rounded-full bg-green-500/15 border-2 border-green-500/40 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-400" />
              </motion.div>
              <div className="space-y-2">
                <motion.h3 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  className="text-xl font-black text-green-400">
                  Devices Confirmed Successfully ✓
                </motion.h3>
                <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                  className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                  All {order.imeis.length} device{order.imeis.length > 1 ? 's have' : ' has'} been verified and registered with Apple's activation servers.
                </motion.p>
              </div>
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <Button onClick={() => setStep('payment')}
                  className="gap-2 bg-green-500 hover:bg-green-400 text-black font-bold px-8 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                  Continue to Activation <ArrowRight className="w-4 h-4" />
                </Button>
              </motion.div>
            </div>
          </Card>
        </motion.div>
      )}

    </AnimatePresence>
  );
}
