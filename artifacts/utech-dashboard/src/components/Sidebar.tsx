import { LayoutDashboard, Send, ClipboardList, Search, HeadphonesIcon, Settings, ChevronRight, Server, LogOut, Bell, Shield, FileText, Activity, Zap, CheckCircle2, Clock, Globe, Users, Award, TrendingUp, Wifi, Plus, Cpu } from 'lucide-react';

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  displayClass?: string;
  credits?: number;
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard',     icon: LayoutDashboard },
  { id: 'request',   label: 'New Request',   icon: Send             },
  { id: 'history',   label: 'Order History', icon: ClipboardList    },
  { id: 'lookup',    label: 'Device Lookup', icon: Search           },
  { id: 'support',   label: 'Support',       icon: HeadphonesIcon   },
  { id: 'settings',  label: 'Settings',      icon: Settings         },
];

const RECENT_ORDERS = [
  { id: 'ORD-20847', device: '352456789012345', status: 'processing' },
  { id: 'ORD-20846', device: '864123456789012', status: 'success'    },
  { id: 'ORD-20845', device: '490987654321098', status: 'processing' },
];

export function Sidebar({ activePage, onNavigate, displayClass = 'hidden lg:flex', credits = 24 }: SidebarProps) {
  const lowCredits  = credits < 5;
  const noCredits   = credits < 1;
  return (
    <aside className={`${displayClass} flex-col w-64 shrink-0 bg-card border-r border-border h-screen sticky top-0`}>

      {/* Logo */}
      <div className="px-4 py-3 border-b border-border flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 bg-primary/15 border border-primary/30 rounded-lg flex items-center justify-center">
          <Server className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="font-bold text-sm text-foreground leading-none">UTECH SERVER</p>
          <p className="text-[10px] font-mono text-primary tracking-widest">UNLOCK v4.2</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
        </div>
      </div>

      {/* User profile */}
      <div className="px-3 py-2.5 border-b border-border shrink-0">
        <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-secondary/40 border border-border">
          <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">UT</div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground truncate leading-none">Tech Support</p>
            <div className="flex items-center gap-1 mt-0.5">
              <Award className="w-2.5 h-2.5 text-yellow-400" />
              <p className="text-[9px] text-yellow-400 font-semibold">Pro — Tier 2</p>
            </div>
          </div>
          <div className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono shrink-0 border ${
            noCredits  ? 'bg-red-500/10 border-red-500/20 text-red-400'       :
            lowCredits ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' :
                         'bg-primary/10 border-primary/20 text-primary'
          }`}>{credits} CR</div>
        </div>
        <div className="mt-1.5 w-full h-1 rounded-full bg-secondary overflow-hidden">
          <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-primary to-cyan-400" />
        </div>
        <p className="text-[9px] text-muted-foreground mt-0.5 font-mono px-0.5">750 / 1,000 XP to Tier 3</p>
      </div>

      <div className="flex-1 overflow-y-auto">

        {/* New request CTA */}
        <div className="p-3 pb-0">
          <button onClick={() => onNavigate('request')}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest hover:bg-primary/90 transition-all shadow-[0_0_16px_rgba(2,132,199,0.2)] hover:shadow-[0_0_24px_rgba(2,132,199,0.35)]">
            <Plus className="w-3.5 h-3.5" />New Unlock Request
          </button>
        </div>

        {/* Main nav */}
        <nav className="p-2 pt-3">
          <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest px-2 py-1.5">Navigation</p>
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const isActive = activePage === id;
            return (
              <button key={id} data-testid={`nav-${id}`} onClick={() => onNavigate(id)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all group mb-0.5 ${
                  isActive
                    ? 'bg-primary/15 text-primary border border-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                }`}>
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
                <span className="flex-1 text-left">{label}</span>
                {isActive && <ChevronRight className="w-3 h-3 text-primary" />}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-border mx-3" />

        {/* Server status */}
        <div className="p-3">
          <p className="flex items-center gap-1.5 text-[9px] font-semibold text-muted-foreground uppercase tracking-widest px-1 py-1.5">
            <Activity className="w-3 h-3 text-primary" /> Server Status
          </p>
          <div className="flex flex-col gap-1.5 px-1">
            {[
              { label: 'Server Status', value: 'Online',   color: 'text-green-400',  dot: true  },
              { label: 'Response Time', value: '12ms',     color: 'text-cyan-400',   dot: false },
              { label: 'Queue',         value: '47 jobs',  color: 'text-yellow-400', dot: false },
              { label: 'Uptime',        value: '99.98%',   color: 'text-foreground', dot: false },
              { label: 'Throughput',    value: '1.2k/hr',  color: 'text-foreground', dot: false },
            ].map(({ label, value, color, dot }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">{label}</span>
                <span className={`flex items-center gap-1 text-[10px] font-mono ${color}`}>
                  {dot && <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />}
                  {value}
                </span>
              </div>
            ))}
            <div className="mt-1.5">
              <p className="text-[9px] text-muted-foreground mb-1">Requests (last 6h)</p>
              <div className="flex items-end gap-0.5 h-6">
                {[40, 65, 50, 80, 90, 72].map((h, i) => (
                  <div key={i} className="flex-1 bg-primary/40 rounded-sm hover:bg-primary/70 transition-colors" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border mx-3" />

        {/* Recent orders */}
        <div className="p-3">
          <p className="flex items-center gap-1.5 text-[9px] font-semibold text-muted-foreground uppercase tracking-widest px-1 py-1.5 cursor-pointer hover:text-foreground transition-colors"
            onClick={() => onNavigate('history')}>
            <ClipboardList className="w-3 h-3 text-primary" /> Recent Orders
          </p>
          <div className="flex flex-col gap-1 px-1">
            {RECENT_ORDERS.map((o) => (
              <div key={o.id}
                className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30 border border-border hover:bg-secondary/50 transition-colors cursor-pointer"
                onClick={() => onNavigate('history')}>
                {o.status === 'success'
                  ? <CheckCircle2 className="w-3 h-3 text-green-400 shrink-0" />
                  : <Cpu          className="w-3 h-3 text-primary shrink-0 animate-pulse" />}
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-medium text-foreground truncate">{o.device}</p>
                  <p className="text-[9px] text-muted-foreground font-mono">{o.id}</p>
                </div>
                <span className={`text-[8px] font-bold uppercase px-1 py-0.5 rounded ${
                  o.status === 'success'
                    ? 'bg-green-500/10 text-green-400'
                    : 'bg-primary/10 text-primary'
                }`}>
                  {o.status === 'success' ? 'OK' : 'PROC'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-border mx-3" />

        {/* Announcements */}
        <div className="p-3">
          <p className="flex items-center gap-1.5 text-[9px] font-semibold text-muted-foreground uppercase tracking-widest px-1 py-1.5">
            <Zap className="w-3 h-3 text-yellow-400" /> Announcements
          </p>
          <div className="flex flex-col gap-1.5 px-1">
            <div className="p-2 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-[10px] text-primary font-semibold">New: iPhone 15 series supported</p>
              <p className="text-[9px] text-muted-foreground/60 font-mono mt-0.5">2h ago</p>
            </div>
            <div className="p-2 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
              <p className="text-[10px] text-yellow-300/80 font-semibold">Maintenance: June 28, 02:00 UTC</p>
              <p className="text-[9px] text-muted-foreground/60 font-mono mt-0.5">1d ago</p>
            </div>
          </div>
        </div>

        <div className="border-t border-border mx-3" />

        {/* Platform stats */}
        <div className="p-3">
          <p className="flex items-center gap-1.5 text-[9px] font-semibold text-muted-foreground uppercase tracking-widest px-1 py-1.5">
            <TrendingUp className="w-3 h-3 text-primary" /> Platform Stats
          </p>
          <div className="grid grid-cols-2 gap-1.5 px-1">
            {[
              { icon: Globe,        label: 'Countries',    value: '80+'     },
              { icon: Users,        label: 'Active Users', value: '12.4k'   },
              { icon: CheckCircle2, label: 'Total Unlocks',value: '2.1M'    },
              { icon: Clock,        label: 'Avg Time',     value: '4.2 min' },
              { icon: Wifi,         label: 'Carriers',     value: '200+'    },
              { icon: TrendingUp,   label: 'Success Rate', value: '99.2%'   },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="p-2 rounded-lg bg-secondary/20 border border-border text-center hover:bg-secondary/40 transition-colors">
                <Icon className="w-3 h-3 text-primary mx-auto mb-1" />
                <p className="text-[10px] font-bold font-mono text-foreground">{value}</p>
                <p className="text-[8px] text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-border mx-3" />

        {/* Legal */}
        <div className="p-3">
          <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest px-1 py-1.5">Legal</p>
          <div className="flex flex-col gap-0.5 px-1">
            <button onClick={() => onNavigate('privacy')}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[10px] transition-all ${
                activePage === 'privacy' ? 'text-primary bg-primary/10 border border-primary/20' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
              }`}>
              <Shield className="w-3 h-3" /> Privacy Policy
            </button>
            <button onClick={() => onNavigate('terms')}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[10px] transition-all ${
                activePage === 'terms' ? 'text-primary bg-primary/10 border border-primary/20' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
              }`}>
              <FileText className="w-3 h-3" /> Terms & Conditions
            </button>
          </div>
        </div>

      </div>

      {/* Footer actions */}
      <div className="shrink-0 border-t border-border p-2">
        <button onClick={() => onNavigate('settings')}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all">
          <Bell className="w-3.5 h-3.5" /><span>Notifications</span>
          <span className="ml-auto w-4 h-4 rounded-full bg-primary/20 border border-primary/30 text-[8px] font-bold text-primary flex items-center justify-center">5</span>
        </button>
        <button className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all">
          <LogOut className="w-3.5 h-3.5" /><span>Sign Out</span>
        </button>
        <p className="text-center text-[9px] text-muted-foreground font-mono mt-1 pb-1">&copy; 2026 UTECH SERVER UNLOCK</p>
      </div>
    </aside>
  );
}
