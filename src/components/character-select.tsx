import { MAX_PARTY, ROSTER } from "@/lib/campaign/roster";
import type { SeatPublic } from "@/lib/campaign/types";
import { Portrait } from "@/components/portrait";
import { cn } from "@/lib/utils";

export function CharacterSelect({
  takenCharacterIds,
  seats,
  myCharacterId,
  myClientId,
  locked,
  onClaim,
  busy,
  error,
}: {
  takenCharacterIds: string[];
  seats: SeatPublic[];
  myCharacterId: string | null;
  myClientId: string;
  locked?: boolean;
  onClaim: (id: string | null) => void;
  busy?: boolean;
  error?: string | null;
}) {
  const remaining = Math.max(0, MAX_PARTY - takenCharacterIds.length);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="font-display text-2xl text-paper">Ростер бюро</p>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted">
            Трое или четверо. Чужую роль взять нельзя. Способности написаны
            человеческим языком — лор новеллы знать не нужно.
          </p>
        </div>
        <p className="shrink-0 font-display text-sm tabular-nums text-night">
          {takenCharacterIds.length}/{MAX_PARTY}
        </p>
      </div>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {ROSTER.map((ch) => {
          const takenBy = seats.find(
            (s) => s.characterId === ch.id && s.clientId !== myClientId,
          );
          const mine = myCharacterId === ch.id;
          const blocked = Boolean(takenBy) || (locked && !mine);
          const partyFull =
            !mine && !takenBy && remaining === 0 && takenCharacterIds.length >= MAX_PARTY;
          const disabled = blocked || partyFull || busy || locked;

          return (
            <button
              key={ch.id}
              type="button"
              disabled={disabled && !mine}
              onClick={() => onClaim(mine ? null : ch.id)}
              className={cn(
                "flex overflow-hidden rounded-[20px] border text-left transition-colors",
                mine
                  ? "border-night bg-raised"
                  : blocked
                    ? "border-line/60 bg-surface/60 opacity-55"
                    : "border-line bg-surface hover:border-brass/70",
              )}
            >
              <Portrait
                src={ch.portrait}
                name={ch.name}
                tone={ch.fallbackTone}
                mark={ch.mark}
                className="h-[220px] w-[118px] shrink-0 rounded-none sm:h-[240px]"
              />
              <div className="flex min-w-0 flex-1 flex-col gap-1 p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-display text-lg leading-tight text-paper">
                    {ch.name}
                  </p>
                  {mine ? (
                    <span className="rounded-full border border-night/50 px-2 py-0.5 text-[10px] uppercase tracking-wider text-night">
                      ваша
                    </span>
                  ) : takenBy ? (
                    <span className="rounded-full border border-line px-2 py-0.5 text-[10px] uppercase tracking-wider text-faint">
                      занято
                    </span>
                  ) : null}
                </div>
                <p className="text-[11px] uppercase tracking-[0.14em] text-brass">
                  {ch.pathwayName} · {ch.occupation}
                </p>
                <p className="line-clamp-3 text-xs leading-relaxed text-muted">
                  {ch.pathwayPlain}
                </p>
                <ul className="mt-1 space-y-1">
                  {ch.abilities.map((a) => (
                    <li key={a.id} className="text-[11px] leading-snug text-ink/85">
                      <span className="text-paper">{a.name}.</span> {a.summary}{" "}
                      <span className="text-faint">
                        {a.visibility === "private"
                          ? "Результат только на вашем телефоне."
                          : "Стол увидит, что вы сделали."}
                      </span>
                    </li>
                  ))}
                </ul>
                {takenBy ? (
                  <p className="mt-auto pt-1 text-xs text-faint">
                    Уже взял {takenBy.displayName}
                  </p>
                ) : mine ? (
                  <p className="mt-auto pt-1 text-xs text-night">
                    Нажмите, чтобы отпустить
                  </p>
                ) : partyFull ? (
                  <p className="mt-auto pt-1 text-xs text-faint">Стол полный</p>
                ) : (
                  <p className="mt-auto pt-1 text-xs text-faint">Нажмите, чтобы сесть</p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
