import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HeadphonesIcon, MessageSquare, AlertCircle, ChevronRight, ChevronDown, Send, CheckCircle2, Loader2, ExternalLink } from 'lucide-react';

const FAQS = [
  {
    q: 'How long does an unlock take after submitting?',
    a: 'Most unlock requests complete within 4–24 hours depending on your carrier. After submission, your request is automatically queued and processed by our server cluster — no manual steps are needed on your end. You will be notified as soon as processing is complete.',
  },
  {
    q: 'Can I submit multiple IMEIs at once?',
    a: 'Yes. The request form supports batch submissions of up to 6 IMEIs per request. Each IMEI requires its own API access token. One credit is consumed per IMEI submitted.',
  },
  {
    q: 'Which carriers and countries are supported?',
    a: 'We support 200+ global carriers including AT&T, T-Mobile, Verizon, O2, Vodafone, Rogers, EE, SFR, Etisalat, STC, Airtel, and many more. Use the Device Lookup tool to verify carrier compatibility before submitting.',
  },
  {
    q: 'How do I get my Access Token?',
    a: 'Your access token was issued when your account was created. You can find it in Settings under API Credentials. If you have lost your token, contact support for a replacement after identity verification.',
  },
  {
    q: 'What do I do if my order is stuck in Processing?',
    a: 'Processing status means your request is actively being handled by our servers. If an order has been in Processing for more than 48 hours without movement, open a support ticket with your Order ID so we can manually investigate and escalate it.',
  },
  {
    q: 'Is the unlock permanent?',
    a: 'Yes. All unlocks processed through UTECH are permanent, server-side activations tied to the device IMEI. They persist through factory resets and iOS/Android updates.',
  },
];

const CATEGORIES = [
  'General Inquiry',
  'Order Not Processing',
  'Unlock Not Received',
  'Account Access',
  'Credit / Billing',
  'Technical Error',
];

const TICKETS = [
  { id: 'TKT-0042', subject: 'ORD-20847 — still showing Processing after 30h', status: 'Open',     date: 'Jun 22, 2026', priority: 'High'   },
  { id: 'TKT-0041', subject: 'IMEI stuck in queue — ORD-20843',                  status: 'Resolved', date: 'Jun 20, 2026', priority: 'Medium' },
];

