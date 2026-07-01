import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Globe, AlertTriangle } from 'lucide-react';
import { useCountdown } from '../hooks/useCountdown';

interface CountdownBannerProps {
  until: number;
}

export function CountdownBanner({ until }: CountdownBannerProps) {
  const { formatted, remaining, expired, active } = useCountdown(until);

  if (!active) return null;

  const critical  = !expired && remaining < 10 * 60_000;
  const warning   = !expired && !critical && remaining < 30 * 60_000;

  const bg     = expired  ? 'bg-red-950/40 border-red-500/40'
               : critical ? 'bg-red-500/10 border-red-500/30'
               : warning  ? 'bg-orange-500/10 border-orange-500/30'
                          : 'bg-amber-500/10 border-amber-500/30';

  const color  = expired  ? 'text-red-400'
               : critical ? 'text-red-400'
               : warning  ? 'text-orange-400'
                          : 'text-amber-400';

  const pulse  = !expired && critical;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-center gap-4 p-4 rounded-xl border ${bg}`}
      >
        <div className={`shrink-0 ${pulse ? 'animate-pulse' : ''}`}>
          {expired
            ? <AlertTriangle className="w-6 h-6 text-red-400" />
            : <Timer className={`w-6 h-6 ${color}`} />
          }
        </div>

        <div className="flex-1 min-w-0">
          <p className={`text-[10px] font-mono uppercase tracking-widest mb-0.5 ${color} opacity-70`}>
            {expired ? 'Processing Window' : 'Processing Window Closes In'}
          </p>

          {expired ? (
            <p className="text-lg font-black text-red-400">Window Expired</p>
          ) : (
            <motion.p
              key={formatted}
              className={`text-3xl font-black font-mono tabular-nums leading-none ${color}`}
            >
              {formatted}
            </motion.p>
          )}

          <div className="flex items-center gap-1.5 mt-1.5">
            <Globe className="w-2.5 h-2.5 text-muted-foreground/50" />
            <p className="text-[10px] text-muted-foreground/50 font-mono">
              UTC-synced · same countdown from any country
            </p>
          </div>
        </div>

        {/* Progress ring visual */}
        {!expired && (
          <div className="shrink-0 hidden sm:flex flex-col items-center gap-0.5">
            <div className={`text-xs font-bold font-mono ${color}`}>
              {Math.floor(remaining / 3_600_000)}h {Math.floor((remaining % 3_600_000) / 60_000)}m
            </div>
            <div className="text-[9px] text-muted-foreground/40 font-mono uppercase">remaining</div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
