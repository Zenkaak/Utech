import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Bell, CreditCard, Globe, ShieldCheck, TrendingUp, History, Download, Smartphone, Wifi } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const TRANSACTION_HISTORY = [
  { id: 'TXN-9841', type: 'Device Unlock',  device: 'IMEI 352456789012345', amount: '1 CR',   date: 'Jun 22, 2026', status: 'Completed' },
  { id: 'TXN-9802', type: 'Device Unlock',  device: 'IMEI 864123456789012', amount: '1 CR',   date: 'Jun 20, 2026', status: 'Completed' },
  { id: 'TXN-9778', type: 'Device Unlock',  device: 'IMEI 490987654321098', amount: '1 CR',   date: 'Jun 19, 2026', status: 'Completed' },
  { id: 'TXN-9741', type: 'Credit Top-Up',  device: '—',                    amount: '+20 CR', date: 'Jun 17, 2026', status: 'Received'  },
];

export function SettingsPage() {
  const [notifications, setNotifications] = useState({
    unlock:        true,
    processing:    true,
    lowCredit:     false,
    announcements: true,
    weeklyReport:  false,
  });

  const toggle = (key: keyof typeof notifications) =>
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />Settings
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Manage your account, credits, and notification preferences.</p>
      </div>

      {/* Membership */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-cyan-500/5 overflow-hidden">
        <div className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-bold text-foreground">Pro Technician — Tier 2</p>
              <Badge className="text-[9px] bg-yellow-500/15 text-yellow-400 border border-yellow-500/25 uppercase tracking-wider">Active</Badge>
            </div>
            <p className="text-xs text-muted-foreground">Account ID: <span className="font-mono text-foreground">UTK-00291</span></p>
            <div className="mt-2 w-full h-1.5 rounded-full bg-secondary overflow-hidden">
              <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-primary to-cyan-400" />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 font-mono">750 / 1,000 XP — 250 XP to Tier 3</p>
          </div>
          <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
            <p className="text-2xl font-bold font-mono text-primary">24 CR</p>
            <p className="text-[10px] text-muted-foreground">Current balance</p>
          </div>
        </div>
      </Card>

      {/* Credits & Billing */}
      <Card className="border-border bg-card/50 overflow-hidden">
        <div className="p-4 border-b border-border bg-card/80 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Credits & Billing</h3>
        </div>
        <div className="p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Current Balance</p>
              <p className="text-3xl font-bold font-mono text-primary">24 CR</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">1 credit = 1 unlock request</p>
            </div>
            <div className="flex flex-col gap-2 items-end">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                Top Up Credits
              </Button>
              <p className="text-[10px] text-muted-foreground font-mono">Contact support to purchase credits</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            {[
              { label: 'Used This Month',    value: '18 CR' },
              { label: 'Orders This Month',  value: '6'     },
              { label: 'Avg Cost / Order',   value: '1 CR'  },
              { label: 'Total Used (All)',   value: '42 CR' },
            ].map(({ label, value }) => (
              <div key={label} className="p-3 rounded-lg bg-secondary/20 border border-border">
                <p className="text-xs text-muted-foreground mb-1">{label}</p>
                <p className="text-sm font-bold font-mono text-foreground">{value}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 font-medium flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5" /> Credit Usage — Last 7 Days
            </p>
            <div className="flex items-end gap-1 h-12">
              {[{ v: 3, day: 'Mon' },{ v: 5, day: 'Tue' },{ v: 2, day: 'Wed' },{ v: 4, day: 'Thu' },{ v: 1, day: 'Fri' },{ v: 3, day: 'Sat' },{ v: 2, day: 'Sun' }].map(({ v, day }) => (
                <div key={day} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-primary/40 rounded-sm hover:bg-primary/60 transition-colors" style={{ height: `${(v / 5) * 100}%` }} />
                  <span className="text-[8px] text-muted-foreground font-mono">{day}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 font-medium">Service Pricing</p>
            <div className="flex flex-col divide-y divide-border rounded-lg border border-border overflow-hidden">
              {[
                { service: 'Standard Unlock',         price: '1 CR',  note: 'Per device · all supported carriers' },
                { service: 'Express Processing',      price: '2 CR',  note: 'Priority queue · under 1 min avg'    },
                { service: 'Batch Bundle (5 devices)',price: '4 CR',  note: 'Save 1 CR — 5 activations'           },
                { service: 'Batch Bundle (10 devices)',price: '8 CR', note: 'Save 2 CR — 10 activations'          },
              ].map(({ service, price, note }) => (
                <div key={service} className="flex items-center justify-between px-4 py-3 bg-card/40 hover:bg-secondary/20 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-foreground">{service}</p>
                    <p className="text-[10px] text-muted-foreground">{note}</p>
                  </div>
                  <p className="text-sm font-bold font-mono text-primary">{price}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Credit / Transaction history */}
      <Card className="border-border bg-card/50 overflow-hidden">
        <div className="p-4 border-b border-border bg-card/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Credit History</h3>
          </div>
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground gap-1.5">
            <Download className="w-3.5 h-3.5" /> Export
          </Button>
        </div>
        <div className="divide-y divide-border">
          {TRANSACTION_HISTORY.map(({ id, type, device, amount, date, status }) => {
            const isTopUp = type === 'Credit Top-Up';
            return (
              <div key={id} className="flex items-center justify-between px-5 py-3 hover:bg-secondary/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isTopUp ? 'bg-green-500/10 border border-green-500/20' : 'bg-primary/10 border border-primary/20'}`}>
                    <CreditCard className={`w-3.5 h-3.5 ${isTopUp ? 'text-green-400' : 'text-primary'}`} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">{type}{device !== '—' ? ` — ${device}` : ''}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{id} · {date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className={`text-sm font-bold font-mono ${isTopUp ? 'text-green-400' : 'text-foreground'}`}>{amount}</p>
                  <Badge variant="outline" className="text-[9px] border-green-500/30 text-green-400 bg-green-500/10 uppercase">{status}</Badge>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Supported Devices & Carriers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-border bg-card/50 overflow-hidden">
          <div className="p-4 border-b border-border bg-card/80 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Supported Devices</h3>
          </div>
          <div className="p-4 flex flex-col gap-3">
            {[
              { brand: 'Apple iPhone',   models: 'iPhone 6 – iPhone 15 Pro Max',          ok: true  },
              { brand: 'Samsung Galaxy', models: 'S-series, A-series, Note, Z Fold/Flip', ok: true  },
              { brand: 'Xiaomi / POCO',  models: 'All Xiaomi & POCO models',              ok: true  },
              { brand: 'Google Pixel',   models: 'Pixel 4 – Pixel 9',                     ok: true  },
              { brand: 'OnePlus',        models: 'OnePlus 8 and later',                   ok: true  },
              { brand: 'Motorola / LG',  models: 'Selected models — check support',       ok: false },
            ].map(({ brand, models, ok }) => (
              <div key={brand} className="flex items-start gap-2.5">
                <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${ok ? 'bg-green-400' : 'bg-yellow-400'}`} />
                <div>
                  <p className="text-xs font-semibold text-foreground">{brand}</p>
                  <p className="text-[10px] text-muted-foreground">{models}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-border bg-card/50 overflow-hidden">
          <div className="p-4 border-b border-border bg-card/80 flex items-center gap-2">
            <Wifi className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Carrier Coverage</h3>
          </div>
          <div className="p-4 flex flex-col gap-2.5">
            {[
              { region: 'USA',          carriers: 'AT&T, T-Mobile, Verizon, Sprint, Boost, Cricket, Metro' },
              { region: 'UK',           carriers: 'O2, EE, Vodafone, Three, BT Mobile'                     },
              { region: 'Canada',       carriers: 'Rogers, Bell, Telus, Fido, Koodo'                        },
              { region: 'Europe',       carriers: 'Vodafone DE, Orange FR, Telekom, SFR, Swisscom'          },
              { region: 'Middle East',  carriers: 'Etisalat, Du UAE, STC SA, Zain, Ooredoo'                 },
              { region: 'Asia / Other', carriers: 'Airtel, Jio, Globe PH, Singtel, M1, StarHub'             },
            ].map(({ region, carriers }) => (
              <div key={region}>
                <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-0.5">{region}</p>
                <p className="text-[10px] text-muted-foreground leading-relaxed">{carriers}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Preferences */}
      <Card className="border-border bg-card/50 overflow-hidden">
        <div className="p-4 border-b border-border bg-card/80 flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Preferences</h3>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Language',         value: 'English (US)' },
            { label: 'Timezone',         value: 'UTC+00:00'    },
            { label: 'Currency Display', value: 'USD ($)'      },
          ].map(({ label, value }) => (
            <div key={label} className="p-3 rounded-lg bg-secondary/20 border border-border">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
              <p className="text-sm font-semibold text-foreground">{value}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Notification preferences */}
      <Card className="border-border bg-card/50 overflow-hidden">
        <div className="p-4 border-b border-border bg-card/80 flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Notification Preferences</h3>
        </div>
        <div className="p-6 flex flex-col gap-4">
          {([
            { key: 'unlock'        as const, label: 'Unlock completed',        sub: 'Notify when a device is successfully unlocked'                  },
            { key: 'processing'    as const, label: 'Queue status updates',     sub: 'Alert when your order moves through the processing pipeline'    },
            { key: 'lowCredit'     as const, label: 'Low credit balance',       sub: 'Warn when credit balance drops below 5 CR'                     },
            { key: 'announcements' as const, label: 'Platform announcements',   sub: 'System updates, new carrier support, and feature releases'      },
            { key: 'weeklyReport'  as const, label: 'Weekly activity report',   sub: 'Summary of your unlock activity every Monday'                  },
          ]).map(({ key, label, sub }) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{sub}</p>
              </div>
              <button
                onClick={() => toggle(key)}
                className={`w-10 h-5 rounded-full relative flex items-center px-0.5 shrink-0 transition-colors duration-200 ${
                  notifications[key] ? 'bg-primary' : 'bg-secondary border border-border'
                }`}
              >
                <span className={`w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${notifications[key] ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
