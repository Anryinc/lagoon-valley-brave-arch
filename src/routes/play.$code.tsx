import { createFileRoute, Link } from "@tanstack/react-router";
import { PlayerTable } from "@/components/player-table";
import { joinTable } from "@/lib/game/api";
import { useRoom } from "@/lib/game/use-room";
import { useEffect } from "react";

export const Route = createFileRoute("/play/$code")({ component: PlayPage });

function PlayPage() {
  const { code } = Route.useParams();
  const roomHook = useRoom(code);
  const { room, clientId, error } = roomHook;

  useEffect(() => {
    if (!clientId || clientId === "ssr") return;
    void joinTable({ data: { code, clientId } });
  }, [code, clientId]);

  if (error) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-bg px-6 text-center">
        <p className="font-display text-3xl text-paper">Стол не найден</p>
        <p className="text-sm text-muted">{error}</p>
        <Link to="/" className="text-sm text-night underline">
          На первую страницу
        </Link>
      </main>
    );
  }
  if (!room) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-bg font-display text-2xl text-paper">
        Садимся за стол…
      </main>
    );
  }

  return (
    <PlayerTable
      room={room}
      clientId={clientId}
      onClaim={(id) => roomHook.claim.mutate(id)}
      onCouncil={(on) => roomHook.council.mutate(on)}
      onChoose={(id) => roomHook.choose.mutate(id)}
      onAbility={async (id) => {
        const res = await roomHook.ability.mutateAsync(id);
        if (!res.ok) return { ok: false, error: res.error };
        return {
          ok: true,
          visibility: res.visibility,
          note: res.note,
        };
      }}
      onSpeak={(text) => roomHook.speak.mutate(text)}
      onRegister={(p) => roomHook.register.mutate(p)}
      onClosePuzzle={() => roomHook.dismissPuzzle.mutate()}
      claimError={
        roomHook.claim.data && !roomHook.claim.data.ok
          ? roomHook.claim.data.error
          : null
      }
      actionError={
        (roomHook.choose.data && !roomHook.choose.data.ok
          ? roomHook.choose.data.error
          : null) ||
        (roomHook.ability.data && !roomHook.ability.data.ok
          ? roomHook.ability.data.error
          : null) ||
        (roomHook.speak.data && !roomHook.speak.data.ok
          ? roomHook.speak.data.error
          : null) ||
        (roomHook.register.data && !roomHook.register.data.ok
          ? roomHook.register.data.error
          : null)
      }
      abilityBusy={roomHook.ability.isPending}
    />
  );
}
