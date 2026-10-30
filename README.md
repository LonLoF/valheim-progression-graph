# Valheim progression graph

Interactive reference for Valheim creatures, materials, food, gear, stations, structures and traders, grouped by the biome where you can first get them. Dataset **2026-10-28 v9** (1167 entries, including 69 structures). Each entry’s detail panel includes a short summary, stats, and a Valheim Wiki link when one exists.

- [Full graph](https://lonlof.github.io/valheim-progression-graph/) — every biome at once, in the same wood-and-iron frame. Tap an entry to see where it comes from (solid lines) and what it leads to (dashed lines).
- [Compact view](https://lonlof.github.io/valheim-progression-graph/compact/) — one biome at a time. Swipe or use the arrows to change biome. Links can stop at the next connection, or follow the whole upstream and downstream chain.

Both pages work on a phone and on a desktop. A link at the top of each page switches to the other view.

## Build locally

```bash
npm ci
npm run build
npm run preview
```

The site is built with Vite and a relative base path, so it is served under `/valheim-progression-graph/`.

## Publishing

Pushes to `main` run [`.github/workflows/pages.yml`](.github/workflows/pages.yml), which builds `dist/` and deploys it with GitHub Actions.

Pages has to use **GitHub Actions** as its source. If the site is not live yet: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
