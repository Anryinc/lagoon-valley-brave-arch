import { createFileRoute, Link } from "@tanstack/react-router";
import { PlayerTable } from "@/components/player-table";
import { useGuestRoom } from "@/lib/game/use-p2p-room";
import { useState } from "react";
import { z } from "zod";

const searchSchema = z.object({
  p: z.string().optional(),
});

export const Route = createFileRoute("/play/$code")({
  validateSearch: (s) => searchSchema.parse(s),
  component: PlayPage,
});

function PlayPage() {
  const { code } = Route.useParams();
  const guest = useGuestRoom(code);
  const { room, clientId, error } = guest;
  const [claimError, setClaimError] = useState<string | null>(null);
  const [abilityBusy, setAbilityBusy] = useState(false);

  if (error && !room) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-bg px-6 text-center">
        <p className="font-display text-3xl text-paper">Стол</p>
        <p className="text-sm text-muted">{error}</p>
        <p className="max-w-sm text-xs text-faint">
          Код {code.toUpperCase()}. Убедитесь, что на ПК/ноутбуке открыт этот стол
          и вкладка не ушла в сон.
        </p>
        <Link to="/" className="text-sm text-night underline">
          К проектам
        </Link>
      </main>
    );
  }
  if (!room) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-2 bg-bg px-6 text-center">
        <p className="font-display text-2xl text-paper">Садимся за стол…</p>
        <p className="text-xs text-faint">Ищем хоста по коду {code.toUpperCase()}</p>
      </main>
    );
  }

  return (
    <PlayerTable
      room={room}
      clientId={clientId}
      onClaim={(id) => {
        guest.claim(id);
        setClaimError(null);
      }}
      onCouncil={(on) => guest.council(on)}
      onChoose={(id) => guest.choose(id)}
      onAbility={async (id) => {
        setAbilityBusy(true);
        try {
          const res = await guest.ability(id);
          if (!res.ok) return { ok: false, error: res.error };
          return {
            ok: true,
            visibility: res.visibility,
            note: res.note,
          };
        } finally {
          setAbilityBusy(false);
        }
      }}
      onSpeak={(text) => guest.speak(text)}
      onRegister={(p) => guest.register(p)}
      onClosePuzzle={() => guest.dismissPuzzle()}
      claimError={claimError}
      actionError={guest.lastActionError}
      abilityBusy={abilityBusy}
    />
  );
}
