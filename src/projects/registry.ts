import { cherwoodProject } from "./cherwood";
import type { ProjectDefinition, ProjectSummary } from "./types";

/**
 * All playable/draft projects shipped in git.
 * Add a folder under src/projects/<id> and register here.
 */
const PROJECTS: ProjectDefinition[] = [cherwoodProject];

const BY_ID: Record<string, ProjectDefinition> = Object.fromEntries(
  PROJECTS.map((p) => [p.manifest.id, p]),
);

export function listProjects(): ProjectSummary[] {
  return PROJECTS.map((p) => p.manifest);
}

export function listPlayableProjects(): ProjectSummary[] {
  return listProjects().filter((p) => p.status === "playable");
}

export function getProject(id: string): ProjectDefinition | null {
  return BY_ID[id] ?? null;
}

export function getProjectOrThrow(id: string): ProjectDefinition {
  const p = getProject(id);
  if (!p) throw new Error(`Unknown project: ${id}`);
  return p;
}
