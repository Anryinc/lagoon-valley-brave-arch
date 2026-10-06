import { t as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-A6pJPYTF.mjs";
import { n as LOCATION_BY_ID } from "./locations-Dl_Cn8V3.mjs";
import { i as ROSTER_BY_ID, n as NPC_BY_ID } from "./roster-Cd5W4G4t.mjs";
import { c as getSql, i as checkRegisterPuzzle, n as applyChoice, t as applyAbility, u as presentScene } from "./pack-D2uxI2bN.mjs";
import { a as string, i as object, t as boolean } from "../_libs/zod.mjs";
import { n as loadLivePack } from "./pack-api-CFu9Def2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/api-DmAy3eTq.js
var ALPH = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
function makeRoomCode() {
	let s = "";
	for (let i = 0; i < 6; i += 1) s += ALPH[Math.floor(Math.random() * 31)];
	return s;
}
function newId() {
	return crypto.randomUUID();
}
async function interpretFreeText(input) {
	const apiKey = process.env.XAI_API_KEY;
	const fallbackNarration = `Хранитель дела слушает ${input.characterName}. «${input.text}» — смело, но засов от этого не двигается. Выберите одно из действий на столе или примените способность.`;
	if (!apiKey) return {
		choiceId: null,
		narration: fallbackNarration
	};
	try {
		const res = await fetch("https://api.x.ai/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`
			},
			body: JSON.stringify({
				model: "grok-4.5",
				max_tokens: 400,
				temperature: .4,
				messages: [{
					role: "system",
					content: "Ты мастер детективной кампании в мире Повелителя тайн, 1349, Бекленд. Клейн Морретти не существует в этой истории. Отвечай строго JSON: {\"choiceId\": string|null, \"narration\": string}. choiceId — id одного из предложенных вариантов, если речь игрока явно к нему сводится. Иначе null. narration — 2–5 предложений от хранителя дела, без спойлеров будущих актов, без ломания канона. Не выдавай разгадку."
				}, {
					role: "user",
					content: JSON.stringify({
						sceneId: input.sceneId,
						narration: input.narration,
						choices: input.choices,
						player: input.characterName,
						speech: input.text
					})
				}]
			})
		});
		if (!res.ok) return {
			choiceId: null,
			narration: fallbackNarration
		};
		const raw = (await res.json()).choices?.[0]?.message?.content ?? "";
		const jsonStart = raw.indexOf("{");
		const jsonEnd = raw.lastIndexOf("}");
		if (jsonStart < 0 || jsonEnd < 0) return {
			choiceId: null,
			narration: fallbackNarration
		};
		const parsed = JSON.parse(raw.slice(jsonStart, jsonEnd + 1));
		return {
			choiceId: parsed.choiceId && input.choices.some((c) => c.id === parsed.choiceId) ? parsed.choiceId : null,
			narration: parsed.narration?.slice(0, 900) || fallbackNarration
		};
	} catch {
		return {
			choiceId: null,
			narration: fallbackNarration
		};
	}
}
function parseJson(raw, fallback) {
	try {
		return JSON.parse(raw);
	} catch {
		return fallback;
	}
}
async function loadRoom(code) {
	return (await (await getSql())`
    select code, host_client_id, status, council, scene_id, location_id, speaker_id,
           narration, choices_json, flags_json, public_log_json, clues_json, puzzle_id,
           last_public_event
    from rooms where code = ${code.toUpperCase()}
  `)[0] ?? null;
}
async function loadSeats(code) {
	return (await getSql())`
    select id, room_code, client_id, display_name, character_id
    from seats where room_code = ${code.toUpperCase()}
    order by id
  `;
}
function flagsOf(room) {
	return parseJson(room.flags_json, {});
}
async function savePresentation(code, patch) {
	const sql = await getSql();
	const room = await loadRoom(code);
	if (!room) return;
	const sceneId = patch.sceneId ?? room.scene_id;
	const locationId = patch.locationId ?? room.location_id;
	const speakerId = patch.speakerId === void 0 ? room.speaker_id : patch.speakerId;
	const narration = patch.narration ?? room.narration;
	const choices = patch.choices ?? parseJson(room.choices_json, []);
	const flags = patch.flags ?? flagsOf(room);
	const clues = patch.clues ?? parseJson(room.clues_json, []);
	const puzzleId = patch.puzzleId === void 0 ? room.puzzle_id : patch.puzzleId;
	const lastPublicEvent = patch.lastPublicEvent === void 0 ? room.last_public_event : patch.lastPublicEvent;
	const status = patch.status ?? room.status;
	const council = patch.council ?? room.council;
	await sql`
    update rooms set
      scene_id = ${sceneId},
      location_id = ${locationId},
      speaker_id = ${speakerId},
      narration = ${narration},
      choices_json = ${JSON.stringify(choices)},
      flags_json = ${JSON.stringify(flags)},
      clues_json = ${JSON.stringify(clues)},
      puzzle_id = ${puzzleId},
      last_public_event = ${lastPublicEvent},
      status = ${status},
      council = ${council},
      updated_at = now()
    where code = ${code.toUpperCase()}
  `;
}
function addClue(list, clue) {
	if (!clue) return list;
	if (list.some((c) => c.id === clue.id)) return list;
	return [...list, clue];
}
function toSnapshot(room, seats, clientId, notes) {
	const loc = LOCATION_BY_ID[room.location_id];
	const my = seats.find((s) => s.client_id === clientId);
	const speaker = speakerOf(room.speaker_id);
	const flags = flagsOf(room);
	const usedPrefix = my?.character_id ? `used:${room.scene_id}:${my.character_id}:` : null;
	return {
		code: room.code,
		isHost: room.host_client_id === clientId,
		status: room.status === "playing" ? "playing" : "lobby",
		council: Boolean(room.council),
		sceneId: room.scene_id,
		locationId: room.location_id,
		locationName: loc?.name ?? room.location_id,
		speakerId: room.speaker_id,
		speakerName: speaker.name,
		speakerPortrait: speaker.portrait,
		speakerTone: speaker.tone,
		narration: room.narration,
		lastPublicEvent: room.last_public_event,
		choices: parseJson(room.choices_json, []),
		seats: seats.map((s) => ({
			clientId: s.client_id,
			displayName: s.display_name,
			characterId: s.character_id
		})),
		myCharacterId: my?.character_id ?? null,
		myNotes: notes,
		clues: parseJson(room.clues_json, []),
		puzzleId: room.puzzle_id,
		takenCharacterIds: seats.map((s) => s.character_id).filter((id) => Boolean(id)),
		seatedCount: seats.filter((s) => s.character_id).length,
		usedAbilityIds: usedPrefix ? Object.keys(flags).filter((k) => k.startsWith(usedPrefix) && flags[k]).map((k) => k.slice(usedPrefix.length)) : []
	};
}
function speakerOf(id) {
	if (!id) return {
		name: null,
		portrait: null,
		tone: null
	};
	const npc = NPC_BY_ID[id];
	if (npc) return {
		name: npc.name,
		portrait: npc.portrait,
		tone: npc.fallbackTone
	};
	const ch = ROSTER_BY_ID[id];
	if (ch) return {
		name: ch.name,
		portrait: ch.portrait,
		tone: ch.fallbackTone
	};
	return {
		name: "Голос",
		portrait: null,
		tone: null
	};
}
var createTable_createServerFn_handler = createServerRpc({
	id: "2cf48311b5a2ccc7a7a7f8efacc723899dd7b7c11ba4a3aeca9e34d41953c3d9",
	name: "createTable",
	filename: "src/lib/game/api.ts"
}, (opts) => createTable.__executeServer(opts));
var createTable = createServerFn({ method: "POST" }).validator((input) => object({ clientId: string().min(8) }).parse(input)).handler(createTable_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	for (let i = 0; i < 8; i += 1) {
		const code = makeRoomCode();
		try {
			await sql`
          insert into rooms (code, host_client_id, narration, choices_json)
          values (
            ${code},
            ${data.clientId},
            ${"Туман Червуда стоит у двери. Хозяйка ещё не знает, что к ней идут. Возьмите роли — и откройте дело."},
            ${"[]"}
          )
        `;
			await sql`
          insert into seats (id, room_code, client_id, display_name)
          values (${newId()}, ${code}, ${data.clientId}, ${"Хост"})
        `;
			return {
				ok: true,
				code
			};
		} catch {}
	}
	return {
		ok: false,
		error: "Не удалось открыть стол"
	};
});
var joinTable_createServerFn_handler = createServerRpc({
	id: "96fd6a010c1e6f2ae1c8aff6ecf40515c1af7781c3d9e190545f3feb6a23b648",
	name: "joinTable",
	filename: "src/lib/game/api.ts"
}, (opts) => joinTable.__executeServer(opts));
var joinTable = createServerFn({ method: "POST" }).validator((input) => object({
	code: string().min(4),
	clientId: string().min(8)
}).parse(input)).handler(joinTable_createServerFn_handler, async ({ data }) => {
	const code = data.code.toUpperCase().trim();
	const room = await loadRoom(code);
	if (!room) return {
		ok: false,
		error: "Стол не найден"
	};
	const sql = await getSql();
	if (!(await sql`
      select id, room_code, client_id, display_name, character_id
      from seats where room_code = ${code} and client_id = ${data.clientId}
    `)[0]) {
		if (((await sql`
        select count(*)::int as n from seats
        where room_code = ${code} and character_id is not null
      `)[0]?.n ?? 0) >= 4 && room.status === "playing") return {
			ok: false,
			error: "Стол уже идёт и мест нет"
		};
		await sql`
        insert into seats (id, room_code, client_id, display_name)
        values (${newId()}, ${code}, ${data.clientId}, ${"Игрок"})
      `;
	}
	return {
		ok: true,
		code
	};
});
var getSnapshot_createServerFn_handler = createServerRpc({
	id: "6db1106a46fca5a14ec3be313cb2a70293616f3e37993ae0d066f8262b2cf82a",
	name: "getSnapshot",
	filename: "src/lib/game/api.ts"
}, (opts) => getSnapshot.__executeServer(opts));
var getSnapshot = createServerFn({ method: "POST" }).validator((input) => object({
	code: string().min(4),
	clientId: string().min(8)
}).parse(input)).handler(getSnapshot_createServerFn_handler, async ({ data }) => {
	const code = data.code.toUpperCase();
	const room = await loadRoom(code);
	if (!room) return {
		ok: false,
		error: "Стол не найден"
	};
	const seats = await loadSeats(code);
	const notes = (await (await getSql())`
      select id, title, body, created_at::text as created_at
      from private_notes
      where room_code = ${code} and client_id = ${data.clientId}
      order by created_at desc
      limit 20
    `).map((n) => ({
		id: n.id,
		title: n.title,
		body: n.body,
		createdAt: n.created_at
	}));
	return {
		ok: true,
		room: toSnapshot(room, seats, data.clientId, notes)
	};
});
var claimCharacter_createServerFn_handler = createServerRpc({
	id: "ea354b52744ddbfe76c0a3c80d248bee0897f27bf56631d1780427aff5e85ed9",
	name: "claimCharacter",
	filename: "src/lib/game/api.ts"
}, (opts) => claimCharacter.__executeServer(opts));
var claimCharacter = createServerFn({ method: "POST" }).validator((input) => object({
	code: string(),
	clientId: string(),
	characterId: string().nullable()
}).parse(input)).handler(claimCharacter_createServerFn_handler, async ({ data }) => {
	const code = data.code.toUpperCase();
	const room = await loadRoom(code);
	if (!room) return {
		ok: false,
		error: "Стол не найден"
	};
	if (room.status === "playing") return {
		ok: false,
		error: "Дело уже начато, роли зафиксированы"
	};
	const sql = await getSql();
	const seats = await loadSeats(code);
	if (!seats.find((s) => s.client_id === data.clientId)) await sql`
        insert into seats (id, room_code, client_id, display_name)
        values (${newId()}, ${code}, ${data.clientId}, ${"Игрок"})
      `;
	if (data.characterId) {
		if (!ROSTER_BY_ID[data.characterId]) return {
			ok: false,
			error: "Нет такого человека в ростере"
		};
		if (seats.find((s) => s.character_id === data.characterId && s.client_id !== data.clientId)) return {
			ok: false,
			error: "Этого уже взяли"
		};
		const claimed = seats.filter((s) => s.character_id && s.client_id !== data.clientId).length;
		if (!Boolean(seats.find((s) => s.client_id === data.clientId)?.character_id) && claimed >= 4) return {
			ok: false,
			error: "За столом уже четверо"
		};
		try {
			await sql`
          update seats
          set character_id = ${data.characterId},
              display_name = ${ROSTER_BY_ID[data.characterId].name},
              last_seen = now()
          where room_code = ${code} and client_id = ${data.clientId}
        `;
		} catch {
			return {
				ok: false,
				error: "Этого уже взяли"
			};
		}
	} else await sql`
        update seats
        set character_id = null, display_name = ${"Игрок"}, last_seen = now()
        where room_code = ${code} and client_id = ${data.clientId}
      `;
	return { ok: true };
});
var startCase_createServerFn_handler = createServerRpc({
	id: "e064c5d027390403ab08ce1a6aed43acfca58c98c2c602636720854f23eefde0",
	name: "startCase",
	filename: "src/lib/game/api.ts"
}, (opts) => startCase.__executeServer(opts));
var startCase = createServerFn({ method: "POST" }).validator((input) => object({
	code: string(),
	clientId: string()
}).parse(input)).handler(startCase_createServerFn_handler, async ({ data }) => {
	const code = data.code.toUpperCase();
	const room = await loadRoom(code);
	if (!room) return {
		ok: false,
		error: "Стол не найден"
	};
	if (room.host_client_id !== data.clientId) return {
		ok: false,
		error: "Начать дело может только хост"
	};
	if (!(await loadSeats(code)).some((s) => s.character_id)) return {
		ok: false,
		error: "Нужна хотя бы одна роль"
	};
	const pack = await loadLivePack();
	const presented = presentScene(pack.startScene, {}, pack);
	await savePresentation(code, {
		status: "playing",
		sceneId: presented.sceneId,
		locationId: presented.locationId,
		speakerId: presented.speakerId,
		narration: presented.narration,
		choices: presented.choices,
		flags: {},
		clues: [],
		puzzleId: null,
		lastPublicEvent: null
	});
	return { ok: true };
});
var setCouncil_createServerFn_handler = createServerRpc({
	id: "6aa701e3f3d7570051a1719784d85869682972f23dc66fc1896c04fe930e7d0a",
	name: "setCouncil",
	filename: "src/lib/game/api.ts"
}, (opts) => setCouncil.__executeServer(opts));
var setCouncil = createServerFn({ method: "POST" }).validator((input) => object({
	code: string(),
	clientId: string(),
	council: boolean()
}).parse(input)).handler(setCouncil_createServerFn_handler, async ({ data }) => {
	const code = data.code.toUpperCase();
	const room = await loadRoom(code);
	if (!room) return {
		ok: false,
		error: "Стол не найден"
	};
	if (!(await loadSeats(code)).find((s) => s.client_id === data.clientId) && room.host_client_id !== data.clientId) return {
		ok: false,
		error: "Вас нет за столом"
	};
	await savePresentation(code, { council: data.council });
	return { ok: true };
});
var submitChoice_createServerFn_handler = createServerRpc({
	id: "c91b3ed114443ec6c9f35c8d60c9e5eccdb0bea200f476580e477a5e28aca800",
	name: "submitChoice",
	filename: "src/lib/game/api.ts"
}, (opts) => submitChoice.__executeServer(opts));
var submitChoice = createServerFn({ method: "POST" }).validator((input) => object({
	code: string(),
	clientId: string(),
	choiceId: string()
}).parse(input)).handler(submitChoice_createServerFn_handler, async ({ data }) => {
	const code = data.code.toUpperCase();
	const room = await loadRoom(code);
	if (!room) return {
		ok: false,
		error: "Стол не найден"
	};
	if (room.status !== "playing") return {
		ok: false,
		error: "Дело ещё не начато"
	};
	if (room.council) return {
		ok: false,
		error: "Стол совещается. Мастер глухой."
	};
	const mine = (await loadSeats(code)).find((s) => s.client_id === data.clientId);
	const isHost = room.host_client_id === data.clientId;
	if (!mine?.character_id && !isHost) return {
		ok: false,
		error: "Сначала возьмите роль"
	};
	const pack = await loadLivePack();
	const flags = flagsOf(room);
	const clues = parseJson(room.clues_json, []);
	const result = applyChoice(room.scene_id, data.choiceId, flags, pack);
	const who = mine?.character_id ? ROSTER_BY_ID[mine.character_id]?.name ?? "Следователь" : "Хранитель";
	await savePresentation(code, {
		sceneId: result.presentation.sceneId,
		locationId: result.presentation.locationId,
		speakerId: result.presentation.speakerId,
		narration: result.presentation.narration,
		choices: result.presentation.choices,
		flags: result.flags,
		clues: addClue(clues, result.clue),
		puzzleId: result.puzzleId === void 0 ? room.puzzle_id : result.puzzleId,
		lastPublicEvent: result.publicEvent ?? `${who}: ${labelOf(room, data.choiceId)}`
	});
	return { ok: true };
});
function labelOf(room, choiceId) {
	return parseJson(room.choices_json, []).find((c) => c.id === choiceId)?.label ?? "действие";
}
var useAbility_createServerFn_handler = createServerRpc({
	id: "0afaa4c3f93b77fe091a8c14f64aa918fab01e8bd0448fccb6feab3aa4a1f8ef",
	name: "useAbility",
	filename: "src/lib/game/api.ts"
}, (opts) => useAbility.__executeServer(opts));
var useAbility = createServerFn({ method: "POST" }).validator((input) => object({
	code: string(),
	clientId: string(),
	abilityId: string()
}).parse(input)).handler(useAbility_createServerFn_handler, async ({ data }) => {
	const code = data.code.toUpperCase();
	const room = await loadRoom(code);
	if (!room) return {
		ok: false,
		error: "Стол не найден"
	};
	if (room.status !== "playing") return {
		ok: false,
		error: "Дело ещё не начато"
	};
	if (room.council) return {
		ok: false,
		error: "Стол совещается. Мастер глухой."
	};
	const mine = (await loadSeats(code)).find((s) => s.client_id === data.clientId);
	if (!mine?.character_id) return {
		ok: false,
		error: "Сначала возьмите роль"
	};
	if (!ROSTER_BY_ID[mine.character_id]?.abilities.find((a) => a.id === data.abilityId)) return {
		ok: false,
		error: "У этой роли нет такой способности"
	};
	const flags = flagsOf(room);
	if (flags[`used:${room.scene_id}:${mine.character_id}:${data.abilityId}`]) return {
		ok: false,
		error: "В этой сцене способность уже применяли"
	};
	const pack = await loadLivePack();
	const applied = applyAbility(room.scene_id, data.abilityId, mine.character_id, flags, pack);
	const clues = parseJson(room.clues_json, []);
	await (await getSql())`
      insert into private_notes (id, room_code, client_id, title, body)
      values (
        ${newId()},
        ${code},
        ${data.clientId},
        ${applied.result.title},
        ${applied.result.body}
      )
    `;
	const publicEvent = applied.visibility === "public" ? applied.result.publicEvent ?? `${applied.characterName} применяет «${applied.abilityName}».` : room.last_public_event;
	let puzzleId = room.puzzle_id;
	if (applied.visibility === "public" && applied.result.opensPuzzle) puzzleId = applied.result.opensPuzzle;
	const jumpId = applied.visibility === "public" ? applied.nextSceneId : void 0;
	const presented = presentScene(jumpId ?? room.scene_id, applied.flags, pack);
	await savePresentation(code, {
		flags: applied.flags,
		clues: applied.visibility === "public" ? addClue(clues, applied.result.clue) : clues,
		lastPublicEvent: publicEvent,
		puzzleId,
		sceneId: presented.sceneId,
		locationId: presented.locationId,
		choices: presented.choices,
		narration: jumpId ? presented.narration : applied.visibility === "public" ? applied.result.body : room.narration,
		speakerId: jumpId ? presented.speakerId : applied.visibility === "public" ? "narrator" : room.speaker_id
	});
	return {
		ok: true,
		visibility: applied.visibility,
		note: {
			title: applied.result.title,
			body: applied.result.body
		}
	};
});
var submitSpeech_createServerFn_handler = createServerRpc({
	id: "b970f555d25a9cc382e19b769105c1a8492de598713346f4515c006b642a01cf",
	name: "submitSpeech",
	filename: "src/lib/game/api.ts"
}, (opts) => submitSpeech.__executeServer(opts));
var submitSpeech = createServerFn({ method: "POST" }).validator((input) => object({
	code: string(),
	clientId: string(),
	text: string().min(1).max(400)
}).parse(input)).handler(submitSpeech_createServerFn_handler, async ({ data }) => {
	const code = data.code.toUpperCase();
	const room = await loadRoom(code);
	if (!room) return {
		ok: false,
		error: "Стол не найден"
	};
	if (room.status !== "playing") return {
		ok: false,
		error: "Дело ещё не начато"
	};
	if (room.council) return {
		ok: false,
		error: "Стол совещается. Мастер глухой."
	};
	const mine = (await loadSeats(code)).find((s) => s.client_id === data.clientId);
	if (!mine?.character_id) return {
		ok: false,
		error: "Сначала возьмите роль"
	};
	const choices = parseJson(room.choices_json, []);
	const lowered = data.text.toLowerCase();
	const fuzzy = choices.find((c) => {
		const l = c.label.toLowerCase();
		return lowered.includes(l.slice(0, 12)) || l.includes(lowered.slice(0, 12));
	});
	if (fuzzy) return submitChoice({ data: {
		code,
		clientId: data.clientId,
		choiceId: fuzzy.id
	} });
	const interpreted = await interpretFreeText({
		sceneId: room.scene_id,
		narration: room.narration,
		choices,
		text: data.text,
		characterName: ROSTER_BY_ID[mine.character_id]?.name ?? "Следователь"
	});
	if (interpreted.choiceId) return submitChoice({ data: {
		code,
		clientId: data.clientId,
		choiceId: interpreted.choiceId
	} });
	const flags = flagsOf(room);
	const who = ROSTER_BY_ID[mine.character_id]?.name ?? "Следователь";
	await savePresentation(code, {
		narration: interpreted.narration,
		speakerId: "narrator",
		lastPublicEvent: `${who} говорит: «${data.text}»`,
		flags
	});
	return { ok: true };
});
var submitRegisterPuzzle_createServerFn_handler = createServerRpc({
	id: "d3bca32f97e1b1bbe24a404af655f7f7a764aeb7702abc40467ce4c59718e510",
	name: "submitRegisterPuzzle",
	filename: "src/lib/game/api.ts"
}, (opts) => submitRegisterPuzzle.__executeServer(opts));
var submitRegisterPuzzle = createServerFn({ method: "POST" }).validator((input) => object({
	code: string(),
	clientId: string(),
	room3: string(),
	room5: string(),
	room7: string(),
	hiddenSeen: boolean()
}).parse(input)).handler(submitRegisterPuzzle_createServerFn_handler, async ({ data }) => {
	const code = data.code.toUpperCase();
	const room = await loadRoom(code);
	if (!room) return {
		ok: false,
		error: "Стол не найден"
	};
	if (room.puzzle_id !== "register") return {
		ok: false,
		error: "Реестр сейчас не на столе"
	};
	const check = checkRegisterPuzzle({
		room3: data.room3,
		room5: data.room5,
		room7: data.room7,
		hiddenSeen: data.hiddenSeen
	});
	if (!check.ok) return {
		ok: false,
		error: check.hint ?? "Не сходится"
	};
	const flags = {
		...flagsOf(room),
		register_solved: true
	};
	const clues = addClue(parseJson(room.clues_json, []), {
		id: "hidden_ink",
		title: "Исчезающие имена",
		body: "Синий свет проявил строку: пятница, подвал, тихий гость. Комната 7 — Восс. Комната 5 — Пелл. Третья — Миллс. Есть ещё имя, которого хозяйка не произносит.",
		source: "Реестр гостей"
	});
	const pack = await loadLivePack();
	const presented = presentScene("parlor", flags, pack);
	await savePresentation(code, {
		flags,
		clues,
		puzzleId: null,
		sceneId: presented.sceneId,
		locationId: presented.locationId,
		speakerId: "narrator",
		narration: "Синий свет гаснет. В книге остаётся то, что обычная лампа отрицала: пятница, подвал, тихий гость. Хэтти отворачивается к окну. «Вы видели. Значит, уже поздно делать вид. Внизу дверь. Я её не отпирала сегодня. И не запирала.»",
		choices: presented.choices,
		lastPublicEvent: "Реестр сошёлся. Подвал больше не слух."
	});
	return { ok: true };
});
var closePuzzle_createServerFn_handler = createServerRpc({
	id: "ae31ab8460efd802d80dae932a7b6e638ece8981f52e31a373dcd8affafe59aa",
	name: "closePuzzle",
	filename: "src/lib/game/api.ts"
}, (opts) => closePuzzle.__executeServer(opts));
var closePuzzle = createServerFn({ method: "POST" }).validator((input) => object({
	code: string(),
	clientId: string()
}).parse(input)).handler(closePuzzle_createServerFn_handler, async ({ data }) => {
	const code = data.code.toUpperCase();
	if (!await loadRoom(code)) return {
		ok: false,
		error: "Стол не найден"
	};
	await savePresentation(code, { puzzleId: null });
	return { ok: true };
});
//#endregion
export { claimCharacter_createServerFn_handler, closePuzzle_createServerFn_handler, createTable_createServerFn_handler, getSnapshot_createServerFn_handler, joinTable_createServerFn_handler, setCouncil_createServerFn_handler, startCase_createServerFn_handler, submitChoice_createServerFn_handler, submitRegisterPuzzle_createServerFn_handler, submitSpeech_createServerFn_handler, useAbility_createServerFn_handler };
