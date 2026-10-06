import { ROSTER_BY_ID } from "@/lib/campaign/roster";
import type { RoomSnapshot } from "@/lib/campaign/types";
import { CharacterSelect } from "@/components/character-select";
import { GuestRegister } from "@/components/guest-register";
import { Portrait } from "@/components/portrait";
import { SpeechButton } from "@/components/speech-button";
import { cn } from "@/lib/utils";
import { BookOpen, Eye, MicOff, ScrollText, User } from "lucide-react";
import { useEffect, useState } from "react";

type Tab = "act" | "skill" | "clues" | "dossier";

export function PlayerTable({
  room,
  clientId,
  onClaim,
  onCouncil,
  onChoose,
  onAbility,
  onSpeak,
  onRegister,
  onClosePuzzle,
  claimError,
  actionError,
  abilityBusy,
}: {
  room: RoomSnapshot;
  clientId: string;
  onClaim: (id: string | null) => void;
  onCouncil: (on: boolean) => void;
  onChoose: (id: string) => void;
  onAbility: (id: string) => Promise<{
    ok: boolean;
    visibility?: "private" | "public";
    note?: { title: string; body: string };
    error?: string;
  }>;
  onSpeak: (text: string) => void;
  onRegister: (p: {
    room3: string;
    room5: string;
    room7: string;
    hiddenSeen: boolean;
  }) => void;
  onClosePuzzle: () => void;
  claimError?: string | null;
  actionError?: string | null;
  abilityBusy?: boolean;
}) {
  const [tab, setTab] = useState<Tab>("act");
  const [privateNote, setPrivateNote] = useState<{ title: string; body: string } | null>(
    null,
  );
  const me = room.myCharacterId ? ROSTER_BY_ID[room.myCharacterId] : null;

  useEffect(() => {
    if (room.status === "playing") setTab("act");
  }, [room.status]);

  if (room.status === "lobby" || !me) {
    return (
      <div className="mx-auto min-h-dvh max-w-lg bg-bg px-4 py-5">
        <Header room={room} onCouncil={onCouncil} />
        <CharacterSelect
          takenCharacterIds={room.takenCharacterIds}
          seats={room.seats}
          myCharacterId={room.myCharacterId}
          myClientId={clientId}
          locked={room.status === "playing"}
          onClaim={onClaim}
          error={claimError}
        />
        {me ? (
          <p className="mt-4 text-sm text-muted">Ждём, пока хост откроет дело.</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col bg-bg">
      <Header room={room} onCouncil={onCouncil} />
      <div className="flex items-center gap-3 px-4">
        <Portrait
          src={me.portrait}
          name={me.name}
          tone={me.fallbackTone}
          className="h-16 w-12 rounded-[12px]"
        />
        <div className="min-w-0">
          <p className="font-display text-xl leading-tight text-paper">{me.name}</p>
          <p className="text-[11px] uppercase tracking-[0.16em] text-brass">
            {me.pathwayName}
          </p>
        </div>
      </div>

      <div className="mt-4 flex-1 px-4 pb-28">
        {tab === "act" ? (
          <div className="flex flex-col gap-3">
            <p className="text-[11px] uppercase tracking-[0.2em] text-faint">
              {room.locationName}
            </p>
            <p className="font-display text-xl leading-snug text-paper">
              {room.narration}
            </p>
            {room.lastPublicEvent ? (
              <p className="text-sm text-night">{room.lastPublicEvent}</p>
            ) : null}
            {actionError ? <p className="text-sm text-danger">{actionError}</p> : null}
            <div className="flex flex-col gap-2">
              {room.choices.length === 0 ? (
                <p className="rounded-[16px] border border-line bg-surface px-4 py-3 text-sm text-muted">
                  {room.sceneId === "ending"
                    ? "Акт I завершён. Книгу можно закрыть."
                    : "Сейчас нет открытых действий. Попробуйте способность или подождите реплику стола."}
                </p>
              ) : (
                room.choices.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    disabled={room.council}
                    onClick={() => onChoose(c.id)}
                    className="min-h-12 rounded-[16px] border border-line bg-surface px-4 py-3 text-left text-sm text-ink disabled:opacity-40"
                  >
                    {c.label}
                  </button>
                ))
              )}
            </div>
            <SpeechButton disabled={room.council} onConfirm={onSpeak} />
          </div>
        ) : null}

        {tab === "skill" ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm leading-relaxed text-muted">{me.pathwayPlain}</p>
            {me.abilities.map((ab) => {
              const used = room.usedAbilityIds.includes(ab.id);
              return (
              <div key={ab.id} className="rounded-[20px] border border-line bg-surface p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-display text-xl text-paper">{ab.name}</p>
                  <span className="rounded-full border border-line px-2 py-0.5 text-[10px] uppercase tracking-wider text-faint">
                    {ab.visibility === "private" ? "только вам" : "стол увидит"}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted">{ab.detail}</p>
                <button
                  type="button"
                  disabled={room.council || abilityBusy || used}
                  onClick={async () => {
                    const res = await onAbility(ab.id);
                    if (res.ok && res.note && res.visibility === "private") {
                      setPrivateNote(res.note);
                    }
                  }}
                  className="mt-3 h-11 w-full rounded-[14px] bg-paper text-sm text-bg disabled:opacity-40"
                >
                  {used
                    ? "Уже применяли в этой сцене"
                    : room.council
                      ? "Сначала закончите совет"
                      : "Применить с телефона"}
                </button>
              </div>
              );
            })}
          </div>
        ) : null}

        {tab === "clues" ? (
          <div className="flex flex-col gap-3">
            {room.clues.length === 0 ? (
              <p className="text-sm text-muted">Пока пусто. Смотрите, спрашивайте, применяйте способности.</p>
            ) : (
              room.clues.map((c) => (
                <article key={c.id} className="rounded-[20px] border border-line bg-surface p-4">
                  <p className="text-[11px] uppercase tracking-wider text-brass">{c.source}</p>
                  <p className="mt-1 font-display text-xl text-paper">{c.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{c.body}</p>
                </article>
              ))
            )}
          </div>
        ) : null}

        {tab === "dossier" ? (
          <div className="flex flex-col gap-3">
            <p className="font-display text-2xl text-paper">{me.occupation}</p>
            <p className="text-sm italic text-muted">«{me.quote}»</p>
            <p className="text-sm leading-relaxed text-muted">{me.pathwayPlain}</p>
            <p className="text-[11px] uppercase tracking-wider text-faint">Личные заметки</p>
            {room.myNotes.length === 0 ? (
              <p className="text-sm text-muted">Способности оставят след здесь — только на этом телефоне.</p>
            ) : (
              room.myNotes.map((n) => (
                <article key={n.id} className="rounded-[20px] border border-line bg-raised p-4">
                  <p className="font-display text-lg text-paper">{n.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{n.body}</p>
                </article>
              ))
            )}
          </div>
        ) : null}
      </div>

      <nav className="fixed inset-x-0 bottom-0 mx-auto flex max-w-lg border-t border-line bg-bg/95 px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {(
          [
            ["act", "Дело", ScrollText],
            ["skill", "Сила", Eye],
            ["clues", "Улики", BookOpen],
            ["dossier", "Досье", User],
          ] as const
        ).map(([id, label, Icon]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "flex h-12 flex-1 flex-col items-center justify-center gap-0.5 text-[10px] uppercase tracking-wider",
              tab === id ? "text-paper" : "text-faint",
            )}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </nav>

      {privateNote ? (
        <div className="fixed inset-0 z-30 flex items-end bg-bg/70 p-3 sm:items-center sm:justify-center">
          <div className="w-full max-w-lg rounded-[24px] border border-line bg-surface p-5">
            <p className="text-[11px] uppercase tracking-[0.2em] text-brass">
              Только ваш телефон
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

      {room.puzzleId === "register" ? (
        <div className="fixed inset-0 z-20 bg-bg">
          <GuestRegister
            onSolve={onRegister}
            onClose={onClosePuzzle}
            error={actionError}
          />
        </div>
      ) : null}
    </div>
  );
}

function Header({
  room,
  onCouncil,
}: {
  room: RoomSnapshot;
  onCouncil: (on: boolean) => void;
}) {
  return (
    <header className="flex items-start justify-between gap-3 px-4 pb-4 pt-3">
      <div>
        <p className="text-[11px] uppercase tracking-[0.24em] text-brass">
          Червудский свидетель
        </p>
        <p className="font-display text-lg tabular-nums tracking-[0.18em] text-night">
          {room.code}
        </p>
      </div>
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
    </header>
  );
}
