export function isDemoRoute(): boolean {
  return /\/demo\/?$/.test(window.location.pathname);
}

export function liveHref(): string {
  const url = new URL(".", window.location.href);
  url.pathname = url.pathname.replace(/\/demo\/?$/, "/");
  return url.pathname + url.search + url.hash;
}

export function demoHref(): string {
  const live = new URL(".", window.location.href);
  live.pathname = live.pathname.replace(/\/demo\/?$/, "/");
  const demo = new URL("demo", live.href);
  return demo.pathname + demo.search + demo.hash;
}

export function navigateToLive(): void {
  const href = liveHref();
  if (href === window.location.pathname + window.location.search + window.location.hash) {
    return;
  }
  history.pushState({}, "", href);
  window.dispatchEvent(new Event("print-deck:route"));
}

export function navigateToDemo(): void {
  const href = demoHref();
  if (href === window.location.pathname + window.location.search + window.location.hash) {
    return;
  }
  history.pushState({}, "", href);
  window.dispatchEvent(new Event("print-deck:route"));
}
