import { motion } from 'framer-motion';
  import { LayoutDashboard, Send, ClipboardList, Search, Settings } from 'lucide-react';

  interface BottomNavProps {
    activePage: string;
    onNavigate: (page: string) => void;
    errorCount?: number;
  }

  const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'request',   label: 'Request',   icon: Send },
    { id: 'history',   label: 'History',   icon: ClipboardList, badge: true },
    { id: 'lookup',    label: 'Lookup',    icon: Search },
    { id: 'settings',  label: 'Settings',  icon: Settings },
  ];

  export function BottomNav({ activePage, onNavigate, errorCount = 3 }: BottomNavProps) {
    return (
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border flex items-end h-[68px] px-1 pb-1">
        {NAV_ITEMS.map(({ id, label, icon: Icon, badge }) => {
          const isActive = activePage === id;
          return (
            <button
              key={id}
              data-testid={`bottom-nav-${id}`}
              onClick={() => onNavigate(id)}
              className="relative flex flex-col items-center justify-end flex-1 h-full pb-1 gap-1"
            >
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-pill"
                  className="absolute top-1 left-1/2 -translate-x-1/2 w-10 h-10 rounded-xl bg-primary/15 border border-primary/20"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <div className="relative z-10 flex flex-col items-center gap-0.5">
                <motion.div
                  animate={{ scale: isActive ? 1.1 : 1, y: isActive ? -1 : 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="relative"
                >
                  <Icon className={`w-5 h-5 transition-colors duration-200 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                  {badge && errorCount > 0 && (
                    <span className="absolute -top-1 -right-1.5 min-w-[14px] h-3.5 px-0.5 rounded-full bg-red-500 border border-background flex items-center justify-center text-[8px] font-bold text-white leading-none">
                      {errorCount}
                    </span>
                  )}
                </motion.div>
                <span className={`text-[9px] font-medium transition-colors duration-200 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>{label}</span>
              </div>
            </button>
          );
        })}
      </nav>
    );
  }