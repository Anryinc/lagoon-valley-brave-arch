import { createFileRoute, Link } from "@tanstack/react-router";
import { StageView } from "@/components/stage-view";
import { readRememberedProjectId } from "@/lib/game/project-session";
import { useHostRoom } from "@/lib/game/use-p2p-room";
import { useState } from "react";
import { z } from "zod";

const searchSchema = z.object({
  p: z.string().optional(),
});

export const Route = createFileRoute("/table/$code")({
  validateSearch: (s) => searchSchema.parse(s),
  component: TablePage,
});

function TablePage() {
  const { code } = Route.useParams();
  const { p } = Route.useSearch();
  const projectId = p ?? readRememberedProjectId() ?? "cherwood";
  const host = useHostRoom(code, projectId);
  const { room, clientId, error } = host;
  const [claimError, setClaimError] = useState<string | null>(null);
  const [startError, setStartError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  if (error) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-bg px-6 text-center">
        <p className="font-display text-3xl text-paper">Стол не найден</p>
        <p className="text-sm text-muted">{error}</p>
        <Link to="/" className="text-sm text-night underline">
          К проектам
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
      onClaim={(id) => {
        const r = host.claim(id);
        setClaimError(r.ok ? null : (r.error ?? "Ошибка"));
      }}
      onStart={() => {
        const r = host.start();
        setStartError(r.ok ? null : (r.error ?? "Ошибка"));
      }}
      onCouncil={(on) => host.council(on)}
      onRegister={(payload) => {
        const r = host.register(payload);
        setActionError(r.ok ? null : (r.error ?? "Ошибка"));
      }}
      onClosePuzzle={() => host.dismissPuzzle()}
      onChoose={(id) => {
        const r = host.choose(id);
        setActionError(r.ok ? null : (r.error ?? "Ошибка"));
      }}
      onAbility={async (id) => {
        const res = host.ability(id);
        if (!res.ok) return { ok: false as const, error: res.error };
        return {
          ok: true as const,
          visibility: res.visibility,
          note: res.note,
        };
      }}
      claimError={claimError}
      startError={startError}
      actionError={actionError}
    />
  );
}
