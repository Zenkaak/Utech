import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, X, Lock, Hash, Cpu, CheckCircle2, ChevronRight,
  AlertTriangle, Loader2, KeyRound, PartyPopper, Clock,
  Bell, ShieldCheck, Copy, Check, Server, Wifi,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface ImeiRow { id: string; imei: string; token: string; }

interface TermLine { id: string; text: string; type: 'out' | 'in' | 'ok' | 'info' | 'warn'; delay: number; }

const STAGE_LABELS = [
  { key: 'received',   label: 'Received',   sub: 'Request logged'     },
  { key: 'queued',     label: 'Queued',      sub: 'Awaiting processor' },
  { key: 'processing', label: 'Processing',  sub: 'In progress'        },
  { key: 'complete',   label: 'Complete',    sub: 'Unlock delivered'   },
];

function genRef() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return 'UTK-' + Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function buildTermLines(imeis: string[]): TermLine[] {
  const ts = () => new Date().toISOString().replace('T', ' ').slice(0, 23);
  const lines: TermLine[] = [];
  let t = 0;

  const push = (text: string, type: TermLine['type'], gap = 220) => {
    lines.push({ id: `${t}-${Math.random()}`, text, type, delay: t });
    t += gap;
  };

  push(`[${ts()}] Initiating secure handshake with unlock cluster…`, 'out', 180);
  push(`[${ts()}] TLS 1.3 session established · cipher AES-256-GCM`, 'in', 200);
  push(`[${ts()}] → POST /api/v3/auth  HTTP/2`, 'out', 160);
  push(`[${ts()}] ← 200 OK  · latency 38ms`, 'in', 200);
  push(`[${ts()}] Token validated · scope: unlock:write`, 'ok', 180);

  imeis.forEach((imei, i) => {
    push(`[${ts()}] ─── Device ${i + 1} of ${imeis.length} ───────────────────────────────`, 'info', 120);
    push(`[${ts()}] → Validating IMEI ${imei} via Luhn algorithm`, 'out', 160);
    push(`[${ts()}] ← Checksum PASS · length 15 · format OK`, 'in', 180);
    push(`[${ts()}] → Querying GSMA IMEI database`, 'out', 200);
    push(`[${ts()}] ← Device fingerprint resolved`, 'in', 180);
    push(`[${ts()}] → Resolving carrier lock via MVNO bridge`, 'out', 220);
    push(`[${ts()}] ← Carrier lock record found · region confirmed`, 'in', 200);
    push(`[${ts()}] → Registering activation job in queue`, 'out', 180);
    push(`[${ts()}] ← Job accepted · priority: standard`, 'ok', 160);
  });

  push(`[${ts()}] ─────────────────────────────────────────────────`, 'info', 100);
  push(`[${ts()}] All devices registered · dispatching to processor`, 'ok', 180);
  push(`[${ts()}] Queue position assigned · estimated window active`, 'ok', 160);
  push(`[${ts()}] Connection closed gracefully · 200 OK`, 'in', 140);

  return lines;
}

interface ImeiFormProps {
  credits?: number;
  onSpend?: (amount: number) => void;
  onNavigate?: (page: string) => void;
}

