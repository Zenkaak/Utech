import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Order {
  id: string;
  imeis: string[];
  carrier: string;
  status: 'success' | 'processing' | 'queued';
  date: string;
  submittedAt: string;
  updatedAt: string;
  region: string;
  ref: string;
  events: { time: string; msg: string; type: 'ok' | 'info' | 'warn' }[];
  creditAlert?: 'exhausted' | 'low';
  progress?: number;
  countdownUntil?: number;
  verificationFlow?: boolean;
  paymentPendingImei?: string;
}

const ORDERS_KEY  = 'utech_orders';
const CREDITS_KEY = 'utech_credits';

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-20848',
    imeis: ['353875189689979','353948891968208','356978861734589','353335934696683','352048091968208'],
    carrier: 'Mixed',
    status: 'success',
    date: 'Jun 29, 2026 08:56',
    submittedAt: 'Jun 29, 2026 8:56 AM',
    updatedAt: 'Jun 29, 2026 10:22 AM',
    region: 'Mixed',
    ref: 'UTK-ZHVXLCICB',
    progress: 100,
    paymentPendingImei: '353114100731092',
    events: [
      { time: '08:56 AM', msg: 'Batch request received — 5 devices submitted', type: 'ok' },
      { time: '08:56 AM', msg: 'All 5 IMEIs validated via Luhn algorithm — PASS', type: 'ok' },
      { time: '08:56 AM', msg: 'Carrier locks identified per IMEI', type: 'ok' },
      { time: '08:57 AM', msg: 'Jobs queued — awaiting processor slot', type: 'info' },
      { time: '09:14 AM', msg: 'Processing started — unlock cluster active', type: 'info' },
      { time: '09:31 AM', msg: 'Device 1 (353875189689979) — Unlock delivered successfully', type: 'ok' },
      { time: '09:38 AM', msg: 'Device 2 (353948891968208) — Unlock delivered successfully', type: 'ok' },
      { time: '09:45 AM', msg: 'Device 3 (356978861734589) — Unlock delivered successfully', type: 'ok' },
      { time: '09:52 AM', msg: 'Device 4 (353335934696683) — Unlock delivered successfully', type: 'ok' },
      { time: '10:01 AM', msg: 'Device 5 (352048091968208) — Unlock delivered successfully', type: 'ok' },
      { time: '10:02 AM', msg: 'All 5 devices unlocked successfully — batch complete', type: 'ok' },
      { time: '10:05 AM', msg: 'WARNING: IMEI 353114100731092 — unlock completed, payment not received. Complete payment to receive unlock instructions.', type: 'warn' },
    ],
  },
  {
    id: 'ORD-20847',
    imeis: ['352456789012345'],
    carrier: 'AT&T USA',
    status: 'processing',
    date: 'Jun 22, 2026 11:42',
    submittedAt: 'Jun 22, 2026 11:42 AM',
    updatedAt: 'Jun 22, 2026 12:01 PM',
    region: 'North America',
    ref: 'UTK-A3R9KZ2M',
    events: [
      { time: '11:42 AM', msg: 'Request received and logged', type: 'ok' },
      { time: '11:42 AM', msg: 'IMEI validated via Luhn algorithm — PASS', type: 'ok' },
      { time: '11:43 AM', msg: 'Carrier lock confirmed — AT&T USA', type: 'ok' },
      { time: '11:44 AM', msg: 'Job queued — position assigned', type: 'ok' },
      { time: '12:01 PM', msg: 'Processing started — unlock cluster active', type: 'info' },
    ],
  },
  {
    id: 'ORD-20846',
    imeis: ['864123456789012'],
    carrier: 'T-Mobile USA',
    status: 'success',
    date: 'Jun 22, 2026 10:15',
    submittedAt: 'Jun 22, 2026 10:15 AM',
    updatedAt: 'Jun 22, 2026 10:39 AM',
    region: 'North America',
    ref: 'UTK-B7YQP14N',
    events: [
      { time: '10:15 AM', msg: 'Request received and logged', type: 'ok' },
      { time: '10:15 AM', msg: 'IMEI validated via Luhn algorithm — PASS', type: 'ok' },
      { time: '10:16 AM', msg: 'Carrier lock confirmed — T-Mobile USA', type: 'ok' },
      { time: '10:17 AM', msg: 'Job queued — priority: standard', type: 'ok' },
      { time: '10:22 AM', msg: 'Processing started — unlock cluster active', type: 'info' },
      { time: '10:39 AM', msg: 'Unlock delivered successfully — device is now unlocked', type: 'ok' },
    ],
  },
  {
    id: 'ORD-20845',
    imeis: ['490987654321098'],
    carrier: 'Verizon USA',
    status: 'processing',
    date: 'Jun 22, 2026 09:30',
    submittedAt: 'Jun 22, 2026 09:30 AM',
    updatedAt: 'Jun 22, 2026 09:48 AM',
    region: 'North America',
    ref: 'UTK-C2WDT85R',
    events: [
      { time: '09:30 AM', msg: 'Request received and logged', type: 'ok' },
      { time: '09:31 AM', msg: 'IMEI validated via Luhn algorithm — PASS', type: 'ok' },
      { time: '09:31 AM', msg: 'Carrier lock confirmed — Verizon USA', type: 'ok' },
      { time: '09:32 AM', msg: 'Job queued — awaiting processor slot', type: 'info' },
      { time: '09:48 AM', msg: 'Processing started — unlock cluster active', type: 'info' },
    ],
  },
  {
    id: 'ORD-20844',
    imeis: ['358741258963014'],
    carrier: 'O2 UK',
    status: 'success',
    date: 'Jun 21, 2026 14:20',
    submittedAt: 'Jun 21, 2026 2:20 PM',
    updatedAt: 'Jun 21, 2026 2:47 PM',
    region: 'Europe',
    ref: 'UTK-D9XKL37Q',
    events: [
      { time: '02:20 PM', msg: 'Request received and logged', type: 'ok' },
      { time: '02:20 PM', msg: 'IMEI validated via Luhn algorithm — PASS', type: 'ok' },
      { time: '02:21 PM', msg: 'Carrier lock confirmed — O2 UK', type: 'ok' },
      { time: '02:22 PM', msg: 'Job queued — priority: standard', type: 'ok' },
      { time: '02:29 PM', msg: 'Processing started — unlock cluster active', type: 'info' },
      { time: '02:47 PM', msg: 'Unlock delivered successfully — device is now unlocked', type: 'ok' },
    ],
  },
  {
    id: 'ORD-20843',
    imeis: ['861369258014785'],
    carrier: 'Vodafone DE',
    status: 'queued',
    date: 'Jun 21, 2026 11:05',
    submittedAt: 'Jun 21, 2026 11:05 AM',
    updatedAt: 'Jun 21, 2026 11:06 AM',
    region: 'Europe',
    ref: 'UTK-E4MNP62V',
    events: [
      { time: '11:05 AM', msg: 'Request received and logged', type: 'ok' },
      { time: '11:05 AM', msg: 'IMEI validated via Luhn algorithm — PASS', type: 'ok' },
      { time: '11:06 AM', msg: 'Carrier lock confirmed — Vodafone DE', type: 'ok' },
      { time: '11:06 AM', msg: 'Job queued — awaiting processor slot', type: 'info' },
    ],
  },
];

