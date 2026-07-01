import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Copy, Check, ShieldCheck, Zap, Star, ArrowRight,
  CheckCircle2, AlertCircle, Clock, Smartphone, ChevronRight,
  CalendarClock, Receipt, Coins, CreditCard, MessageCircle,
  BadgeCheck, Lock, Sparkles,
} from 'lucide-react';

const UNLOCK_PRICE   = 45;   // base price per credit
const PROCESSING_FEE = 3;    // flat processing fee per transaction
const TOTAL_PER_CREDIT = UNLOCK_PRICE + PROCESSING_FEE; // 48
const BINANCE_PAY_ID = '490759406';
const VALIDITY_DAYS  = 30;

const PACKAGES = [
  { credits: 1,  label: 'Single',    badge: null,           icon: Zap,         popular: false },
  { credits: 3,  label: 'Bundle',    badge: 'Save $6',      icon: Star,        popular: true  },
  { credits: 5,  label: 'Pro',       badge: 'Best Value',   icon: ShieldCheck, popular: false },
  { credits: 10, label: 'Business',  badge: 'Max Savings',  icon: Sparkles,    popular: false },
];

function calcTotal(credits: number) {
  return UNLOCK_PRICE * credits + PROCESSING_FEE;
}

function expiryDate() {
  const d = new Date();
  d.setDate(d.getDate() + VALIDITY_DAYS);
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

interface TopUpPageProps { onNavigate: (page: string) => void; }

export function TopUpPage({ onNavigate }: TopUpPageProps) {
  const [credits, setCredits]   = useState(1);
  const [copied, setCopied]     = useState(false);
  const [sent, setSent]         = useState(false);
  const [txRef, setTxRef]       = useState('');

  const total = calcTotal(credits);

  const copyId = () => {
    navigator.clipboard.writeText(BINANCE_PAY_ID).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="flex flex-col gap-5 max-w-3xl">

      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-primary" />Purchase Credits
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          1 credit = 1 device unlock ·{' '}
          <span className="text-foreground font-semibold">${UNLOCK_PRICE} base + ${PROCESSING_FEE} processing</span> ·
          valid {VALIDITY_DAYS} days
        </p>
      </div>

      {/* Price highlight banner */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="relative overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(2,132,199,0.12),transparent_60%)]" />
        <div className="relative p-5 flex items-center gap-5 flex-wrap">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Price per device unlock</p>
            <div className="flex items-end gap-2">
              <span className="text-5xl font-black text-foreground font-mono">${TOTAL_PER_CREDIT}</span>
              <div className="mb-1.5">
                <p className="text-xs text-muted-foreground font-mono">USD</p>
                <p className="text-[10px] text-muted-foreground">(incl. processing)</p>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground font-mono">
              <span className="text-foreground/80">${UNLOCK_PRICE} base</span>
              <span className="text-muted-foreground/40">+</span>
              <span className="text-foreground/80">${PROCESSING_FEE} processing fee</span>
              <span className="text-muted-foreground/40">=</span>
              <span className="text-primary font-bold">${TOTAL_PER_CREDIT} total</span>
            </div>
          </div>
          <div className="flex flex-col gap-2 ml-auto shrink-0">
            {[
              { icon: BadgeCheck,    text: 'Guaranteed unlock' },
              { icon: Clock,        text: '4–12 hr delivery'  },
              { icon: Lock,         text: '100% secure'        },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-xs text-muted-foreground">
                <Icon className="w-3.5 h-3.5 text-primary shrink-0" />
                {text}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Package selector */}
      <Card className="border-border bg-card/50 overflow-hidden">
        <div className="p-4 border-b border-border bg-card/80 flex items-center gap-2">
          <Coins className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">Select Credits</h3>
          <span className="ml-auto text-[10px] font-mono text-muted-foreground">
            ${UNLOCK_PRICE}/credit + ${PROCESSING_FEE} fee
          </span>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PACKAGES.map((pkg, i) => {
              const pkgTotal = calcTotal(pkg.credits);
              const active   = credits === pkg.credits;
              const Icon     = pkg.icon;
              return (
                <motion.button
                  key={pkg.credits}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => setCredits(pkg.credits)}
                  className={`relative flex flex-col items-center text-center p-4 rounded-xl border-2 transition-all duration-200 ${
                    active
                      ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(2,132,199,0.15)]'
                      : 'border-border bg-card/50 hover:border-primary/40 hover:bg-card/80'
                  }`}
                >
                  {pkg.badge && (
                    <span className={`absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border whitespace-nowrap ${
                      pkg.popular
                        ? 'bg-primary/20 border-primary/40 text-primary'
                        : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                    }`}>
                      {pkg.badge}
                    </span>
                  )}
                  <Icon className={`w-5 h-5 mb-2 mt-1 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
                  <p className={`text-2xl font-black font-mono leading-none ${active ? 'text-primary' : 'text-foreground/80'}`}>{pkg.credits}</p>
                  <p className={`text-[9px] font-mono mb-2 ${active ? 'text-primary/60' : 'text-muted-foreground/50'}`}>
                    {pkg.credits === 1 ? 'device' : 'devices'}
                  </p>
                  <p className={`text-sm font-bold ${active ? 'text-foreground' : 'text-muted-foreground'}`}>${pkgTotal}</p>
                  <p className={`text-[9px] ${active ? 'text-muted-foreground' : 'text-muted-foreground/40'}`}>USD</p>
                </motion.button>
              );
            })}
          </div>

          {/* Custom */}
          <div>
            <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider mb-2">Or enter custom amount</p>
            <div className="flex gap-2 items-center">
              <div className="relative flex-1">
                <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type="number" min={1} max={999}
                  value={credits}
                  onChange={e => {
                    const n = parseInt(e.target.value, 10);
                    if (!isNaN(n) && n >= 1 && n <= 999) setCredits(n);
                  }}
                  className="w-full h-10 pl-9 pr-4 bg-secondary/30 border border-border rounded-lg text-base font-mono font-bold text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>
              <span className="text-xs text-muted-foreground font-mono shrink-0">credits</span>
            </div>
          </div>

          {/* Live price summary */}
          <AnimatePresence mode="wait">
            <motion.div key={credits}
              initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.15 }}
              className="rounded-xl bg-background/60 border border-border p-4 space-y-2.5"
            >
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Credits</span>
                  <span className="font-mono font-semibold text-foreground">{credits} × ${UNLOCK_PRICE}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Unlock base</span>
                  <span className="font-mono text-foreground">${(UNLOCK_PRICE * credits).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Processing fee</span>
                  <span className="font-mono text-foreground">+${PROCESSING_FEE.toFixed(2)}</span>
                </div>
                <div className="h-px bg-border/60 my-1" />
                <div className="flex justify-between items-center">
                  <span className="font-bold text-foreground text-sm">Total Due</span>
                  <span className="text-3xl font-black font-mono text-primary">${total}<span className="text-sm text-muted-foreground font-normal ml-1">USD</span></span>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-primary/5 border border-primary/15 mt-1">
                <CalendarClock className="w-3.5 h-3.5 text-primary shrink-0" />
                <p className="text-[10px] text-muted-foreground flex-1">
                  Credits expire <span className="text-foreground font-semibold">{expiryDate()}</span> if purchased today
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </Card>

      {/* Value points */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Zap,          label: 'Instant Queue',   sub: 'Your request starts within minutes'           },
          { icon: BadgeCheck,   label: 'Guaranteed',      sub: '100% unlock success or full refund'           },
          { icon: MessageCircle,label: 'Live Support',    sub: 'Chat with us anytime during processing'       },
        ].map(({ icon: Icon, label, sub }) => (
          <Card key={label} className="p-3.5 border-border bg-card/50 flex flex-col items-center text-center gap-2 hover:border-primary/20 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Icon className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-foreground">{label}</p>
              <p className="text-[9px] text-muted-foreground mt-0.5 leading-snug">{sub}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* How to pay */}
      <Card className="border-border bg-card/50 overflow-hidden">
        <div className="p-4 border-b border-border bg-card/80 flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">How to Pay</h3>
          <span className="ml-auto text-[10px] font-mono text-muted-foreground bg-[#F0B90B]/10 border border-[#F0B90B]/20 text-[#F0B90B] px-2 py-0.5 rounded">via Binance Pay</span>
        </div>
        <div className="p-5 flex flex-col gap-5">

          {/* Steps */}
          <div className="flex flex-col gap-3">
            {[
              { n: 1, title: 'Choose your credits above',       detail: `Select how many devices you want to unlock. Total: $${UNLOCK_PRICE}/credit + $${PROCESSING_FEE} processing fee.`  },
              { n: 2, title: 'Open Binance App → Pay',          detail: 'Launch the Binance app on your phone, tap "Pay", then search by Pay ID.'                                           },
              { n: 3, title: `Send $${total} USD to Pay ID below`, detail: `Enter the exact amount shown above. Current total: $${total} USD for ${credits} credit${credits > 1 ? 's' : ''}.` },
              { n: 4, title: 'Submit your transaction reference',detail: 'Paste your Binance transaction ID below. Credits are added within minutes of confirmation.'                        },
            ].map(step => (
              <div key={step.n} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[11px] font-black text-primary">{step.n}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{step.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{step.detail}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Amount banner */}
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-primary/8 border border-primary/20">
            <Receipt className="w-5 h-5 text-primary shrink-0" />
            <div>
              <p className="text-xs text-foreground">
                Send exactly{' '}
                <span className="font-black text-primary font-mono text-base">${total} USD</span>
                {' '}for{' '}
                <span className="font-semibold">{credits} credit{credits !== 1 ? 's' : ''}</span>
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                ${UNLOCK_PRICE} × {credits} credits + ${PROCESSING_FEE} processing = ${total} total
              </p>
            </div>
          </div>

          {/* Binance Pay ID */}
          <div className="flex flex-col gap-3 p-4 rounded-xl bg-[#F0B90B]/5 border border-[#F0B90B]/20">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#F0B90B] flex items-center justify-center shrink-0">
                <span className="text-[9px] font-black text-black">B</span>
              </div>
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">Binance Pay ID</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 px-4 py-3.5 rounded-xl bg-background border border-border font-mono text-2xl font-black text-foreground tracking-[0.2em] text-center select-all">
                {BINANCE_PAY_ID}
              </div>
              <Button
                variant="outline" size="sm" onClick={copyId}
                className={`shrink-0 gap-1.5 h-[52px] px-4 ${copied ? 'border-green-500/40 text-green-400 bg-green-500/10' : 'border-[#F0B90B]/30 text-[#F0B90B] hover:bg-[#F0B90B]/10'}`}
              >
                {copied ? <><Check className="w-4 h-4" />Copied!</> : <><Copy className="w-4 h-4" />Copy</>}
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground text-center">
              Search this Pay ID in Binance app to send payment
            </p>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-amber-400">Manual Verification Required</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                After payment, submit your transaction reference below or send it via our live chat.
                Credits are applied within minutes of confirmation. 30-day validity starts on activation.
              </p>
              <Button variant="outline" size="sm"
                className="mt-2 text-xs border-amber-500/30 text-amber-400 hover:bg-amber-500/10 gap-1.5"
                onClick={() => onNavigate('support')}>
                Contact Support <ChevronRight className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Submit reference */}
      <Card className="border-border bg-card/50 overflow-hidden">
        <div className="p-4 border-b border-border bg-card/80 flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Already Paid? Submit Reference</h3>
        </div>
        {sent ? (
          <div className="p-10 flex flex-col items-center gap-3 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
            </motion.div>
            <div>
              <p className="font-bold text-lg text-foreground">Reference Received!</p>
              <p className="text-sm text-muted-foreground mt-1">
                Our team will verify and credit your account shortly.<br />
                Your 30-day clock starts on confirmation.
              </p>
            </div>
            <Button variant="outline" size="sm" className="mt-1 text-xs" onClick={() => { setSent(false); setTxRef(''); }}>
              Submit Another
            </Button>
          </div>
        ) : (
          <div className="p-5 flex flex-col gap-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border text-xs">
              <CreditCard className="w-4 h-4 text-primary shrink-0" />
              <span className="text-muted-foreground">Submitting for:</span>
              <span className="font-bold text-foreground ml-auto font-mono">{credits} CR — ${total} USD</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Paste your Binance Pay transaction ID so our team can verify it faster.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Binance transaction ID or order number"
                value={txRef}
                onChange={e => setTxRef(e.target.value)}
                className="flex-1 h-10 px-3 rounded-xl border border-border bg-background/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 font-mono transition-all"
              />
              <Button size="sm" disabled={!txRef.trim()} onClick={() => setSent(true)} className="gap-1.5 shrink-0 h-10">
                Submit <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </Card>

    </div>
  );
}
