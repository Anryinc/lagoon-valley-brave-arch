import type { ChoicePublic } from "./types";
import {
  DEFAULT_ABILITY,
  SCENES,
  START_SCENE,
  type CampaignPack,
  type SceneRail,
  type ScriptedChoice,
} from "./rails";

export type FlowIssue = {
  level: "error" | "warn";
  sceneId?: string;
  message: string;
};

export function cloneDefaultPack(): CampaignPack {
  return structuredClone({ startScene: START_SCENE, scenes: SCENES });
}

export function parsePack(raw: unknown): CampaignPack | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as { startScene?: unknown; scenes?: unknown };
  if (typeof data.startScene !== "string" || !data.scenes || typeof data.scenes !== "object") {
    return null;
  }
  const scenes: Record<string, SceneRail> = {};
  for (const [id, scene] of Object.entries(data.scenes as Record<string, unknown>)) {
    const parsed = parseScene(id, scene);
    if (!parsed) return null;
    scenes[id] = parsed;
  }
  if (!scenes[data.startScene]) return null;
  return { startScene: data.startScene, scenes };
}

function parseScene(id: string, raw: unknown): SceneRail | null {
  if (!raw || typeof raw !== "object") return null;
  const s = raw as Record<string, unknown>;
  if (typeof s.narration !== "string") return null;
  const choices = Array.isArray(s.choices)
    ? s.choices.map((c, i) => parseChoice(c, i)).filter((c): c is ScriptedChoice => Boolean(c))
    : [];
  return {
    id,
    locationId: typeof s.locationId === "string" ? s.locationId : "street",
    speakerId: typeof s.speakerId === "string" ? s.speakerId : null,
    narration: s.narration,
    choices,
    abilityResults:
      s.abilityResults && typeof s.abilityResults === "object"
        ? (s.abilityResults as SceneRail["abilityResults"])
        : {},
    defaultAbility:
      s.defaultAbility && typeof s.defaultAbility === "object"
        ? (s.defaultAbility as SceneRail["defaultAbility"])
        : DEFAULT_ABILITY,
  };
}

function parseChoice(raw: unknown, index: number): ScriptedChoice | null {
  if (!raw || typeof raw !== "object") return null;
  const c = raw as Record<string, unknown>;
  const label = typeof c.label === "string" ? c.label : "";
  if (!label) return null;
  return {
    id: typeof c.id === "string" && c.id ? c.id : `choice_${index}`,
    label,
    nextSceneId: typeof c.nextSceneId === "string" ? c.nextSceneId : undefined,
    stayNarration: typeof c.stayNarration === "string" ? c.stayNarration : undefined,
    staySpeakerId:
      c.staySpeakerId === null
        ? null
        : typeof c.staySpeakerId === "string"
          ? c.staySpeakerId
          : undefined,
    setFlags: Array.isArray(c.setFlags)
      ? c.setFlags.filter((f): f is string => typeof f === "string")
      : undefined,
    publicEvent: typeof c.publicEvent === "string" ? c.publicEvent : undefined,
    opensPuzzle: typeof c.opensPuzzle === "string" ? c.opensPuzzle : c.opensPuzzle === null ? null : undefined,
    requiresFlag: typeof c.requiresFlag === "string" ? c.requiresFlag : undefined,
    requiresAnyFlags: Array.isArray(c.requiresAnyFlags)
      ? c.requiresAnyFlags.filter((f): f is string => typeof f === "string")
      : undefined,
    hideIfFlag: typeof c.hideIfFlag === "string" ? c.hideIfFlag : undefined,
    clue:
      c.clue && typeof c.clue === "object"
        ? (c.clue as ScriptedChoice["clue"])
        : undefined,
  };
}

export function emptyScene(id: string): SceneRail {
  return {
    id,
    locationId: "street",
    speakerId: "narrator",
    narration: "Новая сцена. Напишите, что видит стол.",
    choices: [],
    abilityResults: {},
    defaultAbility: DEFAULT_ABILITY,
  };
}

export function presentChoices(scene: SceneRail, flags: Record<string, boolean>): ChoicePublic[] {
  return scene.choices
    .filter((c) => choiceVisible(c, flags))
    .map((c) => ({ id: c.id, label: c.label }));
}

export function choiceVisible(c: ScriptedChoice, flags: Record<string, boolean>) {
  if (c.requiresFlag && !flags[c.requiresFlag]) return false;
  if (c.requiresAnyFlags?.length && !c.requiresAnyFlags.some((f) => flags[f])) return false;
  if (c.hideIfFlag && flags[c.hideIfFlag]) return false;
  return true;
}

export function auditPack(pack: CampaignPack): FlowIssue[] {
  const issues: FlowIssue[] = [];
  const { scenes, startScene } = pack;
  if (!scenes[startScene]) {
    issues.push({ level: "error", message: `Стартовая сцена «${startScene}» не существует.` });
    return issues;
  }

  const reachable = new Set<string>();
  const queue = [startScene];
  while (queue.length) {
    const id = queue.shift()!;
    if (reachable.has(id)) continue;
    reachable.add(id);
    const scene = scenes[id];
    if (!scene) continue;
    for (const choice of scene.choices) {
      if (choice.nextSceneId) queue.push(choice.nextSceneId);
    }
    for (const result of Object.values(scene.abilityResults)) {
      if (result.nextSceneId) queue.push(result.nextSceneId);
    }
  }

  for (const [id, scene] of Object.entries(scenes)) {
    const choiceIds = new Set<string>();
    for (const choice of scene.choices) {
      if (choiceIds.has(choice.id)) {
        issues.push({
          level: "error",
          sceneId: id,
          message: `Два действия с id «${choice.id}».`,
        });
      }
      choiceIds.add(choice.id);
      if (choice.nextSceneId && !scenes[choice.nextSceneId]) {
        issues.push({
          level: "error",
          sceneId: id,
          message: `«${choice.label}» ведёт в несуществующую сцену «${choice.nextSceneId}».`,
        });
      }
      if (!choice.nextSceneId && !choice.stayNarration && !choice.opensPuzzle && !choice.setFlags?.length) {
        issues.push({
          level: "warn",
          sceneId: id,
          message: `«${choice.label}» никуда не ведёт и не меняет текст.`,
        });
      }
    }
    for (const [abilityId, result] of Object.entries(scene.abilityResults)) {
      if (result.nextSceneId && !scenes[result.nextSceneId]) {
        issues.push({
          level: "error",
          sceneId: id,
          message: `Способность ${abilityId} ведёт в «${result.nextSceneId}», которой нет.`,
        });
      }
    }
    const outgoing = scene.choices.filter((c) => c.nextSceneId).length;
    const abilityOut = Object.values(scene.abilityResults).some((r) => r.nextSceneId);
    if (outgoing === 0 && !abilityOut && id !== "ending") {
      issues.push({
        level: "warn",
        sceneId: id,
        message: "Тупик: из сцены нельзя уйти выбором.",
      });
    }
    if (!reachable.has(id) && id !== startScene) {
      issues.push({
        level: "warn",
        sceneId: id,
        message: "Сцена недостижима со старта.",
      });
    }
  }
  return issues;
}
