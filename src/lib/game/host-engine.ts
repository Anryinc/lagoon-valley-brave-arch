/**
 * In-memory authoritative room for host-screen play.
 * No server DB: state lives in the host tab until the tab closes.
 */

import { LOCATION_BY_ID } from "@/lib/campaign/locations";
import {
  applyAbility,
  applyChoice,
  checkRegisterPuzzle,
  defaultPack,
  presentScene,
  type CampaignPack,
} from "@/lib/campaign/rails";
import { MAX_PARTY, NPC_BY_ID, ROSTER_BY_ID } from "@/lib/campaign/roster";
import type {
  ChoicePublic,
  CluePublic,
  PrivateNote,
  RoomSnapshot,
  RoomStatus,
  SeatPublic,
} from "@/lib/campaign/types";
import { newId } from "./ids";

type Seat = {
  clientId: string;
  displayName: string;
  characterId: string | null;
};

export type AbilityOutcome = {
  ok: boolean;
  visibility?: "private" | "public";
  note?: { title: string; body: string };
  error?: string;
  publicEvent?: string;
  clue?: CluePublic;
};

export class HostEngine {
  readonly code: string;
  readonly hostClientId: string;
  private pack: CampaignPack;
  private status: RoomStatus = "lobby";
  private council = false;
  private sceneId = "street";
  private locationId = "street";
  private speakerId: string | null = null;
  private narration =
    "Стол собирается. Возьмите роли на телефонах. Хост нажмёт «Начать дело».";
  private choices: ChoicePublic[] = [];
  private flags: Record<string, boolean> = {};
  private clues: CluePublic[] = [];
  private puzzleId: string | null = null;
  private lastPublicEvent: string | null = null;
  private seats: Seat[] = [];
  private notes = new Map<string, PrivateNote[]>();
  private listeners = new Set<() => void>();

  constructor(code: string, hostClientId: string, pack?: CampaignPack) {
    this.code = code.toUpperCase();
    this.hostClientId = hostClientId;
    this.pack = pack ?? defaultPack();
    // Host has a seat so StageView can show roster / claim if desired
    this.seats.push({
      clientId: hostClientId,
      displayName: "Хост",
      characterId: null,
    });
  }

  subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private emit() {
    for (const fn of this.listeners) fn();
  }

  ensureSeat(clientId: string, displayName = "Игрок") {
    if (this.seats.some((s) => s.clientId === clientId)) return { ok: true as const };
    if (this.seats.length >= MAX_PARTY + 1) {
      // +1 host seat allowance; players with roles capped by MAX_PARTY at claim
      return { ok: false as const, error: "Стол заполнен" };
    }
    this.seats.push({ clientId, displayName, characterId: null });
    this.emit();
    return { ok: true as const };
  }

  dropSeat(clientId: string) {
    if (clientId === this.hostClientId) return;
    this.seats = this.seats.filter((s) => s.clientId !== clientId);
    this.notes.delete(clientId);
    this.emit();
  }

  snapshotFor(clientId: string): RoomSnapshot {
    const loc = LOCATION_BY_ID[this.locationId];
    const my = this.seats.find((s) => s.clientId === clientId);
    const speaker = speakerOf(this.speakerId);
    const usedPrefix = my?.characterId
      ? `used:${this.sceneId}:${my.characterId}:`
      : null;
    return {
      code: this.code,
      isHost: clientId === this.hostClientId,
      status: this.status,
      council: this.council,
      sceneId: this.sceneId,
      locationId: this.locationId,
      locationName: loc?.name ?? this.locationId,
      speakerId: this.speakerId,
      speakerName: speaker.name,
      speakerPortrait: speaker.portrait,
      speakerTone: speaker.tone,
      narration: this.narration,
      lastPublicEvent: this.lastPublicEvent,
      choices: this.choices,
      seats: this.seats.map(
        (s): SeatPublic => ({
          clientId: s.clientId,
          displayName: s.displayName,
          characterId: s.characterId,
        }),
      ),
      myCharacterId: my?.characterId ?? null,
      myNotes: this.notes.get(clientId) ?? [],
      clues: this.clues,
      puzzleId: this.puzzleId,
      takenCharacterIds: this.seats
        .map((s) => s.characterId)
        .filter((id): id is string => Boolean(id)),
      seatedCount: this.seats.filter((s) => s.characterId).length,
      usedAbilityIds: usedPrefix
        ? Object.keys(this.flags)
            .filter((k) => k.startsWith(usedPrefix) && this.flags[k])
            .map((k) => k.slice(usedPrefix.length))
        : [],
    };
  }

