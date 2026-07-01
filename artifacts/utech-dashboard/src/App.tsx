import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { Server, Coins, Bell, X, CheckCircle2, Info, Clock, AlertTriangle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Sidebar } from "./components/Sidebar";
import { BottomNav } from "./components/BottomNav";
import { DashboardPage } from "./pages/DashboardPage";
import { ImeiForm } from "./components/ImeiForm";
import { ActivityFeed } from "./components/ActivityFeed";
import { HistoryPage } from "./pages/HistoryPage";
import { LookupPage } from "./pages/LookupPage";
import { SupportPage } from "./pages/SupportPage";
import { SettingsPage } from "./pages/SettingsPage";
import { PrivacyPage } from "./pages/PrivacyPage";
import { TermsPage } from "./pages/TermsPage";
import { TopUpPage } from "./pages/TopUpPage";
import { AdminPage } from "./pages/AdminPage";
import { OrdersProvider, useOrders } from "./context/OrdersContext";

const NOTIFICATIONS = [
  {
    id: 1,
    type: 'warning',
    title: 'Payment Required',
    msg: 'UTK-ZHVXLCICB — IMEI 353114100731092 unlock complete, awaiting payment to release instructions',
    time: 'Just now',
  },
  {
    id: 2,
    type: 'success',
    title: 'Batch Unlock Completed',
    msg: 'UTK-ZHVXLCICB — All 5 devices unlocked successfully · ORD-20848',
    time: '22m ago',
  },
  {
    id: 3,
    type: 'success',
    title: 'Unlock Completed',
    msg: 'ORD-20846 — IMEI 864123456789012 unlocked successfully · T-Mobile USA',
    time: '1h 45m ago',
  },
  {
    id: 4,
    type: 'success',
    title: 'Unlock Completed',
    msg: 'ORD-20844 — IMEI 358741258963014 unlocked successfully · O2 UK',
    time: '7h 5m ago',
  },
  {
    id: 5,
    type: 'info',
    title: 'Queue Update',
    msg: 'ORD-20843 — IMEI 861369258014785 moved to active processing',
    time: '3h 12m ago',
  },
];