const INITIAL_CREDITS = 24;

function loadOrders(): Order[] {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Order[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return INITIAL_ORDERS;
}

function loadCredits(): number {
  try {
    const raw = localStorage.getItem(CREDITS_KEY);
    if (raw !== null) return Number(raw) || INITIAL_CREDITS;
  } catch {}
  return INITIAL_CREDITS;
}

interface OrdersContextValue {
  orders: Order[];
  credits: number;
  updateOrder: (id: string, patch: Partial<Order>) => void;
  addOrder: (order: Order) => void;
  deleteOrder: (id: string) => void;
  addEvent: (orderId: string, event: Order['events'][number]) => void;
  removeEvent: (orderId: string, index: number) => void;
  setCountdown: (id: string, until: number | undefined) => void;
  adjustCredits: (delta: number) => void;
  setCredits: (n: number) => void;
}

const OrdersContext = createContext<OrdersContextValue | null>(null);

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders]           = useState<Order[]>(loadOrders);
  const [creditsState, setCreditsState] = useState<number>(loadCredits);

  // Persist orders to localStorage whenever they change
  useEffect(() => {
    try { localStorage.setItem(ORDERS_KEY, JSON.stringify(orders)); } catch {}
  }, [orders]);

  // Persist credits
  useEffect(() => {
    try { localStorage.setItem(CREDITS_KEY, String(creditsState)); } catch {}
  }, [creditsState]);

  // Cross-tab sync — admin panel changes reflect on user dashboard immediately
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === ORDERS_KEY && e.newValue) {
        try {
          const updated = JSON.parse(e.newValue) as Order[];
          if (Array.isArray(updated)) setOrders(updated);
        } catch {}
      }
      if (e.key === CREDITS_KEY && e.newValue !== null) {
        setCreditsState(Number(e.newValue) || 0);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const updateOrder = (id: string, patch: Partial<Order>) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, ...patch } : o));
  };

  const addOrder = (order: Order) => {
    setOrders(prev => [order, ...prev]);
  };

  const deleteOrder = (id: string) => {
    setOrders(prev => prev.filter(o => o.id !== id));
  };

  const addEvent = (orderId: string, event: Order['events'][number]) => {
    setOrders(prev => prev.map(o =>
      o.id === orderId ? { ...o, events: [...o.events, event] } : o
    ));
  };

  const removeEvent = (orderId: string, index: number) => {
    setOrders(prev => prev.map(o =>
      o.id === orderId ? { ...o, events: o.events.filter((_, i) => i !== index) } : o
    ));
  };

  const setCountdown = (id: string, until: number | undefined) => {
    try {
      if (until !== undefined) localStorage.setItem(`utech_cd_${id}`, String(until));
      else localStorage.removeItem(`utech_cd_${id}`);
    } catch {}
    setOrders(prev => prev.map(o => o.id === id ? { ...o, countdownUntil: until } : o));
  };

  const adjustCredits = (delta: number) => {
    setCreditsState(prev => Math.max(0, Math.round((prev + delta) * 100) / 100));
  };

  const setCredits = (n: number) => {
    setCreditsState(Math.max(0, Math.round(n * 100) / 100));
  };

  return (
    <OrdersContext.Provider value={{ orders, credits: creditsState, updateOrder, addOrder, deleteOrder, addEvent, removeEvent, setCountdown, adjustCredits, setCredits }}>
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error('useOrders must be used within OrdersProvider');
  return ctx;
}
