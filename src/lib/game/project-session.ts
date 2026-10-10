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
