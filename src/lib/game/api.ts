import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { LOCATION_BY_ID } from "@/lib/campaign/locations";
import { MAX_PARTY, NPC_BY_ID, ROSTER_BY_ID } from "@/lib/campaign/roster";
import {
  applyAbility,
  applyChoice,
  checkRegisterPuzzle,
  presentScene,
  type AbilitySceneResult,
} from "@/lib/campaign/rails";
import type {
  ChoicePublic,
  CluePublic,
  PrivateNote,
  RoomSnapshot,
  SeatPublic,
} from "@/lib/campaign/types";
import { makeRoomCode, newId } from "./ids";
import { interpretFreeText } from "./ai";
import { loadLivePack } from "./pack-api";

type RoomRow = {
  code: string;
  host_client_id: string;
  status: string;
  council: boolean;
  scene_id: string;
  location_id: string;
  speaker_id: string | null;
  narration: string;
  choices_json: string;
  flags_json: string;
  public_log_json: string;
  clues_json: string;
  puzzle_id: string | null;
  last_public_event: string | null;
};

type SeatRow = {
  id: string;
  room_code: string;
  client_id: string;
  display_name: string;
  character_id: string | null;
};

type NoteRow = {
  id: string;
  title: string;
  body: string;
  created_at: string;
};

function parseJson<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function loadRoom(code: string): Promise<RoomRow | null> {
  const sql = await getSql();
  const rows = await sql<RoomRow>`
    select code, host_client_id, status, council, scene_id, location_id, speaker_id,
           narration, choices_json, flags_json, public_log_json, clues_json, puzzle_id,
           last_public_event
    from rooms where code = ${code.toUpperCase()}
  `;
  return rows[0] ?? null;
}

async function loadSeats(code: string): Promise<SeatRow[]> {
  const sql = await getSql();
  return sql<SeatRow>`
    select id, room_code, client_id, display_name, character_id
    from seats where room_code = ${code.toUpperCase()}
    order by id
  `;
}

function flagsOf(room: RoomRow): Record<string, boolean> {
  return parseJson<Record<string, boolean>>(room.flags_json, {});
}

async function savePresentation(
  code: string,
  patch: {
    sceneId?: string;
    locationId?: string;
    speakerId?: string | null;
    narration?: string;
    choices?: ChoicePublic[];
    flags?: Record<string, boolean>;
    clues?: CluePublic[];
    puzzleId?: string | null;
    lastPublicEvent?: string | null;
    status?: string;
    council?: boolean;
  },
) {
  const sql = await getSql();
  const room = await loadRoom(code);
  if (!room) return;
  const sceneId = patch.sceneId ?? room.scene_id;
  const locationId = patch.locationId ?? room.location_id;
  const speakerId = patch.speakerId === undefined ? room.speaker_id : patch.speakerId;
  const narration = patch.narration ?? room.narration;
  const choices = patch.choices ?? parseJson<ChoicePublic[]>(room.choices_json, []);
  const flags = patch.flags ?? flagsOf(room);
  const clues = patch.clues ?? parseJson<CluePublic[]>(room.clues_json, []);
  const puzzleId = patch.puzzleId === undefined ? room.puzzle_id : patch.puzzleId;
  const lastPublicEvent =
    patch.lastPublicEvent === undefined ? room.last_public_event : patch.lastPublicEvent;
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

function addClue(list: CluePublic[], clue?: CluePublic) {
  if (!clue) return list;
  if (list.some((c) => c.id === clue.id)) return list;
  return [...list, clue];
}

function toSnapshot(
  room: RoomRow,
  seats: SeatRow[],
  clientId: string,
  notes: PrivateNote[],
): RoomSnapshot {
  const loc = LOCATION_BY_ID[room.location_id];
  const my = seats.find((s) => s.client_id === clientId);
  const speaker = speakerOf(room.speaker_id);
  const flags = flagsOf(room);
  const usedPrefix = my?.character_id
    ? `used:${room.scene_id}:${my.character_id}:`
    : null;
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
    choices: parseJson<ChoicePublic[]>(room.choices_json, []),
    seats: seats.map(
      (s): SeatPublic => ({
        clientId: s.client_id,
        displayName: s.display_name,
        characterId: s.character_id,
      }),
    ),
    myCharacterId: my?.character_id ?? null,
    myNotes: notes,
    clues: parseJson<CluePublic[]>(room.clues_json, []),
    puzzleId: room.puzzle_id,
    takenCharacterIds: seats
      .map((s) => s.character_id)
      .filter((id): id is string => Boolean(id)),
    seatedCount: seats.filter((s) => s.character_id).length,
    usedAbilityIds: usedPrefix
      ? Object.keys(flags)
          .filter((k) => k.startsWith(usedPrefix) && flags[k])
          .map((k) => k.slice(usedPrefix.length))
      : [],
  };
}

