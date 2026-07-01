import { useEffect, useRef, useState } from 'react';
import { Activity, CheckCircle2, PlayCircle, Info, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type LogStatus = 'success' | 'pending' | 'info';
interface LogEntry { id: string; time: string; text: string; status: LogStatus; carrier?: string; }

const MESSAGE_POOL: { text: string; status: LogStatus; carrier?: string }[] = [
  { text: 'iPhone 15 Pro Max · IMEI 352XXXXXXXXX012 · Unlock Complete',        status: 'success', carrier: 'AT&T USA'      },
  { text: 'Samsung S24 Ultra · IMEI 864XXXXXXXXX034 · Processing queue',        status: 'pending', carrier: 'T-Mobile USA'  },
  { text: 'iPhone 13 · IMEI 490XXXXXXXXX056 · Unlock Complete',                 status: 'success', carrier: 'Verizon USA'   },
  { text: 'Server heartbeat · latency 11ms · all nodes healthy',                status: 'info'                               },
  { text: 'New batch from TechFix Dubai · 4 IMEIs queued',                      status: 'info'                               },
  { text: 'iPhone 14 Pro · IMEI 358XXXXXXXXX078 · Unlock Complete',             status: 'success', carrier: 'O2 UK'         },
  { text: 'Carrier API sync · Rogers CA · 200 OK',                              status: 'info'                               },
  { text: 'Google Pixel 8 · IMEI 350XXXXXXXXX112 · Unlock Complete',            status: 'success', carrier: 'EE UK'         },
  { text: 'Activation queue flushed · 8 jobs dispatched',                       status: 'info'                               },
  { text: 'iPhone 12 Mini · IMEI 352XXXXXXXXX134 · Processing queue',           status: 'pending', carrier: 'Rogers Canada' },
  { text: 'Queue flush · 12 jobs dispatched to unlock cluster',                  status: 'info'                               },
  { text: 'Samsung S23+ · IMEI 863XXXXXXXXX178 · Unlock Complete',              status: 'success', carrier: 'AT&T USA'      },
  { text: 'TLS certificate renewed · valid 90 days',                            status: 'info'                               },
  { text: 'Pixel 7 Pro · IMEI 357XXXXXXXXX200 · Unlock Complete',               status: 'success', carrier: 'T-Mobile USA'  },
  { text: 'Xiaomi 13T · IMEI 860XXXXXXXXX156 · Activation submitted',           status: 'pending', carrier: 'SFR France'   },
  { text: 'iPhone 15 · IMEI 354XXXXXXXXX220 · Activation submitted',            status: 'pending', carrier: 'Vodafone DE'  },
  { text: 'IMEI database sync · 3,204 records refreshed',                       status: 'info'                               },
  { text: 'Samsung A54 · IMEI 861XXXXXXXXX340 · Unlock Complete',               status: 'success', carrier: 'O2 UK'         },
];

const statusMeta = {
  success: { color: 'text-green-400 bg-green-400/10 border-green-400/20',     icon: <CheckCircle2 className="w-3 h-3" />, label: 'Unlocked' },
  pending: { color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',  icon: <PlayCircle   className="w-3 h-3" />, label: 'Queued'   },
  info:    { color: 'text-blue-400 bg-blue-400/10 border-blue-400/20',         icon: <Info         className="w-3 h-3" />, label: 'System'   },
};

export function ActivityFeed() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const pick = () => MESSAGE_POOL[Math.floor(Math.random() * MESSAGE_POOL.length)];
    const initial: LogEntry[] = Array.from({ length: 6 }).map((_, i) => ({
      id: `init-${i}`,
      time: new Date(Date.now() - (6 - i) * 6000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
      ...pick(),
    }));
    setLogs(initial);

    const iv = setInterval(() => {
      setLogs(prev => {
        const entry: LogEntry = {
          id: Math.random().toString(36).substring(7),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
          ...pick(),
        };
        const next = [...prev, entry];
        return next.length > 20 ? next.slice(next.length - 20) : next;
      });
    }, 3500);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <Card className="flex flex-col h-[500px] lg:h-full border-border bg-card/50 backdrop-blur-sm overflow-hidden">
      <div className="p-4 border-b border-border bg-card/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm tracking-wide uppercase text-foreground">Live Activity Feed</h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground">
            <Zap className="w-3 h-3 text-primary" />{logs.length} events
          </div>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="text-xs text-muted-foreground font-mono">Live</span>
          </div>
        </div>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3">
        <div className="flex flex-col gap-2">
          {logs.map((log) => {
            const meta = statusMeta[log.status];
            return (
              <div
                key={log.id}
                className="animate-in slide-in-from-bottom-2 fade-in duration-400 p-3 rounded-lg bg-secondary/25 border border-border/40 hover:bg-secondary/40 transition-colors"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono text-muted-foreground/70">{log.time}</span>
                  <div className="flex items-center gap-1.5">
                    {log.carrier && (
                      <span className="text-[9px] font-mono text-muted-foreground/60 bg-secondary/60 px-1.5 py-0.5 rounded">
                        {log.carrier}
                      </span>
                    )}
                    <Badge variant="outline" className={`text-[9px] px-1.5 py-0 h-4 font-sans uppercase tracking-wider gap-0.5 ${meta.color}`}>
                      {meta.icon}{meta.label}
                    </Badge>
                  </div>
                </div>
                <p className="text-xs font-mono text-foreground/80 leading-snug">{log.text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
