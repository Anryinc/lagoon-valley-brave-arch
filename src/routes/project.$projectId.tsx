import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { createLocalTableCode } from "@/lib/game/use-p2p-room";
import { getProject } from "@/projects/registry";
import { useState } from "react";

export const Route = createFileRoute("/project/$projectId")({
  component: ProjectLanding,
});

const PROJECT_KEY = "cherwood.activeProjectId";

export function rememberProjectId(projectId: string) {
  if (typeof sessionStorage !== "undefined") {
    sessionStorage.setItem(PROJECT_KEY, projectId);
  }
}

export function readRememberedProjectId(): string | null {
  if (typeof sessionStorage === "undefined") return null;
  return sessionStorage.getItem(PROJECT_KEY);
}

function ProjectLanding() {
  const { projectId } = Route.useParams();
  const project = getProject(projectId);
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!project) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-bg px-6 text-center">
        <p className="font-display text-3xl text-paper">Проект не найден</p>
        <Link to="/" className="text-sm text-night underline">
          К столу проектов
        </Link>
      </main>
    );
  }

  const m = project.manifest;

  return (
    <main className="relative min-h-dvh overflow-hidden bg-bg text-ink">
      <img
        src={m.coverImage}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/75 to-bg/35" />

      <div className="relative mx-auto flex min-h-dvh max-w-xl flex-col justify-end px-5 pb-10 pt-10">
        <Link
          to="/"
          className="mb-6 text-xs uppercase tracking-[0.18em] text-muted hover:text-paper"
        >
          ← Все проекты
        </Link>
        {m.subtitle ? (
          <p className="text-[11px] uppercase tracking-[0.32em] text-brass">
            {m.subtitle}
          </p>
        ) : null}
        <h1 className="mt-3 font-display text-5xl leading-[0.95] text-paper md:text-6xl">
          {m.title}
        </h1>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
          {m.description}
        </p>
        <p className="mt-3 text-xs text-faint">
          {m.playersMin}–{m.playersMax} игрока
          {m.estimatedMinutes ? ` · около ${m.estimatedMinutes} мин` : ""} · v
          {m.version}
        </p>

        {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}

        <div className="mt-8 flex flex-col gap-3">
          <button
            type="button"
            disabled={m.status !== "playable"}
            onClick={() => {
              setError(null);
              if (m.status !== "playable") {
                setError("Сценарий ещё в черновике");
                return;
              }
              rememberProjectId(m.id);
              const next = createLocalTableCode();
              void navigate({
                to: "/table/$code",
                params: { code: next },
                search: { p: m.id },
              });
            }}
            className="h-12 rounded-[18px] bg-paper text-sm font-medium text-bg disabled:opacity-40"
          >
            Открыть стол на этом экране
          </button>

          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              setError(null);
              const c = code.trim().toUpperCase();
              if (c.length < 4) {
                setError("Введите код с экрана хоста");
                return;
              }
              rememberProjectId(m.id);
              void navigate({
                to: "/play/$code",
                params: { code: c },
                search: { p: m.id },
              });
            }}
          >
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Код стола"
              className="h-12 flex-1 rounded-[18px] border border-line bg-bg/70 px-4 font-display text-xl tracking-[0.2em] text-paper placeholder:text-faint"
              autoCapitalize="characters"
              autoComplete="off"
              suppressHydrationWarning
            />
            <button
              type="submit"
              className="h-12 rounded-[18px] border border-line px-4 text-sm text-paper"
            >
              Сесть
            </button>
          </form>
        </div>

        <p className="mt-6 text-xs leading-relaxed text-faint">
          Хост — ПК или ноутбук: QR и общая доска. С телефона можно сесть как
          игрок (в том числе с того же стола). Мастерская: сценарий в git.
        </p>

        <Link
          to="/studio/$projectId"
          params={{ projectId: m.id }}
          className="mt-4 text-xs text-muted underline hover:text-paper"
        >
          Открыть в мастерской
        </Link>
      </div>
    </main>
  );
}