function speakerOf(id: string | null) {
  if (!id) {
    return { name: null as string | null, portrait: null as string | null, tone: null as string | null };
  }
  const npc = NPC_BY_ID[id];
  if (npc) {
    return { name: npc.name, portrait: npc.portrait, tone: npc.fallbackTone };
  }
  const ch = ROSTER_BY_ID[id];
  if (ch) {
    return { name: ch.name, portrait: ch.portrait, tone: ch.fallbackTone };
  }
  return { name: "Голос", portrait: null, tone: null };
}

export const createTable = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z.object({ clientId: z.string().min(8) }).parse(input),
  )
  .handler(async ({ data }) => {
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
        return { ok: true as const, code };
      } catch {
        // unique collision on code
      }
    }
    return { ok: false as const, error: "Не удалось открыть стол" };
  });

export const joinTable = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z
      .object({
        code: z.string().min(4),
        clientId: z.string().min(8),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const code = data.code.toUpperCase().trim();
    const room = await loadRoom(code);
    if (!room) return { ok: false as const, error: "Стол не найден" };
    const sql = await getSql();
    const existing = await sql<SeatRow>`
      select id, room_code, client_id, display_name, character_id
      from seats where room_code = ${code} and client_id = ${data.clientId}
    `;
    if (!existing[0]) {
      const seated = await sql<{ n: number }>`
        select count(*)::int as n from seats
        where room_code = ${code} and character_id is not null
      `;
      if ((seated[0]?.n ?? 0) >= MAX_PARTY && room.status === "playing") {
        return { ok: false as const, error: "Стол уже идёт и мест нет" };
      }
      await sql`
        insert into seats (id, room_code, client_id, display_name)
        values (${newId()}, ${code}, ${data.clientId}, ${"Игрок"})
      `;
    }
    return { ok: true as const, code };
  });

export const getSnapshot = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z
      .object({
        code: z.string().min(4),
        clientId: z.string().min(8),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const code = data.code.toUpperCase();
    const room = await loadRoom(code);
    if (!room) return { ok: false as const, error: "Стол не найден" };
    const seats = await loadSeats(code);
    const sql = await getSql();
    const noteRows = await sql<NoteRow>`
      select id, title, body, created_at::text as created_at
      from private_notes
      where room_code = ${code} and client_id = ${data.clientId}
      order by created_at desc
      limit 20
    `;
    const notes: PrivateNote[] = noteRows.map((n) => ({
      id: n.id,
      title: n.title,
      body: n.body,
      createdAt: n.created_at,
    }));
    return { ok: true as const, room: toSnapshot(room, seats, data.clientId, notes) };
  });

