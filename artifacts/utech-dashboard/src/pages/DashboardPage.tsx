import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck, Activity, Clock, Zap, CheckCircle2, TrendingUp,
  Smartphone, Globe, Wifi, Server, RefreshCw, Users,
  ArrowRight, Cpu, Bell, Plus, MessageCircle, Sparkles,
  BadgeCheck, Star, ChevronRight, AlertTriangle, Info,
  BarChart3, Signal, Layers, Target, LucideIcon,
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
  icon: Icon, label, value, sub, color, bg, delay,
}: {
  icon: LucideIcon; label: string; value: string; sub: string;
  color: string; bg: string; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3, transition: { duration: 0.15 } }}
    >
      <Card className="relative overflow-hidden p-5 border border-border/60 bg-card/60 backdrop-blur-sm hover:border-border hover:bg-card/80 transition-all duration-200 cursor-default group h-full">
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${bg} pointer-events-none`} />
        <div className="relative flex items-start justify-between mb-4">
          <div className={`w-10 h-10 rounded-2xl ${bg.replace('from-', 'bg-').split(' ')[0]}/20 border border-current/10 flex items-center justify-center`}
            style={{}}>
            <Icon className={`w-4.5 h-4.5 ${color}`} style={{ width: 18, height: 18 }} />
          </div>
          <TrendingUp className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-muted-foreground/70 transition-colors" />
        </div>
        <div className="relative">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-1">{label}</p>
          <p className="text-3xl font-black font-mono text-foreground leading-none tracking-tight">{value}</p>
          <p className={`text-[11px] mt-2 font-medium ${color} opacity-90`}>{sub}</p>
        </div>
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
    const total          = orders.length;
    const successCount   = orders.filter(o => o.status === 'success').length;
    const processingCount = orders.filter(o => o.status === 'processing').length;
    const queuedCount    = orders.filter(o => o.status === 'queued').length;
    const activeCount    = processingCount + queuedCount;
    const successRate    = total > 0 ? Math.round((successCount / total) * 100) : 0;

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
    <div className="flex flex-col gap-6">

      {/* ── Hero ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="relative overflow-hidden rounded-3xl border border-white/6 bg-gradient-to-br from-[#0b1629] via-[#0d1f3c]/80 to-card/60">
          {/* Ambient glows */}
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-primary/8 blur-[80px] pointer-events-none" />
          <div className="absolute -bottom-16 left-0 w-64 h-64 rounded-full bg-cyan-500/5 blur-[60px] pointer-events-none" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <div className="relative p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-start gap-6">
              <div className="flex-1 min-w-0">
                {/* Status pill */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Platform 100% Operational
                  <span className="text-emerald-400/50 mx-0.5">·</span>
                  <span className="text-emerald-400/80">{stats.successRate}% success</span>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap mb-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight leading-tight">
                    Welcome back, Tech Support
                  </h1>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/25">
                    Pro · Tier 2
                  </span>
                </div>

                <p className="text-sm text-muted-foreground mb-5">
                  {stats.activeCount > 0
                    ? <><span className="text-primary font-semibold">{stats.activeCount} jobs</span> actively processing right now</>
                    : 'All queues clear — ready for new requests'}
                </p>

                {(low || empty) && (
                  <div className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold ${
                    empty ? 'bg-red-500/10 border-red-500/25 text-red-400' : 'bg-amber-500/10 border-amber-500/25 text-amber-400'
                  }`}>
                    <Zap className="w-3.5 h-3.5" />
                    {empty ? 'No credits — top up to resume unlocks' : `Low balance: ${credits} CR remaining`}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2.5 shrink-0">
                <Button
                  className="gap-2 text-sm font-semibold shadow-[0_0_24px_rgba(2,132,199,0.3)] hover:shadow-[0_0_32px_rgba(2,132,199,0.5)] transition-all"
                  onClick={() => onNavigate('request')}
                >
                  <Plus className="w-4 h-4" />
                  New Unlock Request
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2 text-xs border-border/60 text-muted-foreground hover:text-foreground"
                  onClick={() => onNavigate('history')}
                >
                  <Clock className="w-3.5 h-3.5" />
                  View Order History
                </Button>
              </div>
            </div>
          </div>

          {/* Completed strip */}
          {recentCompleted.length > 0 && (
            <div className="relative border-t border-white/6 bg-emerald-500/5 px-6 sm:px-8 py-3 flex items-center gap-3 flex-wrap">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-xs text-emerald-400 font-semibold">
                {recentCompleted.length} order{recentCompleted.length > 1 ? 's' : ''} completed
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
              <span className="ml-auto text-[10px] text-muted-foreground/60 hidden sm:flex items-center gap-1">
                View in Order History <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <StatCard
          icon={ShieldCheck} label="Total Orders" value={String(stats.total)}
          sub={`${stats.successCount} completed`}
          color="text-primary" bg="from-primary/5 to-transparent" delay={0.06}
        />
        <StatCard
          icon={BadgeCheck} label="Success Rate" value={`${stats.successRate}%`}
          sub={`${stats.successCount} devices unlocked`}
          color="text-emerald-400" bg="from-emerald-500/5 to-transparent" delay={0.12}
        />
        <StatCard
          icon={Cpu} label="Processing" value={String(stats.processingCount)}
          sub="In progress now"
          color="text-blue-400" bg="from-blue-500/5 to-transparent" delay={0.18}
        />
        <StatCard
          icon={BarChart3} label="Queue Status" value={`${stats.activeCount}`}
          sub={stats.activeCount > 0 ? 'Jobs queued · active' : 'All clear'}
          color="text-violet-400" bg="from-violet-500/5 to-transparent" delay={0.24}
        />
      </div>

      {/* ── Credits + Quick actions ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Credits card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.28 }}>
          <Card className={`relative overflow-hidden p-5 border-2 flex flex-col gap-4 h-full ${
            empty ? 'border-red-500/30 bg-red-500/5'
            : low  ? 'border-amber-500/25 bg-amber-500/5'
            : 'border-primary/20 bg-gradient-to-br from-primary/8 via-primary/4 to-transparent'
          }`}>
            <div className={`absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl pointer-events-none opacity-40 ${
              empty ? 'bg-red-500' : low ? 'bg-amber-500' : 'bg-primary'
            }`} />
            <div className="relative">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Your Balance</p>
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                  empty ? 'bg-red-500/20' : low ? 'bg-amber-500/20' : 'bg-primary/20'
                }`}>
                  <Zap className={`w-3.5 h-3.5 ${empty ? 'text-red-400' : low ? 'text-amber-400' : 'text-primary'}`} />
                </div>
              </div>
              <p className={`text-5xl font-black font-mono leading-none tracking-tight mt-3 ${
                empty ? 'text-red-400' : low ? 'text-amber-400' : 'text-primary'
              }`}>{credits}</p>
              <p className="text-[11px] text-muted-foreground mt-2">credits · 1 credit = 1 unlock</p>
              {credits > 0 && (
                <p className="text-[10px] text-muted-foreground/60 font-mono mt-0.5">≈ ${credits * 48} USD value</p>
              )}
            </div>
            <Button size="sm" className="w-full gap-1.5 text-xs mt-auto" onClick={() => onNavigate('topup')}>
              <Plus className="w-3.5 h-3.5" />Top Up Credits
            </Button>
          </Card>
        </motion.div>

        {/* Quick action cards */}
        {[
          {
            label: 'Submit New Request',
            sub: 'Activate an unlock for one or more devices',
            icon: Cpu,
            page: 'request',
            color: 'text-primary',
            accent: 'border-primary/20 bg-primary/5',
            glow: 'bg-primary',
          },
          {
            label: 'Live Support Chat',
            sub: "Talk to our team — we're online right now",
            icon: MessageCircle,
            page: 'chat',
            color: 'text-emerald-400',
            accent: 'border-emerald-500/20 bg-emerald-500/5',
            glow: 'bg-emerald-500',
          },
        ].map(({ label, sub, icon: Icon, page, color, accent, glow }) => (
          <motion.div key={label}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16, duration: 0.28 }}
          >
            <Card
              onClick={() => page === 'chat'
                ? (document.querySelector<HTMLButtonElement>('[data-chat-toggle]') as HTMLButtonElement | null)?.click()
                : onNavigate(page)
              }
              className={`relative overflow-hidden p-5 border ${accent} hover:border-opacity-40 transition-all duration-200 cursor-pointer group flex flex-col gap-4 h-full`}
            >
              <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl pointer-events-none opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${glow}`} />
              <div className={`w-10 h-10 rounded-2xl ${accent} border flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div className="flex-1 relative">
                <p className={`text-sm font-bold text-foreground group-hover:${color} transition-colors duration-150 mb-1`}>{label}</p>
                <p className="text-[11px] text-muted-foreground leading-snug">{sub}</p>
                {page === 'chat' && (
                  <span className="inline-flex items-center gap-1.5 mt-2 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />Live
                  </span>
                )}
              </div>
              <div className={`flex items-center gap-1 text-[11px] font-semibold ${color} opacity-70 group-hover:opacity-100 transition-opacity`}>
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
          <Card className="border-border/60 bg-card/60 overflow-hidden flex-1">
            <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Unlock Volume</h3>
                  <p className="text-[10px] text-muted-foreground">Today · hourly breakdown</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold font-mono text-foreground">{stats.total}</p>
                <p className="text-[10px] text-muted-foreground">total orders</p>
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-end gap-1 h-32">
                {HOURLY_VOLUME.map((v, i) => (
                  <motion.div key={i}
                    className="flex-1 flex flex-col items-center gap-1.5"
                    initial={{ scaleY: 0, originY: 1 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.45, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div
                      className="w-full rounded-t-md bg-gradient-to-t from-primary/40 via-primary/70 to-primary/90 hover:from-primary/60 hover:to-primary cursor-default transition-all group relative"
                      style={{ height: `${(v / maxVol) * 100}%` }}
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
                  <div key={h} className="flex-1 text-center text-[8px] text-muted-foreground/60 font-mono">{h}</div>
                ))}
              </div>
            </div>
          </Card>

          {/* Carrier + Device */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="border-border/60 bg-card/60 overflow-hidden">
              <div className="px-4 py-3 border-b border-border/50 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                  <Signal className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-xs font-bold">Carrier Success Rates</h3>
                </div>
              </div>
              <div className="p-4 flex flex-col gap-3">
                {stats.finalCarrierStats.map(({ carrier, rate }, i) => (
                  <div key={carrier}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] text-foreground font-medium truncate max-w-[130px]">{carrier}</span>
                      <span className="text-[11px] font-black text-emerald-400 font-mono">{rate}%</span>
                    </div>
                    <div className="w-full h-1 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-primary/70 to-emerald-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${rate}%` }}
                        transition={{ duration: 0.7, delay: 0.3 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="border-border/60 bg-card/60 overflow-hidden">
              <div className="px-4 py-3 border-b border-border/50 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                  <Smartphone className="w-3.5 h-3.5 text-violet-400" />
                </div>
                <h3 className="text-xs font-bold">Device Breakdown</h3>
              </div>
              <div className="p-4 flex flex-col gap-4">
                {/* Segmented bar */}
                <div className="flex h-2.5 rounded-full overflow-hidden gap-0.5">
                  {DEVICE_BREAKDOWN.map(({ brand, share, color }) => (
                    <motion.div
                      key={brand}
                      className={`${color} opacity-80 first:rounded-l-full last:rounded-r-full`}
                      style={{ width: `${share}%` }}
                      title={`${brand}: ${share}%`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.8 }}
                      transition={{ delay: 0.4 }}
                    />
                  ))}
                </div>
                <div className="flex flex-col gap-2">
                  {DEVICE_BREAKDOWN.map(({ brand, share, color }) => (
                    <div key={brand} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-sm ${color} opacity-80`} />
                        <span className="text-[11px] text-foreground">{brand}</span>
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

      {/* ── System Health + Queue ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-border/60 bg-card/60 overflow-hidden">
          <div className="px-5 py-4 border-b border-border/50 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Server className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold">System Health</h3>
            </div>
            <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-full uppercase tracking-wide">
              All Operational
            </span>
          </div>
          <div className="p-4 flex flex-col gap-1">
            {[
              { label: 'Unlock API',         uptime: '99.98%' },
              { label: 'Activation Server',  uptime: '99.95%' },
              { label: 'IMEI Database',      uptime: '99.9%'  },
              { label: 'Carrier API Bridge', uptime: '99.4%'  },
              { label: 'Notification Hub',   uptime: '100%'   },
            ].map(({ label, uptime }) => (
              <div key={label} className="flex items-center justify-between py-2.5 border-b border-border/30 last:border-0 group">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full shrink-0 bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
                  <span className="text-xs text-foreground/80 group-hover:text-foreground transition-colors">{label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-muted-foreground/70 font-mono">{uptime}</span>
                  <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border border-emerald-500/25 text-emerald-400 bg-emerald-500/8">
                    OK
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-border/60 bg-card/60 overflow-hidden">
          <div className="px-5 py-4 border-b border-border/50 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Layers className="w-4 h-4 text-blue-400" />
            </div>
            <h3 className="text-sm font-bold">Processing Queue</h3>
          </div>
          <div className="p-5 flex flex-col gap-5">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Active',    value: String(stats.activeCount),   color: 'text-amber-400',  border: 'border-amber-500/20'  },
                { label: 'Done',      value: String(stats.successCount),  color: 'text-emerald-400',border: 'border-emerald-500/20'},
                { label: 'Queued',    value: String(stats.queuedCount),   color: 'text-primary',    border: 'border-primary/20'    },
              ].map(({ label, value, color, border }) => (
                <div key={label} className={`p-3 rounded-2xl bg-white/3 border ${border} text-center`}>
                  <p className={`text-2xl font-black font-mono ${color} leading-none`}>{value}</p>
                  <p className="text-[10px] text-muted-foreground mt-1.5 uppercase tracking-wide font-semibold">{label}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2.5">
              <p className="text-[10px] text-muted-foreground/70 uppercase tracking-widest font-bold">By Carrier</p>
              {stats.finalQueueList.length === 0 ? (
                <div className="flex items-center gap-2 py-2 text-xs text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />Queue clear — all orders processed
                </div>
              ) : stats.finalQueueList.map(({ carrier, jobs }, i) => (
                <div key={carrier} className="flex items-center gap-3">
                  <span className="text-[11px] text-muted-foreground/80 w-24 truncate shrink-0">{carrier}</span>
                  <div className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-primary/50 to-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${(jobs / stats.maxQueueJobs) * 100}%` }}
                      transition={{ duration: 0.55, delay: 0.35 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                  <span className="text-[11px] text-muted-foreground/70 font-mono w-5 text-right shrink-0">{jobs}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* ── Recent Activity ── */}
      <Card className="border-border/60 bg-card/60 overflow-hidden">
        <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Activity className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Recent Activity</h3>
              <p className="text-[10px] text-muted-foreground">Latest order events</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground gap-1 h-8 hover:text-foreground" onClick={() => onNavigate('history')}>
            View all <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
        <div className="divide-y divide-border/30">
          {stats.recentAlerts.length === 0 ? (
            <div className="flex items-center justify-center py-10 text-xs text-muted-foreground">No recent activity</div>
          ) : stats.recentAlerts.map((a, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.05, duration: 0.22 }}
              className="flex items-start gap-3 px-5 py-3.5 hover:bg-white/2 transition-colors"
            >
              <div className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                a.type === 'success' ? 'bg-emerald-500/12 text-emerald-400' :
                a.type === 'warn'    ? 'bg-amber-500/12 text-amber-400' :
                                      'bg-primary/12 text-primary'
              }`}>
                {a.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5" />}
                {a.type === 'warn'    && <AlertTriangle className="w-3.5 h-3.5" />}
                {a.type === 'info'    && <Info className="w-3.5 h-3.5" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-foreground/90 leading-snug font-medium">{a.msg}</p>
              </div>
              <span className="text-[10px] text-muted-foreground/60 shrink-0 font-mono whitespace-nowrap">{a.time}</span>
            </motion.div>
          ))}
        </div>
      </Card>

    </div>
  );
}