function AppShell() {
  const { credits, adjustCredits } = useOrders();

  const [activePage, setActivePage] = useState(() =>
    window.location.hash === '#xx' ? 'admin' : 'dashboard'
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen]           = useState(false);

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  useEffect(() => {
    const onHash = () => {
      if (window.location.hash === '#xx') setActivePage('admin');
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const handleNavigate = (page: string) => {
    setActivePage(page);
    setNotifOpen(false);
    setMobileMenuOpen(false);
    if (page !== 'admin') {
      history.replaceState(null, '', window.location.pathname);
    }
  };

  const handleSpend = (amount: number) => {
    adjustCredits(-amount);
  };

  const pageTitle: Record<string, string> = {
    dashboard: 'Dashboard',
    request:   'New Unlock Request',
    history:   'Order History',
    lookup:    'Device Lookup',
    support:   'Support Center',
    settings:  'Settings',
    privacy:   'Privacy Policy',
    terms:     'Terms & Conditions',
    topup:     'Top Up Credits',
    admin:     'Admin Panel',
  };

  const pageContent = () => {
    switch (activePage) {
      case 'dashboard': return <DashboardPage credits={credits} onNavigate={handleNavigate} />;
      case 'request':   return (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 lg:gap-6">
          <div className="xl:col-span-7">
            <ImeiForm credits={credits} onSpend={handleSpend} onNavigate={handleNavigate} />
          </div>
          <div className="xl:col-span-5 h-[480px] xl:h-auto"><ActivityFeed /></div>
        </div>
      );
      case 'history':  return <HistoryPage onNavigate={handleNavigate} />;
      case 'lookup':   return <LookupPage onNavigate={handleNavigate} />;
      case 'support':  return <SupportPage />;
      case 'settings': return <SettingsPage />;
      case 'privacy':  return <PrivacyPage />;
      case 'terms':    return <TermsPage />;
      case 'topup':    return <TopUpPage onNavigate={handleNavigate} />;
      case 'admin':    return <AdminPage />;
      default:         return <DashboardPage credits={credits} onNavigate={handleNavigate} />;
    }
  };

  const lowCredits  = credits < 5;
  const noCredits   = credits < 1;
  const warningCount = NOTIFICATIONS.filter(n => n.type === 'warning').length;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar activePage={activePage} onNavigate={handleNavigate} credits={credits} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Header */}
        <header className="shrink-0 h-12 border-b border-border bg-card/50 backdrop-blur-sm flex items-center px-4 gap-3">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(o => !o)}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Server className="w-4 h-4" />}
          </button>

          <h2 className="text-sm font-semibold text-foreground flex-1 truncate">
            {pageTitle[activePage] ?? 'Dashboard'}
          </h2>

          {/* Credits */}
          <button
            onClick={() => handleNavigate('topup')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
              noCredits  ? 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20'    :
              lowCredits ? 'bg-yellow-500/10 border-yellow-500/30 hover:bg-yellow-500/20' :
                           'bg-secondary border-border hover:bg-secondary/80'
            }`}>
            <Coins className={`w-3.5 h-3.5 ${noCredits ? 'text-red-400' : lowCredits ? 'text-yellow-400' : 'text-primary'}`} />
            <span className={`text-sm font-bold font-mono ${noCredits ? 'text-red-400' : lowCredits ? 'text-yellow-400' : 'text-foreground'}`}>
              {credits} CR
            </span>
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(o => !o)}
              className="relative w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all"
            >
              <Bell className="w-4 h-4" />
              {warningCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 border border-background" />
              )}
            </button>

            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-10 w-96 max-w-[calc(100vw-2rem)] bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground uppercase tracking-wider">Notifications</span>
                    <span className="text-[10px] bg-primary/20 text-primary font-bold px-1.5 py-0.5 rounded font-mono">
                      {NOTIFICATIONS.length} new
                    </span>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-border">
                    {NOTIFICATIONS.map(n => (
                      <div key={n.id} className={`px-4 py-3 flex gap-3 items-start hover:bg-secondary/30 transition-colors ${
                        n.type === 'warning' ? 'bg-amber-500/5' : ''
                      }`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                          n.type === 'warning' ? 'bg-amber-500/15' :
                          n.type === 'success' ? 'bg-emerald-500/15' :
                                                 'bg-primary/15'
                        }`}>
                          {n.type === 'warning' && <AlertTriangle className="w-3 h-3 text-amber-400" />}
                          {n.type === 'success' && <CheckCircle2  className="w-3 h-3 text-emerald-400" />}
                          {n.type === 'info'    && <Info          className="w-3 h-3 text-primary" />}
                          {(n.type === 'queue' || (!['warning','success','info'].includes(n.type))) && <Clock className="w-3 h-3 text-muted-foreground" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-[11px] font-semibold ${n.type === 'warning' ? 'text-amber-300' : 'text-foreground'}`}>{n.title}</p>
                          <p className="text-[10px] text-muted-foreground leading-snug mt-0.5">{n.msg}</p>
                          <p className="text-[9px] text-muted-foreground/60 font-mono mt-0.5">{n.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2.5 border-t border-border">
                    <button className="w-full text-center text-[10px] text-primary hover:text-primary/80 font-semibold transition-colors">
                      View all notifications
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Mobile drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            >
              <motion.div
                initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="absolute left-0 top-0 bottom-0 w-72"
                onClick={e => e.stopPropagation()}
              >
                <Sidebar activePage={activePage} onNavigate={handleNavigate} displayClass="flex" credits={credits} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 pb-24 lg:pb-6 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto">
            <AnimatePresence mode="wait">
              <motion.div key={activePage}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}>
                {pageContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        <footer className="hidden lg:flex items-center justify-between px-6 py-3 border-t border-border bg-card/50 text-[10px] text-muted-foreground font-mono">
          <span>UTECH SERVER UNLOCK v4.2 — All rights reserved © 2026</span>
          <div className="flex items-center gap-4">
            <span>Unlock Server: <span className="text-green-400">Operational</span></span>
            <span>Processing Cluster: <span className="text-green-400">Active</span></span>
            <span>Queue: <span className="text-primary">47 jobs</span></span>
          </div>
        </footer>
      </div>

      <BottomNav activePage={activePage} onNavigate={handleNavigate} errorCount={warningCount} />
      <Toaster theme="dark" position="bottom-right" />
    </div>
  );
}

export default function App() {
  return (
    <OrdersProvider>
      <AppShell />
    </OrdersProvider>
  );
}