  claim(clientId: string, characterId: string | null): { ok: boolean; error?: string } {
    this.ensureSeat(clientId);
    const seat = this.seats.find((s) => s.clientId === clientId);
    if (!seat) return { ok: false, error: "Вас нет за столом" };
    if (characterId) {
      if (!ROSTER_BY_ID[characterId]) return { ok: false, error: "Нет такой роли" };
      const taken = this.seats.some(
        (s) => s.characterId === characterId && s.clientId !== clientId,
      );
      if (taken) return { ok: false, error: "Этого уже взяли" };
      const withRoles = this.seats.filter((s) => s.characterId).length;
      if (!seat.characterId && withRoles >= MAX_PARTY) {
        return { ok: false, error: `За столом уже ${MAX_PARTY}` };
      }
      seat.characterId = characterId;
      seat.displayName = ROSTER_BY_ID[characterId]!.name;
    } else {
      seat.characterId = null;
      seat.displayName = clientId === this.hostClientId ? "Хост" : "Игрок";
    }
    this.emit();
    return { ok: true };
  }

  start(clientId: string): { ok: boolean; error?: string } {
    if (clientId !== this.hostClientId) {
      return { ok: false, error: "Начать дело может только хост" };
    }
    if (!this.seats.some((s) => s.characterId)) {
      return { ok: false, error: "Нужна хотя бы одна роль" };
    }
    const presented = presentScene(this.pack.startScene, {}, this.pack);
    this.status = "playing";
    this.sceneId = presented.sceneId;
    this.locationId = presented.locationId;
    this.speakerId = presented.speakerId;
    this.narration = presented.narration;
    this.choices = presented.choices;
    this.flags = {};
    this.clues = [];
    this.puzzleId = null;
    this.lastPublicEvent = null;
    this.council = false;
    this.emit();
    return { ok: true };
  }

  setCouncil(on: boolean): { ok: boolean } {
    this.council = on;
    this.emit();
    return { ok: true };
  }

  choose(clientId: string, choiceId: string): { ok: boolean; error?: string } {
    if (this.status !== "playing") return { ok: false, error: "Дело ещё не начато" };
    if (this.council) return { ok: false, error: "Стол совещается" };
    const mine = this.seats.find((s) => s.clientId === clientId);
    if (!mine?.characterId && clientId !== this.hostClientId) {
      return { ok: false, error: "Сначала возьмите роль" };
    }
    const applied = applyChoice(this.sceneId, choiceId, this.flags, this.pack);
    this.flags = applied.flags;
    this.clues = addClue(this.clues, applied.clue);
    this.sceneId = applied.presentation.sceneId;
    this.locationId = applied.presentation.locationId;
    this.speakerId = applied.presentation.speakerId;
    this.narration = applied.presentation.narration;
    this.choices = applied.presentation.choices;
    if (applied.puzzleId !== undefined) this.puzzleId = applied.puzzleId;
    if (applied.publicEvent) this.lastPublicEvent = applied.publicEvent;
    this.emit();
    return { ok: true };
  }

