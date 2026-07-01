import { Router } from "express";
import { db, chatMessagesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function nowStr() {
  return new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
}

const WELCOME = {
  id: "welcome",
  fromRole: "admin",
  text: "👋 Hi! We're live and ready to help. How can we assist you today?",
  timestamp: nowStr(),
  read: true,
};

router.get("/", async (req, res) => {
  try {
    let rows = await db.select().from(chatMessagesTable).orderBy(chatMessagesTable.createdAt);
    if (rows.length === 0) {
      await db.insert(chatMessagesTable).values({
        id: WELCOME.id,
        fromRole: WELCOME.fromRole,
        text: WELCOME.text,
        timestamp: WELCOME.timestamp,
        read: WELCOME.read,
      });
      rows = await db.select().from(chatMessagesTable).orderBy(chatMessagesTable.createdAt);
    }
    const messages = rows.map(r => ({
      id: r.id,
      from: r.fromRole,
      text: r.text,
      timestamp: r.timestamp,
      fileUrl: r.fileUrl ?? undefined,
      fileName: r.fileName ?? undefined,
      fileType: r.fileType ?? undefined,
      read: r.read ?? true,
    }));
    res.json(messages);
  } catch (err) {
    req.log.error({ err }, "GET /chat failed");
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { from, text, fileUrl, fileName, fileType } = req.body;
    if (!from || !text) { res.status(400).json({ error: "from and text are required" }); return; }
    const id = genId();
    const timestamp = nowStr();
    await db.insert(chatMessagesTable).values({
      id, fromRole: from, text, timestamp,
      fileUrl: fileUrl ?? null,
      fileName: fileName ?? null,
      fileType: fileType ?? null,
      read: from === "admin",
    });
    res.json({ ok: true, id, timestamp });
  } catch (err) {
    req.log.error({ err }, "POST /chat failed");
    res.status(500).json({ error: "Failed to send message" });
  }
});

router.patch("/:id/read", async (req, res) => {
  try {
    await db.update(chatMessagesTable).set({ read: true }).where(eq(chatMessagesTable.id, req.params.id));
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "PATCH /chat/:id/read failed");
    res.status(500).json({ error: "Failed to mark read" });
  }
});

router.post("/mark-all-read", async (req, res) => {
  try {
    await db.update(chatMessagesTable).set({ read: true });
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "POST /chat/mark-all-read failed");
    res.status(500).json({ error: "Failed to mark all read" });
  }
});

router.delete("/", async (req, res) => {
  try {
    await db.delete(chatMessagesTable);
    await db.insert(chatMessagesTable).values({
      id: WELCOME.id,
      fromRole: WELCOME.fromRole,
      text: WELCOME.text,
      timestamp: nowStr(),
      read: true,
    });
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "DELETE /chat failed");
    res.status(500).json({ error: "Failed to clear chat" });
  }
});

export default router;
