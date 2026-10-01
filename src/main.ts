import { mountApp } from "./app";
import "./style.css";

function getRoot(): HTMLElement {
  const el = document.querySelector("#app");
  if (!(el instanceof HTMLElement)) throw new Error("#app not found");
  return el;
}

let teardown: (() => void) | undefined;

function boot(): void {
  teardown?.();
  teardown = mountApp(getRoot());
}

boot();
window.addEventListener("print-deck:route", boot);
window.addEventListener("popstate", boot);
