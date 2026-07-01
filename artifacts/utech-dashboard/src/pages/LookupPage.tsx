import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Search, Smartphone, AlertTriangle, CheckCircle2,
  X, Loader2, PartyPopper, Bell, Clock, ShieldCheck, Copy, Check,
  Cpu, Hash, Layers, Activity, AlertCircle, Coins,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { useOrders, Order } from '../context/OrdersContext';
import { CountdownBanner } from '../components/CountdownBanner';

const LOOKUP_STEPS = [
  { id: 'validate', label: 'Validating IMEI format',         duration: 500 },
  { id: 'database', label: 'Querying global IMEI database',  duration: 700 },
  { id: 'carrier',  label: 'Resolving carrier & country',    duration: 600 },
  { id: 'submit',   label: 'Registering activation request', duration: 700 },
];

const REF_LOOKUP_STEPS = [
  { id: 'parse',   label: 'Parsing reference ID',        duration: 400 },
  { id: 'fetch',   label: 'Fetching order record',       duration: 600 },
  { id: 'status',  label: 'Loading current status',      duration: 500 },
  { id: 'render',  label: 'Building order summary',      duration: 400 },
];

const STAGE_LABELS = [
  { key: 'received',   label: 'Received',   sub: 'Request logged'     },
  { key: 'queued',     label: 'Queued',     sub: 'Awaiting processor' },
  { key: 'processing', label: 'Processing', sub: 'In progress'        },
  { key: 'complete',   label: 'Complete',   sub: 'Unlock delivered'   },
];


function stageIndex(status: 'processing' | 'queued' | 'success') {
  if (status === 'queued')     return 1;
  if (status === 'processing') return 2;
  if (status === 'success')    return 3;
  return 0;
}

function genRef() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return 'UTK-' + Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

interface LookupPageProps {
  onNavigate: (page: string) => void;
}

