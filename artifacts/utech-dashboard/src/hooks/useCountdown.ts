import { useState, useEffect } from 'react';

export function useCountdown(until?: number) {
  const [remaining, setRemaining] = useState(() =>
    until ? Math.max(0, until - Date.now()) : 0
  );

  useEffect(() => {
    if (!until) { setRemaining(0); return; }
    const tick = () => setRemaining(Math.max(0, until - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [until]);

  const h = Math.floor(remaining / 3_600_000);
  const m = Math.floor((remaining % 3_600_000) / 60_000);
  const s = Math.floor((remaining % 60_000) / 1_000);

  return {
    remaining,
    expired: until ? remaining === 0 : false,
    active: !!until,
    formatted: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`,
    hours: h,
    minutes: m,
    seconds: s,
  };
}
