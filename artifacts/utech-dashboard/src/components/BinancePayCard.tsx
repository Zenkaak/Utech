import { useState } from 'react';
import { Copy, CheckCircle2, Shield, Zap, Clock, CreditCard, AlertCircle, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const BINANCE_ID = "490759406";
const BINANCE_PAY_URL = "https://app.binance.com/qr/dplk9e5f2c26c19e41e1ae6e71f1e0dbc5b1";

const SIP_PRICE_USD = 24;

interface BinancePayCardProps {
  itemLabel?: string;
  quantity?: number;
}

export function BinancePayCard({ itemLabel = "SIP Bypass File", quantity = 1 }: BinancePayCardProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const total = SIP_PRICE_USD * quantity;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  return (
    <Card className="border-yellow-500/30 bg-card/60 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-yellow-500/20 bg-yellow-500/5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-yellow-500/15 border border-yellow-500/25 flex items-center justify-center shrink-0">
          <CreditCard className="w-4 h-4 text-yellow-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-yellow-400 text-sm">Binance Pay — Secure Checkout</h4>
          <p className="text-[10px] text-yellow-400/60 font-mono">Complete your payment to receive the {itemLabel}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Amount Due</p>
          <p className="text-xl font-bold font-mono text-yellow-400">${total} <span className="text-xs font-normal">USD</span></p>
          {quantity > 1 && <p className="text-[9px] text-muted-foreground font-mono">{quantity} × $24</p>}
        </div>
      </div>

      <div className="p-5 flex flex-col gap-5">
        {/* Steps */}
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">How to Pay</p>
          {[
            { step: '1', text: 'Open your Binance app and go to Pay' },
            { step: '2', text: 'Search by Binance ID or scan the QR code' },
            { step: '3', text: 'Enter the Binance ID below and confirm payment' },
            { step: '4', text: 'Resubmit your unlock request after payment confirmation' },
          ].map(({ step, text }) => (
            <div key={step} className="flex items-start gap-3 text-sm">
              <span className="w-5 h-5 rounded-full bg-yellow-500/15 border border-yellow-500/25 text-[10px] font-bold text-yellow-400 flex items-center justify-center shrink-0 mt-0.5">{step}</span>
              <span className="text-muted-foreground">{text}</span>
            </div>
          ))}
        </div>

        {/* Payment details */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Payment Details</p>
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 border border-green-500/20 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
              <span className="text-[10px] text-green-400 font-mono">Active</span>
            </div>
          </div>

          {/* Price summary */}
          <div className="p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{itemLabel}{quantity > 1 ? ` × ${quantity}` : ''}</span>
              <span className="font-mono font-semibold text-foreground">${SIP_PRICE_USD}{quantity > 1 ? ` × ${quantity}` : ''} USD</span>
            </div>
            <div className="border-t border-yellow-500/15 pt-1.5 flex items-center justify-between">
              <span className="text-xs font-bold text-yellow-400">Total Due</span>
              <span className="text-sm font-bold font-mono text-yellow-400">${total} USD</span>
            </div>
          </div>

          {/* Binance ID */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/40 border border-border">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Binance Pay ID</p>
              <p className="text-lg font-bold font-mono text-yellow-400 tracking-widest">{BINANCE_ID}</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 text-xs gap-1.5"
              onClick={() => copyToClipboard(BINANCE_ID, 'id')}
            >
              {copied === 'id' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied === 'id' ? 'Copied' : 'Copy ID'}
            </Button>
          </div>

          {/* Payment link */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/40 border border-border">
            <div className="min-w-0 flex-1 mr-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Payment Link</p>
              <p className="text-xs font-mono text-foreground truncate">{BINANCE_PAY_URL}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button
                size="sm"
                variant="outline"
                className="border-border text-muted-foreground hover:text-foreground text-xs gap-1.5"
                onClick={() => copyToClipboard(BINANCE_PAY_URL, 'url')}
              >
                {copied === 'url' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied === 'url' ? 'Copied' : 'Copy'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-border text-muted-foreground hover:text-foreground text-xs gap-1.5"
                onClick={() => window.open(BINANCE_PAY_URL, '_blank')}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open
              </Button>
            </div>
          </div>
        </div>

        {/* Trust badges */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: Shield, label: 'SSL Secured', sub: '256-bit encryption' },
            { icon: Zap, label: 'Instant', sub: 'Confirmed in <1 min' },
            { icon: Clock, label: '24/7 Support', sub: 'Help always available' },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex flex-col items-center text-center p-2.5 rounded-lg bg-secondary/20 border border-border gap-1.5">
              <Icon className="w-4 h-4 text-primary" />
              <p className="text-[10px] font-semibold text-foreground">{label}</p>
              <p className="text-[9px] text-muted-foreground leading-tight">{sub}</p>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-secondary/20 border border-border/50">
          <AlertCircle className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            After payment is confirmed on Binance, please allow up to 15 minutes for processing. Your unlock request will be automatically resumed. Contact support with your Binance transaction ID if delivery is delayed.
          </p>
        </div>
      </div>
    </Card>
  );
}
