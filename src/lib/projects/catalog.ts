import type { ProjectManifest } from "./types";
import cherwoodManifest from "../../../content/projects/cherwood/manifest.json";

/**
 * Bundled projects from git. Add a folder under content/projects/ and register here.
 * Studio will later write manifests/packs back into the same tree via commits.
 */
const BUNDLED: ProjectManifest[] = [
  cherwoodManifest as ProjectManifest,
];

export function listProjects(): ProjectManifest[] {
  return BUNDLED.slice().sort((a, b) => a.title.localeCompare(b.title, "ru"));
}

export function listPlayableProjects(): ProjectManifest[] {
  return listProjects().filter((p) => p.status === "playable");
}

export function getProject(id: string): ProjectManifest | null {
  return BUNDLED.find((p) => p.id === id) ?? null;
}
