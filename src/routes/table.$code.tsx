import { createFileRoute, Link } from "@tanstack/react-router";
import { StageView } from "@/components/stage-view";
import { useRoom } from "@/lib/game/use-room";

export const Route = createFileRoute("/table/$code")({ component: TablePage });

function TablePage() {
  const { code } = Route.useParams();
  const roomHook = useRoom(code);
  const { room, clientId, error } = roomHook;

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
        Зажигаем лампы…
      </main>
    );
  }

  return (
    <StageView
      room={room}
      clientId={clientId}
      onClaim={(id) => roomHook.claim.mutate(id)}
      onStart={() => roomHook.start.mutate()}
      onCouncil={(on) => roomHook.council.mutate(on)}
      onRegister={(p) => roomHook.register.mutate(p)}
      onClosePuzzle={() => roomHook.dismissPuzzle.mutate()}
      onChoose={(id) => roomHook.choose.mutate(id)}
      onAbility={async (id) => {
        const res = await roomHook.ability.mutateAsync(id);
        if (!res.ok) return { ok: false as const, error: res.error };
        return {
          ok: true as const,
          visibility: res.visibility,
          note: res.note,
        };
      }}
      claimError={
        roomHook.claim.data && !roomHook.claim.data.ok
          ? roomHook.claim.data.error
          : null
      }
      startError={
        roomHook.start.data && !roomHook.start.data.ok
          ? roomHook.start.data.error
          : null
      }
      actionError={
        (roomHook.choose.data && !roomHook.choose.data.ok
          ? roomHook.choose.data.error
          : null) ??
        (roomHook.register.data && !roomHook.register.data.ok
          ? roomHook.register.data.error
          : null)
      }
    />
  );
}
