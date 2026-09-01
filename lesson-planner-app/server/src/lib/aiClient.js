import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt, buildUserPrompt } from "./prompts.js";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";

let client = null;
function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}

function fallbackContent(params) {
  const { subject, topic, contentType, grade } = params;
  return `## הערה
לא הוגדר מפתח ANTHROPIC_API_KEY בשרת, לכן זהו תוכן דוגמה בלבד ולא תוכן שנוצר על ידי הבינה המלאכותית.
הגדירו את המפתח בקובץ .env כדי לקבל ${contentType === "presentation" ? "מצגת" : "מערך שיעור"} מלא שנוצר אוטומטית.

## נושא
${topic} (מקצוע: ${subject}, כיתה ${grade})

## שלד הצעה
1. פתיחה ומוטיבציה
2. גוף השיעור / תוכן השקפים המרכזי
3. תרגול / פעילות
4. סיכום והערכה`;
}

export async function generateLessonContent(params) {
  const anthropic = getClient();
  if (!anthropic) {
    return { content: fallbackContent(params), source: "fallback" };
  }

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: buildSystemPrompt(),
    messages: [{ role: "user", content: buildUserPrompt(params) }],
  });

  const content = message.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n");

  return { content, source: "anthropic", model: MODEL };
}