export function LookupPage({ onNavigate }: LookupPageProps) {
  const { orders, credits } = useOrders();
  const refMap = Object.fromEntries(orders.map(o => [o.ref, o]));

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const [result, setResult] = useState<'submitted' | 'order_found' | 'order_not_found' | null>(null);
  const [refId, setRefId] = useState('');
  const [submittedAt, setSubmittedAt] = useState('');
  const [copied, setCopied] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [foundOrder, setFoundOrder] = useState<Order | null>(null);
  const [orderRef, setOrderRef] = useState('');

  const isRefId = (v: string) => /^UTK-[A-Z0-9]{8}$/i.test(v.trim());
  const isImei  = (v: string) => /^\d{15}$/.test(v.trim());

  const handleChange = (v: string) => {
    const upper = v.toUpperCase();
    if (isRefId(upper) || upper.startsWith('UTK-')) {
      setQuery(upper.slice(0, 12));
    } else {
      const digits = v.replace(/\D/g, '').slice(0, 15);
      setQuery(digits);
    }
    setValidationError('');
  };

  const copyRef = () => {
    navigator.clipboard.writeText(refId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const runSteps = (steps: typeof LOOKUP_STEPS, onDone: () => void) => {
    setLoading(true);
    setResult(null);
    setCompletedSteps([]);
    setActiveStep(steps[0].id);

    const total = steps.reduce((s, st) => s + st.duration, 0) + 200;
    steps.forEach((step, i) => {
      const delay = steps.slice(0, i).reduce((s, st) => s + st.duration, 0);
      setTimeout(() => setActiveStep(step.id), delay);
      setTimeout(() => {
        setCompletedSteps(prev => [...prev, step.id]);
        setActiveStep(i + 1 < steps.length ? steps[i + 1].id : null);
      }, delay + step.duration);
    });

    setTimeout(() => { setLoading(false); onDone(); }, total);
  };

  const handleLookup = () => {
    const q = query.trim();

    if (isRefId(q)) {
      const ref = q.toUpperCase();
      setOrderRef(ref);
      runSteps(REF_LOOKUP_STEPS, () => {
        const order = refMap[ref] ?? null;
        setFoundOrder(order);
        setResult(order ? 'order_found' : 'order_not_found');
      });
      return;
    }

    if (!isImei(q)) {
      if (q.startsWith('UTK-')) {
        setValidationError('Reference ID must be in format UTK-XXXXXXXX (8 characters after dash).');
      } else {
        setValidationError('Enter a 15-digit IMEI or a reference ID (e.g. UTK-XXXXXXXX).');
      }
      return;
    }

    setValidationError('');
    runSteps(LOOKUP_STEPS, () => {
      setRefId(genRef());
      setSubmittedAt(new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }));
      setResult('submitted');
    });
  };

  const reset = () => {
    setQuery('');
    setResult(null);
    setRefId('');
    setSubmittedAt('');
    setCompletedSteps([]);
    setActiveStep(null);
    setValidationError('');
    setFoundOrder(null);
    setOrderRef('');
  };

  const currentSteps = query.toUpperCase().startsWith('UTK-') ? REF_LOOKUP_STEPS : LOOKUP_STEPS;
  const lowCredits = credits < 5;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Search className="w-5 h-5 text-primary" />Device Lookup
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Verify carrier status, submit an activation request, or look up an order by reference ID.
        </p>
      </div>

      <Card className="p-6 border-border bg-card/50">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">IMEI / Order Lookup</h3>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              data-testid="input-lookup-imei"
              placeholder="15-digit IMEI or reference ID (UTK-XXXXXXXX)"
              className={`pl-9 pr-14 font-mono bg-background/50 ${validationError ? 'border-red-500/50' : ''}`}
              value={query}
              onChange={(e) => handleChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
              maxLength={15}
            />
            {!query.toUpperCase().startsWith('UTK-') && (
              <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono tabular-nums ${query.length === 15 ? 'text-green-400' : 'text-muted-foreground/50'}`}>
                {query.length}/15
              </span>
            )}
          </div>
          {result ? (
            <Button variant="outline" onClick={reset} className="gap-1.5 border-border text-muted-foreground hover:text-foreground px-4">
              <X className="w-4 h-4" />Clear
            </Button>
          ) : (
            <Button
              data-testid="button-lookup"
              onClick={handleLookup}
              disabled={loading || query.length < 4}
              className="px-6 gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {loading ? 'Searching…' : 'Look Up'}
            </Button>
          )}
        </div>
        {validationError && (
          <p className="text-xs text-red-400 mt-2 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />{validationError}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-3">
          Dial <span className="font-mono">*#06#</span> to find the IMEI · or enter a reference ID like <span className="font-mono">UTK-XXXXXXXX</span>
        </p>
      </Card>

      <AnimatePresence>
        {loading && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Card className="p-6 border-border bg-card/50">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
                {query.toUpperCase().startsWith('UTK-') ? 'Looking Up Order' : 'Running Diagnostics'}
              </p>
              <div className="flex flex-col gap-2">
                {currentSteps.map(step => {
                  const done   = completedSteps.includes(step.id);
                  const active = activeStep === step.id;
                  return (
                    <div
                      key={step.id}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border transition-all duration-300 ${
                        done   ? 'bg-green-500/5 border-green-500/20' :
                        active ? 'bg-primary/5 border-primary/20' :
                                 'bg-secondary/20 border-border/40'
                      }`}
                    >
                      <div className="w-5 h-5 flex items-center justify-center shrink-0">
                        {done   ? <CheckCircle2 className="w-4 h-4 text-green-400" /> :
                         active ? <Loader2 className="w-4 h-4 text-primary animate-spin" /> :
                                  <div className="w-3 h-3 rounded-full border border-muted-foreground/30" />}
                      </div>
                      <span className={`text-xs font-mono ${done ? 'text-green-400' : active ? 'text-primary' : 'text-muted-foreground/50'}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Order found by reference ID */}
        {result === 'order_found' && foundOrder && !loading && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">

            {/* Hero */}
            <Card className="border-border bg-card/50 overflow-hidden">
              <div className={`h-1 ${foundOrder.status === 'success' ? 'bg-gradient-to-r from-emerald-500 to-green-400' : foundOrder.status === 'processing' ? 'bg-gradient-to-r from-primary to-cyan-400' : 'bg-gradient-to-r from-yellow-500 to-amber-400'}`} />
              <div className="p-5">
                <div className="flex items-start gap-4 mb-4 flex-wrap">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                    foundOrder.status === 'processing' ? 'bg-primary/10 border-primary/20' :
                    foundOrder.status === 'success'    ? 'bg-green-500/10 border-green-500/20' :
                                                         'bg-yellow-500/10 border-yellow-500/20'
                  }`}>
                    {foundOrder.status === 'processing'
                      ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}>
                          <Cpu className="w-6 h-6 text-primary" />
                        </motion.div>
                      : foundOrder.status === 'success'
                      ? <CheckCircle2 className="w-6 h-6 text-green-400" />
                      : <Clock className="w-6 h-6 text-yellow-400" />
                    }
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h2 className="text-lg font-bold text-foreground font-mono">{foundOrder.id}</h2>
                      <Badge variant="outline" className={`text-[10px] uppercase tracking-wider ${
                        foundOrder.status === 'processing' ? 'border-primary/30 text-primary bg-primary/10' :
                        foundOrder.status === 'success'    ? 'border-green-500/30 text-green-400 bg-green-500/10' :
                                                             'border-yellow-500/30 text-yellow-400 bg-yellow-500/10'
                      }`}>
                        {foundOrder.status === 'processing' ? 'Processing' : foundOrder.status === 'success' ? 'Completed' : 'In Queue'}
                      </Badge>
                      {foundOrder.imeis.length > 1 && (
                        <Badge variant="outline" className="text-[10px] uppercase tracking-wider border-purple-500/30 text-purple-400 bg-purple-500/10">
                          <Layers className="w-2.5 h-2.5 mr-1" />{foundOrder.imeis.length} Devices
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{foundOrder.carrier} · {foundOrder.region}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  {[
                    { label: 'Ref ID',      value: orderRef,             icon: Hash     },
                    { label: 'Submitted',   value: foundOrder.submittedAt, icon: Clock  },
                    { label: 'Updated',     value: foundOrder.updatedAt,   icon: Activity },
                    { label: 'Devices',     value: `${foundOrder.imeis.length} IMEI${foundOrder.imeis.length > 1 ? 's' : ''}`, icon: Smartphone },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="flex flex-col gap-0.5 p-3 rounded-lg bg-secondary/30 border border-border/60">
                      <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                        <Icon className="w-3 h-3" />
                        <span className="text-[9px] uppercase tracking-wider font-semibold">{label}</span>
                      </div>
                      <span className="font-mono text-[11px] text-foreground font-medium leading-tight">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Status pipeline */}
            <Card className="border-border bg-card/50 overflow-hidden">
              <div className="px-5 py-3 border-b border-border bg-card/80 flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Activation Status</p>
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      foundOrder.status === 'processing' ? 'bg-primary' :
                      foundOrder.status === 'success'    ? 'bg-green-400' : 'bg-yellow-400'
                    }`} />
                    <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
                      foundOrder.status === 'processing' ? 'bg-primary' :
                      foundOrder.status === 'success'    ? 'bg-green-400' : 'bg-yellow-400'
                    }`} />
                  </span>
                  <span className={`text-[10px] font-mono ${
                    foundOrder.status === 'processing' ? 'text-primary' :
                    foundOrder.status === 'success'    ? 'text-green-400' : 'text-yellow-400'
                  }`}>
                    {foundOrder.status === 'processing' ? 'Processing' : foundOrder.status === 'success' ? 'Completed' : 'Queued'}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <div className="relative flex items-start justify-between">
                  <div className="absolute top-4 left-4 right-4 h-px bg-border" style={{ zIndex: 0 }} />
                  {STAGE_LABELS.map((stage, idx) => {
                    const activeStageIdx = stageIndex(foundOrder.status);
                    const isDone   = idx < activeStageIdx;
                    const isActive = idx === activeStageIdx;
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
                            isDone   ? 'text-green-400' :
                            isActive ? 'text-primary' :
                                       'text-muted-foreground/40'
                          }`}>{stage.label}</p>
                          <p className="text-[9px] text-muted-foreground/50 font-mono mt-0.5">{stage.sub}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 3 (Processing) — credit warning */}
              {foundOrder.status === 'processing' && foundOrder.creditAlert && (
                <div className="mx-5 mb-5">
                  <div className={`flex items-start gap-3 p-4 rounded-xl border ${
                    foundOrder.creditAlert === 'exhausted'
                      ? 'bg-red-500/10 border-red-500/30'
                      : 'bg-yellow-500/10 border-yellow-500/30'
                  }`}>
                    <AlertCircle className={`w-5 h-5 shrink-0 mt-0.5 ${foundOrder.creditAlert === 'exhausted' ? 'text-red-400' : 'text-yellow-400'}`} />
                    <div className="flex-1 min-w-0">
                      {foundOrder.creditAlert === 'exhausted' ? (
                        <>
                          <p className="text-sm font-semibold text-red-400 mb-0.5">Dear user, you have exhausted your credits</p>
                          <p className="text-xs text-red-300/70 leading-relaxed">
                            Your credit balance has reached zero. Please top up immediately to complete your order — processing cannot continue without available credits.
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-semibold text-yellow-400 mb-0.5">You have low credits</p>
                          <p className="text-xs text-yellow-300/70 leading-relaxed">
                            Your current credit balance is low. Your order can be delayed if credits run out before processing completes.
                            Top up now to keep your unlock on track.
                          </p>
                        </>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => onNavigate('topup')}
                      className={`shrink-0 font-semibold gap-1.5 border-0 ${
                        foundOrder.creditAlert === 'exhausted'
                          ? 'bg-red-500 hover:bg-red-400 text-white'
                          : 'bg-yellow-500 hover:bg-yellow-400 text-black'
                      }`}
                    >
                      <Coins className="w-3.5 h-3.5" />Top Up
                    </Button>
                  </div>
                </div>
              )}
            </Card>

            {/* Countdown banner */}
            {foundOrder.countdownUntil && (
              <CountdownBanner until={foundOrder.countdownUntil} />
            )}

            {/* Event log */}
            <Card className="border-border bg-card/50 overflow-hidden">
              <div className="px-5 py-3 border-b border-border bg-card/80">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Activity Log</p>
              </div>
              <div className="p-5 flex flex-col gap-2">
                {foundOrder.events.map((ev, i) => (
                  <div key={i} className={`flex items-start gap-3 px-3 py-2 rounded-lg border text-xs ${
                    ev.type === 'ok'   ? 'bg-green-500/5 border-green-500/15' :
                    ev.type === 'warn' ? 'bg-yellow-500/5 border-yellow-500/15' :
                                         'bg-primary/5 border-primary/15'
                  }`}>
                    <div className={`mt-0.5 shrink-0 ${ev.type === 'ok' ? 'text-green-400' : ev.type === 'warn' ? 'text-yellow-400' : 'text-primary'}`}>
                      {ev.type === 'ok' ? <CheckCircle2 className="w-3.5 h-3.5" /> : ev.type === 'warn' ? <AlertTriangle className="w-3.5 h-3.5" /> : <Activity className="w-3.5 h-3.5" />}
                    </div>
                    <span className="flex-1 text-muted-foreground font-mono leading-relaxed">{ev.msg}</span>
                    <span className="text-[10px] text-muted-foreground/50 font-mono shrink-0">{ev.time}</span>
                  </div>
                ))}
              </div>
            </Card>

          </motion.div>
        )}

        {/* Order not found */}
        {result === 'order_not_found' && !loading && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-6 border-red-500/20 bg-card/50 flex flex-col items-center gap-3 text-center">
              <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <p className="font-semibold text-foreground">Order Not Found</p>
              <p className="text-sm text-muted-foreground">
                No order was found for reference <span className="font-mono text-foreground">{orderRef}</span>.
                Double-check the reference ID and try again.
              </p>
            </Card>
          </motion.div>
        )}

        {/* IMEI submitted */}
        {result === 'submitted' && !loading && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">

            <Card className="border-green-500/25 bg-card/50 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-emerald-500 via-green-400 to-teal-400" />
              <div className="p-6">
                <div className="flex items-start gap-4 mb-5">
                  <motion.div
                    initial={{ scale: 0, rotate: -15 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                    className="w-12 h-12 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0"
                  >
                    <PartyPopper className="w-6 h-6 text-green-400" />
                  </motion.div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <h3 className="text-lg font-bold text-foreground">Activation Successfully Submitted!</h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 uppercase tracking-wider">
                        Queued
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Your activation request for IMEI{' '}
                      <span className="font-mono text-foreground font-semibold">{query}</span>{' '}
                      has been received and is queued for processing. No further action is needed.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
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
                </div>
              </div>
            </Card>

            <Card className="border-border bg-card/50 overflow-hidden">
              <div className="px-5 py-3 border-b border-border bg-card/80 flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Activation Status</p>
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-yellow-400" />
                  </span>
                  <span className="text-[10px] text-yellow-400 font-mono">Queued</span>
                </div>
              </div>
              <div className="p-5">
                <div className="relative flex items-start justify-between">
                  <div className="absolute top-4 left-4 right-4 h-px bg-border" style={{ zIndex: 0 }} />
                  {STAGE_LABELS.map((stage, idx) => {
                    const isActive = idx === 1;
                    const isDone   = idx === 0;
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
                            isDone   ? 'text-green-400' :
                            isActive ? 'text-primary' :
                                       'text-muted-foreground/40'
                          }`}>{stage.label}</p>
                          <p className="text-[9px] text-muted-foreground/50 font-mono mt-0.5">{stage.sub}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>

            <Card className="border-primary/15 bg-gradient-to-br from-primary/5 to-transparent overflow-hidden">
              <div className="p-5 flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <Bell className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-1">You will be notified once completed</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Your request is queued under reference{' '}
                      <span className="font-mono text-foreground font-medium">{refId}</span>.
                      Our servers will process your activation automatically and notify you
                      as soon as the unlock is delivered.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: ShieldCheck, label: 'Verified',       sub: 'IMEI authenticated'   },
                    { icon: Clock,       label: 'Queue Active',   sub: 'Request is in line'   },
                    { icon: Bell,        label: 'Alert Ready',    sub: 'Notified on complete' },
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
        )}
      </AnimatePresence>
    </div>
  );
}
