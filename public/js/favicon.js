// public/js/favicon.js
const BASE = "https://api.buk1t.com/assets/favicon";

function upsertMeta(name, content) {
  let el = document.head.querySelector(`meta[name="${CSS.escape(name)}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.name = name;
    document.head.appendChild(el);
  }
  el.content = content;
}

function removeAllLinks(rel) {
  document.head.querySelectorAll(`link[rel="${CSS.escape(rel)}"]`).forEach(n => n.remove());
}

function addLink(rel, href, attrs = {}) {
  const el = document.createElement("link");
  el.rel = rel;
  el.href = href;
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  document.head.appendChild(el);
  return el;
}

function cssVar(name) {
  try {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  } catch {
    return "";
  }
}

function pickAccent(accentSetting) {
  const a = String(accentSetting || "").trim();
  if (a && a !== "auto") return a;

  // IMPORTANT: your tokens must define --accent on :root
  return (
    cssVar("--accent") ||
    cssVar("--brand") ||
    cssVar("--primary") ||
    "#7aa7ff"
  );
}

function svgFavicon(accent) {
  // Big bold shapes so it reads at 16px
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <rect x="6" y="6" width="52" height="52" rx="16" fill="rgba(255,255,255,0.06)"/>
  <path d="M18 28c0-6.6 5.4-12 12-12h4c6.6 0 12 5.4 12 12v8c0 6.6-5.4 12-12 12h-4c-6.6 0-12-5.4-12-12v-8z"
        fill="${accent}"/>
  <path d="M22 28h20v6H22z" fill="rgba(0,0,0,0.22)"/>
</svg>`;
}

function toDataSvg(svgText) {
  const encoded = encodeURIComponent(svgText).replace(/%0A/g, "");
  return `data:image/svg+xml,${encoded}`;
}

function install({ appTitle, themeColor, colorScheme, accent }) {
  if (colorScheme) upsertMeta("color-scheme", colorScheme);
  if (themeColor) upsertMeta("theme-color", themeColor);
  upsertMeta("apple-mobile-web-app-title", appTitle);

  removeAllLinks("icon");
  removeAllLinks("shortcut icon");
  removeAllLinks("apple-touch-icon");
  removeAllLinks("manifest");

  const chosen = pickAccent(accent);
  const href = toDataSvg(svgFavicon(chosen));

  addLink("icon", href, { type: "image/svg+xml" });
  addLink("icon", `${BASE}/favicon-96x96.png`, { type: "image/png", sizes: "96x96" });
  addLink("shortcut icon", `${BASE}/favicon.ico`);
  addLink("apple-touch-icon", `${BASE}/apple-touch-icon.png`, { sizes: "180x180" });
  addLink("manifest", `${BASE}/site.webmanifest`);
}

function waitForAccent(accentSetting, tries = 8) {
  return new Promise((resolve) => {
    const tick = () => {
      const a = pickAccent(accentSetting);
      // If auto and still empty-ish, keep trying a few frames
      if (String(accentSetting) === "auto" && (!a || a === "#7aa7ff") && tries > 0) {
        tries -= 1;
        requestAnimationFrame(tick);
        return;
      }
      resolve(a);
    };
    requestAnimationFrame(tick);
  });
}

const self = document.currentScript;

const cfg = {
  appTitle: self?.dataset?.appTitle || "buk1t",
  themeColor: self?.dataset?.themeColor || null,
  colorScheme: self?.dataset?.colorScheme || "dark light",
  accent: self?.dataset?.accent || "auto"
};

// Wait for CSS vars to exist, then install
waitForAccent(cfg.accent).then(() => install(cfg));