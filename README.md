# Print Deck

Client-side dashboard for [Moonraker](https://moonraker.readthedocs.io/) printers. Add printer URLs, poll status, pause/resume/cancel. Printer list lives in `localStorage`. Try **`/demo`** for simulated printers (no network).

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (default `http://localhost:5173`). Use **Run and Debug → Print Deck** after the dev server is running.

## GitHub Pages

```bash
npm run build
```

Upload `dist/` to Pages, or push `dist` to `gh-pages`. Set `base` in `vite.config.ts` if your site is served from a subpath (e.g. `/print-deck/`).

## Real printers from the browser

Moonraker must allow your app origin in `[authorization] cors_domains` (see Moonraker docs). Otherwise use demo mode or run the app from a origin Moonraker already trusts.
