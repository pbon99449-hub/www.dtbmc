import { NextResponse } from "next/server";

function getOfflineReply(text) {
  const q = text.toLowerCase();

  if (q.includes("hi") || q.includes("hello") || q.includes("assalamu") || q.includes("hey")) {
    return "বাংলা: হাই! আমি আছি। বাংলা বা ইংরেজিতে প্রশ্ন করতে পারো।\n\nEnglish: Hi! I am here. You can ask in Bangla or English.";
  }
  if (q.includes("thanks") || q.includes("dhonnobad") || q.includes("thank you")) {
    return "বাংলা: স্বাগতম।\n\nEnglish: You are welcome.";
  }
  if (q.includes("name")) {
    return "বাংলা: আমি তোমার AI chat assistant।\n\nEnglish: I am your AI chat assistant.";
  }

  return `বাংলা: আমি তোমার মেসেজটি বুঝেছি: "${text}"। OpenAI quota/rate limit ঠিক হলে আমি full answer দিতে পারব।\n\nEnglish: I understood your message: "${text}". I can provide full answers once OpenAI quota/rate limit is resolved.`;
}

function extractText(responseJson) {
  if (!responseJson) return "";

  if (typeof responseJson.output_text === "string" && responseJson.output_text) {
    return responseJson.output_text.trim();
  }

  const output = Array.isArray(responseJson.output) ? responseJson.output : [];
  for (const item of output) {
    const content = Array.isArray(item?.content) ? item.content : [];
    for (const part of content) {
      if (part?.type === "output_text" && typeof part?.text === "string") {
        return part.text.trim();
      }
    }
  }
  return "";
}

function getErrorText(errorJson) {
  const message = errorJson?.error?.message;
  return typeof message === "string" ? message : "";
}

function getStatusMessage(status, errorText) {
  if (status === 429) {
    return [
      "বাংলা: OpenAI rate limit বা quota শেষ হয়ে গেছে। Billing/usage check করে আবার চেষ্টা করো।",
      "English: OpenAI rate limit was hit or quota is exhausted. Check billing/usage and retry."
    ].join("\n\n");
  }

  if (status === 401 || status === 403) {
    return [
      "বাংলা: API key invalid বা permission সমস্যা আছে। .env.local এর key verify করো।",
      "English: The API key is invalid or lacks permission. Verify the key in .env.local."
    ].join("\n\n");
  }

  const extra = errorText ? ` (${errorText})` : "";
  return [
    `বাংলা: এই মুহূর্তে AI service পাওয়া যাচ্ছে না${extra}।`,
    `English: The AI service is unavailable right now${extra}.`
  ].join("\n\n");
}

const RETRYABLE_STATUSES = new Set([408, 409, 429, 500, 502, 503, 504]);

async function callResponses({ apiKey, model, input }) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  let response;
  try {
    response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({ model, input }),
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeoutId);
  }

  let json = null;
  try {
    json = await response.json();
  } catch {
    json = null;
  }

  return { ok: response.ok, status: response.status, json };
}

export async function POST(request) {
  try {
    const { message, messages } = await request.json();
    const text = String(message || "").trim();

    if (!text) {
      return NextResponse.json(
        { reply: "বাংলা: একটি প্রশ্ন লিখো।\n\nEnglish: Please ask a question." },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ reply: getOfflineReply(text) });
    }

    const primaryModel = process.env.OPENAI_MODEL || "gpt-4.1-mini";
    const fallbackModel = process.env.OPENAI_FALLBACK_MODEL || "gpt-4o-mini";
    const models = [...new Set([primaryModel, fallbackModel])];

    const history = Array.isArray(messages)
      ? messages
          .filter((item) => item && typeof item.text === "string" && item.text.trim())
          .slice(-20)
          .map((item) => ({
            role: item.role === "user" ? "user" : "assistant",
            content: item.text.trim()
          }))
      : [];

    const systemPrompt = [
      "You are a helpful AI assistant similar to ChatGPT.",
      "You understand Bangla, English, and mixed Banglish.",
      "Always answer with two short sections in this order: 'বাংলা:' then 'English:'.",
      "Answer directly and clearly.",
      "If unsure, say that clearly and do not invent facts."
    ].join("\n");

    const input = [{ role: "system", content: systemPrompt }, ...history];
    const lastHistoryItem = history[history.length - 1];
    const hasLatestUserMessage =
      lastHistoryItem?.role === "user" && lastHistoryItem?.content === text;

    if (!hasLatestUserMessage) {
      input.push({ role: "user", content: text });
    }

    let lastStatus = 502;
    let lastErrorText = "";

    for (const model of models) {
      let result = await callResponses({ apiKey, model, input });

      if (!result.ok && RETRYABLE_STATUSES.has(result.status)) {
        await new Promise((resolve) => setTimeout(resolve, 700));
        result = await callResponses({ apiKey, model, input });
      }

      if (result.ok) {
        const reply = extractText(result.json);
        if (reply) {
          return NextResponse.json({ reply });
        }
      }

      lastStatus = result.status || lastStatus;
      lastErrorText = getErrorText(result.json);
    }

    return NextResponse.json(
      {
        reply: `${getStatusMessage(lastStatus, lastErrorText)}\n\n${getOfflineReply(text)}`
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      {
        reply:
          "বাংলা: প্রশ্নটি প্রসেস করতে সমস্যা হয়েছে।\n\nEnglish: Something went wrong while processing your question."
      },
      { status: 500 }
    );
  }
}
