import { createFileRoute, Link } from "@tanstack/react-router";
import { listProjects } from "@/projects/registry";

export const Route = createFileRoute("/studio/")({ component: StudioIndex });

function StudioIndex() {
  const projects = listProjects();

  return (
    <main className="min-h-dvh bg-bg px-5 py-8 text-ink">
      <div className="mx-auto max-w-3xl">
        <Link to="/" className="text-xs uppercase tracking-[0.18em] text-muted">
          ← Стол проектов
        </Link>
        <h1 className="mt-4 font-display text-4xl text-paper">Мастерская</h1>
        <p className="mt-2 text-sm text-muted">
          Node-based редактор сценария: локации, реплики, ветки, события.
          Перетаскивание карточек, связи портами, инспектор справа.
        </p>

        <ul className="mt-8 space-y-3">
          {projects.map((p) => (
            <li key={p.id}>
              <Link
                to="/studio/$projectId"
                params={{ projectId: p.id }}
                className="flex items-center justify-between rounded-[18px] border border-line px-4 py-4 hover:border-paper/40"
              >
                <div>
                  <p className="font-display text-xl text-paper">{p.title}</p>
                  <p className="text-xs text-faint">
                    {p.id} · v{p.version} · graph editor
                  </p>
                </div>
                <span className="text-xs text-muted">открыть граф →</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
