import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

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

interface OrdersContextValue {
  orders: Order[];
  credits: number;
  loading: boolean;
  updateOrder: (id: string, patch: Partial<Order>) => Promise<void>;
  addOrder: (order: Order) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  addEvent: (orderId: string, event: Order['events'][number]) => Promise<void>;
  removeEvent: (orderId: string, index: number) => Promise<void>;
  setCountdown: (id: string, until: number | undefined) => void;
  adjustCredits: (delta: number) => Promise<void>;
  setCredits: (n: number) => Promise<void>;
  refetch: () => Promise<void>;
}

const OrdersContext = createContext<OrdersContextValue | null>(null);

const API = '/api';

async function apiFetch(path: string, opts?: RequestInit) {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (!res.ok) throw new Error(`API ${path} failed: ${res.status}`);
  return res.json();
}

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders]   = useState<Order[]>([]);
  const [credits, setCreditsState] = useState(24);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    try {
      const [ordersData, creditsData] = await Promise.all([
        apiFetch('/orders'),
        apiFetch('/credits'),
      ]);
      setOrders(ordersData as Order[]);
      setCreditsState((creditsData as any).credits ?? 24);
    } catch (e) {
      console.error('OrdersContext fetchAll error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 10_000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  const updateOrder = useCallback(async (id: string, patch: Partial<Order>) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, ...patch } : o));
    await apiFetch(`/orders/${id}`, { method: 'PATCH', body: JSON.stringify(patch) });
  }, []);

  const addOrder = useCallback(async (order: Order) => {
    setOrders(prev => [order, ...prev]);
    await apiFetch('/orders', { method: 'POST', body: JSON.stringify(order) });
  }, []);

  const deleteOrder = useCallback(async (id: string) => {
    setOrders(prev => prev.filter(o => o.id !== id));
    await apiFetch(`/orders/${id}`, { method: 'DELETE' });
  }, []);

  const addEvent = useCallback(async (orderId: string, event: Order['events'][number]) => {
    setOrders(prev => prev.map(o =>
      o.id === orderId ? { ...o, events: [...o.events, event] } : o
    ));
    const order = orders.find(o => o.id === orderId);
    if (order) {
      const updated = { ...order, events: [...order.events, event] };
      await apiFetch(`/orders/${orderId}`, { method: 'PATCH', body: JSON.stringify(updated) });
    }
  }, [orders]);

  const removeEvent = useCallback(async (orderId: string, index: number) => {
    setOrders(prev => prev.map(o =>
      o.id === orderId ? { ...o, events: o.events.filter((_, i) => i !== index) } : o
    ));
    const order = orders.find(o => o.id === orderId);
    if (order) {
      const updated = { ...order, events: order.events.filter((_, i) => i !== index) };
      await apiFetch(`/orders/${orderId}`, { method: 'PATCH', body: JSON.stringify(updated) });
    }
  }, [orders]);

  const setCountdown = useCallback((id: string, until: number | undefined) => {
    try {
      if (until !== undefined) localStorage.setItem(`utech_cd_${id}`, String(until));
      else localStorage.removeItem(`utech_cd_${id}`);
    } catch {}
    setOrders(prev => prev.map(o => o.id === id ? { ...o, countdownUntil: until } : o));
  }, []);

  const adjustCredits = useCallback(async (delta: number) => {
    setCreditsState(prev => Math.max(0, Math.round((prev + delta) * 100) / 100));
    await apiFetch('/credits/adjust', { method: 'POST', body: JSON.stringify({ delta }) });
  }, []);

  const setCredits = useCallback(async (n: number) => {
    const safe = Math.max(0, Math.round(n * 100) / 100);
    setCreditsState(safe);
    await apiFetch('/credits/set', { method: 'POST', body: JSON.stringify({ amount: safe }) });
  }, []);

  return (
    <OrdersContext.Provider value={{
      orders, credits, loading,
      updateOrder, addOrder, deleteOrder, addEvent, removeEvent,
      setCountdown, adjustCredits, setCredits, refetch: fetchAll,
    }}>
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error('useOrders must be used within OrdersProvider');
  return ctx;
}
