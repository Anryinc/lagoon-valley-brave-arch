const KEY = "cherwood.clientId";

export function getClientId() {
  if (typeof window === "undefined") return "ssr";
  let id = sessionStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(KEY, id);
  }
  return id;
}
