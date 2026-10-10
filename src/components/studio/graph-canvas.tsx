import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  NODE_KIND_META,
  createNode,
  type StudioEdge,
  type StudioGraph,
  type StudioNode,
  type StudioNodeKind,
} from "@/lib/studio/graph-types";
import { cn } from "@/lib/utils";

type Props = {
  graph: StudioGraph;
  onChange: (g: StudioGraph) => void;
};

type DragState =
  | { mode: "node"; id: string; ox: number; oy: number }
  | { mode: "pan"; ox: number; oy: number; vx: number; vy: number }
  | {
      mode: "link";
      from: string;
      fromPort: string;
      x: number;
      y: number;
    }
  | null;

const NODE_W = 200;
const NODE_H = 88;

export function GraphCanvas({ graph, onChange }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState({ x: 40, y: 40, scale: 1 });
  const drag = useRef<DragState>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  const selected = graph.nodes.find((n) => n.id === selectedId) ?? null;

  const updateNode = useCallback(
    (id: string, patch: Partial<StudioNode> | { data: Partial<StudioNode["data"]> }) => {
      onChange({
        ...graph,
        nodes: graph.nodes.map((n) => {
          if (n.id !== id) return n;
          if ("data" in patch && patch.data) {
            return { ...n, data: { ...n.data, ...patch.data } };
          }
          return { ...n, ...patch } as StudioNode;
        }),
      });
    },
    [graph, onChange],
  );

  const addNode = (kind: StudioNodeKind) => {
    const n = createNode(
      kind,
      (180 - view.x) / view.scale,
      (120 - view.y) / view.scale + graph.nodes.length * 12,
    );
    onChange({ ...graph, nodes: [...graph.nodes, n] });
    setSelectedId(n.id);
  };

  const removeSelected = () => {
    if (!selectedId) return;
    onChange({
      ...graph,
      nodes: graph.nodes.filter((n) => n.id !== selectedId),
      edges: graph.edges.filter(
        (e) => e.from !== selectedId && e.to !== selectedId,
      ),
    });
    setSelectedId(null);
  };

  const onBoardPointerDown = (e: ReactPointerEvent) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest("[data-node]")) return;
    if ((e.target as HTMLElement).closest("[data-port]")) return;
    setSelectedId(null);
    drag.current = {
      mode: "pan",
      ox: e.clientX,
      oy: e.clientY,
      vx: view.x,
      vy: view.y,
    };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    const d = drag.current;
    if (!d) return;
    if (d.mode === "pan") {
      setView((v) => ({
        ...v,
        x: d.vx + (e.clientX - d.ox),
        y: d.vy + (e.clientY - d.oy),
      }));
    } else if (d.mode === "node") {
      const rect = boardRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = (e.clientX - rect.left - view.x) / view.scale - d.ox;
      const y = (e.clientY - rect.top - view.y) / view.scale - d.oy;
      updateNode(d.id, { x, y });
    } else if (d.mode === "link") {
      const rect = boardRef.current?.getBoundingClientRect();
      if (!rect) return;
      drag.current = {
        ...d,
        x: (e.clientX - rect.left - view.x) / view.scale,
        y: (e.clientY - rect.top - view.y) / view.scale,
      };
      // force re-render via view noop
      setView((v) => ({ ...v }));
    }
  };

  const onPointerUp = (e: ReactPointerEvent) => {
    const d = drag.current;
    if (d?.mode === "link") {
      const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
      const port = el?.closest("[data-port]") as HTMLElement | null;
      if (port) {
        const to = port.dataset.nodeId!;
        const toPort = port.dataset.portId!;
        const dir = port.dataset.portDir;
        if (dir === "in" && to !== d.from) {
          const edge: StudioEdge = {
            id: `e_${Math.random().toString(36).slice(2, 8)}`,
            from: d.from,
            fromPort: d.fromPort,
            to,
            toPort,
          };
          onChange({ ...graph, edges: [...graph.edges, edge] });
        }
      }
    }
    drag.current = null;
  };

  const portPos = useMemo(() => {
    const map = new Map<string, { x: number; y: number }>();
    for (const n of graph.nodes) {
      const outs = n.ports.filter((p) => p.dir === "out");
      const ins = n.ports.filter((p) => p.dir === "in");
      outs.forEach((p, i) => {
        map.set(`${n.id}:${p.id}`, {
          x: n.x + NODE_W,
          y: n.y + 36 + i * 18,
        });
      });
      ins.forEach((p, i) => {
        map.set(`${n.id}:${p.id}`, {
          x: n.x,
          y: n.y + 36 + i * 18,
        });
      });
    }
    return map;
  }, [graph.nodes]);

  const linkDraft = drag.current?.mode === "link" ? drag.current : null;

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] min-h-[480px] w-full overflow-hidden rounded-[18px] border border-line bg-[#0d0d0c]">
      {/* Palette */}
      <aside className="flex w-44 shrink-0 flex-col gap-1 border-r border-line bg-bg/80 p-2">
        <p className="px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-faint">
          Добавить
        </p>
        {(Object.keys(NODE_KIND_META) as StudioNodeKind[]).map((kind) => (
          <button
            key={kind}
            type="button"
            onClick={() => addNode(kind)}
            className="flex items-center gap-2 rounded-lg px-2 py-2 text-left text-xs text-paper hover:bg-paper/10"
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: NODE_KIND_META[kind].color }}
            />
            {NODE_KIND_META[kind].label}
          </button>
        ))}
        <div className="mt-auto space-y-1 border-t border-line pt-2">
          <button
            type="button"
            disabled={!selectedId}
            onClick={removeSelected}
            className="w-full rounded-lg px-2 py-2 text-xs text-danger disabled:opacity-30"
          >
            Удалить ноду
          </button>
        </div>
      </aside>

      {/* Board */}
      <div
        ref={boardRef}
        className="relative flex-1 cursor-grab overflow-hidden active:cursor-grabbing"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)",
          backgroundSize: `${20 * view.scale}px ${20 * view.scale}px`,
          backgroundPosition: `${view.x}px ${view.y}px`,
        }}
        onPointerDown={onBoardPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onWheel={(e) => {
          e.preventDefault();
          setView((v) => ({
            ...v,
            scale: Math.min(1.6, Math.max(0.45, v.scale - e.deltaY * 0.001)),
          }));
        }}
      >
        <div
          className="absolute origin-top-left"
          style={{
            transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
          }}
        >
          <svg
            className="pointer-events-none absolute left-0 top-0 overflow-visible"
            width={4000}
            height={3000}
          >
            {graph.edges.map((e) => {
              const a = portPos.get(`${e.from}:${e.fromPort}`);
              const b = portPos.get(`${e.to}:${e.toPort}`);
              if (!a || !b) return null;
              const mid = (a.x + b.x) / 2;
              const d = `M ${a.x} ${a.y} C ${mid} ${a.y}, ${mid} ${b.y}, ${b.x} ${b.y}`;
              return (
                <g key={e.id}>
                  <path d={d} stroke="#5a5854" strokeWidth={2} fill="none" />
                  {e.label ? (
                    <text
                      x={mid}
                      y={(a.y + b.y) / 2 - 6}
                      fill="#8a8680"
                      fontSize={11}
                      textAnchor="middle"
                    >
                      {e.label}
                    </text>
                  ) : null}
                </g>
              );
            })}
            {linkDraft ? (
              (() => {
                const a = portPos.get(`${linkDraft.from}:${linkDraft.fromPort}`);
                if (!a) return null;
                const mid = (a.x + linkDraft.x) / 2;
                const d = `M ${a.x} ${a.y} C ${mid} ${a.y}, ${mid} ${linkDraft.y}, ${linkDraft.x} ${linkDraft.y}`;
                return (
                  <path
                    d={d}
                    stroke="#c4a574"
                    strokeWidth={2}
                    strokeDasharray="6 4"
                    fill="none"
                  />
                );
              })()
            ) : null}
          </svg>

          {graph.nodes.map((n) => (
            <NodeCard
              key={n.id}
              node={n}
              selected={n.id === selectedId}
              onSelect={() => setSelectedId(n.id)}
              onDragStart={(e, ox, oy) => {
                e.stopPropagation();
                drag.current = { mode: "node", id: n.id, ox, oy };
                setSelectedId(n.id);
              }}
              onPortOut={(e, portId) => {
                e.stopPropagation();
                const rect = boardRef.current?.getBoundingClientRect();
                if (!rect) return;
                drag.current = {
                  mode: "link",
                  from: n.id,
                  fromPort: portId,
                  x: (e.clientX - rect.left - view.x) / view.scale,
                  y: (e.clientY - rect.top - view.y) / view.scale,
                };
              }}
            />
          ))}
        </div>
      </div>

      {/* Inspector */}
      <aside className="w-64 shrink-0 overflow-y-auto border-l border-line bg-bg/90 p-3">
        <p className="text-[10px] uppercase tracking-[0.18em] text-faint">
          Инспектор
        </p>
        {!selected ? (
          <p className="mt-3 text-xs text-muted">
            Выберите ноду или добавьте из палитры слева. Тяните карточки;
            связи — от зелёного порта наружу к входу другой ноды. Фон — pan,
            колесо — zoom.
          </p>
        ) : (
          <div className="mt-3 space-y-3">
            <Field
              label="Заголовок"
              value={selected.data.title}
              onChange={(v) => updateNode(selected.id, { data: { title: v } })}
            />
            <Field
              label="Текст"
              value={selected.data.body ?? ""}
              multiline
              onChange={(v) => updateNode(selected.id, { data: { body: v } })}
            />
            <Field
              label="locationId"
              value={selected.data.locationId ?? ""}
              onChange={(v) =>
                updateNode(selected.id, { data: { locationId: v || undefined } })
              }
            />
            <Field
              label="Флаг (ветка)"
              value={selected.data.flag ?? ""}
              onChange={(v) =>
                updateNode(selected.id, { data: { flag: v || undefined } })
              }
            />
            <Field
              label="Фон (URL)"
              value={selected.data.background ?? ""}
              onChange={(v) =>
                updateNode(selected.id, {
                  data: { background: v || undefined },
                })
              }
            />
            <p className="text-[10px] text-faint">id: {selected.id}</p>
            <p className="text-[10px] text-faint">тип: {selected.kind}</p>
          </div>
        )}
      </aside>
    </div>
  );
}