export function ImeiForm({ credits = 99, onSpend, onNavigate }: ImeiFormProps) {
  const [rows, setRows] = useState<ImeiRow[]>([{ id: '1', imei: '', token: '' }]);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle');
  const [progress, setProgress] = useState(0);
  const [visibleLines, setVisibleLines] = useState<TermLine[]>([]);
  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const [submittedImeis, setSubmittedImeis] = useState<string[]>([]);
  const [refId, setRefId] = useState('');
  const [submittedAt, setSubmittedAt] = useState('');
  const [copied, setCopied] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [pipelineStage, setPipelineStage] = useState(1);
  const termRef = useRef<HTMLDivElement>(null);

  // Auto-advance pipeline based on elapsed real time (stored in localStorage)
  useEffect(() => {
    if (!refId || status !== 'success') return;
    const calcStage = () => {
      try {
        const raw = localStorage.getItem(`utech_${refId}`);
        if (!raw) return;
        const { start, completesAt } = JSON.parse(raw);
        const pct = Math.min((Date.now() - start) / (completesAt - start), 1);
        let stage = 0;
        if (pct >= 0.12) stage = 1;
        if (pct >= 0.42) stage = 2;
        if (pct >= 0.95) stage = 3;
        setPipelineStage(stage);
      } catch {}
    };
    calcStage();
    const iv = setInterval(calcStage, 30000);
    return () => clearInterval(iv);
  }, [refId, status]);

  const addRow = () => {
    if (rows.length >= 6) return;
    setRows(prev => [...prev, { id: Math.random().toString(36).substring(7), imei: '', token: '' }]);
  };
  const removeRow = (id: string) => {
    if (rows.length <= 1) return;
    setRows(prev => prev.filter(r => r.id !== id));
  };
  const updateImei = (id: string, value: string) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, imei: value.replace(/\D/g, '').slice(0, 15) } : r));
    setValidationError('');
  };
  const updateToken = (id: string, value: string) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, token: value } : r));
    setValidationError('');
  };
  const copyRef = () => {
    navigator.clipboard.writeText(refId).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  useEffect(() => {
    if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight;
  }, [visibleLines]);

  const handleActivate = () => {
    if (!agreedToTerms) {
      setValidationError('You must agree to the Terms & Conditions and Privacy Policy before submitting.');
      return;
    }
    for (let i = 0; i < rows.length; i++) {
      if (rows[i].imei.length !== 15) { setValidationError(`Row ${i + 1}: IMEI must be exactly 15 digits (${rows[i].imei.length}/15).`); return; }
      if (!rows[i].token.trim()) { setValidationError(`Row ${i + 1}: Access token is required.`); return; }
    }
    setValidationError('');

    const imeis = rows.map(r => r.imei);

    // Warn when credits insufficient for this request but still allow submission
    if (credits < imeis.length) {
      toast.warning('Insufficient Server Credits', {
        description: 'Your request was queued but may experience delays. Top up credits for priority processing.',
        duration: 9000,
        action: {
          label: 'Top Up',
          onClick: () => onNavigate?.('topup'),
        },
      });
    }
    const lines = buildTermLines(imeis);
    const totalDuration = lines[lines.length - 1].delay + 400;

    setStatus('processing');
    setVisibleLines([]);
    setActiveStepIdx(0);
    setProgress(0);

    // Stream lines
    lines.forEach(line => {
      setTimeout(() => setVisibleLines(prev => [...prev, line]), line.delay);
    });

    // Progress + step advancement
    let elapsed = 0;
    const tick = setInterval(() => {
      elapsed += 60;
      const pct = Math.min((elapsed / totalDuration) * 100, 98);
      setProgress(pct);
      if (pct > 25 && pct <= 55) setActiveStepIdx(1);
      if (pct > 55 && pct <= 85) setActiveStepIdx(2);
    }, 60);

    setTimeout(() => {
      clearInterval(tick);
      setProgress(100);
      setActiveStepIdx(3);
      setSubmittedImeis(imeis);
      const newRef = genRef();
      const start = Date.now();
      const completesAt = start + (5 + Math.random() * 2) * 3_600_000; // 5–7 h
      localStorage.setItem(`utech_${newRef}`, JSON.stringify({ start, completesAt }));
      setRefId(newRef);
      setPipelineStage(1);
      setSubmittedAt(new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }));
      onSpend?.(imeis.length);
      setTimeout(() => setStatus('success'), 600);
    }, totalDuration);
  };

  const resetForm = () => {
    setStatus('idle');
    setRows([{ id: Math.random().toString(36).substring(7), imei: '', token: '' }]);
    setSubmittedImeis([]); setRefId(''); setSubmittedAt('');
    setVisibleLines([]); setProgress(0); setActiveStepIdx(0);
    setValidationError('');
  };

  /* ── Processing State ── */
  if (status === 'processing') {
    const lineColor = (type: TermLine['type']) => {
      if (type === 'out')  return 'text-blue-400';
      if (type === 'in')   return 'text-cyan-300';
      if (type === 'ok')   return 'text-green-400';
      if (type === 'warn') return 'text-yellow-400';
      return 'text-muted-foreground/50';
    };

    return (
      <Card className="border-border bg-card/50 overflow-hidden min-h-[520px] flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-border bg-card/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
            </div>
            <span className="text-sm font-semibold text-foreground">Connecting to Unlock Server</span>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-mono text-muted-foreground">
            <span className="flex items-center gap-1.5"><Wifi className="w-3 h-3 text-green-400" />TLS 1.3</span>
            <span className="flex items-center gap-1.5"><Server className="w-3 h-3 text-primary" />cluster-us-east-1</span>
          </div>
        </div>

        {/* Terminal */}
        <div
          ref={termRef}
          className="flex-1 bg-[#0a0d12] mx-4 my-3 rounded-lg border border-border/40 p-3 overflow-y-auto font-mono text-[10px] leading-relaxed"
          style={{ minHeight: 240, maxHeight: 300 }}
        >
          <div className="text-muted-foreground/30 mb-2 border-b border-border/20 pb-2">
            UTECH Unlock Engine v4.2 · Secure Processing Terminal
          </div>
          {visibleLines.map(line => (
            <motion.div
              key={line.id}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.12 }}
              className={`${lineColor(line.type)} whitespace-pre-wrap break-all leading-5`}
            >
              {line.text}
            </motion.div>
          ))}
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ repeat: Infinity, duration: 0.9 }}
            className="inline-block w-1.5 h-3 bg-primary/70 ml-0.5 align-middle"
          />
        </div>

        {/* Progress + pipeline */}
        <div className="px-5 pb-5 flex flex-col gap-4 shrink-0">
          {/* Progress bar */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
              <span>Processing {rows.length} IMEI{rows.length > 1 ? 's' : ''}…</span>
              <span className="tabular-nums">{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-primary via-blue-400 to-cyan-400"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.08 }}
              />
            </div>
          </div>

          {/* 4-stage pipeline */}
          <div className="relative flex items-start justify-between">
            <div className="absolute top-3.5 left-4 right-4 h-px bg-border/60" style={{ zIndex: 0 }} />
            {STAGE_LABELS.map((stage, idx) => {
              const isDone   = idx < activeStepIdx;
              const isActive = idx === activeStepIdx;
              return (
                <div key={stage.key} className="relative flex flex-col items-center gap-1.5 z-10" style={{ flex: 1 }}>
                  <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                    isDone   ? 'bg-green-500/20 border-green-500'          :
                    isActive ? 'bg-primary/20 border-primary'              :
                               'bg-secondary/30 border-border/40'
                  }`}>
                    {isDone
                      ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                      : isActive
                      ? <motion.div animate={{ scale: [1, 1.25, 1] }} transition={{ repeat: Infinity, duration: 1.4 }}>
                          <div className="w-2 h-2 rounded-full bg-primary" />
                        </motion.div>
                      : <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/20" />}
                  </div>
                  <div className="text-center">
                    <p className={`text-[9px] font-semibold uppercase tracking-wider ${
                      isDone   ? 'text-green-400' :
                      isActive ? 'text-primary'   : 'text-muted-foreground/30'
                    }`}>{stage.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    );
  }

  /* ── Success State ── */
  if (status === 'success') {
    return (
      <div className="flex flex-col gap-4">
        <Card className="border-green-500/25 bg-card/50 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-emerald-500 via-green-400 to-teal-400" />
          <div className="p-6">
            <div className="flex items-start gap-4 mb-5">
              <motion.div
                initial={{ scale: 0, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0"
              >
                <PartyPopper className="w-7 h-7 text-green-400" />
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <h2 className="text-xl font-bold text-foreground">Activation Submitted Successfully</h2>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Your unlock request for{' '}
                  <span className="font-semibold text-foreground">
                    {submittedImeis.length} device{submittedImeis.length > 1 ? 's' : ''}
                  </span>{' '}
                  has been securely received and queued. Our processing cluster will handle
                  everything automatically — no further action is required from you.
                </p>
              </motion.div>
            </div>

            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 border border-border">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Ref</span>
                <span className="font-mono text-sm font-bold text-foreground tracking-wider">{refId}</span>
                <button onClick={copyRef} className="text-muted-foreground hover:text-foreground transition-colors ml-1">
                  {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
                <Clock className="w-3.5 h-3.5" /><span>{submittedAt}</span>
              </div>
              <span className="ml-auto text-[10px] font-mono px-2 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 uppercase tracking-wider">
                {submittedImeis.length} Device{submittedImeis.length > 1 ? 's' : ''} Queued
              </span>
            </motion.div>
          </div>
        </Card>

        {/* Pipeline */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
          <Card className="border-border bg-card/50 overflow-hidden">
            <div className="px-5 py-3 border-b border-border bg-card/80 flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Activation Status</p>
              <div className="flex items-center gap-1.5">
                {pipelineStage < 3 ? (
                  <>
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-yellow-400" />
                    </span>
                    <span className="text-[10px] text-yellow-400 font-mono">{STAGE_LABELS[pipelineStage].label}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                    <span className="text-[10px] text-green-400 font-mono">Complete</span>
                  </>
                )}
              </div>
            </div>
            <div className="p-5">
              <div className="relative flex items-start justify-between">
                <div className="absolute top-4 left-4 right-4 h-px bg-border" style={{ zIndex: 0 }} />
                {STAGE_LABELS.map((stage, idx) => {
                  const isDone   = idx < pipelineStage;
                  const isActive = idx === pipelineStage;
                  return (
                    <div key={stage.key} className="relative flex flex-col items-center gap-2 z-10" style={{ flex: 1 }}>
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                        isDone   ? 'bg-green-500/15 border-green-500 text-green-400' :
                        isActive ? 'bg-primary/15 border-primary text-primary' :
                                   'bg-secondary/30 border-border/50 text-muted-foreground/30'
                      }`}>
                        {isDone
                          ? <CheckCircle2 className="w-4 h-4" />
                          : isActive
                          ? <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.6 }}>
                              <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                            </motion.div>
                          : <div className="w-2 h-2 rounded-full bg-muted-foreground/20" />}
                      </div>
                      <div className="text-center">
                        <p className={`text-[10px] font-semibold uppercase tracking-wider ${
                          isDone ? 'text-green-400' : isActive ? 'text-primary' : 'text-muted-foreground/40'
                        }`}>{stage.label}</p>
                        <p className="text-[9px] text-muted-foreground/50 font-mono mt-0.5">{stage.sub}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* IMEI list */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}>
          <Card className="border-border bg-card/50 overflow-hidden">
            <div className="px-5 py-3 border-b border-border bg-card/80">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Submitted IMEI{submittedImeis.length > 1 ? 's' : ''}
              </p>
            </div>
            <div className="p-4 flex flex-col gap-2">
              {submittedImeis.map((imei, idx) => (
                <motion.div key={imei} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.28 + idx * 0.07 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-md bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                    </div>
                    <span className="font-mono text-sm text-foreground tracking-wider">{imei}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono text-muted-foreground/60">#{idx + 1}</span>
                    <span className="text-[10px] font-mono text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20 uppercase tracking-wider">Queued</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Notification card */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}>
          <Card className="border-primary/15 bg-gradient-to-br from-primary/5 to-transparent overflow-hidden">
            <div className="p-5 flex flex-col gap-5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <Bell className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground mb-1">You will be notified once completed</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Your request is now in our secure processing queue under reference{' '}
                    <span className="font-mono text-foreground font-medium">{refId}</span>.
                    Our unlock servers process requests automatically — you'll receive
                    a confirmation as soon as your activation is complete.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: ShieldCheck, label: 'TLS Encrypted',   sub: 'End-to-end secure'    },
                  { icon: Cpu,         label: 'Auto-Processing', sub: 'No manual steps'       },
                  { icon: Bell,        label: 'Instant Alert',   sub: 'Notified on complete'  },
                ].map(({ icon: Icon, label, sub }) => (
                  <div key={label} className="flex flex-col items-center text-center p-3 rounded-xl bg-secondary/30 border border-border/60 gap-2">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <Icon className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-foreground leading-tight">{label}</p>
                      <p className="text-[9px] text-muted-foreground leading-tight mt-0.5">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        <Button onClick={resetForm} variant="ghost" className="text-muted-foreground hover:text-foreground self-start text-xs gap-2">
          <ChevronRight className="w-3.5 h-3.5 rotate-180" /> Submit Another Request
        </Button>
      </div>
    );
  }

  /* ── Idle / Form State ── */
  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm overflow-hidden flex flex-col shadow-xl">
      <div className="p-6 border-b border-border bg-card/80 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary" />Submit Unlock Request
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">Enter 15-digit IMEIs and your API access token.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground bg-secondary/40 border border-border px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse" />Server Ready
        </div>
      </div>

      <div className="px-6 py-2.5 bg-primary/5 border-b border-border flex items-center gap-3 text-xs text-muted-foreground">
        <AlertTriangle className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
        <span>Ensure each access token matches your account credentials before submitting.</span>
      </div>

      <div className="p-6 flex-1 flex flex-col gap-4">
        <AnimatePresence>
          {rows.map((row, index) => (
            <motion.div key={row.id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }} className="flex items-start gap-3 group">
              <div className="w-7 h-10 flex items-center justify-center text-[10px] font-mono text-muted-foreground border border-border/50 bg-secondary/30 rounded shrink-0">{index + 1}</div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    data-testid={`input-imei-${index}`}
                    placeholder="15-digit IMEI"
                    className={`pl-8 pr-12 font-mono text-sm bg-background/50 focus:bg-background ${row.imei.length > 0 && row.imei.length < 15 ? 'border-yellow-500/50' : ''}`}
                    value={row.imei}
                    onChange={(e) => updateImei(row.id, e.target.value)}
                    maxLength={15}
                    inputMode="numeric"
                  />
                  <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono tabular-nums ${row.imei.length === 15 ? 'text-green-400' : 'text-muted-foreground/50'}`}>
                    {row.imei.length}/15
                  </span>
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    data-testid={`input-token-${index}`}
                    type="password"
                    placeholder="Access Token"
                    className="pl-8 font-mono text-sm bg-background/50 focus:bg-background"
                    value={row.token}
                    onChange={(e) => updateToken(row.id, e.target.value)}
                  />
                </div>
              </div>
              {rows.length > 1 && (
                <Button variant="ghost" size="icon"
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 w-8 h-8 mt-1"
                  onClick={() => removeRow(row.id)}>
                  <X className="w-3.5 h-3.5" />
                </Button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        <AnimatePresence>
          {validationError && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
              <AlertTriangle className="w-4 h-4 shrink-0" />{validationError}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between pt-2">
          <Button variant="outline" size="sm" onClick={addRow} disabled={rows.length >= 6}
            className="border-dashed border-muted-foreground/30 hover:border-primary hover:text-primary transition-colors text-xs gap-1.5">
            <Plus className="w-3.5 h-3.5" />Add IMEI Row
          </Button>
          <span className="bg-secondary/50 px-2.5 py-1 rounded-full border border-border/50 font-mono text-xs text-muted-foreground">
            {rows.length} / 6 slots
          </span>
        </div>
      </div>

      <div className="p-6 bg-secondary/20 border-t border-border flex flex-col gap-3">
        {/* Terms & conditions agreement checkbox */}
        <label className="flex items-start gap-3 cursor-pointer group select-none">
          <div className="mt-0.5 shrink-0">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={e => { setAgreedToTerms(e.target.checked); if (e.target.checked) setValidationError(''); }}
              className="w-4 h-4 rounded border border-border bg-background accent-primary cursor-pointer"
            />
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">
            I agree to the{' '}
            <button
              type="button"
              onClick={e => { e.preventDefault(); e.stopPropagation(); onNavigate?.('terms'); }}
              className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
            >
              Terms and Conditions
            </button>
            {' '}and{' '}
            <button
              type="button"
              onClick={e => { e.preventDefault(); e.stopPropagation(); onNavigate?.('privacy'); }}
              className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
            >
              Privacy Policy
            </button>
            {' '}for UTECH Providers. By submitting, I confirm that all device information is accurate and that I have the legal right to submit this request.
          </p>
        </label>
        <Button data-testid="button-activate" onClick={handleActivate} disabled={!agreedToTerms}
          className="w-full h-12 text-sm font-bold tracking-widest uppercase bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_24px_rgba(2,132,199,0.2)] hover:shadow-[0_0_32px_rgba(2,132,199,0.35)] transition-all gap-2 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed">
          <Cpu className="w-4 h-4" />Activate Unlock Request<ChevronRight className="w-4 h-4" />
        </Button>
        <p className="text-[10px] text-muted-foreground text-center font-mono">
          TLS 1.3 encrypted · 1 credit per IMEI · Results in ~30s
        </p>
      </div>
    </Card>
  );
}
