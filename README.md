# Print Deck

Client-side dashboard for [Moonraker](https://moonraker.readthedocs.io/) printers. Add printer URLs, poll status, pause/resume/cancel. Printer list lives in `localStorage`. Try **`/demo`** for simulated printers (no network).

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:5173/demo` (or `/` for your saved printers). Use **Run and Debug → Print Deck** after the dev server is running.

## Deploy (GitHub Pages)

1. Set `base` in `vite.config.ts` to `"/<repo-name>/"` (e.g. `"/print-deck/"`) for a project site at `https://<user>.github.io/<repo-name>/`.
2. In the repo on GitHub: **Settings → Pages → Build and deployment → Source**: branch **`gh-pages`**, folder **`/`** (root).
3. From this folder:

```bash
npm run deploy
```

That runs `build`, then pushes `dist/` to the `gh-pages` branch. You need git remotes set up and permission to push.

## Real printers from the browser

Moonraker must allow your app origin in `[authorization] cors_domains` (see Moonraker docs). Otherwise use `/demo` or run the app from an origin Moonraker already trusts.
