const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const OpenAI = require("openai");

const app = express();
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: "30kb" }));
app.use(express.static("public"));

app.use("/api/", rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false
}));

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.post("/api/chat", async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({ error: "کلید هوش مصنوعی هنوز در تنظیمات سرور ثبت نشده است." });
    }
    const messages = req.body.messages;
    if (!Array.isArray(messages) || messages.length === 0 || messages.length > 30) {
      return res.status(400).json({ error: "پیام‌ها درست ارسال نشده‌اند." });
    }
    const input = messages
      .filter(m => m && ["user", "assistant"].includes(m.role) && typeof m.content === "string")
      .map(m => ({ role: m.role, content: m.content.slice(0, 6000) }));
    if (!input.length || input[input.length - 1].role !== "user") {
      return res.status(400).json({ error: "لطفاً یک پیام بنویسید." });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      instructions: "You are Shifa AI, a helpful, respectful assistant. Reply in the language used by the user, including Dari/Persian or English. For medical, legal, and financial topics, provide general information, explain uncertainty, and encourage professional help when appropriate. Do not claim to be a doctor or provide a definitive diagnosis.",
      input
    });
    res.json({ reply: response.output_text || "پاسخی دریافت نشد." });
  } catch (err) {
    console.error("Chat API error:", err.message);
    res.status(500).json({ error: "در پاسخ‌گویی مشکلی رخ داد. لطفاً دوباره کوشش کنید." });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Shifa AI listening on ${port}`));