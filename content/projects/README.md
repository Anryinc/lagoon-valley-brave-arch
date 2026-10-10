# Projects (git source of truth)

Each playable scenario is a folder under `content/projects/<id>/`.

- `manifest.json` — card for the hub (title, cover, player counts, status)
- Future: `pack.json` / graph nodes edited by Studio and committed here

The runtime loads manifests via `src/lib/projects/catalog.ts`.
Studio saves by writing these files (commit to git) — not localStorage.
