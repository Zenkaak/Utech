import { Router } from "express";
import { db, ordersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

const INITIAL_ORDERS = [
  {
    id: "ORD-20848",
    imeis: ["353875189689979","353948891968208","356978861734589","353335934696683","352048091968208"],
    carrier: "Mixed", status: "success",
    date: "Jun 29, 2026 08:56", submittedAt: "Jun 29, 2026 8:56 AM", updatedAt: "Jun 29, 2026 10:22 AM",
    region: "Mixed", ref: "UTK-ZHVXLCICB", progress: 100,
    paymentPendingImei: "353114100731092",
    events: [
      { time: "08:56 AM", msg: "Batch request received — 5 devices submitted", type: "ok" },
      { time: "08:56 AM", msg: "All 5 IMEIs validated via Luhn algorithm — PASS", type: "ok" },
      { time: "08:56 AM", msg: "Carrier locks identified per IMEI", type: "ok" },
      { time: "08:57 AM", msg: "Jobs queued — awaiting processor slot", type: "info" },
      { time: "09:14 AM", msg: "Processing started — unlock cluster active", type: "info" },
      { time: "09:31 AM", msg: "Device 1 (353875189689979) — Unlock delivered successfully", type: "ok" },
      { time: "09:38 AM", msg: "Device 2 (353948891968208) — Unlock delivered successfully", type: "ok" },
      { time: "09:45 AM", msg: "Device 3 (356978861734589) — Unlock delivered successfully", type: "ok" },
      { time: "09:52 AM", msg: "Device 4 (353335934696683) — Unlock delivered successfully", type: "ok" },
      { time: "10:01 AM", msg: "Device 5 (352048091968208) — Unlock delivered successfully", type: "ok" },
      { time: "10:02 AM", msg: "All 5 devices unlocked successfully — batch complete", type: "ok" },
      { time: "10:05 AM", msg: "WARNING: IMEI 353114100731092 — unlock completed, payment not received.", type: "warn" },
    ],
  },
  {
    id: "ORD-20847", imeis: ["352456789012345"], carrier: "AT&T USA", status: "processing",
    date: "Jun 22, 2026 11:42", submittedAt: "Jun 22, 2026 11:42 AM", updatedAt: "Jun 22, 2026 12:01 PM",
    region: "North America", ref: "UTK-A3R9KZ2M",
    events: [
      { time: "11:42 AM", msg: "Request received and logged", type: "ok" },
      { time: "11:42 AM", msg: "IMEI validated via Luhn algorithm — PASS", type: "ok" },
      { time: "11:43 AM", msg: "Carrier lock confirmed — AT&T USA", type: "ok" },
      { time: "11:44 AM", msg: "Job queued — position assigned", type: "ok" },
      { time: "12:01 PM", msg: "Processing started — unlock cluster active", type: "info" },
    ],
  },
  {
    id: "ORD-20846", imeis: ["864123456789012"], carrier: "T-Mobile USA", status: "success",
    date: "Jun 22, 2026 10:15", submittedAt: "Jun 22, 2026 10:15 AM", updatedAt: "Jun 22, 2026 10:39 AM",
    region: "North America", ref: "UTK-B7YQP14N",
    events: [
      { time: "10:15 AM", msg: "Request received and logged", type: "ok" },
      { time: "10:15 AM", msg: "IMEI validated via Luhn algorithm — PASS", type: "ok" },
      { time: "10:16 AM", msg: "Carrier lock confirmed — T-Mobile USA", type: "ok" },
      { time: "10:17 AM", msg: "Job queued — priority: standard", type: "ok" },
      { time: "10:22 AM", msg: "Processing started — unlock cluster active", type: "info" },
      { time: "10:39 AM", msg: "Unlock delivered successfully — device is now unlocked", type: "ok" },
    ],
  },
  {
    id: "ORD-20845", imeis: ["490987654321098"], carrier: "Verizon USA", status: "processing",
    date: "Jun 22, 2026 09:30", submittedAt: "Jun 22, 2026 09:30 AM", updatedAt: "Jun 22, 2026 09:48 AM",
    region: "North America", ref: "UTK-C2WDT85R",
    events: [
      { time: "09:30 AM", msg: "Request received and logged", type: "ok" },
      { time: "09:31 AM", msg: "IMEI validated via Luhn algorithm — PASS", type: "ok" },
      { time: "09:31 AM", msg: "Carrier lock confirmed — Verizon USA", type: "ok" },
      { time: "09:32 AM", msg: "Job queued — awaiting processor slot", type: "info" },
      { time: "09:48 AM", msg: "Processing started — unlock cluster active", type: "info" },
    ],
  },
  {
    id: "ORD-20844", imeis: ["358741258963014"], carrier: "O2 UK", status: "success",
    date: "Jun 21, 2026 14:20", submittedAt: "Jun 21, 2026 2:20 PM", updatedAt: "Jun 21, 2026 2:47 PM",
    region: "Europe", ref: "UTK-D9XKL37Q",
    events: [
      { time: "02:20 PM", msg: "Request received and logged", type: "ok" },
      { time: "02:20 PM", msg: "IMEI validated via Luhn algorithm — PASS", type: "ok" },
      { time: "02:21 PM", msg: "Carrier lock confirmed — O2 UK", type: "ok" },
      { time: "02:22 PM", msg: "Job queued — priority: standard", type: "ok" },
      { time: "02:29 PM", msg: "Processing started — unlock cluster active", type: "info" },
      { time: "02:47 PM", msg: "Unlock delivered successfully — device is now unlocked", type: "ok" },
    ],
  },
  {
    id: "ORD-20843", imeis: ["861369258014785"], carrier: "Vodafone DE", status: "queued",
    date: "Jun 21, 2026 11:05", submittedAt: "Jun 21, 2026 11:05 AM", updatedAt: "Jun 21, 2026 11:06 AM",
    region: "Europe", ref: "UTK-E4MNP62V",
    events: [
      { time: "11:05 AM", msg: "Request received and logged", type: "ok" },
      { time: "11:05 AM", msg: "IMEI validated via Luhn algorithm — PASS", type: "ok" },
      { time: "11:06 AM", msg: "Carrier lock confirmed — Vodafone DE", type: "ok" },
      { time: "11:06 AM", msg: "Job queued — awaiting processor slot", type: "info" },
    ],
  },
];

router.get("/", async (req, res) => {
  try {
    let rows = await db.select().from(ordersTable);
    if (rows.length === 0) {
      await db.insert(ordersTable).values(
        INITIAL_ORDERS.map(o => ({ id: o.id, data: o }))
      );
      rows = await db.select().from(ordersTable);
    }
    const orders = rows
      .map(r => ({ ...(r.data as object), id: r.id, _createdAt: r.createdAt }))
      .sort((a: any, b: any) => new Date(b._createdAt ?? 0).getTime() - new Date(a._createdAt ?? 0).getTime())
      .map(({ _createdAt, ...o }) => o);
    res.json(orders);
  } catch (err) {
    req.log.error({ err }, "GET /orders failed");
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

router.post("/", async (req, res) => {
  try {
    const order = req.body;
    if (!order?.id) { res.status(400).json({ error: "order.id is required" }); return; }
    await db.insert(ordersTable).values({ id: order.id, data: order })
      .onConflictDoUpdate({ target: ordersTable.id, set: { data: order } });
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "POST /orders failed");
    res.status(500).json({ error: "Failed to create order" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const rows = await db.select().from(ordersTable).where(eq(ordersTable.id, id));
    if (rows.length === 0) { res.status(404).json({ error: "Order not found" }); return; }
    const existing = rows[0].data as object;
    const updated = { ...existing, ...req.body, id };
    await db.update(ordersTable).set({ data: updated }).where(eq(ordersTable.id, id));
    res.json({ ok: true, order: updated });
  } catch (err) {
    req.log.error({ err }, "PATCH /orders/:id failed");
    res.status(500).json({ error: "Failed to update order" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await db.delete(ordersTable).where(eq(ordersTable.id, req.params.id));
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "DELETE /orders/:id failed");
    res.status(500).json({ error: "Failed to delete order" });
  }
});

router.post("/seed/reset", async (req, res) => {
  try {
    await db.delete(ordersTable);
    await db.insert(ordersTable).values(INITIAL_ORDERS.map(o => ({ id: o.id, data: o })));
    res.json({ ok: true, seeded: INITIAL_ORDERS.length });
  } catch (err) {
    req.log.error({ err }, "POST /orders/seed/reset failed");
    res.status(500).json({ error: "Failed to reset orders" });
  }
});

export default router;
