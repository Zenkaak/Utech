import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck, Activity, Clock, Zap, CheckCircle2, TrendingUp,
  Smartphone, Globe, Wifi, Server, RefreshCw, Users,
  ArrowRight, Cpu, Bell, Plus, MessageCircle, Sparkles,
  BadgeCheck, Star, ChevronRight, AlertTriangle, Info,
  BarChart3, Signal, Layers, Target, LucideIcon,
  Lock, Fingerprint, Radio, Database,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ActivityFeed } from '@/components/ActivityFeed';
import { useOrders } from '../context/OrdersContext';

interface DashboardPageProps {
  credits: number;
  onNavigate: (page: string) => void;
}

const DEVICE_BREAKDOWN = [
  { brand: 'Apple iPhone',   share: 54, color: 'bg-primary'          },
  { brand: 'Samsung Galaxy', share: 28, color: 'bg-violet-500'       },
  { brand: 'Xiaomi / POCO',  share: 9,  color: 'bg-orange-400'       },
  { brand: 'Google Pixel',   share: 5,  color: 'bg-emerald-500'      },
  { brand: 'Other',          share: 4,  color: 'bg-zinc-500'         },
];

const HOURLY_VOLUME = [12, 18, 9, 24, 31, 28, 19, 35, 42, 38, 29, 47];
const HOURS = ['01','03','05','07','09','11','13','15','17','19','21','23'];

function StatCard({
  icon: Icon, label, value, sub, color, border, delay,
}: {
  icon: LucideIcon; label: string; value: string; sub: string;
  color: string; border: string; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className={`relative overflow-hidden p-5 border ${border} bg-card/50 backdrop-blur-sm h-full`}>
        <div className="flex items-start justify-between mb-3">
          <div className={`w-9 h-9 rounded-xl border ${border} bg-card flex items-center justify-center`}>
            <Icon className={`w-4 h-4 ${color}`} />
          </div>
          <span className={`text-[9px] font-bold uppercase tracking-widest ${color} opacity-60 font-mono`}>LIVE</span>
        </div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-1">{label}</p>
        <p className="text-3xl font-black font-mono text-foreground leading-none tracking-tight">{value}</p>
        <p className={`text-[11px] mt-2 font-medium ${color}`}>{sub}</p>
      </Card>
    </motion.div>
  );
}

