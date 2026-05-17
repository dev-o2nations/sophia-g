/**
 * SOPHIA-G Component Loader
 * Fetches each section's HTML partial and injects it into its slot.
 * After all components are loaded, initialises scroll + parallax.
 *
 * Live Server injects a <script> block into every .html partial it serves.
 * stripLiveServer() removes those injected scripts before insertion so they
 * never corrupt the DOM and never get cached.
 */

const COMPONENTS = [
  { slot: "header",      path: "components/header/header.html" },
  { slot: "hero",        path: "components/hero/hero.html" },
  { slot: "welcome",     path: "components/welcome/welcome.html" },
  { slot: "collections", path: "components/collections/collections.html" },
  { slot: "services",    path: "components/services/services.html" },
  { slot: "subscribe",   path: "components/subscribe/subscribe.html" },
  { slot: "footer",      path: "components/footer/footer.html" },
  { slot: "scroll-top",  path: "components/scroll-top/scroll-top.html" },
];

/** Remove any <script> blocks injected by Live Server (or any tool) */
function stripInjectedScripts(html) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, "");
}

async function loadComponent({ slot, path }) {
  try {
    /* Unique timestamp on every page load — bypasses every cache layer */
    const bust = "?t=" + Date.now();
    const res  = await fetch(path + bust, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status} — ${path}`);

    const raw    = await res.text();
    const clean  = stripInjectedScripts(raw);
    const target = document.querySelector(`[data-component="${slot}"]`);
    if (target) target.innerHTML = clean;
  } catch (err) {
    console.warn(`[SOPHIA-G] Could not load component "${slot}":`, err.message);
  }
}

async function init() {
  await Promise.all(COMPONENTS.map(loadComponent));

  /* Fire main.js initialisers once the DOM is fully populated */
  if (typeof window.__sophiaInit === "function") {
    window.__sophiaInit();
  }
}

init();
