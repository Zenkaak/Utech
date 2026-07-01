import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck, Activity, Clock, Zap, CheckCircle2, TrendingUp,
  Smartphone, Globe, Wifi, Server, RefreshCw, Users,
  ArrowRight, Cpu, Bell, Plus, MessageCircle, Sparkles,
  BadgeCheck, Star, ChevronRight,
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
  { brand: 'Samsung Galaxy', share: 28, color: 'bg-purple-500'       },
  { brand: 'Xiaomi / POCO',  share: 9,  color: 'bg-orange-400'       },
  { brand: 'Google Pixel',   share: 5,  color: 'bg-green-500'        },
  { brand: 'Other',          share: 4,  color: 'bg-muted-foreground' },
];

const HOURLY_VOLUME = [12, 18, 9, 24, 31, 28, 19, 35, 42, 38, 29, 47];
const HOURS = ['01','03','05','07','09','11','13','15','17','19','21','23'];

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

  // Recent completed orders for the satisfaction strip
  const recentCompleted = orders.filter(o => o.status === 'success').slice(0, 3);

  return (
    <div className="flex flex-col gap-5">

      {/* ── Hero banner ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-[#0a1628] via-card/80 to-card/50">
          {/* Glow orbs */}
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-8 left-8 w-32 h-32 rounded-full bg-cyan-500/8 blur-2xl pointer-events-none" />

          <div className="relative p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <h2 className="text-xl font-black text-foreground tracking-tight">Welcome back, Tech Support</h2>
                <Badge className="text-[9px] bg-yellow-500/15 text-yellow-400 border border-yellow-500/25 uppercase tracking-wider">Pro · Tier 2</Badge>
              </div>
              <div className="flex items-center gap-2 flex-wrap mb-3">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  Platform <span className="text-green-400 font-semibold">100% operational</span>
                </span>
                <span className="text-muted-foreground/30">·</span>
                <span className="text-xs text-muted-foreground">{stats.successRate}% success rate</span>
                <span className="text-muted-foreground/30">·</span>
                <span className="text-xs text-muted-foreground">{stats.activeCount} active jobs</span>
              </div>

              {/* Credit warning */}
              {(low || empty) && (
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium ${
                  empty ? 'bg-red-500/10 border-red-500/25 text-red-400' : 'bg-yellow-500/10 border-yellow-500/25 text-yellow-400'
                }`}>
                  <Zap className="w-3 h-3" />
                  {empty ? 'No credits remaining — top up to resume' : `Low balance: ${credits} CR`}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <Button size="sm" variant="outline" className="gap-1.5 text-xs border-border" onClick={() => onNavigate('history')}>
                <ClockIcon className="w-3.5 h-3.5" />View Orders
              </Button>
              <Button size="sm" className="gap-1.5 text-xs shadow-[0_0_20px_rgba(2,132,199,0.25)] hover:shadow-[0_0_28px_rgba(2,132,199,0.4)] transition-shadow" onClick={() => onNavigate('request')}>
                <Plus className="w-3.5 h-3.5" />New Request
              </Button>
            </div>
          </div>

          {/* Completed orders strip */}
          {recentCompleted.length > 0 && (
            <div className="relative border-t border-border/50 bg-emerald-500/4 px-5 sm:px-6 py-2.5 flex items-center gap-3 flex-wrap">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-xs text-emerald-400 font-semibold">
                {recentCompleted.length} order{recentCompleted.length > 1 ? 's' : ''} completed successfully
              </span>
              <div className="flex gap-2 flex-wrap">
                {recentCompleted.map(o => (
                  <button key={o.id}
                    onClick={() => onNavigate('history')}
                    className="text-[10px] font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full hover:bg-emerald-500/20 transition-colors">
                    {o.ref}
                  </button>
                ))}
              </div>
              <span className="ml-auto text-[10px] text-muted-foreground hidden sm:block">View in Order History →</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {[
          { icon: ShieldCheck,  label: 'Total Orders',  value: String(stats.total),           color: 'text-primary',    bg: 'bg-primary/10 border-primary/20',       sub: `${stats.successCount} completed`     },
          { icon: BadgeCheck,   label: 'Success Rate',  value: `${stats.successRate}%`,       color: 'text-emerald-400',bg: 'bg-emerald-500/10 border-emerald-500/20',sub: `${stats.successCount} unlocked`      },
          { icon: Cpu,          label: 'Processing',    value: String(stats.processingCount),  color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/20',     sub: 'In progress now'                     },
          { icon: Star,         label: 'Queue Status',  value: `${stats.activeCount} Jobs`,   color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20', sub: stats.activeCount > 0 ? 'Active — processing' : 'All clear' },
        ].map(({ icon: Icon, label, value, color, bg, sub }, idx) => (
          <motion.div key={label}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06, duration: 0.22 }}
            whileHover={{ y: -2, transition: { duration: 0.15 } }}
          >
            <Card className="p-4 border-border bg-card/50 flex flex-col gap-3 h-full hover:border-primary/20 hover:bg-card/80 transition-all cursor-default group">
              <div className="flex items-center justify-between">
                <div className={`w-9 h-9 rounded-xl ${bg} border flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">{label}</p>
                <p className="text-2xl font-black font-mono text-foreground">{value}</p>
                <p className={`text-[10px] mt-0.5 font-medium ${color}`}>{sub}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* ── Credits + Quick actions ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className={`p-4 border-2 flex flex-col gap-3 relative overflow-hidden ${
          empty ? 'border-red-500/30 bg-red-500/5' : low ? 'border-yellow-500/25 bg-yellow-500/5' : 'border-primary/25 bg-gradient-to-br from-primary/8 to-transparent'
        }`}>
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Your Balance</p>
            <CoinsIcon className={`w-4 h-4 ${empty ? 'text-red-400' : low ? 'text-yellow-400' : 'text-primary'}`} />
          </div>
          <div>
            <p className={`text-5xl font-black font-mono leading-none ${empty ? 'text-red-400' : low ? 'text-yellow-400' : 'text-primary'}`}>{credits}</p>
            <p className="text-[10px] text-muted-foreground mt-1.5">credits remaining · 1 credit = 1 unlock</p>
          </div>
          <Button size="sm" className="w-full gap-1.5 text-xs" onClick={() => onNavigate('topup')}>
            <Plus className="w-3.5 h-3.5" />Top Up Credits
          </Button>
          {credits > 0 && (
            <div className="text-[9px] text-muted-foreground text-center font-mono">≈ ${credits * 48} USD value remaining</div>
          )}
        </Card>

        {[
          { label: 'Submit New Request', sub: 'Activate an unlock for one or more devices', icon: Cpu,    page: 'request', color: 'text-primary',   bg: 'bg-primary/10 border-primary/20'      },
          { label: 'Live Support Chat',  sub: 'Talk to our team — we\'re online right now',  icon: MessageCircle, page: 'chat', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
        ].map(({ label, sub, icon: Icon, page, color, bg }) => (
          <Card key={label}
            onClick={() => page === 'chat' ? (document.querySelector<HTMLButtonElement>('[data-chat-toggle]') as HTMLButtonElement | null)?.click() : onNavigate(page)}
            className="p-4 border-border bg-card/50 hover:border-primary/20 hover:bg-card/80 transition-all cursor-pointer group flex flex-col gap-3">
            <div className={`w-9 h-9 rounded-xl ${bg} border flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{sub}</p>
              {page === 'chat' && (
                <span className="inline-flex items-center gap-1 mt-1.5 text-[9px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-full font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />Live
                </span>
              )}
            </div>
            <ArrowRight className={`w-4 h-4 text-muted-foreground group-hover:${color} group-hover:translate-x-0.5 transition-all`} />
          </Card>
        ))}
      </div>

      {/* ── Activity + Chart ── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-5">
          <ActivityFeed />
        </div>
        <div className="xl:col-span-7 flex flex-col gap-4">
          <Card className="border-border bg-card/50 overflow-hidden flex-1">
            <div className="p-4 border-b border-border bg-card/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold">Unlock Volume — Today (Hourly)</h3>
              </div>
              <span className="text-xs font-mono text-muted-foreground">Total: {stats.total} orders</span>
            </div>
            <div className="p-5">
              <div className="flex items-end gap-1.5 h-28">
                {HOURLY_VOLUME.map((v, i) => (
                  <motion.div key={i} className="flex-1 flex flex-col items-center gap-1"
                    initial={{ scaleY: 0, originY: 1 }} animate={{ scaleY: 1 }}
                    transition={{ duration: 0.5, delay: i * 0.04 }}>
                    <div className="w-full rounded-t-sm bg-gradient-to-t from-primary/50 to-primary/80 hover:from-primary/70 hover:to-primary transition-all cursor-default"
                      style={{ height: `${(v / maxVol) * 100}%` }} title={`${HOURS[i]}:00 — ${v} unlocks`} />
                  </motion.div>
                ))}
              </div>
              <div className="flex gap-1.5 mt-1.5">
                {HOURS.map(h => (
                  <div key={h} className="flex-1 text-center text-[9px] text-muted-foreground font-mono">{h}</div>
                ))}
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="border-border bg-card/50 overflow-hidden">
              <div className="p-3 border-b border-border bg-card/80 flex items-center gap-2">
                <Wifi className="w-3.5 h-3.5 text-primary" />
                <h3 className="text-xs font-semibold">Carrier Success Rates</h3>
              </div>
              <div className="p-3 flex flex-col gap-2.5">
                {stats.finalCarrierStats.map(({ carrier, rate }, i) => (
                  <div key={carrier}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-foreground font-medium truncate max-w-[120px]">{carrier}</span>
                      <span className="text-[10px] font-bold text-emerald-400 font-mono">{rate}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
                      <motion.div className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400"
                        initial={{ width: 0 }} animate={{ width: `${rate}%` }}
                        transition={{ duration: 0.6, delay: i * 0.07 }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="border-border bg-card/50 overflow-hidden">
              <div className="p-3 border-b border-border bg-card/80 flex items-center gap-2">
                <Smartphone className="w-3.5 h-3.5 text-primary" />
                <h3 className="text-xs font-semibold">Device Breakdown</h3>
              </div>
              <div className="p-3 flex flex-col gap-3">
                <div className="flex h-3 rounded-lg overflow-hidden gap-0.5">
                  {DEVICE_BREAKDOWN.map(({ brand, share, color }) => (
                    <div key={brand} className={`${color} opacity-80`} style={{ width: `${share}%` }} title={`${brand}: ${share}%`} />
                  ))}
                </div>
                <div className="flex flex-col gap-2">
                  {DEVICE_BREAKDOWN.map(({ brand, share, color }) => (
                    <div key={brand} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-sm ${color} opacity-80`} />
                        <span className="text-[10px] text-foreground">{brand}</span>
                      </div>
                      <span className="text-[10px] font-bold font-mono text-muted-foreground">{share}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* ── System health + Queue ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-border bg-card/50 overflow-hidden">
          <div className="p-4 border-b border-border bg-card/80 flex items-center gap-2">
            <Server className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold">System Health</h3>
            <span className="ml-auto text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">All Systems Operational</span>
          </div>
          <div className="p-4 flex flex-col gap-3">
            {[
              { label: 'Unlock API',         status: 'Operational', uptime: '99.98%', ok: true  },
              { label: 'Activation Server',  status: 'Operational', uptime: '99.95%', ok: true  },
              { label: 'IMEI Database',      status: 'Operational', uptime: '99.9%',  ok: true  },
              { label: 'Carrier API Bridge', status: 'Operational', uptime: '99.4%',  ok: true  },
              { label: 'Notification Hub',   status: 'Operational', uptime: '100%',   ok: true  },
            ].map(({ label, status, uptime, ok }) => (
              <div key={label} className="flex items-center justify-between group">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${ok ? 'bg-green-400' : 'bg-yellow-400 animate-pulse'}`} />
                  <span className="text-xs text-foreground">{label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-muted-foreground font-mono">{uptime}</span>
                  <Badge variant="outline" className={`text-[9px] uppercase px-1.5 ${ok ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/8' : 'border-yellow-500/30 text-yellow-400 bg-yellow-500/8'}`}>
                    {status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-border bg-card/50 overflow-hidden">
          <div className="p-4 border-b border-border bg-card/80 flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold">Processing Queue</h3>
          </div>
          <div className="p-4 flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: 'Active',    value: String(stats.activeCount),   color: 'text-yellow-400' },
                { label: 'Completed', value: String(stats.successCount),  color: 'text-emerald-400' },
                { label: 'Queued',    value: String(stats.queuedCount),   color: 'text-primary'    },
              ].map(({ label, value, color }) => (
                <div key={label} className="p-3 rounded-xl bg-secondary/30 border border-border">
                  <p className={`text-xl font-black font-mono ${color}`}>{value}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Queue by Carrier</p>
              {stats.finalQueueList.length === 0 ? (
                <div className="flex items-center gap-2 py-2 text-xs text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />Queue clear — all orders processed
                </div>
              ) : stats.finalQueueList.map(({ carrier, jobs }, i) => (
                <div key={carrier} className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground w-24 truncate shrink-0">{carrier}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                    <motion.div className="h-full rounded-full bg-gradient-to-r from-primary/60 to-primary"
                      initial={{ width: 0 }} animate={{ width: `${(jobs / stats.maxQueueJobs) * 100}%` }}
                      transition={{ duration: 0.5, delay: 0.3 + i * 0.07 }} />
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono w-6 text-right shrink-0">{jobs}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* ── Recent alerts ── */}
      <Card className="border-border bg-card/50 overflow-hidden">
        <div className="p-4 border-b border-border bg-card/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold">Recent Activity</h3>
          </div>
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground gap-1 h-7" onClick={() => onNavigate('history')}>
            View all <ChevronRight className="w-3 h-3" />
          </Button>
        </div>
        <div className="divide-y divide-border/50">
          {stats.recentAlerts.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-xs text-muted-foreground">No recent activity</div>
          ) : stats.recentAlerts.map((a, i) => (
            <div key={i} className="flex items-start gap-2.5 p-3.5 hover:bg-secondary/20 transition-colors">
              <div className="mt-0.5 shrink-0">
                {a.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                {a.type === 'warn'    && <AlertIcon    className="w-3.5 h-3.5 text-amber-400"   />}
                {a.type === 'info'    && <Activity      className="w-3.5 h-3.5 text-primary"      />}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-[10px] leading-snug ${a.type === 'warn' ? 'text-amber-300' : 'text-foreground'}`}>{a.msg}</p>
                <p className="text-[9px] text-muted-foreground font-mono mt-0.5">{a.time}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Platform summary ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Globe,        label: 'Countries Served',   value: '80+',   sub: 'Worldwide coverage'     },
          { icon: Users,        label: 'Active Technicians', value: '12.4k', sub: 'Registered pros'         },
          { icon: ShieldCheck,  label: 'Total Unlocks',      value: '2.1M+', sub: 'All time'               },
          { icon: Sparkles,     label: 'Your Completed',     value: String(stats.successCount), sub: 'Completed orders' },
        ].map(({ icon: Icon, label, value, sub }, idx) => (
          <motion.div key={label}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + idx * 0.06 }}
            whileHover={{ y: -2, transition: { duration: 0.15 } }}
          >
            <Card className="p-4 border-border bg-card/50 text-center h-full hover:border-primary/20 hover:bg-card/80 transition-all cursor-default group">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <p className="text-xl font-black font-mono text-foreground">{value}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{label}</p>
              <p className="text-[9px] text-primary/70 font-mono mt-0.5">{sub}</p>
            </Card>
          </motion.div>
        ))}
      </div>

    </div>
  );
}

/* ── Inline icon components to avoid import conflicts ── */
const AlertIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 3h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
  </svg>
);
const ClockIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const CoinsIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <circle cx="8" cy="8" r="6" /><path d="M18.09 10.37A6 6 0 1 1 10.34 18" /><path d="M7 6h1v4" /><path d="m16.71 13.88.7.71-2.82 2.82" />
  </svg>
);