  ability(clientId: string, abilityId: string): AbilityOutcome {
    if (this.status !== "playing") return { ok: false, error: "Дело ещё не начато" };
    if (this.council) return { ok: false, error: "Стол совещается" };
    const mine = this.seats.find((s) => s.clientId === clientId);
    if (!mine?.characterId) return { ok: false, error: "Сначала возьмите роль" };
    const usedKey = `used:${this.sceneId}:${mine.characterId}:${abilityId}`;
    if (this.flags[usedKey]) return { ok: false, error: "Уже в этой сцене" };

    const applied = applyAbility(
      this.sceneId,
      abilityId,
      mine.characterId,
      this.flags,
      this.pack,
    );
    this.flags = applied.flags;
    this.clues = addClue(this.clues, applied.result.clue);

    if (applied.nextSceneId) {
      const presented = presentScene(applied.nextSceneId, this.flags, this.pack);
      this.sceneId = presented.sceneId;
      this.locationId = presented.locationId;
      this.speakerId = presented.speakerId;
      this.narration = presented.narration;
      this.choices = presented.choices;
    }

    if (applied.puzzleId) this.puzzleId = applied.puzzleId;

    let publicEvent: string | undefined;
    if (applied.visibility === "public") {
      publicEvent =
        applied.result.publicEvent ??
        `${applied.characterName} применяет «${applied.abilityName}».`;
      this.lastPublicEvent = publicEvent;
      if (applied.result.body) {
        this.narration = applied.result.body;
        this.speakerId = "narrator";
      }
    }

    const note = {
      title: applied.result.title,
      body: applied.result.body,
    };
    if (applied.visibility === "private") {
      const list = this.notes.get(clientId) ?? [];
      list.unshift({
        id: newId(),
        title: note.title,
        body: note.body,
        createdAt: new Date().toISOString(),
      });
      this.notes.set(clientId, list.slice(0, 20));
    }

    this.emit();
    return {
      ok: true,
      visibility: applied.visibility,
      note,
      publicEvent,
      clue: applied.result.clue,
    };
  }

  speak(clientId: string, text: string): { ok: boolean; error?: string } {
    if (this.status !== "playing") return { ok: false, error: "Дело ещё не начато" };
    if (this.council) return { ok: false, error: "Стол совещается. Мастер глухой." };
    const mine = this.seats.find((s) => s.clientId === clientId);
    if (!mine?.characterId) return { ok: false, error: "Сначала возьмите роль" };
    const trimmed = text.trim().slice(0, 400);
    if (!trimmed) return { ok: false, error: "Пусто" };

    const lowered = trimmed.toLowerCase();
    const fuzzy = this.choices.find((c) => {
      const l = c.label.toLowerCase();
      return lowered.includes(l.slice(0, 12)) || l.includes(lowered.slice(0, 12));
    });
    if (fuzzy) return this.choose(clientId, fuzzy.id);

    const who = ROSTER_BY_ID[mine.characterId]?.name ?? "Следователь";
    this.narration = `Хранитель дела слушает ${who}. «${trimmed}» — смело, но засов от этого не двигается. Выберите одно из действий на столе или примените способность.`;
    this.speakerId = "narrator";
    this.lastPublicEvent = `${who} говорит: «${trimmed}»`;
    this.emit();
    return { ok: true };
  }

  register(
    clientId: string,
    input: { room3: string; room5: string; room7: string; hiddenSeen: boolean },
  ): { ok: boolean; error?: string } {
    if (this.puzzleId !== "register") {
      return { ok: false, error: "Реестр сейчас не на столе" };
    }
    const check = checkRegisterPuzzle(input);
    if (!check.ok) return { ok: false, error: check.hint ?? "Не сходится" };
    this.flags = { ...this.flags, register_solved: true };
    this.clues = addClue(this.clues, {
      id: "hidden_ink",
      title: "Исчезающие имена",
      body: "Синий свет проявил строку: пятница, подвал, тихий гость. Комната 7 — Восс. Комната 5 — Пелл. Третья — Миллс. Есть ещё имя, которого хозяйка не произносит.",
      source: "Реестр гостей",
    });
    const presented = presentScene("parlor", this.flags, this.pack);
    this.puzzleId = null;
    this.sceneId = presented.sceneId;
    this.locationId = presented.locationId;
    this.speakerId = "narrator";
    this.narration =
      "Синий свет гаснет. В книге остаётся то, что обычная лампа отрицала: пятница, подвал, тихий гость. Хэтти отворачивается к окну. «Вы видели. Значит, уже поздно делать вид. Внизу дверь. Я её не отпирала сегодня. И не запирала.»";
    this.choices = presented.choices;
    this.lastPublicEvent = "Реестр сошёлся. Подвал больше не слух.";
    this.emit();
    return { ok: true };
  }

  closePuzzle(): { ok: boolean } {
    this.puzzleId = null;
    this.emit();
    return { ok: true };
  }
}

function addClue(list: CluePublic[], clue?: CluePublic) {
  if (!clue) return list;
  if (list.some((c) => c.id === clue.id)) return list;
  return [...list, clue];
}

function speakerOf(id: string | null) {
  if (!id) {
    return {
      name: null as string | null,
      portrait: null as string | null,
      tone: null as string | null,
    };
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
