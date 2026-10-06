import { t as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-A6pJPYTF.mjs";
import { a as string, i as object } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tts-D7KTHxrF.js
var cache = /* @__PURE__ */ new Map();
var speakText_createServerFn_handler = createServerRpc({
	id: "1bb57940fd926c77d96684f754e72045af3244bcbd97113ce017358238835023",
	name: "speakText",
	filename: "src/lib/game/tts.ts"
}, (opts) => speakText.__executeServer(opts));
var speakText = createServerFn({ method: "POST" }).validator((input) => object({ text: string().min(1).max(900) }).parse(input)).handler(speakText_createServerFn_handler, async ({ data }) => {
	const key = data.text.slice(0, 200);
	const hit = cache.get(key);
	if (hit) return {
		ok: true,
		audioBase64: hit,
		mime: "audio/mpeg"
	};
	const apiKey = process.env.XAI_API_KEY;
	if (!apiKey) return {
		ok: false,
		error: "no-key"
	};
	try {
		const res = await fetch("https://api.x.ai/v1/tts", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`
			},
			body: JSON.stringify({
				text: data.text.slice(0, 900),
				voice_id: "eve"
			})
		});
		if (!res.ok) return {
			ok: false,
			error: `tts ${res.status}`
		};
		const audioBase64 = Buffer.from(await res.arrayBuffer()).toString("base64");
		if (cache.size > 24) cache.clear();
		cache.set(key, audioBase64);
		return {
			ok: true,
			audioBase64,
			mime: "audio/mpeg"
		};
	} catch {
		return {
			ok: false,
			error: "tts-failed"
		};
	}
});
//#endregion
export { speakText_createServerFn_handler };
