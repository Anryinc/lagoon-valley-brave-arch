import { LOCATION_BY_ID } from "@/lib/campaign/locations";
import { ROSTER_BY_ID } from "@/lib/campaign/roster";
import type { RoomSnapshot } from "@/lib/campaign/types";
import { Portrait } from "@/components/portrait";
import { CharacterSelect } from "@/components/character-select";
import { GuestRegister } from "@/components/guest-register";
import { TableQr } from "@/components/table-qr";
import { speakText } from "@/lib/game/tts";
import { cn } from "@/lib/utils";
import { MicOff, Users, Volume2, Eye } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function StageView({
  room,
  clientId,
  onClaim,
  onStart,
  onCouncil,
  onRegister,
  onClosePuzzle,
  onChoose,
  onAbility,
  claimError,
  startError,
  actionError,
}: {
  room: RoomSnapshot;
  clientId: string;
  onClaim: (id: string | null) => void;
  onStart: () => void;
  onCouncil: (on: boolean) => void;
  onRegister: (p: {
    room3: string;
    room5: string;
    room7: string;
    hiddenSeen: boolean;
  }) => void;
  onClosePuzzle: () => void;
  onChoose: (id: string) => void;
  onAbility?: (id: string) => Promise<{
    ok: boolean;
    visibility?: "private" | "public";
    note?: { title: string; body: string };
    error?: string;
  }>;
  claimError?: string | null;
  startError?: string | null;
  actionError?: string | null;
}) {
  const loc = LOCATION_BY_ID[room.locationId];
  const [voiceOn, setVoiceOn] = useState(false);
  const [deskOpen, setDeskOpen] = useState(false);
  const [privateNote, setPrivateNote] = useState<{ title: string; body: string } | null>(
    null,
  );
  const lastSpoken = useRef("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const me = room.myCharacterId ? ROSTER_BY_ID[room.myCharacterId] : null;

  useEffect(() => {
    if (!voiceOn) {
      audioRef.current?.pause();
      return;
    }
    if (!room.narration || room.narration === lastSpoken.current) return;
    lastSpoken.current = room.narration;
    let cancelled = false;
    const play = async () => {
      audioRef.current?.pause();
      const hash = await narrationKey(room.narration);
      if (cancelled) return;
      const file = await fetch(`/voice/${hash}.mp3`).catch(() => null);
      const type = file?.headers.get("content-type") ?? "";
      if (file?.ok && type.includes("audio")) {
        const url = URL.createObjectURL(await file.blob());
        if (cancelled) {
          URL.revokeObjectURL(url);
          return;
        }
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onended = () => URL.revokeObjectURL(url);
        await audio.play().catch(() => undefined);
        return;
      }
      const res = await speakText({ data: { text: room.narration } });
      if (cancelled || !res.ok) return;
      const audio = new Audio(`data:${res.mime};base64,${res.audioBase64}`);
      audioRef.current = audio;
      await audio.play().catch(() => undefined);
    };
    void play();
    return () => {
      cancelled = true;
      audioRef.current?.pause();
    };
  }, [room.narration, voiceOn]);

  return (
    <div className="relative min-h-dvh overflow-hidden bg-bg text-ink">
      {loc?.image ? (
        <img
          src={loc.image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
        />
      ) : (
        <div className="absolute inset-0 grain" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/55 to-bg/25" />
      <div className="absolute inset-0 bg-gradient-to-r from-bg/70 via-transparent to-bg/40" />

      <header className="relative z-10 flex items-start justify-between gap-4 px-4 py-4 md:px-8">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-brass">
            Червудский свидетель
          </p>
          <h1 className="font-display text-3xl text-paper md:text-4xl">
            {room.status === "lobby" ? "Стол ещё собирается" : room.locationName}
          </h1>
          <p className="mt-1 font-display text-lg tabular-nums tracking-[0.2em] text-night">
            {room.code}
          </p>
        </div>
        <div className="flex flex-wrap items-start justify-end gap-2">
          {room.status === "playing" ? (
            <TableQr code={room.code} size={88} compact />
          ) : null}
          <button
            type="button"
            onClick={() => setVoiceOn((v) => !v)}
            className={cn(
              "flex h-11 items-center gap-2 rounded-full border px-3 text-xs uppercase tracking-wider",
              voiceOn ? "border-night bg-night/20 text-paper" : "border-line text-muted",
            )}
          >
            <Volume2 className="size-4" />
            {voiceOn ? "Голос" : "Без голоса"}
          </button>
          <button
            type="button"
            onClick={() => onCouncil(!room.council)}
            className={cn(
              "flex h-11 items-center gap-2 rounded-full border px-3 text-xs uppercase tracking-wider",
              room.council
                ? "border-danger bg-danger/20 text-paper"
                : "border-line text-muted",
            )}
          >
            <MicOff className="size-4" />
            {room.council ? "Идёт совет" : "Совет"}
          </button>
          {me && room.status === "playing" ? (
            <button
              type="button"
              onClick={() => setDeskOpen((v) => !v)}
              className="flex h-11 items-center gap-2 rounded-full border border-line px-3 text-xs uppercase tracking-wider text-muted"
            >
              <Eye className="size-4" />
              Личный стол
            </button>
          ) : null}
        </div>
      </header>

      {room.council ? (
        <div className="relative z-10 mx-4 mb-3 rounded-[16px] border border-danger/40 bg-danger/15 px-4 py-3 text-sm text-paper md:mx-8">
          Стол совещается. Мастер глухой, пока не снимут «Совет».
        </div>
      ) : null}

      {room.status === "lobby" ? (
        <div className="relative z-10 mx-auto max-w-5xl px-4 pb-24 md:px-8">
          <div className="mb-6 flex flex-col gap-4 rounded-[20px] border border-line bg-bg/70 p-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-sm text-muted">
                <Users className="size-4" />
                Наведите камеру телефона на QR — откроется личный стол.
              </p>
              {startError ? <p className="mt-2 text-sm text-danger">{startError}</p> : null}
              {room.isHost ? (
                <>
                  <button
                    type="button"
                    onClick={onStart}
                    className="mt-4 h-12 rounded-[16px] bg-paper px-6 text-sm font-medium text-bg disabled:opacity-40"
                    disabled={room.seatedCount < 1}
                  >
                    Начать дело
                  </button>
                  {room.seatedCount < 1 ? (
                    <p className="mt-2 text-sm text-brass">
                      Сначала нажмите карточку в ростере — свою роль. Без роли
                      кнопки в деле будут молчать.
                    </p>
                  ) : (
                    <p className="mt-2 text-sm text-muted">
                      Роль взята. Можно начинать — действия появятся и на сцене, и на телефонах.
                    </p>
                  )}
                </>
              ) : (
                <p className="mt-3 text-sm text-faint">Ждём хоста.</p>
              )}
            </div>
            <TableQr code={room.code} size={152} />
          </div>
          <CharacterSelect
            takenCharacterIds={room.takenCharacterIds}
            seats={room.seats}
            myCharacterId={room.myCharacterId}
            myClientId={clientId}
            onClaim={onClaim}
            error={claimError}
          />
        </div>
      ) : (
        <div className="relative z-10 flex min-h-[70dvh] flex-col justify-end">
          <div className="grid items-end gap-4 px-4 pb-6 md:grid-cols-[minmax(0,280px)_1fr] md:px-8">
            {room.speakerId && room.speakerId !== "narrator" ? (
              <Portrait
                src={room.speakerPortrait}
                name={room.speakerName ?? ""}
                tone={room.speakerTone}
                className="mx-auto h-[42vh] w-[min(72vw,280px)] rounded-[24px] md:mx-0 md:h-[52vh] md:w-full"
              />
            ) : (
              <div />
            )}
            <div className="rounded-[24px] border border-line/80 bg-bg/78 p-4 md:p-6">
              <p className="text-[11px] uppercase tracking-[0.22em] text-brass">
                {room.speakerName ?? "Хранитель дела"}
              </p>
              <p className="mt-3 font-display text-xl leading-snug text-paper md:text-2xl">
                {room.narration}
              </p>
              {room.lastPublicEvent ? (
                <p className="mt-4 rounded-[14px] border border-night/30 bg-night/10 px-3 py-2 text-sm text-paper">
                  {room.lastPublicEvent}
                </p>
              ) : null}
              {actionError ? <p className="mt-3 text-sm text-danger">{actionError}</p> : null}
              {room.choices.length > 0 ? (
                <div className="mt-4 grid gap-2 md:grid-cols-2">
                  {room.choices.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      disabled={room.council}
                      onClick={() => onChoose(c.id)}
                      className="min-h-11 rounded-[14px] border border-line bg-raised/80 px-3 py-2 text-left text-sm text-ink disabled:opacity-40"
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-muted">
                  {room.sceneId === "ending"
                    ? "Акт I завершён. Можно закрыть стол."
                    : "В этой сцене нет открытых действий — смените комнату или примените способность с телефона."}
                </p>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                {room.seats
                  .filter((s) => s.characterId)
                  .map((s) => (
                    <span
                      key={s.clientId}
                      className="rounded-full border border-line px-3 py-1 text-xs text-muted"
                    >
                      {ROSTER_BY_ID[s.characterId!]?.name ?? s.displayName}
                    </span>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {room.puzzleId === "register" ? (
        <div className="absolute inset-0 z-20 bg-bg/70 p-3 md:p-8">
          <div className="mx-auto h-full max-w-lg overflow-hidden rounded-[24px] border border-line bg-surface">
            <GuestRegister
              onSolve={onRegister}
              onClose={onClosePuzzle}
              error={actionError}
            />
          </div>
        </div>
      ) : null}

      {deskOpen && me && onAbility ? (
        <div className="absolute inset-y-0 right-0 z-30 flex w-full max-w-md flex-col border-l border-line bg-bg/95 p-4 md:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-brass">Личный стол</p>
              <p className="font-display text-2xl text-paper">{me.name}</p>
            </div>
            <button
              type="button"
              onClick={() => setDeskOpen(false)}
              className="rounded-full border border-line px-3 py-1 text-xs uppercase tracking-wider text-muted"
            >
              Закрыть
            </button>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted">{me.pathwayPlain}</p>
          <div className="mt-4 flex-1 space-y-3 overflow-auto">
            {me.abilities.map((ab) => {
              const used = room.usedAbilityIds.includes(ab.id);
              return (
                <div key={ab.id} className="rounded-[18px] border border-line bg-surface p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-display text-lg text-paper">{ab.name}</p>
                    <span className="text-[10px] uppercase tracking-wider text-faint">
                      {ab.visibility === "private" ? "только вам" : "стол увидит"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{ab.detail}</p>
                  <button
                    type="button"
                    disabled={room.council || used}
                    onClick={async () => {
                      const res = await onAbility(ab.id);
                      if (res.ok && res.note && res.visibility === "private") {
                        setPrivateNote(res.note);
                      }
                    }}
                    className="mt-3 h-11 w-full rounded-[14px] bg-paper text-sm text-bg disabled:opacity-40"
                  >
                    {used ? "Уже в этой сцене" : "Применить"}
                  </button>
                </div>
              );
            })}
            {room.myNotes.length > 0 ? (
              <div className="space-y-2">
                <p className="text-[11px] uppercase tracking-wider text-faint">Только вы это видели</p>
                {room.myNotes.map((n) => (
                  <article key={n.id} className="rounded-[16px] border border-line bg-raised p-3">
                    <p className="font-display text-base text-paper">{n.title}</p>
                    <p className="mt-1 text-sm text-muted">{n.body}</p>
                  </article>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {privateNote ? (
        <div className="absolute inset-0 z-40 flex items-end bg-bg/70 p-4 sm:items-center sm:justify-center">
          <div className="w-full max-w-lg rounded-[24px] border border-line bg-surface p-5">
            <p className="text-[11px] uppercase tracking-[0.2em] text-brass">
              Только ваш экран
            </p>
            <p className="mt-2 font-display text-2xl text-paper">{privateNote.title}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted">{privateNote.body}</p>
            <button
              type="button"
              className="mt-5 h-12 w-full rounded-[16px] bg-paper text-sm text-bg"
              onClick={() => setPrivateNote(null)}
            >
              Скрыть
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

async function narrationKey(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 16);
}
