import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Coins, Copy, Check, ShieldCheck, Zap, Star, ArrowRight,
  CheckCircle2, AlertCircle, Clock, Smartphone, ChevronRight,
  CalendarClock, Receipt, TrendingDown,
} from 'lucide-react';

const RATE_PER_CREDIT = 2.70;
const BINANCE_PAY_ID  = '490759406';
const VALIDITY_DAYS   = 30;

const PRESETS = [
  { id: 'starter',    label: 'Starter',    credits: 5,   badge: null,        icon: Zap         },
  { id: 'pro',        label: 'Pro',        credits: 10,  badge: 'Popular',   icon: Star        },
  { id: 'business',   label: 'Business',   credits: 25,  badge: 'Value',     icon: ShieldCheck },
  { id: 'enterprise', label: 'Enterprise', credits: 50,  badge: 'Best Deal', icon: Coins       },
];

function calcTotal(credits: number) {
  return Math.round(credits * RATE_PER_CREDIT * 100) / 100;
}

function expiryDate() {
  const d = new Date();
  d.setDate(d.getDate() + VALIDITY_DAYS);
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

const STEPS = [
  { n: 1, title: 'Choose credits & calculate',  detail: 'Select a preset or type how many credits you want. The total USD is calculated automatically.' },
  { n: 2, title: 'Open Binance App',            detail: 'Launch the Binance app on your phone and go to Pay.' },
  { n: 3, title: 'Enter Pay ID & amount',       detail: `Search by Pay ID ${BINANCE_PAY_ID}. Enter the exact USD total shown above.` },
  { n: 4, title: 'Send reference',              detail: 'Send your Binance Pay transaction ID to support for manual verification and instant credit top-up.' },
];

interface TopUpPageProps { onNavigate: (page: string) => void; }

export function TopUpPage({ onNavigate }: TopUpPageProps) {
  const [credits, setCredits] = useState<number>(10);
  const [inputVal, setInputVal] = useState('10');
  const [copied, setCopied]   = useState(false);
  const [sent, setSent]       = useState(false);
  const [txRef, setTxRef]     = useState('');

  const total = calcTotal(credits);

  const selectPreset = (n: number) => {
    setCredits(n);
    setInputVal(String(n));
  };

  const handleInput = (v: string) => {
    setInputVal(v);
    const n = parseInt(v, 10);
    if (!isNaN(n) && n >= 1 && n <= 9999) setCredits(n);
  };

  const copyId = () => {
    navigator.clipboard.writeText(BINANCE_PAY_ID).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Coins className="w-5 h-5 text-primary" />Purchase Server Credits
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            1 credit = 1 device unlock · <span className="font-semibold text-foreground">${RATE_PER_CREDIT.toFixed(2)} USD / credit</span> · valid {VALIDITY_DAYS} days
          </p>
        </div>
        <Badge className="bg-primary/10 text-primary border border-primary/20 text-[10px] uppercase tracking-wider px-2.5 py-1 flex items-center gap-1.5">
          <CalendarClock className="w-3 h-3" />{VALIDITY_DAYS}-Day Validity
        </Badge>
      </div>

      {/* ── Calculator card ── */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-card/60 to-transparent overflow-hidden">
        <div className="p-4 border-b border-border/60 bg-card/60 flex items-center gap-2">
          <Receipt className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Credit Calculator</h3>
          <span className="ml-auto text-[10px] font-mono text-muted-foreground">${RATE_PER_CREDIT.toFixed(2)} / CR</span>
        </div>

        <div className="p-5 space-y-5">
          {/* Preset buttons */}
          <div>
            <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider mb-3">Quick select</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {PRESETS.map((pkg, i) => {
                const pkgTotal = calcTotal(pkg.credits);
                const active   = credits === pkg.credits;
                return (
                  <motion.button
                    key={pkg.id}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    onClick={() => selectPreset(pkg.credits)}
                    className={`relative flex flex-col items-center text-center p-3.5 rounded-xl border-2 transition-all duration-200 ${
                      active
                        ? 'border-primary bg-primary/10 shadow-[0_0_18px_rgba(2,132,199,0.12)]'
                        : 'border-border bg-card/50 hover:border-primary/40 hover:bg-card/80'
                    }`}
                  >
                    {pkg.badge && (
                      <span className={`absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border whitespace-nowrap ${
                        pkg.badge === 'Popular'   ? 'bg-primary/20 border-primary/40 text-primary'           :
                        pkg.badge === 'Value'     ? 'bg-green-500/20 border-green-500/40 text-green-400'     :
                                                    'bg-yellow-500/20 border-yellow-500/40 text-yellow-400'
                      }`}>
                        {pkg.badge}
                      </span>
                    )}
                    <p className={`text-xl font-black font-mono leading-none mt-2 ${active ? 'text-primary' : 'text-foreground/80'}`}>{pkg.credits}</p>
                    <p className={`text-[9px] font-mono mt-0.5 mb-1.5 ${active ? 'text-primary/70' : 'text-muted-foreground/50'}`}>Credits</p>
                    <p className={`text-xs font-bold ${active ? 'text-foreground' : 'text-muted-foreground'}`}>${pkgTotal.toFixed(2)}</p>
                    <p className={`text-[9px] ${active ? 'text-muted-foreground' : 'text-muted-foreground/40'}`}>USD</p>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Custom input */}
          <div>
            <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider mb-2">Or enter a custom amount</p>
            <div className="flex gap-2 items-center">
              <div className="relative flex-1">
                <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="number"
                  min={1}
                  max={9999}
                  value={inputVal}
                  onChange={e => handleInput(e.target.value)}
                  className="pl-9 text-lg font-mono font-bold"
                  placeholder="1"
                />
              </div>
              <span className="text-muted-foreground text-sm font-mono shrink-0">Credits</span>
            </div>
          </div>

          {/* Live price summary */}
          <AnimatePresence mode="wait">
            <motion.div
              key={credits}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.15 }}
              className="rounded-xl bg-background/80 border border-border p-4 space-y-3"
            >
              {/* Breakdown */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Credits</span>
                  <span className="font-mono font-semibold text-foreground">{credits} CR</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Rate</span>
                  <span className="font-mono text-muted-foreground">{credits} × ${RATE_PER_CREDIT.toFixed(2)}</span>
                </div>
                <div className="h-px bg-border/60" />
                <div className="flex justify-between">
                  <span className="text-sm font-semibold text-foreground">Total</span>
                  <span className="text-2xl font-black font-mono text-primary">${total.toFixed(2)} <span className="text-sm text-muted-foreground font-normal">USD</span></span>
                </div>
              </div>

              {/* Validity row */}
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-primary/5 border border-primary/15">
                <CalendarClock className="w-3.5 h-3.5 text-primary shrink-0" />
                <div className="flex-1 text-xs text-muted-foreground leading-snug">
                  Credits are valid for <span className="font-semibold text-foreground">{VALIDITY_DAYS} days</span> from activation.
                  Your credits will expire on <span className="font-semibold text-foreground">{expiryDate()}</span> if purchased today.
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </Card>

      {/* ── Pricing info ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: TrendingDown, label: 'Flat Rate',       sub: `$${RATE_PER_CREDIT.toFixed(2)} per credit — no hidden fees` },
          { icon: CalendarClock, label: '30-Day Validity', sub: 'Credits expire 30 days after activation'         },
          { icon: CheckCircle2, label: 'Instant Add',      sub: 'Applied within minutes after verification'       },
        ].map(({ icon: Icon, label, sub }) => (
          <Card key={label} className="p-4 border-border bg-card/50 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">{label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{sub}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* ── How to Pay ── */}
      <Card className="border-border bg-card/50 overflow-hidden">
        <div className="p-4 border-b border-border bg-card/80 flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">How to Pay</h3>
          <span className="ml-auto text-[10px] font-mono text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded">via Binance Pay</span>
        </div>
        <div className="p-5 flex flex-col gap-5">
          {/* Steps */}
          <div className="flex flex-col gap-3">
            {STEPS.map(step => (
              <div key={step.n} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[10px] font-bold text-primary">{step.n}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{step.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{step.detail}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Amount reminder banner */}
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-primary/8 border border-primary/20">
            <Receipt className="w-4 h-4 text-primary shrink-0" />
            <p className="text-xs text-foreground">
              Send exactly{' '}
              <span className="font-black text-primary font-mono">${total.toFixed(2)} USD</span>
              {' '}for{' '}
              <span className="font-semibold">{credits} credit{credits !== 1 ? 's' : ''}</span> to the Pay ID below.
            </p>
          </div>

          {/* Binance Pay ID box */}
          <div className="flex flex-col gap-3 p-4 rounded-xl bg-[#F0B90B]/5 border border-[#F0B90B]/20">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-[#F0B90B] flex items-center justify-center shrink-0">
                <span className="text-[8px] font-black text-black">B</span>
              </div>
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">Binance Pay ID</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 px-4 py-3 rounded-lg bg-background border border-border font-mono text-xl font-black text-foreground tracking-widest text-center select-all">
                {BINANCE_PAY_ID}
              </div>
              <Button
                variant="outline" size="sm" onClick={copyId}
                className={`shrink-0 gap-1.5 ${copied ? 'border-green-500/40 text-green-400' : 'border-[#F0B90B]/30 text-[#F0B90B] hover:bg-[#F0B90B]/10'}`}
              >
                {copied ? <><Check className="w-3.5 h-3.5" />Copied</> : <><Copy className="w-3.5 h-3.5" />Copy</>}
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground text-center">
              Search by this Pay ID in the Binance app to send payment
            </p>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
            <AlertCircle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-yellow-400">Manual Verification Required</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                After payment, send your Binance transaction ID to our support team via WhatsApp or Telegram.
                Credits are added within minutes of confirmation. The 30-day validity period starts from the moment credits are applied.
              </p>
              <Button
                variant="outline" size="sm"
                className="mt-2 text-xs border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 gap-1.5"
                onClick={() => onNavigate('support')}
              >
                Contact Support <ChevronRight className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* ── Submit reference ── */}
      <Card className="border-border bg-card/50 overflow-hidden">
        <div className="p-4 border-b border-border bg-card/80 flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Already Paid? Submit Reference</h3>
        </div>
        {sent ? (
          <div className="p-10 flex flex-col items-center gap-3 text-center">
            <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-400" />
            </div>
            <p className="font-semibold text-foreground">Reference Received</p>
            <p className="text-sm text-muted-foreground">Our team will verify and add your credits shortly. Your 30-day clock starts on confirmation.</p>
            <Button variant="outline" size="sm" className="mt-1 text-xs" onClick={() => { setSent(false); setTxRef(''); }}>
              Submit Another
            </Button>
          </div>
        ) : (
          <div className="p-5 flex flex-col gap-3">
            {/* Summary of what was paid */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border text-xs">
              <Coins className="w-4 h-4 text-primary shrink-0" />
              <span className="text-muted-foreground">Submitting for:</span>
              <span className="font-semibold text-foreground ml-auto font-mono">{credits} CR — ${total.toFixed(2)} USD</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Enter your Binance Pay transaction ID below so our team can verify it faster.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Binance transaction ID or order number"
                value={txRef}
                onChange={e => setTxRef(e.target.value)}
                className="flex-1 h-9 px-3 rounded-md border border-input bg-background/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring font-mono"
              />
              <Button
                size="sm" disabled={!txRef.trim()} onClick={() => setSent(true)}
                className="gap-1.5 shrink-0"
              >
                Submit <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
