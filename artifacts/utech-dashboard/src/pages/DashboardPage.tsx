import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck, Activity, Clock, Zap, CheckCircle2, TrendingUp,
  Smartphone, Globe, Wifi, Server, RefreshCw, Users, Info,
  ArrowRight, Cpu, Bell, Plus,
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

const stagger = {
  container: { animate: { transition: { staggerChildren: 0.06 } } },
  item: { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0, transition: { duration: 0.22, ease: 'easeOut' } } },
};

export function DashboardPage({ credits, onNavigate }: DashboardPageProps) {
  const { orders } = useOrders();
  const maxVol = Math.max(...HOURLY_VOLUME);
  const low = credits <= 5;
  const empty = credits === 0;

  // Derive live stats from the orders context
  const stats = useMemo(() => {
    const total = orders.length;
    const successCount = orders.filter(o => o.status === 'success').length;
    const processingCount = orders.filter(o => o.status === 'processing').length;
    const queuedCount = orders.filter(o => o.status === 'queued').length;
    const activeCount = processingCount + queuedCount;
    const successRate = total > 0 ? Math.round((successCount / total) * 100) : 0;

    // Carrier stats derived from orders
    const carrierMap: Record<string, { total: number; success: number }> = {};
    for (const order of orders) {
      const c = order.carrier || 'Unknown';
      if (!carrierMap[c]) carrierMap[c] = { total: 0, success: 0 };
      carrierMap[c].total++;
      if (order.status === 'success') carrierMap[c].success++;
    }
    const carrierStats = Object.entries(carrierMap)
      .map(([carrier, { total, success }]) => ({
        carrier,
        rate: total > 0 ? Math.round((success / total) * 100) : 0,
        count: total,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // If no carrier data yet, fall back to platform defaults
    const finalCarrierStats = carrierStats.length > 0 ? carrierStats : [
      { carrier: 'AT&T USA',      rate: 98,  count: 412 },
      { carrier: 'T-Mobile USA',  rate: 99,  count: 387 },
      { carrier: 'Verizon USA',   rate: 97,  count: 301 },
      { carrier: 'O2 UK',         rate: 100, count: 219 },
      { carrier: 'Vodafone DE',   rate: 96,  count: 184 },
      { carrier: 'Rogers Canada', rate: 99,  count: 143 },
    ];

    // Recent alerts: latest events from the 5 most-recent orders (orders are stored newest-first)
    const recentAlerts = orders
      .slice(0, 5)
      .flatMap(order =>
        [...order.events].reverse().slice(0, 1).map(ev => ({
          type: ev.type === 'ok' ? 'success' : 'info',
          msg: `${order.id} — ${ev.msg}`,
          time: ev.time,
        }))
      )
      .slice(0, 5);

    // Queue by carrier for active (non-success) orders
    const queueByCarrier: Record<string, number> = {};
    for (const order of orders.filter(o => o.status !== 'success')) {
      const c = order.carrier || 'Other';
      queueByCarrier[c] = (queueByCarrier[c] || 0) + 1;
    }
    const queueCarrierList = Object.entries(queueByCarrier)
      .map(([carrier, jobs]) => ({ carrier, jobs }))
      .sort((a, b) => b.jobs - a.jobs)
      .slice(0, 5);

    // Only fall back to hardcoded platform data when there are no orders at all
    const finalQueueList = total === 0 ? [
      { carrier: 'AT&T USA',     jobs: 14 },
      { carrier: 'T-Mobile USA', jobs: 11 },
      { carrier: 'Verizon USA',  jobs: 9  },
      { carrier: 'O2 UK',        jobs: 7  },
      { carrier: 'Other',        jobs: 6  },
    ] : queueCarrierList;
    const maxQueueJobs = Math.max(...finalQueueList.map(q => q.jobs), 1);

    return {
      total,
      successCount,
      activeCount,
      processingCount,
      queuedCount,
      successRate,
      finalCarrierStats,
      recentAlerts,
      finalQueueList,
      maxQueueJobs,
    };
  }, [orders]);

  return (
    <div className="flex flex-col gap-5">

      {/* Hero / Welcome banner */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        <Card className="border-primary/20 bg-gradient-to-br from-primary/8 via-card/60 to-card/40 overflow-hidden relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(2,132,199,0.08),transparent_60%)]" />
          <div className="relative p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <h2 className="text-lg font-bold text-foreground">Welcome back, Tech Support</h2>
                <Badge className="text-[9px] bg-yellow-500/15 text-yellow-400 border border-yellow-500/25 uppercase tracking-wider">Pro · Tier 2</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Platform is <span className="text-green-400 font-medium">operational</span> · {stats.activeCount} job{stats.activeCount !== 1 ? 's' : ''} in queue · {stats.successRate}% success rate
              </p>
              {(low || empty) && (
                <div className={`flex items-center gap-2 mt-2.5 px-3 py-1.5 rounded-lg w-fit border ${
                  empty ? 'bg-red-500/10 border-red-500/20' : 'bg-yellow-500/10 border-yellow-500/20'
                }`}>
                  <AlertCircle className={`w-3.5 h-3.5 ${empty ? 'text-red-400' : 'text-yellow-400'}`} />
                  <span className={`text-xs font-medium ${empty ? 'text-red-400' : 'text-yellow-400'}`}>
                    {empty ? 'No credits remaining — top up to restore priority processing' : `Low balance: ${credits} CR remaining`}
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => onNavigate('history')}>
                <ClockIcon className="w-3.5 h-3.5" />View Orders
              </Button>
              <Button size="sm" className="gap-1.5 text-xs shadow-[0_0_16px_rgba(2,132,199,0.2)]" onClick={() => onNavigate('request')}>
                <Plus className="w-3.5 h-3.5" />New Request
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Stat cards */}
      <motion.div className="grid grid-cols-2 xl:grid-cols-4 gap-3" variants={stagger.container} initial="initial" animate="animate">
        {[
          { icon: ShieldCheck, label: 'Total Orders',      value: String(stats.total),                   color: 'text-primary',    bg: 'bg-primary/10 border-primary/20',       trend: `${stats.successCount} completed`,     trendUp: true  },
          { icon: Activity,    label: 'Success Rate',       value: `${stats.successRate}%`,               color: 'text-green-400',  bg: 'bg-green-500/10 border-green-500/20',   trend: `${stats.successCount} unlocked`,      trendUp: true  },
          { icon: Clock,       label: 'Processing',         value: String(stats.processingCount),         color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/20',     trend: 'In progress now',                     trendUp: false },
          { icon: Zap,         label: 'Queue Status',       value: `${stats.activeCount} Jobs`,           color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20', trend: stats.activeCount > 0 ? 'Active — processing' : 'All clear', trendUp: false },
        ].map(({ icon: Icon, label, value, color, bg, trend }) => (
          <motion.div key={label} variants={stagger.item} whileHover={{ y: -2, transition: { duration: 0.15 } }}>
            <Card className="p-4 border-border bg-card/50 flex flex-col gap-3 h-full hover:border-primary/20 hover:bg-card/80 transition-colors cursor-default">
              <div className="flex items-center justify-between">
                <div className={`w-9 h-9 rounded-lg ${bg} border flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">{label}</p>
                <p className="text-2xl font-bold font-mono text-foreground">{value}</p>
                <p className={`text-[10px] mt-0.5 ${color}`}>{trend}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Credits snapshot + quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className={`p-4 border-2 flex flex-col gap-3 ${empty ? 'border-red-500/30 bg-red-500/5' : low ? 'border-yellow-500/25 bg-yellow-500/5' : 'border-primary/20 bg-primary/5'}`}>
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Your Balance</p>
            <Coins className={`w-4 h-4 ${empty ? 'text-red-400' : low ? 'text-yellow-400' : 'text-primary'}`} />
          </div>
          <div>
            <p className={`text-4xl font-black font-mono ${empty ? 'text-red-400' : low ? 'text-yellow-400' : 'text-primary'}`}>{credits}</p>
            <p className="text-[10px] text-muted-foreground mt-1">credits remaining</p>
          </div>
          <Button size="sm" variant="outline" className="w-full gap-1.5 text-xs" onClick={() => onNavigate('topup')}>
            <Plus className="w-3.5 h-3.5" />Top Up Credits
          </Button>
        </Card>
        {[
          { label: 'Submit New Request', sub: 'Activate an unlock for one or more devices', icon: Cpu,    page: 'request', color: 'text-primary',   bg: 'bg-primary/10 border-primary/20'      },
          { label: 'Device Lookup',      sub: 'Check carrier and lock status before submitting', icon: Wifi, page: 'lookup',  color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20'    },
        ].map(({ label, sub, icon: Icon, page, color, bg }) => (
          <Card key={label} onClick={() => onNavigate(page)}
            className="p-4 border-border bg-card/50 hover:border-primary/20 hover:bg-card/80 transition-all cursor-pointer group flex flex-col gap-3">
            <div className={`w-9 h-9 rounded-lg ${bg} border flex items-center justify-center`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{label}</p>
              <p className="text-[10px] text-muted-foreground mt-1 leading-snug">{sub}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
          </Card>
        ))}
      </div>

      {/* Activity feed + volume chart */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-5 h-[420px] xl:h-auto">
          <ActivityFeed />
        </div>
        <div className="xl:col-span-7 flex flex-col gap-4">
          <Card className="border-border bg-card/50 overflow-hidden flex-1">
            <div className="p-4 border-b border-border bg-card/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Unlock Volume — Today (Hourly)</h3>
              </div>
              <span className="text-xs font-mono text-muted-foreground">Total: {stats.total} orders</span>
            </div>
            <div className="p-5">
              <div className="flex items-end gap-1.5 h-24">
                {HOURLY_VOLUME.map((v, i) => (
                  <motion.div key={i} className="flex-1 flex flex-col items-center gap-1"
                    initial={{ scaleY: 0, originY: 1 }} animate={{ scaleY: 1 }}
                    transition={{ duration: 0.4, delay: i * 0.04, ease: 'easeOut' }}>
                    <div className="w-full rounded-t-sm bg-primary/40 hover:bg-primary/70 transition-colors cursor-default"
                      style={{ height: `${(v / maxVol) * 100}%` }}
                      title={`${HOURS[i]}:00 — ${v} unlocks`} />
                  </motion.div>
                ))}
              </div>
              <div className="flex gap-1.5 mt-1.5">
                {HOURS.map((h) => (
                  <div key={h} className="flex-1 text-center text-[9px] text-muted-foreground font-mono">{h}</div>
                ))}
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="border-border bg-card/50 overflow-hidden">
              <div className="p-3 border-b border-border bg-card/80 flex items-center gap-2">
                <Wifi className="w-3.5 h-3.5 text-primary" />
                <h3 className="text-xs font-semibold text-foreground">Carrier Success Rates</h3>
              </div>
              <div className="p-3 flex flex-col gap-2.5">
                {stats.finalCarrierStats.map(({ carrier, rate }, i) => (
                  <div key={carrier}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-foreground font-medium truncate max-w-[120px]">{carrier}</span>
                      <span className="text-[10px] font-bold text-green-400 font-mono">{rate}%</span>
                    </div>
                    <div className="w-full h-1 rounded-full bg-secondary overflow-hidden">
                      <motion.div className="h-full rounded-full bg-gradient-to-r from-primary to-green-400"
                        initial={{ width: 0 }} animate={{ width: `${rate}%` }}
                        transition={{ duration: 0.6, delay: i * 0.07, ease: 'easeOut' }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="border-border bg-card/50 overflow-hidden">
              <div className="p-3 border-b border-border bg-card/80 flex items-center gap-2">
                <Smartphone className="w-3.5 h-3.5 text-primary" />
                <h3 className="text-xs font-semibold text-foreground">Device Breakdown</h3>
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

      {/* System health + queue */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-border bg-card/50 overflow-hidden">
          <div className="p-4 border-b border-border bg-card/80 flex items-center gap-2">
            <Server className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">System Health</h3>
          </div>
          <div className="p-4 flex flex-col gap-3">
            {[
              { label: 'Unlock API',          status: 'Operational', uptime: '99.98%', ok: true  },
              { label: 'Activation Server',   status: 'Operational', uptime: '99.95%', ok: true  },
              { label: 'IMEI Database',       status: 'Operational', uptime: '99.9%',  ok: true  },
              { label: 'Carrier API Bridge',  status: 'Degraded',    uptime: '97.4%',  ok: false },
              { label: 'Notification Hub',    status: 'Operational', uptime: '100%',   ok: true  },
            ].map(({ label, status, uptime, ok }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${ok ? 'bg-green-400' : 'bg-yellow-400 animate-pulse'}`} />
                  <span className="text-xs text-foreground">{label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-muted-foreground font-mono">{uptime}</span>
                  <Badge variant="outline" className={`text-[9px] uppercase px-1.5 ${ok ? 'border-green-500/30 text-green-400 bg-green-500/10' : 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10'}`}>
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
            <h3 className="text-sm font-semibold text-foreground">Processing Queue</h3>
          </div>
          <div className="p-4 flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: 'Active',      value: String(stats.activeCount),    color: 'text-yellow-400' },
                { label: 'Completed',   value: String(stats.successCount),   color: 'text-green-400'  },
                { label: 'Queued',      value: String(stats.queuedCount),    color: 'text-primary'    },
              ].map(({ label, value, color }) => (
                <div key={label} className="p-3 rounded-lg bg-secondary/30 border border-border">
                  <p className={`text-xl font-bold font-mono ${color}`}>{value}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Queue by Carrier</p>
              {stats.finalQueueList.map(({ carrier, jobs }, i) => (
                <div key={carrier} className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground w-24 truncate shrink-0">{carrier}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                    <motion.div className="h-full rounded-full bg-primary/60"
                      initial={{ width: 0 }} animate={{ width: `${(jobs / stats.maxQueueJobs) * 100}%` }}
                      transition={{ duration: 0.5, delay: 0.3 + i * 0.07, ease: 'easeOut' }} />
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono w-6 text-right shrink-0">{jobs}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Recent alerts — derived from live order events */}
      <Card className="border-border bg-card/50 overflow-hidden">
        <div className="p-4 border-b border-border bg-card/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Recent Alerts</h3>
          </div>
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground gap-1.5" onClick={() => onNavigate('history')}>
            View all <ArrowRight className="w-3 h-3" />
          </Button>
        </div>
        <div className="divide-y divide-border">
          {stats.recentAlerts.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-xs text-muted-foreground">No recent activity</div>
          ) : (
            stats.recentAlerts.map((a, i) => (
              <div key={i} className="flex items-start gap-2.5 p-3 hover:bg-secondary/20 transition-colors">
                <div className="mt-0.5 shrink-0">
                  {a.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />}
                  {a.type === 'info'    && <Info          className="w-3.5 h-3.5 text-primary"   />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-foreground leading-snug">{a.msg}</p>
                  <p className="text-[9px] text-muted-foreground font-mono mt-0.5">{a.time}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Platform summary */}
      <motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-3" variants={stagger.container} initial="initial" animate="animate">
        {[
          { icon: Globe,        label: 'Countries Served',    value: '80+',   sub: 'Worldwide coverage' },
          { icon: Users,        label: 'Active Technicians',  value: '12.4k', sub: 'Registered pros'    },
          { icon: ShieldCheck,  label: 'Total Unlocks',       value: '2.1M+', sub: 'All time'           },
          { icon: CheckCircle2, label: 'Your Completed',      value: String(stats.successCount), sub: 'Completed orders' },
        ].map(({ icon: Icon, label, value, sub }) => (
          <motion.div key={label} variants={stagger.item} whileHover={{ y: -2, transition: { duration: 0.15 } }}>
            <Card className="p-4 border-border bg-card/50 text-center h-full hover:border-primary/20 hover:bg-card/80 transition-colors cursor-default">
              <Icon className="w-5 h-5 text-primary mx-auto mb-2" />
              <p className="text-lg font-bold font-mono text-foreground">{value}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{label}</p>
              <p className="text-[9px] text-primary font-mono mt-0.5">{sub}</p>
            </Card>
          </motion.div>
        ))}
      </motion.div>

    </div>
  );
}

// Local alias to avoid import conflict
const AlertCircle = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
const Coins = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <circle cx="8" cy="8" r="6" /><path d="M18.09 10.37A6 6 0 1 1 10.34 18" /><path d="M7 6h1v4" /><path d="m16.71 13.88.7.71-2.82 2.82" />
  </svg>
);
const ClockIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
