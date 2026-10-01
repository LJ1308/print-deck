import {
  cancelPrint,
  fetchPrinterStatus,
  pausePrint,
  resumePrint,
} from "./moonraker";
import { demoAction, fetchDemoStatus, getDemoPrinters } from "./demo";
import { isDemoRoute, navigateToDemo, navigateToLive } from "./routes";
import {
  loadSettings,
  newPrinter,
  normalizePrinterUrl,
  saveSettings,
} from "./storage";
import type { PrinterEntry, PrinterSnapshot } from "./types";

const POLL_MS = 2000;

export function mountApp(root: HTMLElement): () => void {
  let settings = loadSettings();
  const demoMode = isDemoRoute();
  let snapshots: Map<string, PrinterSnapshot> = new Map();
  let pollTimer: number | undefined;

  root.innerHTML = `
    ${
      demoMode
        ? `
    <div class="demo-banner" role="status">
      <div>
        <strong>You’re on the demo dashboard</strong>
        <p>Sample printers and fake print data only — nothing here talks to your network. Connect your real Moonraker hosts when you’re ready.</p>
      </div>
      <button type="button" class="primary switch-live" id="switch-live">Use my real printers →</button>
    </div>`
        : ""
    }

    <header>
      <div>
        <h1>Print Deck</h1>
        <p class="tagline">${demoMode ? "Demo · simulated printers" : "Moonraker printers in one place"}</p>
      </div>
      ${
        demoMode
          ? ""
          : `<a class="link-demo" href="#" id="try-demo">Try demo first</a>`
      }
    </header>

    <section class="panel" id="add-panel">
      <h2>Add printer</h2>
      <div class="row">
        <input type="text" id="printer-name" placeholder="Name (optional)" autocomplete="off" />
        <input type="url" id="printer-url" placeholder="http://192.168.0.10:7125" autocomplete="off" />
        <button type="button" class="primary" id="add-printer">Add</button>
      </div>
      <p class="hint" id="add-hint"></p>
    </section>

    <section class="panel" id="list-panel">
      <h2>Saved printers</h2>
      <ul class="printer-list" id="printer-list"></ul>
      <p class="hint empty" id="list-empty">No printers yet. Add a Moonraker URL above.</p>
    </section>

    <section>
      <h2 style="margin:0 0 0.75rem;font-size:0.95rem;color:var(--muted);text-transform:uppercase;letter-spacing:0.06em;">Dashboard</h2>
      <div class="grid" id="dashboard"></div>
      <p class="hint empty" id="dash-empty" hidden>No printers to show.</p>
    </section>
  `;

  const nameInput = root.querySelector<HTMLInputElement>("#printer-name")!;
  const urlInput = root.querySelector<HTMLInputElement>("#printer-url")!;
  const addBtn = root.querySelector<HTMLButtonElement>("#add-printer")!;
  const addHint = root.querySelector<HTMLParagraphElement>("#add-hint")!;
  const listEl = root.querySelector<HTMLUListElement>("#printer-list")!;
  const listEmpty = root.querySelector<HTMLParagraphElement>("#list-empty")!;
  const dashEl = root.querySelector<HTMLDivElement>("#dashboard")!;
  const dashEmpty = root.querySelector<HTMLParagraphElement>("#dash-empty")!;
  const addPanel = root.querySelector<HTMLElement>("#add-panel")!;
  const listPanel = root.querySelector<HTMLElement>("#list-panel")!;

  root.querySelector("#switch-live")?.addEventListener("click", () => {
    navigateToLive();
  });

  root.querySelector("#try-demo")?.addEventListener("click", (ev) => {
    ev.preventDefault();
    navigateToDemo();
  });

  function activePrinters(): PrinterEntry[] {
    if (demoMode) return getDemoPrinters();
    return settings.printers;
  }

  function persist(): void {
    saveSettings(settings);
  }

  function renderList(): void {
    if (demoMode) {
      addPanel.hidden = true;
      listPanel.hidden = true;
      return;
    }

    addPanel.hidden = false;
    listPanel.hidden = false;

    if (settings.printers.length === 0) {
      listEl.innerHTML = "";
      listEmpty.textContent = "No printers yet. Add a Moonraker URL above.";
      listEmpty.hidden = false;
      return;
    }

    listEmpty.hidden = true;
    listEl.innerHTML = settings.printers
      .map(
        (p) => `
      <li data-id="${p.id}">
        <div class="meta">
          <strong>${escapeHtml(p.name)}</strong>
          <span>${escapeHtml(p.url)}</span>
        </div>
        <button type="button" data-action="remove">Remove</button>
      </li>`,
      )
      .join("");
  }

  function renderDashboard(): void {
    const printers = activePrinters();
    if (printers.length === 0) {
      dashEl.innerHTML = "";
      dashEmpty.hidden = false;
      dashEmpty.textContent = demoMode
        ? "Demo printers should appear here."
        : "No printers yet. Add a Moonraker URL above.";
      return;
    }
    dashEmpty.hidden = true;

    dashEl.innerHTML = printers
      .map((p) => {
        const snap = snapshots.get(p.id);
        return cardHtml(p, snap);
      })
      .join("");

    dashEl.querySelectorAll("[data-action]").forEach((el) => {
      el.addEventListener("click", onCardAction);
    });
  }

  function cardHtml(p: PrinterEntry, snap: PrinterSnapshot | undefined): string {
    const s = snap ?? placeholderSnapshot(p);
    const badgeClass =
      !s.online && !demoMode
        ? "offline"
        : s.printState === "printing"
          ? "printing"
          : s.printState === "paused"
            ? "paused"
            : s.printState === "error"
              ? "error"
              : "";

    const canPause = s.printState === "printing";
    const canResume = s.printState === "paused";
    const canCancel =
      s.printState === "printing" ||
      s.printState === "paused" ||
      s.printState === "complete";

    return `
    <article class="card ${s.online || demoMode ? "" : "offline"}" data-id="${p.id}">
      <div class="card-head">
        <h3>${escapeHtml(s.name)}</h3>
        <span class="badge ${badgeClass}">${escapeHtml(displayState(s))}</span>
      </div>
      <div class="progress" aria-label="Progress"><span style="width:${s.progress.toFixed(1)}%"></span></div>
      <p class="hint">${s.filename ? escapeHtml(s.filename) : "No file"} · ${s.progress.toFixed(0)}%</p>
      <div class="stats">
        <div>Nozzle <strong>${s.extruderTemp.toFixed(1)}°</strong> / ${s.extruderTarget.toFixed(0)}°</div>
        <div>Bed <strong>${s.bedTemp.toFixed(1)}°</strong> / ${s.bedTarget.toFixed(0)}°</div>
        <div>Klipper <strong>${escapeHtml(s.klippyState)}</strong></div>
        <div>Host <strong>${escapeHtml(shortUrl(s.url))}</strong></div>
      </div>
      ${s.error ? `<p class="hint" style="color:var(--bad)">${escapeHtml(s.error)}</p>` : ""}
      <div class="card-actions">
        <button type="button" data-action="pause" data-id="${p.id}" ${canPause ? "" : "disabled"}>Pause</button>
        <button type="button" data-action="resume" data-id="${p.id}" ${canResume ? "" : "disabled"}>Resume</button>
        <button type="button" class="danger" data-action="cancel" data-id="${p.id}" ${canCancel ? "" : "disabled"}>Cancel</button>
      </div>
    </article>`;
  }

  function placeholderSnapshot(p: PrinterEntry): PrinterSnapshot {
    return {
      printerId: p.id,
      name: p.name,
      url: p.url,
      online: false,
      klippyState: "…",
      printState: "unknown",
      filename: null,
      progress: 0,
      extruderTemp: 0,
      extruderTarget: 0,
      bedTemp: 0,
      bedTarget: 0,
      error: null,
    };
  }

  async function poll(): Promise<void> {
    const printers = activePrinters();
    await Promise.all(
      printers.map(async (p) => {
        const snap = demoMode
          ? fetchDemoStatus(p)
          : await fetchPrinterStatus(p);
        snapshots.set(p.id, snap);
      }),
    );
    renderDashboard();
  }

  function startPolling(): void {
    if (pollTimer !== undefined) window.clearInterval(pollTimer);
    void poll();
    pollTimer = window.setInterval(() => void poll(), POLL_MS);
  }

  addBtn.addEventListener("click", () => {
    addHint.textContent = "";
    try {
      const url = normalizePrinterUrl(urlInput.value);
      const printer = newPrinter(nameInput.value, url);
      settings.printers.push(printer);
      persist();
      nameInput.value = "";
      urlInput.value = "";
      renderList();
      renderDashboard();
      void poll();
    } catch (e) {
      addHint.textContent = e instanceof Error ? e.message : "Invalid URL";
    }
  });

  listEl.addEventListener("click", (ev) => {
    const target = ev.target as HTMLElement;
    if (target.dataset.action !== "remove") return;
    const li = target.closest("li");
    const id = li?.getAttribute("data-id");
    if (!id) return;
    settings.printers = settings.printers.filter((p) => p.id !== id);
    snapshots.delete(id);
    persist();
    renderList();
    renderDashboard();
  });

  async function onCardAction(ev: Event): Promise<void> {
    const btn = ev.currentTarget as HTMLButtonElement;
    const action = btn.dataset.action as "pause" | "resume" | "cancel";
    const id = btn.dataset.id;
    if (!id || !action) return;

    const printer = activePrinters().find((p) => p.id === id);
    if (!printer) return;

    btn.disabled = true;
    let err: string | null;
    if (demoMode) {
      err = await demoAction(printer, action);
    } else {
      err =
        action === "pause"
          ? await pausePrint(printer)
          : action === "resume"
            ? await resumePrint(printer)
            : await cancelPrint(printer);
    }
    if (err) {
      const snap = snapshots.get(id);
      if (snap) snapshots.set(id, { ...snap, error: err });
      renderDashboard();
    } else {
      await poll();
    }
  }

  renderList();
  renderDashboard();
  startPolling();

  return () => {
    if (pollTimer !== undefined) window.clearInterval(pollTimer);
  };
}

function displayState(s: PrinterSnapshot): string {
  if (!s.online && s.klippyState === "offline") return "offline";
  return s.printState;
}

function shortUrl(url: string): string {
  try {
    const u = new URL(url);
    return u.host;
  } catch {
    return url;
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
