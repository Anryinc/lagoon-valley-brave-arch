import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const cache = new Map<string, string>();

export const speakText = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z.object({ text: z.string().min(1).max(900) }).parse(input),
  )
  .handler(async ({ data }) => {
    const key = data.text.slice(0, 200);
    const hit = cache.get(key);
    if (hit) return { ok: true as const, audioBase64: hit, mime: "audio/mpeg" };
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false as const, error: "no-key" };
    try {
      const res = await fetch("https://api.x.ai/v1/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ text: data.text.slice(0, 900), voice_id: "eve" }),
      });
      if (!res.ok) return { ok: false as const, error: `tts ${res.status}` };
      const buf = Buffer.from(await res.arrayBuffer());
      const audioBase64 = buf.toString("base64");
      if (cache.size > 24) cache.clear();
      cache.set(key, audioBase64);
      return { ok: true as const, audioBase64, mime: "audio/mpeg" };
    } catch {
      return { ok: false as const, error: "tts-failed" };
    }
  });