export const claimCharacter = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z
      .object({
        code: z.string(),
        clientId: z.string(),
        characterId: z.string().nullable(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const code = data.code.toUpperCase();
    const room = await loadRoom(code);
    if (!room) return { ok: false as const, error: "Стол не найден" };
    if (room.status === "playing") {
      return { ok: false as const, error: "Дело уже начато, роли зафиксированы" };
    }
    const sql = await getSql();
    const seats = await loadSeats(code);
    let mine = seats.find((s) => s.client_id === data.clientId);
    if (!mine) {
      await sql`
        insert into seats (id, room_code, client_id, display_name)
        values (${newId()}, ${code}, ${data.clientId}, ${"Игрок"})
      `;
    }
    if (data.characterId) {
      if (!ROSTER_BY_ID[data.characterId]) {
        return { ok: false as const, error: "Нет такого человека в ростере" };
      }
      const taken = seats.find(
        (s) => s.character_id === data.characterId && s.client_id !== data.clientId,
      );
      if (taken) return { ok: false as const, error: "Этого уже взяли" };
      const claimed = seats.filter(
        (s) => s.character_id && s.client_id !== data.clientId,
      ).length;
      const iAlreadyHave = Boolean(
        seats.find((s) => s.client_id === data.clientId)?.character_id,
      );
      if (!iAlreadyHave && claimed >= MAX_PARTY) {
        return { ok: false as const, error: "За столом уже четверо" };
      }
      try {
        await sql`
          update seats
          set character_id = ${data.characterId},
              display_name = ${ROSTER_BY_ID[data.characterId]!.name},
              last_seen = now()
          where room_code = ${code} and client_id = ${data.clientId}
        `;
      } catch {
        return { ok: false as const, error: "Этого уже взяли" };
      }
    } else {
      await sql`
        update seats
        set character_id = null, display_name = ${"Игрок"}, last_seen = now()
        where room_code = ${code} and client_id = ${data.clientId}
      `;
    }
    return { ok: true as const };
  });

export const startCase = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z.object({ code: z.string(), clientId: z.string() }).parse(input),
  )
  .handler(async ({ data }) => {
    const code = data.code.toUpperCase();
    const room = await loadRoom(code);
    if (!room) return { ok: false as const, error: "Стол не найден" };
    if (room.host_client_id !== data.clientId) {
      return { ok: false as const, error: "Начать дело может только хост" };
    }
    const seats = await loadSeats(code);
    if (!seats.some((s) => s.character_id)) {
      return { ok: false as const, error: "Нужна хотя бы одна роль" };
    }
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
      lastPublicEvent: null,
    });
    return { ok: true as const };
  });

