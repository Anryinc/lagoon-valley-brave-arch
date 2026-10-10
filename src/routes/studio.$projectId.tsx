import { createFileRoute, Link } from "@tanstack/react-router";
import { getProject } from "@/projects/registry";

export const Route = createFileRoute("/studio/$projectId")({
  component: StudioProject,
});

function StudioProject() {
  const { projectId } = Route.useParams();
  const project = getProject(projectId);

  if (!project) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-bg px-6">
        <p className="font-display text-2xl text-paper">Нет такого проекта</p>
        <Link to="/studio" className="text-sm underline">
          К списку
        </Link>
      </main>
    );
  }

  const m = project.manifest;
  const sceneCount = Object.keys(project.campaign.scenes).length;

  return (
    <main className="min-h-dvh bg-bg px-5 py-8 text-ink">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/studio"
          className="text-xs uppercase tracking-[0.18em] text-muted"
        >
          ← Мастерская
        </Link>
        <h1 className="mt-4 font-display text-4xl text-paper">{m.title}</h1>
        <p className="mt-1 text-xs text-faint">
          id: {m.id} · v{m.version} · start: {project.campaign.startScene}
        </p>

        <section className="mt-8 grid gap-3 sm:grid-cols-3">
          <Stat label="Сцены (rails)" value={String(sceneCount)} />
          <Stat label="Игроки" value={`${m.playersMin}–${m.playersMax}`} />
          <Stat label="Статус" value={m.status} />
        </section>

        <section className="mt-8 rounded-[18px] border border-line p-4">
          <h2 className="text-xs uppercase tracking-[0.18em] text-brass">
            Правила раунда (зафиксировано)
          </h2>
          <ul className="mt-3 space-y-1 text-sm text-muted">
            <li>1 действие за раунд (включая «ничего не делать»)</li>
            <li>Share и способности тратят действие</li>
            <li>Улика с share — только в той же локации</li>
            <li>Без таймера: ход, когда все сдали intent</li>
            <li>Контент-канон: git</li>
          </ul>
        </section>

        <section className="mt-6 rounded-[18px] border border-dashed border-line p-4 text-sm text-muted">
          <p className="font-medium text-paper">P3 — node canvas</p>
          <p className="mt-2 text-xs leading-relaxed text-faint">
            Здесь появится граф локаций/диалогов/событий, инспектор нод и панель
            кода. Пока канон Червуда — <code>src/lib/campaign/rails.ts</code> и
            пакет <code>src/projects/cherwood/</code>. Правки сценария — через
            git commit.
          </p>
        </section>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/project/$projectId"
            params={{ projectId: m.id }}
            className="rounded-[14px] bg-paper px-4 py-2 text-sm text-bg"
          >
            Карточка проекта
          </Link>
          <Link
            to="/"
            className="rounded-[14px] border border-line px-4 py-2 text-sm text-paper"
          >
            Хаб
          </Link>
        </div>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[16px] border border-line px-4 py-3">
      <p className="text-[10px] uppercase tracking-[0.16em] text-faint">{label}</p>
      <p className="mt-1 font-display text-xl text-paper">{value}</p>
    </div>
  );
}
