/** Scenario graph for the Master Studio (node-based). */

export type StudioNodeKind =
  | "location"
  | "scene"
  | "dialogue"
  | "branch"
  | "event"
  | "interactable"
  | "ending";

export type StudioPort = {
  id: string;
  label: string;
  /** "in" | "out" */
  dir: "in" | "out";
};

export type StudioNodeData = {
  title: string;
  body?: string;
  locationId?: string;
  flag?: string;
  setFlags?: string[];
  background?: string;
};

export type StudioNode = {
  id: string;
  kind: StudioNodeKind;
  x: number;
  y: number;
  data: StudioNodeData;
  ports: StudioPort[];
};

export type StudioEdge = {
  id: string;
  from: string;
  fromPort: string;
  to: string;
  toPort: string;
  label?: string;
};

export type StudioGraph = {
  version: 1;
  nodes: StudioNode[];
  edges: StudioEdge[];
};

export const NODE_KIND_META: Record<
  StudioNodeKind,
  { label: string; color: string; defaultPorts: StudioPort[] }
> = {
  location: {
    label: "Локация",
    color: "#c4a574",
    defaultPorts: [
      { id: "in", label: "вход", dir: "in" },
      { id: "out", label: "выход", dir: "out" },
    ],
  },
  scene: {
    label: "Сцена",
    color: "#7aa2c7",
    defaultPorts: [
      { id: "in", label: "вход", dir: "in" },
      { id: "out", label: "далее", dir: "out" },
    ],
  },
  dialogue: {
    label: "Реплика",
    color: "#8bc49a",
    defaultPorts: [
      { id: "in", label: "вход", dir: "in" },
      { id: "out", label: "далее", dir: "out" },
    ],
  },
  branch: {
    label: "Ветка",
    color: "#d4a574",
    defaultPorts: [
      { id: "in", label: "вход", dir: "in" },
      { id: "yes", label: "да", dir: "out" },
      { id: "no", label: "нет", dir: "out" },
    ],
  },
  event: {
    label: "Событие",
    color: "#c77a9a",
    defaultPorts: [
      { id: "in", label: "вход", dir: "in" },
      { id: "out", label: "далее", dir: "out" },
    ],
  },
  interactable: {
    label: "Объект",
    color: "#9a8bc4",
    defaultPorts: [
      { id: "in", label: "вход", dir: "in" },
      { id: "inspect", label: "осмотр", dir: "out" },
      { id: "use", label: "действие", dir: "out" },
    ],
  },
  ending: {
    label: "Финал",
    color: "#a0a0a0",
    defaultPorts: [{ id: "in", label: "вход", dir: "in" }],
  },
};

export function createNode(
  kind: StudioNodeKind,
  x: number,
  y: number,
  id?: string,
): StudioNode {
  const meta = NODE_KIND_META[kind];
  return {
    id: id ?? `n_${kind}_${Math.random().toString(36).slice(2, 9)}`,
    kind,
    x,
    y,
    data: { title: meta.label },
    ports: meta.defaultPorts.map((p) => ({ ...p })),
  };
}

export function emptyGraph(): StudioGraph {
  return { version: 1, nodes: [], edges: [] };
}

/** Seed graph approximating Cherwood locations for studio bootstrap. */
export function cherwoodSeedGraph(): StudioGraph {
  const street = createNode("location", 80, 200, "loc_street");
  street.data = {
    title: "Улица Червуда",
    locationId: "street",
    background: "/art/locations/street.jpg",
    body: "Туман, фонари, дверь пансиона.",
  };
  const parlor = createNode("location", 420, 200, "loc_parlor");
  parlor.data = {
    title: "Гостиная Хэтти",
    locationId: "parlor",
    background: "/art/locations/parlor.jpg",
    body: "Ключи, реестр, запах чая.",
  };
  const corridor = createNode("location", 760, 120, "loc_corridor");
  corridor.data = {
    title: "Коридор",
    locationId: "corridor",
    body: "Двери комнат, запах сырости снизу.",
  };
  const room7 = createNode("location", 760, 320, "loc_room7");
  room7.data = {
    title: "Комната 7",
    locationId: "room7",
    body: "Следы жильца Восса.",
  };
  const dialogue = createNode("dialogue", 420, 420, "dlg_hattie");
  dialogue.data = {
    title: "Хэтти · жильцы",
    body: "Восс, Пелл, Миллс… Внизу — благотворительная встреча.",
  };
  const branch = createNode("branch", 200, 420, "br_register");
  branch.data = {
    title: "Реестр решён?",
    flag: "register_solved",
  };
  const ending = createNode("ending", 1100, 220, "end_act1");
  ending.data = {
    title: "Конец акта I",
    body: "Подвал открыт. Дальше — следующий акт.",
  };

  return {
    version: 1,
    nodes: [street, parlor, corridor, room7, dialogue, branch, ending],
    edges: [
      {
        id: "e1",
        from: "loc_street",
        fromPort: "out",
        to: "loc_parlor",
        toPort: "in",
        label: "войти",
      },
      {
        id: "e2",
        from: "loc_parlor",
        fromPort: "out",
        to: "loc_corridor",
        toPort: "in",
        label: "вверх",
      },
      {
        id: "e3",
        from: "loc_parlor",
        fromPort: "out",
        to: "dlg_hattie",
        toPort: "in",
        label: "говорить",
      },
      {
        id: "e4",
        from: "dlg_hattie",
        fromPort: "out",
        to: "br_register",
        toPort: "in",
      },
      {
        id: "e5",
        from: "loc_corridor",
        fromPort: "out",
        to: "loc_room7",
        toPort: "in",
      },
      {
        id: "e6",
        from: "br_register",
        fromPort: "yes",
        to: "end_act1",
        toPort: "in",
        label: "да",
      },
    ],
  };
}