export const setCouncil = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z
      .object({
        code: z.string(),
        clientId: z.string(),
        council: z.boolean(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const code = data.code.toUpperCase();
    const room = await loadRoom(code);
    if (!room) return { ok: false as const, error: "Стол не найден" };
    const seats = await loadSeats(code);
    const mine = seats.find((s) => s.client_id === data.clientId);
    if (!mine && room.host_client_id !== data.clientId) {
      return { ok: false as const, error: "Вас нет за столом" };
    }
    await savePresentation(code, { council: data.council });
    return { ok: true as const };
  });

export const submitChoice = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z
      .object({
        code: z.string(),
        clientId: z.string(),
        choiceId: z.string(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const code = data.code.toUpperCase();
    const room = await loadRoom(code);
    if (!room) return { ok: false as const, error: "Стол не найден" };
    if (room.status !== "playing") return { ok: false as const, error: "Дело ещё не начато" };
    if (room.council) return { ok: false as const, error: "Стол совещается. Мастер глухой." };
    const seats = await loadSeats(code);
    const mine = seats.find((s) => s.client_id === data.clientId);
    const isHost = room.host_client_id === data.clientId;
    if (!mine?.character_id && !isHost) {
      return { ok: false as const, error: "Сначала возьмите роль" };
    }
    const pack = await loadLivePack();
    const flags = flagsOf(room);
    const clues = parseJson<CluePublic[]>(room.clues_json, []);
    const result = applyChoice(room.scene_id, data.choiceId, flags, pack);
    const who = mine?.character_id
      ? (ROSTER_BY_ID[mine.character_id]?.name ?? "Следователь")
      : "Хранитель";
    await savePresentation(code, {
      sceneId: result.presentation.sceneId,
      locationId: result.presentation.locationId,
      speakerId: result.presentation.speakerId,
      narration: result.presentation.narration,
      choices: result.presentation.choices,
      flags: result.flags,
      clues: addClue(clues, result.clue),
      puzzleId: result.puzzleId === undefined ? room.puzzle_id : result.puzzleId,
      lastPublicEvent: result.publicEvent ?? `${who}: ${labelOf(room, data.choiceId)}`,
    });
    return { ok: true as const };
  });

function labelOf(room: RoomRow, choiceId: string) {
  const choices = parseJson<ChoicePublic[]>(room.choices_json, []);
  return choices.find((c) => c.id === choiceId)?.label ?? "действие";
}

export const useAbility = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z
      .object({
        code: z.string(),
        clientId: z.string(),
        abilityId: z.string(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const code = data.code.toUpperCase();
    const room = await loadRoom(code);
    if (!room) return { ok: false as const, error: "Стол не найден" };
    if (room.status !== "playing") return { ok: false as const, error: "Дело ещё не начато" };
    if (room.council) return { ok: false as const, error: "Стол совещается. Мастер глухой." };
    const seats = await loadSeats(code);
    const mine = seats.find((s) => s.client_id === data.clientId);
    if (!mine?.character_id) return { ok: false as const, error: "Сначала возьмите роль" };
    const character = ROSTER_BY_ID[mine.character_id];
    const ability = character?.abilities.find((a) => a.id === data.abilityId);
    if (!ability) return { ok: false as const, error: "У этой роли нет такой способности" };
    const flags = flagsOf(room);
    const usedKey = `used:${room.scene_id}:${mine.character_id}:${data.abilityId}`;
    if (flags[usedKey]) {
      return { ok: false as const, error: "В этой сцене способность уже применяли" };
    }
    const pack = await loadLivePack();
    const applied = applyAbility(room.scene_id, data.abilityId, mine.character_id, flags, pack);
    const clues = parseJson<CluePublic[]>(room.clues_json, []);
    const sql = await getSql();
    await sql`
      insert into private_notes (id, room_code, client_id, title, body)
      values (
        ${newId()},
        ${code},
        ${data.clientId},
        ${applied.result.title},
        ${applied.result.body}
      )
    `;
    const publicEvent =
      applied.visibility === "public"
        ? (applied.result.publicEvent ??
          `${applied.characterName} применяет «${applied.abilityName}».`)
        : room.last_public_event;
    let puzzleId = room.puzzle_id;
    if (applied.visibility === "public" && applied.result.opensPuzzle) {
      puzzleId = applied.result.opensPuzzle;
    }
    const jumpId =
      applied.visibility === "public" ? applied.nextSceneId : undefined;
    const presented = presentScene(jumpId ?? room.scene_id, applied.flags, pack);
    await savePresentation(code, {
      flags: applied.flags,
      clues:
        applied.visibility === "public"
          ? addClue(clues, applied.result.clue)
          : clues,
      lastPublicEvent: publicEvent,
      puzzleId,
      sceneId: presented.sceneId,
      locationId: presented.locationId,
      choices: presented.choices,
      narration: jumpId
        ? presented.narration
        : applied.visibility === "public"
          ? applied.result.body
          : room.narration,
      speakerId: jumpId
        ? presented.speakerId
        : applied.visibility === "public"
          ? "narrator"
          : room.speaker_id,
    });
    return {
      ok: true as const,
      visibility: applied.visibility,
      note: {
        title: applied.result.title,
        body: applied.result.body,
      } satisfies AbilitySceneResult,
    };
  });

export const submitSpeech = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z
      .object({
        code: z.string(),
        clientId: z.string(),
        text: z.string().min(1).max(400),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const code = data.code.toUpperCase();
    const room = await loadRoom(code);
    if (!room) return { ok: false as const, error: "Стол не найден" };
    if (room.status !== "playing") return { ok: false as const, error: "Дело ещё не начато" };
    if (room.council) return { ok: false as const, error: "Стол совещается. Мастер глухой." };
    const seats = await loadSeats(code);
    const mine = seats.find((s) => s.client_id === data.clientId);
    if (!mine?.character_id) return { ok: false as const, error: "Сначала возьмите роль" };
    const choices = parseJson<ChoicePublic[]>(room.choices_json, []);
    const lowered = data.text.toLowerCase();
    const fuzzy = choices.find((c) => {
      const l = c.label.toLowerCase();
      return lowered.includes(l.slice(0, 12)) || l.includes(lowered.slice(0, 12));
    });
    if (fuzzy) {
      return submitChoice({ data: { code, clientId: data.clientId, choiceId: fuzzy.id } });
    }
    const interpreted = await interpretFreeText({
      sceneId: room.scene_id,
      narration: room.narration,
      choices,
      text: data.text,
      characterName: ROSTER_BY_ID[mine.character_id]?.name ?? "Следователь",
    });
    if (interpreted.choiceId) {
      return submitChoice({
        data: { code, clientId: data.clientId, choiceId: interpreted.choiceId },
      });
    }
    const flags = flagsOf(room);
    const who = ROSTER_BY_ID[mine.character_id]?.name ?? "Следователь";
    await savePresentation(code, {
      narration: interpreted.narration,
      speakerId: "narrator",
      lastPublicEvent: `${who} говорит: «${data.text}»`,
      flags,
    });
    return { ok: true as const };
  });

export const submitRegisterPuzzle = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z
      .object({
        code: z.string(),
        clientId: z.string(),
        room3: z.string(),
        room5: z.string(),
        room7: z.string(),
        hiddenSeen: z.boolean(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const code = data.code.toUpperCase();
    const room = await loadRoom(code);
    if (!room) return { ok: false as const, error: "Стол не найден" };
    if (room.puzzle_id !== "register") {
      return { ok: false as const, error: "Реестр сейчас не на столе" };
    }
    const check = checkRegisterPuzzle({
      room3: data.room3,
      room5: data.room5,
      room7: data.room7,
      hiddenSeen: data.hiddenSeen,
    });
    if (!check.ok) return { ok: false as const, error: check.hint ?? "Не сходится" };
    const flags = { ...flagsOf(room), register_solved: true };
    const clues = addClue(
      parseJson<CluePublic[]>(room.clues_json, []),
      {
        id: "hidden_ink",
        title: "Исчезающие имена",
        body: "Синий свет проявил строку: пятница, подвал, тихий гость. Комната 7 — Восс. Комната 5 — Пелл. Третья — Миллс. Есть ещё имя, которого хозяйка не произносит.",
        source: "Реестр гостей",
      },
    );
    const pack = await loadLivePack();
    const presented = presentScene("parlor", flags, pack);
    await savePresentation(code, {
      flags,
      clues,
      puzzleId: null,
      sceneId: presented.sceneId,
      locationId: presented.locationId,
      speakerId: "narrator",
      narration:
        "Синий свет гаснет. В книге остаётся то, что обычная лампа отрицала: пятница, подвал, тихий гость. Хэтти отворачивается к окну. «Вы видели. Значит, уже поздно делать вид. Внизу дверь. Я её не отпирала сегодня. И не запирала.»",
      choices: presented.choices,
      lastPublicEvent: "Реестр сошёлся. Подвал больше не слух.",
    });
    return { ok: true as const };
  });

export const closePuzzle = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z.object({ code: z.string(), clientId: z.string() }).parse(input),
  )
  .handler(async ({ data }) => {
    const code = data.code.toUpperCase();
    const room = await loadRoom(code);
    if (!room) return { ok: false as const, error: "Стол не найден" };
    await savePresentation(code, { puzzleId: null });
    return { ok: true as const };
  });