function NodeCard({
  node,
  selected,
  onSelect,
  onDragStart,
  onPortOut,
}: {
  node: StudioNode;
  selected: boolean;
  onSelect: () => void;
  onDragStart: (e: ReactPointerEvent, ox: number, oy: number) => void;
  onPortOut: (e: ReactPointerEvent, portId: string) => void;
}) {
  const meta = NODE_KIND_META[node.kind];
  const ins = node.ports.filter((p) => p.dir === "in");
  const outs = node.ports.filter((p) => p.dir === "out");

  return (
    <div
      data-node
      className={cn(
        "absolute select-none rounded-xl border bg-[#161513] shadow-lg",
        selected ? "border-paper ring-1 ring-paper/40" : "border-line",
      )}
      style={{
        left: node.x,
        top: node.y,
        width: NODE_W,
        minHeight: NODE_H,
      }}
      onPointerDown={(e) => {
        e.stopPropagation();
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        // offset inside node in graph space approximated via scale later in parent
        onDragStart(e, e.clientX - rect.left, e.clientY - rect.top);
        onSelect();
      }}
    >
      <div
        className="flex items-center gap-2 rounded-t-xl px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-bg"
        style={{ background: meta.color }}
      >
        {meta.label}
      </div>
      <div className="px-3 py-2">
        <p className="font-display text-sm text-paper">{node.data.title}</p>
        {node.data.body ? (
          <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-muted">
            {node.data.body}
          </p>
        ) : null}
      </div>
      {ins.map((p, i) => (
        <button
          key={p.id}
          type="button"
          data-port
          data-node-id={node.id}
          data-port-id={p.id}
          data-port-dir="in"
          className="absolute -left-1.5 h-3 w-3 rounded-full border-2 border-bg bg-[#7aa2c7]"
          style={{ top: 36 + i * 18 }}
          title={p.label}
          onPointerDown={(e) => e.stopPropagation()}
        />
      ))}
      {outs.map((p, i) => (
        <button
          key={p.id}
          type="button"
          data-port
          data-node-id={node.id}
          data-port-id={p.id}
          data-port-dir="out"
          className="absolute -right-1.5 h-3 w-3 rounded-full border-2 border-bg bg-[#8bc49a]"
          style={{ top: 36 + i * 18 }}
          title={p.label}
          onPointerDown={(e) => onPortOut(e, p.id)}
        />
      ))}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  return (
    <label className="block text-xs text-muted">
      {label}
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className="mt-1 w-full rounded-lg border border-line bg-bg px-2 py-1.5 text-sm text-paper"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 w-full rounded-lg border border-line bg-bg px-2 py-1.5 text-sm text-paper"
        />
      )}
    </label>
  );
}
