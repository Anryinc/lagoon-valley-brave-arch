import { LOCATIONS } from "@/lib/campaign/locations";
import { auditPack, cloneDefaultPack, emptyScene, type FlowIssue } from "@/lib/campaign/pack";
import type { CampaignPack, SceneRail, ScriptedChoice } from "@/lib/campaign/rails";
import { NPCS } from "@/lib/campaign/roster";
import { getCampaignPack, resetCampaignPack, saveCampaignPack } from "@/lib/game/pack-api";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Plus, Save, Trash2, Undo2 } from "lucide-react";
import { useMemo, useState } from "react";

export function MasterStudio() {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["campaign-pack"],
    queryFn: async () => {
      const res = await getCampaignPack({ data: {} });
      return res.pack;
    },
  });
  const [draft, setDraft] = useState<CampaignPack | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const pack = draft ?? query.data ?? cloneDefaultPack();
  const issues = useMemo(() => auditPack(pack), [pack]);
  const sceneId = selected && pack.scenes[selected] ? selected : pack.startScene;
  const scene = pack.scenes[sceneId];

  const save = useMutation({
    mutationFn: () => saveCampaignPack({ data: { pack } }),
    onSuccess: (res) => {
      if (!res.ok) {
        setStatus(res.error);
        return;
      }
      setStatus("Сохранено. Новые столы пойдут по этому потоку.");
      void qc.invalidateQueries({ queryKey: ["campaign-pack"] });
    },
  });
  const reset = useMutation({
    mutationFn: () => resetCampaignPack({ data: {} }),
    onSuccess: (res) => {
      if (!res.ok) return;
      setDraft(res.pack);
      setSelected(res.pack.startScene);
      setStatus("Вернули канонический Акт I.");
      void qc.invalidateQueries({ queryKey: ["campaign-pack"] });
    },
  });

  const updateScene = (id: string, patch: Partial<SceneRail>) => {
    setDraft({
      ...pack,
      scenes: { ...pack.scenes, [id]: { ...pack.scenes[id]!, ...patch, id } },
    });
  };

  const updateChoice = (index: number, patch: Partial<ScriptedChoice>) => {
    const choices = scene.choices.map((c, i) => (i === index ? { ...c, ...patch } : c));
    updateScene(sceneId, { choices });
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-6xl flex-col gap-4 px-4 py-6 md:px-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-brass">Кабинет хранителя</p>
          <h1 className="font-display text-4xl text-paper">Поток дела</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
            Сцены, развилки и тупики Акта I. Сохранённый пакет подхватывают новые
            столы. Идущее дело не переписывается на лету.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => save.mutate()}
            className="flex h-11 items-center gap-2 rounded-[14px] bg-paper px-4 text-sm text-bg"
          >
            <Save className="size-4" />
            Сохранить поток
          </button>
          <button
            type="button"
            onClick={() => reset.mutate()}
            className="flex h-11 items-center gap-2 rounded-[14px] border border-line px-4 text-sm text-muted"
          >
            <Undo2 className="size-4" />
            Вернуть канон
          </button>
        </div>
      </header>
      {status ? <p className="text-sm text-night">{status}</p> : null}

      <IssueList issues={issues} onSelect={setSelected} />

      <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="rounded-[20px] border border-line bg-surface/80 p-3">
          <p className="px-1 text-[11px] uppercase tracking-[0.2em] text-faint">Сцены</p>
          <ol className="mt-2 space-y-1">
            {Object.values(pack.scenes).map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => setSelected(s.id)}
                  className={cn(
                    "flex w-full items-start justify-between gap-2 rounded-[12px] px-3 py-2 text-left text-sm",
                    s.id === sceneId ? "bg-raised text-paper" : "text-muted hover:bg-raised/50",
                  )}
                >
                  <span>
                    <span className="block font-display text-base text-paper">{labelOf(s)}</span>
                    <span className="text-[11px] text-faint">{s.id}</span>
                  </span>
                  {pack.startScene === s.id ? (
                    <span className="text-[10px] uppercase tracking-wider text-brass">старт</span>
                  ) : null}
                </button>
              </li>
            ))}
          </ol>
          <AddScene
            existing={Object.keys(pack.scenes)}
            onAdd={(id) => {
              setDraft({
                ...pack,
                scenes: { ...pack.scenes, [id]: emptyScene(id) },
              });
              setSelected(id);
            }}
          />
        </aside>

        {scene ? (
          <section className="rounded-[20px] border border-line bg-bg/70 p-4 md:p-5">
            <div className="grid gap-3 md:grid-cols-2">
              <label className="text-sm text-muted">
                Локация
                <select
                  value={scene.locationId}
                  onChange={(e) => updateScene(sceneId, { locationId: e.target.value })}
                  className="mt-1 h-11 w-full rounded-[12px] border border-line bg-surface px-3 text-ink"
                >
                  {LOCATIONS.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm text-muted">
                Голос
                <select
                  value={scene.speakerId ?? "narrator"}
                  onChange={(e) => updateScene(sceneId, { speakerId: e.target.value })}
                  className="mt-1 h-11 w-full rounded-[12px] border border-line bg-surface px-3 text-ink"
                >
                  {NPCS.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="mt-3 block text-sm text-muted">
              Текст сцены
              <textarea
                value={scene.narration}
                onChange={(e) => updateScene(sceneId, { narration: e.target.value })}
                rows={7}
                className="mt-1 w-full rounded-[16px] border border-line bg-surface px-3 py-2 font-display text-lg leading-snug text-paper"
              />
            </label>
            <div className="mt-3 flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-muted">
                <input
                  type="checkbox"
                  checked={pack.startScene === sceneId}
                  onChange={(e) => {
                    if (e.target.checked) setDraft({ ...pack, startScene: sceneId });
                  }}
                />
                Начинать дело с этой сцены
              </label>
              {sceneId !== pack.startScene ? (
                <button
                  type="button"
                  onClick={() => {
                    const next = { ...pack.scenes };
                    delete next[sceneId];
                    setDraft({ ...pack, scenes: next });
                    setSelected(pack.startScene);
                  }}
                  className="flex items-center gap-1 text-xs uppercase tracking-wider text-danger"
                >
                  <Trash2 className="size-3.5" />
                  Удалить сцену
                </button>
              ) : null}
            </div>

            <OutArrows scene={scene} />

            <div className="mt-6 flex items-center justify-between">
              <p className="font-display text-2xl text-paper">Действия</p>
              <button
                type="button"
                onClick={() =>
                  updateScene(sceneId, {
                    choices: [
                      ...scene.choices,
                      {
                        id: `c_${Math.random().toString(36).slice(2, 7)}`,
                        label: "Новое действие",
                        stayNarration: "Что происходит, если выбрать это.",
                      },
                    ],
                  })
                }
                className="flex h-10 items-center gap-1 rounded-full border border-line px-3 text-xs uppercase tracking-wider text-muted"
              >
                <Plus className="size-3.5" />
                Добавить
              </button>
            </div>
            <div className="mt-3 space-y-3">
              {scene.choices.map((choice, index) => (
                <article key={choice.id} className="rounded-[16px] border border-line bg-surface p-3">
                  <input
                    value={choice.label}
                    onChange={(e) => updateChoice(index, { label: e.target.value })}
                    className="h-11 w-full rounded-[12px] border border-line bg-bg px-3 text-sm text-paper"
                  />
                  <div className="mt-2 grid gap-2 md:grid-cols-2">
                    <label className="text-xs text-faint">
                      Ведёт в сцену
                      <select
                        value={choice.nextSceneId ?? ""}
                        onChange={(e) =>
                          updateChoice(index, {
                            nextSceneId: e.target.value || undefined,
                          })
                        }
                        className="mt-1 h-10 w-full rounded-[10px] border border-line bg-bg px-2 text-sm text-ink"
                      >
                        <option value="">остаться здесь</option>
                        {Object.keys(pack.scenes).map((id) => (
                          <option key={id} value={id}>
                            {id}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="text-xs text-faint">
                      Спрятать, если флаг
                      <input
                        value={choice.hideIfFlag ?? ""}
                        onChange={(e) =>
                          updateChoice(index, { hideIfFlag: e.target.value || undefined })
                        }
                        className="mt-1 h-10 w-full rounded-[10px] border border-line bg-bg px-2 text-sm text-ink"
                        placeholder="heard_widow"
                      />
                    </label>
                    <label className="text-xs text-faint">
                      Нужен флаг
                      <input
                        value={choice.requiresFlag ?? ""}
                        onChange={(e) =>
                          updateChoice(index, { requiresFlag: e.target.value || undefined })
                        }
                        className="mt-1 h-10 w-full rounded-[10px] border border-line bg-bg px-2 text-sm text-ink"
                        placeholder="saw_pipe"
                      />
                    </label>
                    <label className="text-xs text-faint">
                      Любой из флагов (через запятую)
                      <input
                        value={(choice.requiresAnyFlags ?? []).join(", ")}
                        onChange={(e) =>
                          updateChoice(index, {
                            requiresAnyFlags: e.target.value
                              .split(",")
                              .map((x) => x.trim())
                              .filter(Boolean),
                          })
                        }
                        className="mt-1 h-10 w-full rounded-[10px] border border-line bg-bg px-2 text-sm text-ink"
                        placeholder="register_solved, saw_curtain"
                      />
                    </label>
                  </div>
                  {!choice.nextSceneId ? (
                    <textarea
                      value={choice.stayNarration ?? ""}
                      onChange={(e) => updateChoice(index, { stayNarration: e.target.value })}
                      rows={3}
                      className="mt-2 w-full rounded-[12px] border border-line bg-bg px-3 py-2 text-sm text-ink"
                      placeholder="Текст, если остаёмся в сцене"
                    />
                  ) : null}
                  <label className="mt-2 block text-xs text-faint">
                    Поставить флаги (через запятую)
                    <input
                      value={(choice.setFlags ?? []).join(", ")}
                      onChange={(e) =>
                        updateChoice(index, {
                          setFlags: e.target.value
                            .split(",")
                            .map((x) => x.trim())
                            .filter(Boolean),
                        })
                      }
                      className="mt-1 h-10 w-full rounded-[10px] border border-line bg-bg px-2 text-sm text-ink"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      updateScene(sceneId, {
                        choices: scene.choices.filter((_, i) => i !== index),
                      })
                    }
                    className="mt-2 text-xs uppercase tracking-wider text-danger"
                  >
                    Убрать действие
                  </button>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}

function labelOf(scene: SceneRail) {
  const loc = LOCATIONS.find((l) => l.id === scene.locationId);
  return loc?.name ?? scene.id;
}

function OutArrows({ scene }: { scene: SceneRail }) {
  const next = scene.choices.filter((c) => c.nextSceneId);
  if (next.length === 0) {
    return <p className="mt-4 text-sm text-faint">Из этой сцены нет перехода — проверьте, не тупик ли это.</p>;
  }
  return (
    <ul className="mt-4 flex flex-wrap gap-2">
      {next.map((c) => (
        <li
          key={c.id}
          className="flex items-center gap-1 rounded-full border border-line px-3 py-1 text-xs text-muted"
        >
          {c.label}
          <ArrowRight className="size-3" />
          {c.nextSceneId}
        </li>
      ))}
    </ul>
  );
}

function IssueList({
  issues,
  onSelect,
}: {
  issues: FlowIssue[];
  onSelect: (id: string) => void;
}) {
  if (issues.length === 0) {
    return (
      <p className="rounded-[16px] border border-line bg-surface/70 px-4 py-3 text-sm text-muted">
        Поток цел: все переходы существуют, старт достижим.
      </p>
    );
  }
  return (
    <ul className="space-y-1 rounded-[16px] border border-line bg-surface/70 p-3">
      {issues.map((issue, i) => (
        <li key={`${issue.message}-${i}`}>
          <button
            type="button"
            onClick={() => issue.sceneId && onSelect(issue.sceneId)}
            className={cn(
              "text-left text-sm",
              issue.level === "error" ? "text-danger" : "text-brass",
            )}
          >
            {issue.level === "error" ? "Стоп. " : "Заметка. "}
            {issue.message}
          </button>
        </li>
      ))}
    </ul>
  );
}

function AddScene({
  existing,
  onAdd,
}: {
  existing: string[];
  onAdd: (id: string) => void;
}) {
  const [id, setId] = useState("");
  return (
    <form
      className="mt-3 flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const slug = id
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9_]+/g, "_")
          .replace(/^_|_$/g, "");
        if (!slug || existing.includes(slug)) return;
        onAdd(slug);
        setId("");
      }}
    >
      <input
        value={id}
        onChange={(e) => setId(e.target.value)}
        placeholder="id сцены"
        className="h-10 flex-1 rounded-[12px] border border-line bg-bg px-3 text-sm text-paper"
      />
      <button
        type="submit"
        className="flex h-10 items-center gap-1 rounded-[12px] border border-line px-3 text-xs uppercase tracking-wider text-muted"
      >
        <Plus className="size-3.5" />
        Сцена
      </button>
    </form>
  );
}
