import type { ChoicePublic } from "@/lib/campaign/types";

export async function interpretFreeText(input: {
  sceneId: string;
  narration: string;
  choices: ChoicePublic[];
  text: string;
  characterName: string;
}): Promise<{ choiceId: string | null; narration: string }> {
  const apiKey = process.env.XAI_API_KEY;
  const fallbackNarration = `Хранитель дела слушает ${input.characterName}. «${input.text}» — смело, но засов от этого не двигается. Выберите одно из действий на столе или примените способность.`;
  if (!apiKey) {
    return { choiceId: null, narration: fallbackNarration };
  }
  try {
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        max_tokens: 400,
        temperature: 0.4,
        messages: [
          {
            role: "system",
            content:
              "Ты мастер детективной кампании в мире Повелителя тайн, 1349, Бекленд. Клейн Морретти не существует в этой истории. Отвечай строго JSON: {\"choiceId\": string|null, \"narration\": string}. choiceId — id одного из предложенных вариантов, если речь игрока явно к нему сводится. Иначе null. narration — 2–5 предложений от хранителя дела, без спойлеров будущих актов, без ломания канона. Не выдавай разгадку.",
          },
          {
            role: "user",
            content: JSON.stringify({
              sceneId: input.sceneId,
              narration: input.narration,
              choices: input.choices,
              player: input.characterName,
              speech: input.text,
            }),
          },
        ],
      }),
    });
    if (!res.ok) return { choiceId: null, narration: fallbackNarration };
    const body = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const raw = body.choices?.[0]?.message?.content ?? "";
    const jsonStart = raw.indexOf("{");
    const jsonEnd = raw.lastIndexOf("}");
    if (jsonStart < 0 || jsonEnd < 0) {
      return { choiceId: null, narration: fallbackNarration };
    }
    const parsed = JSON.parse(raw.slice(jsonStart, jsonEnd + 1)) as {
      choiceId?: string | null;
      narration?: string;
    };
    const choiceId =
      parsed.choiceId && input.choices.some((c) => c.id === parsed.choiceId)
        ? parsed.choiceId
        : null;
    return {
      choiceId,
      narration: parsed.narration?.slice(0, 900) || fallbackNarration,
    };
  } catch {
    return { choiceId: null, narration: fallbackNarration };
  }
}
