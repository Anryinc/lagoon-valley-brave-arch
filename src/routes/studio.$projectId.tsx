import { createFileRoute, Link } from "@tanstack/react-router";
import { GraphCanvas } from "@/components/studio/graph-canvas";
import {
  cherwoodSeedGraph,
  emptyGraph,
  type StudioGraph,
} from "@/lib/studio/graph-types";
import { getProject } from "@/projects/registry";
import { useCallback, useEffect, useState } from "react";

export const Route = createFileRoute("/studio/$projectId")({
  component: StudioProject,
});

function storageKey(id: string) {
  return `studio.graph.${id}`;
}

function loadGraph(projectId: string): StudioGraph {
  if (typeof window === "undefined") {
    return projectId === "cherwood" ? cherwoodSeedGraph() : emptyGraph();
  }
  try {
    const raw = localStorage.getItem(storageKey(projectId));
    if (raw) return JSON.parse(raw) as StudioGraph;
  } catch {
    /* ignore */
  }
  return projectId === "cherwood" ? cherwoodSeedGraph() : emptyGraph();
}

function StudioProject() {
  const { projectId } = Route.useParams();
  const project = getProject(projectId);
  const [graph, setGraph] = useState<StudioGraph>(() => loadGraph(projectId));
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    setGraph(loadGraph(projectId));
  }, [projectId]);

  const persist = useCallback(
    (g: StudioGraph) => {
      setGraph(g);
      try {
        localStorage.setItem(storageKey(projectId), JSON.stringify(g));
        setSavedAt(new Date().toLocaleTimeString("ru-RU"));
      } catch {
        /* quota */
      }
    },
    [projectId],
  );

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(graph, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${projectId}-graph.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetSeed = () => {
    if (!confirm("Сбросить граф к сиду Червуда?")) return;
    const g = projectId === "cherwood" ? cherwoodSeedGraph() : emptyGraph();
    persist(g);
  };

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

  return (
    <main className="flex min-h-dvh flex-col bg-bg text-ink">
      <header className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-2">
        <Link
          to="/studio"
          className="text-xs uppercase tracking-[0.16em] text-muted hover:text-paper"
        >
          ← Мастерская
        </Link>
        <h1 className="font-display text-xl text-paper">{m.title}</h1>
        <span className="text-[10px] text-faint">{projectId}</span>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {savedAt ? (
            <span className="text-[10px] text-faint">локально {savedAt}</span>
          ) : null}
          <button
            type="button"
            onClick={exportJson}
            className="rounded-full border border-line px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-muted hover:text-paper"
          >
            Export JSON
          </button>
          <button
            type="button"
            onClick={resetSeed}
            className="rounded-full border border-line px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-muted hover:text-paper"
          >
            Reset seed
          </button>
          <Link
            to="/project/$projectId"
            params={{ projectId }}
            className="rounded-full bg-paper px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-bg"
          >
            Играть
          </Link>
        </div>
      </header>
      <div className="flex-1 p-2">
        <GraphCanvas graph={graph} onChange={persist} />
      </div>
      <p className="px-4 pb-2 text-[10px] text-faint">
        Канон в git: после правок — Export JSON и закоммитьте в{" "}
        <code className="text-muted">src/projects/{projectId}/</code>. Пока
        автосейв только в localStorage браузера.
      </p>
    </main>
  );
}