export function DashboardPage({ credits, onNavigate }: DashboardPageProps) {
  const { orders } = useOrders();
  const maxVol = Math.max(...HOURLY_VOLUME);
  const low    = credits <= 5;
  const empty  = credits === 0;

  const stats = useMemo(() => {
    const total           = orders.length;
    const successCount    = orders.filter(o => o.status === 'success').length;
    const processingCount = orders.filter(o => o.status === 'processing').length;
    const queuedCount     = orders.filter(o => o.status === 'queued').length;
    const activeCount     = processingCount + queuedCount;
    const successRate     = total > 0 ? Math.round((successCount / total) * 100) : 0;

    const carrierMap: Record<string, { total: number; success: number }> = {};
    for (const order of orders) {
      const c = order.carrier || 'Unknown';
      if (!carrierMap[c]) carrierMap[c] = { total: 0, success: 0 };
      carrierMap[c].total++;
      if (order.status === 'success') carrierMap[c].success++;
    }
    const carrierStats = Object.entries(carrierMap)
      .map(([carrier, { total, success }]) => ({
        carrier, rate: total > 0 ? Math.round((success / total) * 100) : 0, count: total,
      }))
      .sort((a, b) => b.count - a.count).slice(0, 6);

    const finalCarrierStats = carrierStats.length > 0 ? carrierStats : [
      { carrier: 'AT&T USA',      rate: 98,  count: 412 },
      { carrier: 'T-Mobile USA',  rate: 99,  count: 387 },
      { carrier: 'Verizon USA',   rate: 97,  count: 301 },
      { carrier: 'O2 UK',         rate: 100, count: 219 },
      { carrier: 'Vodafone DE',   rate: 96,  count: 184 },
      { carrier: 'Rogers Canada', rate: 99,  count: 143 },
    ];

    const recentAlerts = orders
      .slice(0, 5)
      .flatMap(order =>
        [...order.events].reverse().slice(0, 1).map(ev => ({
          type: ev.type === 'ok' ? 'success' : ev.type === 'warn' ? 'warn' : 'info',
          msg: `${order.id} — ${ev.msg}`,
          time: ev.time,
        }))
      ).slice(0, 5);

    const queueByCarrier: Record<string, number> = {};
    for (const order of orders.filter(o => o.status !== 'success')) {
      const c = order.carrier || 'Other';
      queueByCarrier[c] = (queueByCarrier[c] || 0) + 1;
    }
    const queueCarrierList = Object.entries(queueByCarrier)
      .map(([carrier, jobs]) => ({ carrier, jobs }))
      .sort((a, b) => b.jobs - a.jobs).slice(0, 5);

    const finalQueueList = total === 0 ? [
      { carrier: 'AT&T USA',     jobs: 14 },
      { carrier: 'T-Mobile USA', jobs: 11 },
      { carrier: 'Verizon USA',  jobs: 9  },
      { carrier: 'O2 UK',        jobs: 7  },
      { carrier: 'Other',        jobs: 6  },
    ] : queueCarrierList;
    const maxQueueJobs = Math.max(...finalQueueList.map(q => q.jobs), 1);

    return { total, successCount, activeCount, processingCount, queuedCount, successRate, finalCarrierStats, recentAlerts, finalQueueList, maxQueueJobs };
  }, [orders]);

  const recentCompleted = orders.filter(o => o.status === 'success').slice(0, 3);

  return (
    <div className="flex flex-col gap-5">

      {/* ── Hero ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-gradient-to-br from-[#090f1e] via-[#0c1830]/90 to-[#0d1525]/80">
          {/* Background texture */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(2,132,199,0.07),transparent_60%)] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(6,182,212,0.04),transparent_50%)] pointer-events-none" />
          {/* Top separator line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

          <div className="relative p-6 sm:p-8">
            {/* Brand row */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                <Lock className="w-3 h-3 text-primary" />
                <span className="text-[10px] font-bold text-primary tracking-widest uppercase font-mono">UTECH SERVER UNLOCK</span>
              </div>
              <div className="h-4 w-px bg-border/50" />
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-semibold text-emerald-400 font-mono">ALL SYSTEMS OPERATIONAL</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-end gap-6">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-[28px] font-black text-foreground tracking-tight leading-tight mb-2">
                  Provider Dashboard
                </h1>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
                  {stats.activeCount > 0
                    ? <><span className="text-primary font-semibold">{stats.activeCount} unlock request{stats.activeCount !== 1 ? 's' : ''}</span> currently in progress across all active carriers.</>
                    : 'All queues are clear and processing infrastructure is ready for new requests.'}
                </p>

                {/* SLA strip */}
                <div className="flex flex-wrap items-center gap-4 mt-4">
                  {[
                    { label: 'Success Rate',  value: `${stats.successRate}%`, color: 'text-emerald-400' },
                    { label: 'Uptime SLA',    value: '99.97%',               color: 'text-primary'     },
                    { label: 'Avg. ETA',      value: '~28 min',              color: 'text-cyan-400'    },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex items-center gap-2">
                      <span className={`text-sm font-black font-mono ${color}`}>{value}</span>
                      <span className="text-[10px] text-muted-foreground/70">{label}</span>
                    </div>
                  ))}
                </div>

                {/* Credit alert */}
                {(low || empty) && (
                  <div className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold mt-4 ${
                    empty ? 'bg-red-500/10 border-red-500/25 text-red-400' : 'bg-amber-500/10 border-amber-500/25 text-amber-400'
                  }`}>
                    <Zap className="w-3.5 h-3.5" />
                    {empty ? 'Credit balance depleted — top up to resume unlock operations' : `Low balance: ${credits} CR remaining`}
                  </div>
                )}
              </div>

              {/* CTA buttons */}
              <div className="flex flex-row sm:flex-col gap-2 shrink-0">
                <Button
                  className="gap-2 text-sm font-semibold shadow-[0_0_20px_rgba(2,132,199,0.25)] hover:shadow-[0_0_30px_rgba(2,132,199,0.45)] transition-all"
                  onClick={() => onNavigate('request')}
                >
                  <Plus className="w-4 h-4" />
                  New Unlock Request
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2 text-xs border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/5"
                  onClick={() => onNavigate('history')}
                >
                  <Clock className="w-3.5 h-3.5" />
                  Order History
                </Button>
              </div>
            </div>
          </div>

          {/* Completed orders strip */}
          {recentCompleted.length > 0 && (
            <div className="relative border-t border-white/6 bg-emerald-500/5 px-6 sm:px-8 py-3 flex items-center gap-3 flex-wrap">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-xs text-emerald-400 font-semibold">
                {recentCompleted.length} order{recentCompleted.length > 1 ? 's' : ''} successfully completed
              </span>
              <div className="flex gap-2 flex-wrap">
                {recentCompleted.map(o => (
                  <button key={o.id}
                    onClick={() => onNavigate('history')}
                    className="text-[10px] font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full hover:bg-emerald-500/20 transition-colors">
                    {o.ref}
                  </button>
                ))}
              </div>
              <span className="ml-auto text-[10px] text-muted-foreground/50 hidden sm:flex items-center gap-1 font-mono">
                View all in history <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── KPI Stat Cards ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <StatCard
          icon={Database}     label="Total Orders"  value={String(stats.total)}
          sub={`${stats.successCount} completed`}
          color="text-primary"      border="border-primary/15"    delay={0.05}
        />
        <StatCard
          icon={BadgeCheck}   label="Success Rate"  value={`${stats.successRate}%`}
          sub={`${stats.successCount} unlocked`}
          color="text-emerald-400"  border="border-emerald-500/15" delay={0.10}
        />
        <StatCard
          icon={Cpu}          label="Processing"    value={String(stats.processingCount)}
          sub="Active right now"
          color="text-cyan-400"     border="border-cyan-500/15"   delay={0.15}
        />
        <StatCard
          icon={BarChart3}    label="In Queue"      value={String(stats.queuedCount)}
          sub={stats.queuedCount > 0 ? 'Awaiting processing' : 'Queue clear'}
          color="text-violet-400"   border="border-violet-500/15"  delay={0.20}
        />
      </div>

      {/* ── Credits + Quick Actions ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

        {/* Credits card */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.3 }}>
          <Card className={`relative overflow-hidden p-5 border flex flex-col gap-4 h-full ${
            empty ? 'border-red-500/30 bg-red-500/5'
            : low  ? 'border-amber-500/25 bg-amber-500/5'
            : 'border-primary/20 bg-primary/5'
          }`}>
            <div className={`absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-20 ${
              empty ? 'bg-red-500' : low ? 'bg-amber-500' : 'bg-primary'
            }`} />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Credit Balance</p>
                <div className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded-full border ${
                  empty ? 'text-red-400 border-red-500/30 bg-red-500/10'
                  : low  ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                         : 'text-primary border-primary/30 bg-primary/10'
                } uppercase tracking-wider`}>
                  {empty ? 'DEPLETED' : low ? 'LOW' : 'ACTIVE'}
                </div>
              </div>
              <p className={`text-5xl font-black font-mono leading-none tracking-tight ${
                empty ? 'text-red-400' : low ? 'text-amber-400' : 'text-primary'
              }`}>{credits}</p>
              <p className="text-[11px] text-muted-foreground mt-2">credits available · 1 CR = 1 unlock</p>
            </div>
            <Button size="sm" className="w-full gap-1.5 text-xs mt-auto" onClick={() => onNavigate('topup')}>
              <Plus className="w-3.5 h-3.5" />Top Up Credits
            </Button>
          </Card>
        </motion.div>

        {/* Quick action cards */}
        {[
          {
            label: 'Submit Unlock Request',
            sub:   'Process one or more IMEIs across any supported carrier and region.',
            icon:   Cpu,
            page:   'request',
            color:  'text-primary',
            border: 'border-primary/20',
            bg:     'bg-primary/5',
            glow:   'bg-primary',
          },
          {
            label: 'Live Support',
            sub:   'Connect with a UTECH specialist instantly for real-time order assistance.',
            icon:   MessageCircle,
            page:   'chat',
            color:  'text-emerald-400',
            border: 'border-emerald-500/20',
            bg:     'bg-emerald-500/5',
            glow:   'bg-emerald-500',
          },
        ].map(({ label, sub, icon: Icon, page, color, border, bg, glow }) => (
          <motion.div key={label}
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14, duration: 0.3 }}
          >
            <Card
              onClick={() => page === 'chat'
                ? (document.querySelector<HTMLButtonElement>('[data-chat-toggle]') as HTMLButtonElement | null)?.click()
                : onNavigate(page)
              }
              className={`relative overflow-hidden p-5 border ${border} ${bg} hover:brightness-110 transition-all duration-200 cursor-pointer group flex flex-col gap-4 h-full`}
            >
              <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl pointer-events-none opacity-0 group-hover:opacity-15 transition-opacity duration-500 ${glow}`} />
              <div className="flex items-start justify-between">
                <div className={`w-10 h-10 rounded-xl border ${border} bg-card/60 flex items-center justify-center group-hover:scale-105 transition-transform duration-200`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                {page === 'chat' && (
                  <span className="inline-flex items-center gap-1.5 text-[9px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />Online
                  </span>
                )}
              </div>
              <div className="flex-1 relative">
                <p className="text-sm font-bold text-foreground mb-1">{label}</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{sub}</p>
              </div>
              <div className={`flex items-center gap-1 text-[11px] font-semibold ${color}`}>
                Get started <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* ── Activity Feed + Volume Chart ── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-5">
          <ActivityFeed />
        </div>

        <div className="xl:col-span-7 flex flex-col gap-4">
          {/* Volume chart */}
          <Card className="border-border/50 bg-card/60 overflow-hidden flex-1">
            <div className="px-5 py-4 border-b border-border/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Unlock Volume</h3>
                  <p className="text-[10px] text-muted-foreground font-mono">Today · hourly throughput</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-black font-mono text-foreground">{HOURLY_VOLUME.reduce((a, b) => a + b, 0)}</p>
                <p className="text-[10px] text-muted-foreground">unlocks today</p>
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-end gap-1 h-28">
                {HOURLY_VOLUME.map((v, i) => (
                  <motion.div key={i}
                    className="flex-1 flex flex-col items-center gap-1.5"
                    initial={{ scaleY: 0, originY: 1 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.45, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div
                      className="w-full rounded-t bg-gradient-to-t from-primary/30 via-primary/60 to-primary/90 hover:to-primary cursor-default transition-colors group relative"
                      style={{ height: `${(v / maxVol) * 100}%`, minHeight: 4 }}
                      title={`${HOURS[i]}:00 — ${v} unlocks`}
                    >
                      <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[8px] font-mono text-primary opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {v}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="flex gap-1 mt-2">
                {HOURS.map(h => (
                  <div key={h} className="flex-1 text-center text-[8px] text-muted-foreground/50 font-mono">{h}</div>
                ))}
              </div>
            </div>
          </Card>

          {/* Carrier Success + Device Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="border-border/50 bg-card/60 overflow-hidden">
              <div className="px-4 py-3 border-b border-border/40 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                  <Signal className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-foreground">Carrier Success Rates</h3>
                </div>
              </div>
              <div className="p-4 flex flex-col gap-3">
                {stats.finalCarrierStats.map(({ carrier, rate }, i) => (
                  <div key={carrier}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] text-foreground/80 font-medium truncate max-w-[130px]">{carrier}</span>
                      <span className="text-[11px] font-black text-emerald-400 font-mono">{rate}%</span>
                    </div>
                    <div className="w-full h-1 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-primary/60 to-emerald-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${rate}%` }}
                        transition={{ duration: 0.7, delay: 0.3 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="border-border/50 bg-card/60 overflow-hidden">
              <div className="px-4 py-3 border-b border-border/40 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                  <Smartphone className="w-3.5 h-3.5 text-violet-400" />
                </div>
                <h3 className="text-xs font-bold text-foreground">Device Breakdown</h3>
              </div>
              <div className="p-4 flex flex-col gap-4">
                <div className="flex h-2 rounded-full overflow-hidden gap-px">
                  {DEVICE_BREAKDOWN.map(({ brand, share, color }) => (
                    <motion.div
                      key={brand}
                      className={`${color} opacity-75 first:rounded-l-full last:rounded-r-full`}
                      style={{ width: `${share}%` }}
                      title={`${brand}: ${share}%`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.75 }}
                      transition={{ delay: 0.4 }}
                    />
                  ))}
                </div>
                <div className="flex flex-col gap-2">
                  {DEVICE_BREAKDOWN.map(({ brand, share, color }) => (
                    <div key={brand} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-sm ${color} opacity-75`} />
                        <span className="text-[11px] text-foreground/80">{brand}</span>
                      </div>
                      <span className="text-[11px] font-bold font-mono text-muted-foreground">{share}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* ── System Health + Processing Queue ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-border/50 bg-card/60 overflow-hidden">
          <div className="px-5 py-4 border-b border-border/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Server className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Infrastructure Status</h3>
              </div>
            </div>
            <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full uppercase tracking-widest">
              All Operational
            </span>
          </div>
          <div className="p-4 flex flex-col gap-0.5">
            {[
              { label: 'Unlock API',             uptime: '99.98%', icon: Zap      },
              { label: 'Activation Server',       uptime: '99.95%', icon: Server   },
              { label: 'IMEI Database',           uptime: '99.9%',  icon: Database },
              { label: 'Carrier API Bridge',      uptime: '99.4%',  icon: Radio    },
              { label: 'Notification Hub',        uptime: '100%',   icon: Bell     },
            ].map(({ label, uptime, icon: Icon }) => (
              <div key={label} className="flex items-center justify-between py-2.5 border-b border-border/20 last:border-0 group">
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.5)]" />
                  <Icon className="w-3 h-3 text-muted-foreground/40 group-hover:text-muted-foreground/70 transition-colors" />
                  <span className="text-xs text-foreground/70 group-hover:text-foreground transition-colors">{label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-muted-foreground/60 font-mono">{uptime}</span>
                  <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border border-emerald-500/20 text-emerald-400 bg-emerald-500/8">
                    OK
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-border/50 bg-card/60 overflow-hidden">
          <div className="px-5 py-4 border-b border-border/40 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Layers className="w-4 h-4 text-blue-400" />
            </div>
            <h3 className="text-sm font-bold text-foreground">Processing Queue</h3>
          </div>
          <div className="p-5 flex flex-col gap-5">
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Active',   value: String(stats.activeCount),   color: 'text-amber-400',   border: 'border-amber-500/20',   bg: 'bg-amber-500/5'   },
                { label: 'Done',     value: String(stats.successCount),  color: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/5' },
                { label: 'Queued',   value: String(stats.queuedCount),   color: 'text-primary',     border: 'border-primary/20',     bg: 'bg-primary/5'     },
              ].map(({ label, value, color, border, bg }) => (
                <div key={label} className={`p-3 rounded-xl border ${border} ${bg} text-center`}>
                  <p className={`text-2xl font-black font-mono ${color} leading-none`}>{value}</p>
                  <p className="text-[9px] text-muted-foreground mt-1.5 uppercase tracking-widest font-semibold">{label}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest font-bold">Queue by Carrier</p>
              {stats.finalQueueList.length === 0 ? (
                <div className="flex items-center gap-2 py-2 text-xs text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />All requests processed — queue empty
                </div>
              ) : stats.finalQueueList.map(({ carrier, jobs }, i) => (
                <div key={carrier} className="flex items-center gap-3">
                  <span className="text-[11px] text-muted-foreground/70 w-24 truncate shrink-0 font-mono">{carrier}</span>
                  <div className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-primary/40 to-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${(jobs / stats.maxQueueJobs) * 100}%` }}
                      transition={{ duration: 0.55, delay: 0.35 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                  <span className="text-[11px] text-muted-foreground/60 font-mono w-5 text-right shrink-0">{jobs}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* ── Recent Activity ── */}
      <Card className="border-border/50 bg-card/60 overflow-hidden">
        <div className="px-5 py-4 border-b border-border/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Activity className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Recent Activity</h3>
              <p className="text-[10px] text-muted-foreground">Latest order events across your account</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground gap-1 h-8 hover:text-foreground" onClick={() => onNavigate('history')}>
            View all <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
        <div className="divide-y divide-border/20">
          {stats.recentAlerts.length === 0 ? (
            <div className="flex items-center justify-center py-10 text-xs text-muted-foreground">
              No recent activity recorded
            </div>
          ) : stats.recentAlerts.map((a, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 + i * 0.05, duration: 0.22 }}
              className="flex items-start gap-3 px-5 py-3.5 hover:bg-white/2 transition-colors"
            >
              <div className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                a.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' :
                a.type === 'warn'    ? 'bg-amber-500/10 text-amber-400'    :
                                      'bg-primary/10 text-primary'
              }`}>
                {a.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5" />}
                {a.type === 'warn'    && <AlertTriangle className="w-3.5 h-3.5" />}
                {a.type === 'info'    && <Info className="w-3.5 h-3.5" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-foreground/85 leading-snug font-medium">{a.msg}</p>
              </div>
              <span className="text-[10px] text-muted-foreground/50 shrink-0 font-mono whitespace-nowrap">{a.time}</span>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* ── Compliance footer ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        className="flex flex-wrap items-center justify-between gap-3 px-1"
      >
        <div className="flex items-center gap-4 flex-wrap">
          {[
            { icon: Lock,        label: 'TLS 1.3 Encrypted' },
            { icon: ShieldCheck, label: 'Carrier Compliant'  },
            { icon: Globe,       label: 'Texas, United States' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-1.5 text-[10px] text-muted-foreground/50">
              <Icon className="w-3 h-3" />
              <span>{label}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => onNavigate('terms')} className="text-[10px] text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors">
            Terms & Conditions
          </button>
          <span className="text-muted-foreground/20">·</span>
          <button onClick={() => onNavigate('privacy')} className="text-[10px] text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors">
            Privacy Policy
          </button>
        </div>
      </motion.div>

    </div>
  );
}
