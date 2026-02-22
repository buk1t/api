// public/js/favicon.js
// Inject buk1t favicon + manifest tags into <head> for any subdomain.
// Usage:
// <script
//   type="module"
//   src="https://api.buk1t.com/js/favicon.js"
//   data-app-title="buk1t"
// ></script>

const BASE = "https://api.buk1t.com/assets/favicon";

function upsertMeta(name, content) {
  const head = document.head;
  if (!head) return;

  let el = head.querySelector(`meta[name="${CSS.escape(name)}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function removeAllLinks(rel) {
  document.head?.querySelectorAll(`link[rel="${CSS.escape(rel)}"]`).forEach(n => n.remove());
}

function addLink(rel, href, attrs = {}) {
  const head = document.head;
  if (!head) return;

  const el = document.createElement("link");
  el.rel = rel;
  el.href = href;
  Object.entries(attrs).forEach(([k, v]) => {
    if (v == null) return;
    el.setAttribute(k, String(v));
  });
  head.appendChild(el);
}

function install({
  appTitle = "buk1t",
  themeColor = null,
  colorScheme = "dark light",
  preferSvg = true
} = {}) {
  // Optional niceties
  if (colorScheme) {
    // Meta is safe to include once everywhere
    upsertMeta("color-scheme", colorScheme);
  }
  if (themeColor) {
    upsertMeta("theme-color", themeColor);
  }

  upsertMeta("apple-mobile-web-app-title", appTitle);

  // Remove any existing icon tags so we don't duplicate across reloads/hot updates
  removeAllLinks("icon");
  removeAllLinks("shortcut icon");
  removeAllLinks("apple-touch-icon");
  removeAllLinks("manifest");

  // Icons
  if (preferSvg) {
    addLink("icon", `${BASE}/favicon.svg`, { type: "image/svg+xml" });
  }
  addLink("icon", `${BASE}/favicon-96x96.png`, { type: "image/png", sizes: "96x96" });
  addLink("shortcut icon", `${BASE}/favicon.ico`);
  addLink("apple-touch-icon", `${BASE}/apple-touch-icon.png`, { sizes: "180x180" });

  // Manifest
  addLink("manifest", `${BASE}/site.webmanifest`);
}

// Read config from the script tag that loaded this module
const self = document.currentScript;
// Note: for type="module", currentScript is generally supported in modern browsers.
// If it fails, we fall back to defaults.
const cfg = {
  appTitle: self?.dataset?.appTitle || "buk1t",
  themeColor: self?.dataset?.themeColor || null,
  colorScheme: self?.dataset?.colorScheme || "dark light",
  preferSvg: (self?.dataset?.preferSvg ?? "true") !== "false"
};

install(cfg);