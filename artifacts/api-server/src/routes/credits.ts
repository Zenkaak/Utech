import { Router } from "express";
import { db, settingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();
const CREDITS_KEY = "credits";
const DEFAULT_CREDITS = 24;

router.get("/", async (req, res) => {
  try {
    const rows = await db.select().from(settingsTable).where(eq(settingsTable.key, CREDITS_KEY));
    const amount = rows.length > 0 ? Number(rows[0].value) : DEFAULT_CREDITS;
    if (rows.length === 0) {
      await db.insert(settingsTable).values({ key: CREDITS_KEY, value: String(DEFAULT_CREDITS) });
    }
    res.json({ credits: amount });
  } catch (err) {
    req.log.error({ err }, "GET /credits failed");
    res.status(500).json({ error: "Failed to fetch credits" });
  }
});

router.post("/set", async (req, res) => {
  try {
    const { amount } = req.body;
    if (typeof amount !== "number") { res.status(400).json({ error: "amount must be a number" }); return; }
    const value = String(Math.max(0, Math.round(amount * 100) / 100));
    await db.insert(settingsTable)
      .values({ key: CREDITS_KEY, value })
      .onConflictDoUpdate({ target: settingsTable.key, set: { value } });
    res.json({ ok: true, credits: Number(value) });
  } catch (err) {
    req.log.error({ err }, "POST /credits/set failed");
    res.status(500).json({ error: "Failed to set credits" });
  }
});

router.post("/adjust", async (req, res) => {
  try {
    const { delta } = req.body;
    if (typeof delta !== "number") { res.status(400).json({ error: "delta must be a number" }); return; }
    const rows = await db.select().from(settingsTable).where(eq(settingsTable.key, CREDITS_KEY));
    const current = rows.length > 0 ? Number(rows[0].value) : DEFAULT_CREDITS;
    const next = Math.max(0, Math.round((current + delta) * 100) / 100);
    await db.insert(settingsTable)
      .values({ key: CREDITS_KEY, value: String(next) })
      .onConflictDoUpdate({ target: settingsTable.key, set: { value: String(next) } });
    res.json({ ok: true, credits: next });
  } catch (err) {
    req.log.error({ err }, "POST /credits/adjust failed");
    res.status(500).json({ error: "Failed to adjust credits" });
  }
});

export default router;