export function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', email: '', category: '', subject: '', message: '' });
  const [ticketStatus, setTicketStatus] = useState<'idle' | 'submitting' | 'sent'>('idle');
  const setField = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = () => {
    if (!form.subject.trim() || !form.message.trim() || !form.email.trim()) return;
    setTicketStatus('submitting');
    setTimeout(() => setTicketStatus('sent'), 1800);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <HeadphonesIcon className="w-5 h-5 text-primary" />Support Center
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Get help with orders, account issues, and general questions. Average response time: under 2 hours.
        </p>
      </div>

      {/* Contact cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-5 border-border bg-card/50 flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5 text-green-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-0.5">WhatsApp / Telegram</h3>
            <p className="text-xs text-muted-foreground mb-3">Fastest response · Avg reply in under 15 min</p>
            <Button size="sm" variant="outline"
              className="w-full text-xs border-green-500/30 text-green-400 hover:bg-green-500/10 gap-1.5"
              onClick={() => window.open('https://wa.me/message/UTECHSUPPORT', '_blank')}>
              <ExternalLink className="w-3.5 h-3.5" />Open Messenger
            </Button>
          </div>
        </Card>
        <Card className="p-5 border-border bg-card/50 flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5 text-orange-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-0.5">Submit a Ticket</h3>
            <p className="text-xs text-muted-foreground mb-3">For detailed issues · We respond within 24h</p>
            <Button size="sm" variant="outline" className="w-full text-xs gap-1.5"
              onClick={() => document.getElementById('ticket-form')?.scrollIntoView({ behavior: 'smooth' })}>
              <Send className="w-3.5 h-3.5" />Open Ticket Form
            </Button>
          </div>
        </Card>
      </div>

      {/* My tickets */}
      <Card className="border-border bg-card/50 overflow-hidden">
        <div className="p-4 border-b border-border bg-card/80 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">My Tickets</h3>
          <span className="text-[10px] font-mono text-muted-foreground">{TICKETS.length} total</span>
        </div>
        <div className="divide-y divide-border">
          {TICKETS.map((t) => (
            <div key={t.id} className="p-4 flex items-center justify-between gap-3 hover:bg-secondary/20 transition-colors cursor-pointer group">
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">{t.subject}</p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-[10px] font-mono text-muted-foreground">{t.id}</span>
                  <span className="text-[10px] text-muted-foreground/50">·</span>
                  <span className="text-[10px] text-muted-foreground">{t.date}</span>
                  <span className="text-[10px] text-muted-foreground/50">·</span>
                  <span className={`text-[10px] font-semibold ${t.priority === 'High' ? 'text-orange-400' : 'text-muted-foreground'}`}>
                    {t.priority} Priority
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded border ${
                  t.status === 'Open' ? 'text-orange-400 bg-orange-500/10 border-orange-500/20' : 'text-green-400 bg-green-500/10 border-green-500/20'
                }`}>{t.status}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Ticket form */}
      <Card id="ticket-form" className="border-border bg-card/50 overflow-hidden">
        <div className="p-4 border-b border-border bg-card/80">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Open New Ticket</h3>
        </div>
        {ticketStatus === 'sent' ? (
          <div className="p-12 flex flex-col items-center gap-4 text-center">
            <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-green-400" />
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-1">Ticket Submitted Successfully</h4>
              <p className="text-sm text-muted-foreground">We have received your request and will respond within 24 hours.</p>
            </div>
            <Button variant="outline" size="sm" className="mt-2 text-xs"
              onClick={() => { setTicketStatus('idle'); setForm({ name: '', email: '', category: '', subject: '', message: '' }); }}>
              Submit Another
            </Button>
          </div>
        ) : (
          <div className="p-6 flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Full Name</label>
                <Input placeholder="Your name" className="bg-background/50 text-sm" value={form.name} onChange={e => setField('name', e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Email Address</label>
                <Input type="email" placeholder="your@email.com" className="bg-background/50 text-sm" value={form.email} onChange={e => setField('email', e.target.value)} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Category</label>
              <select className="flex h-9 w-full rounded-md border border-input bg-background/50 px-3 py-1 text-sm text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                value={form.category} onChange={e => setField('category', e.target.value)}>
                <option value="">Select a category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Subject</label>
              <Input placeholder="Brief description of your issue" className="bg-background/50 text-sm" value={form.subject} onChange={e => setField('subject', e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Message</label>
              <textarea rows={4} placeholder="Include order IDs, IMEIs, and any relevant details."
                className="flex w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                value={form.message} onChange={e => setField('message', e.target.value)} />
            </div>
            <Button onClick={handleSubmit}
              disabled={ticketStatus === 'submitting' || !form.email || !form.subject || !form.message}
              className="gap-2 self-end px-8">
              {ticketStatus === 'submitting' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {ticketStatus === 'submitting' ? 'Submitting...' : 'Submit Ticket'}
            </Button>
          </div>
        )}
      </Card>

      {/* FAQs */}
      <Card className="border-border bg-card/50 overflow-hidden">
        <div className="p-4 border-b border-border bg-card/80">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Frequently Asked Questions</h3>
        </div>
        <div className="divide-y divide-border">
          {FAQS.map((faq, i) => (
            <div key={i} className="cursor-pointer" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
              <div className="p-4 flex items-center justify-between gap-3 hover:bg-secondary/20 transition-colors">
                <p className="text-sm font-semibold text-foreground">{faq.q}</p>
                {openFaq === i
                  ? <ChevronDown  className="w-4 h-4 text-primary shrink-0" />
                  : <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
              </div>
              {openFaq === i && (
                <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border/50 bg-secondary/10 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
