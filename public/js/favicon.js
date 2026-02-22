// public/js/favicon.js
// Dynamic SVG favicon w/ per-page color.
// Usage (in <head>):
// <script type="module"
//   src="https://api.buk1t.com/js/favicon.js"
//   data-app-title="buk1t"
//   data-accent="auto"  // "auto" reads CSS var --accent, or set a hex like "#7aa7ff"
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
  document.head?.querySelectorAll(`link[rel="${CSS.escape(rel)}"]`).forEach((n) => n.remove());
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

function getCssVar(name) {
  try {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  } catch {
    return "";
  }
}

function pickAccent(scriptAccent) {
  const a = String(scriptAccent || "").trim();

  // If user explicitly provides a color (e.g. "#7aa7ff"), use it.
  if (a && a !== "auto") return a;

  // Auto: read CSS variables in order of preference.
  // You can rename these if your tokens differ.
  return (
    getCssVar("--accent") ||
    getCssVar("--brand") ||
    getCssVar("--primary") ||
    "rgba(122, 167, 255, 0.95)" // final fallback
  );
}

function svgFavicon(accent) {
  // A simple “bucket” mark, but abstract enough to work everywhere.
  // Uses 24x24 to match common favicon sizing.
  // Tip: keep shapes bold so they render at tiny sizes.
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
  <defs>
    <filter id="g" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="0.6" result="b"/>
      <feMerge>
        <feMergeNode in="b"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- background -->
  <rect x="2" y="2" width="20" height="20" rx="6" fill="rgba(255,255,255,0.06)"/>

  <!-- accent mark -->
  <path filter="url(#g)"
    d="M7.2 10.2c0-2 1.6-3.6 3.6-3.6h2.4c2 0 3.6 1.6 3.6 3.6v3.6c0 2-1.6 3.6-3.6 3.6h-2.4c-2 0-3.6-1.6-3.6-3.6v-3.6z"
    fill="${accent}"/>

  <!-- little notch -->
  <path d="M9.2 10.3h5.6v1.6H9.2z" fill="rgba(0,0,0,0.22)"/>
</svg>`;
}

function toDataSvg(svgText) {
  // Keep it simple: URL-encode and use data URL
  const encoded = encodeURIComponent(svgText)
    .replace(/%0A/g, "")
    .replace(/%20/g, " ");
  return `data:image/svg+xml,${encoded}`;
}

function install({
  appTitle = "buk1t",
  themeColor = null,
  colorScheme = "dark light",
  accent = "auto"
} = {}) {
  // Optional niceties
  if (colorScheme) upsertMeta("color-scheme", colorScheme);
  if (themeColor) upsertMeta("theme-color", themeColor);
  upsertMeta("apple-mobile-web-app-title", appTitle);

  // Remove existing to avoid duplicates
  removeAllLinks("icon");
  removeAllLinks("shortcut icon");
  removeAllLinks("apple-touch-icon");
  removeAllLinks("manifest");

  const chosenAccent = pickAccent(accent);
  const svg = svgFavicon(chosenAccent);
  const svgHref = toDataSvg(svg);

  // Dynamic SVG favicon (per-page accent)
  addLink("icon", svgHref, { type: "image/svg+xml" });

  // PNG + ICO fallback (stability)
  addLink("icon", `${BASE}/favicon-96x96.png`, { type: "image/png", sizes: "96x96" });
  addLink("shortcut icon", `${BASE}/favicon.ico`);

  // iOS / PWA
  addLink("apple-touch-icon", `${BASE}/apple-touch-icon.png`, { sizes: "180x180" });
  addLink("manifest", `${BASE}/site.webmanifest`);
}

// Read config from the script tag
const self = document.currentScript;

install({
  appTitle: self?.dataset?.appTitle || "buk1t",
  themeColor: self?.dataset?.themeColor || null,
  colorScheme: self?.dataset?.colorScheme || "dark light",
  accent: self?.dataset?.accent || "auto"
});