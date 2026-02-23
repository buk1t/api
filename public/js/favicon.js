// public/js/favicon.js
// Buk1t dynamic favicon (uses your real SVG paths) + optional CSS var color.
// Usage (in <head>):
// <script
//   type="module"
//   src="https://api.buk1t.com/js/favicon.js?v=1"
//   data-app-title="buk1t"
//   data-accent="auto"          // "auto" uses CSS var --accent; or set "#3ddc97"
//   data-theme-color="#0b0b0d"  // optional (mobile browser UI color)
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
  if (!head) return null;

  const el = document.createElement("link");
  el.rel = rel;
  el.href = href;
  Object.entries(attrs).forEach(([k, v]) => {
    if (v == null) return;
    el.setAttribute(k, String(v));
  });
  head.appendChild(el);
  return el;
}

function cssVar(name) {
  try {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  } catch {
    return "";
  }
}

function pickColor(accentSetting) {
  const a = String(accentSetting || "").trim();

  if (a && a !== "auto") return a;

  // Prefer favicon-specific variable
  return (
    cssVar("--favicon") ||
    cssVar("--accent") ||
    cssVar("--brand") ||
    cssVar("--primary") ||
    "#000"
  );
}

function svgFavicon(accent) {
  // Your original icon has viewBox="0 -0.5 17 17" and group translate(1,0).
  // For favicon use, we keep that exact geometry and scale it to 64x64.
  // We also convert the "opening" path into a mask cutout so it becomes a real hole.

  const openingPath =
    `M7.759,1.143 C7.252,0.634 5.403,1.664 3.629,3.445 C1.857,5.227 0.828,7.082 1.336,7.591 C1.842,8.099 3.69,7.07 5.465,5.287 C7.237,3.506 8.266,1.65 7.759,1.143 L7.759,1.143 Z`;

  const bucketBodyPath =
    `M15.737,7.881 L14.834,6.985 C14.507,7.895 13.859,8.674 12.905,9.235 C11.888,9.835 10.612,10.151 9.214,10.151 C8.423,10.151 7.623,10.048 6.836,9.846 C6.682,9.806 6.554,9.709 6.473,9.573 C6.392,9.437 6.369,9.276 6.41,9.123 C6.478,8.86 6.715,8.677 6.985,8.677 C7.036,8.677 7.087,8.684 7.133,8.697 C7.828,8.877 8.531,8.968 9.224,8.968 C10.399,8.968 11.463,8.707 12.301,8.215 C13.094,7.747 13.615,7.104 13.808,6.354 C13.836,6.24 13.831,6.121 13.846,6.004 L7.862,0.062 C7.862,0.062 6.173,-0.244 3.044,2.899 C-0.089,6.044 0.034,7.834 0.034,7.834 C0.034,7.834 7.194,15.023 7.911,15.741 C8.628,16.461 10.902,15.533 13.25,13.177 C15.598,10.814 16.343,8.489 15.737,7.881 L15.737,7.881 Z M1.336,7.59 C0.828,7.081 1.857,5.227 3.629,3.444 C5.402,1.663 7.252,0.633 7.759,1.142 C8.266,1.65 7.238,3.505 5.465,5.286 C3.69,7.068 1.842,8.098 1.336,7.59 L1.336,7.59 Z`;

  const ringPath =
    `M14.864,6.621 C15.554,3.936 13.089,0.974 9.366,0.016 C9.099,-0.049 8.831,0.107 8.762,0.371 C8.695,0.635 8.854,0.904 9.118,0.973 C12.181,1.76 14.275,4.022 13.951,6.109 L14.757,6.908 C14.791,6.811 14.839,6.721 14.864,6.621 L14.864,6.621 Z`;

  // Note: use a solid, favicon-friendly stroke-less fill approach.
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"
     viewBox="0 -0.5 17 17">
  <defs>
    <mask id="buk1t-cut">
      <rect x="-5" y="-5" width="40" height="40" fill="white"/>
      <!-- Cut out the opening -->
      <path d="${openingPath}" fill="black"/>
    </mask>
  </defs>

  <!-- Original icon group translate(1,0) -->
  <g transform="translate(1,0)">
    <!-- Bucket body (accent) with opening cutout -->
    <path d="${bucketBodyPath}" fill="${accent}" mask="url(#buk1t-cut)"/>
    <!-- Ring/orbit -->
    <path d="${ringPath}" fill="${accent}"/>
  </g>
</svg>`;
}

function toDataSvg(svgText) {
  // URL-encode for data URL; keep it compact
  const encoded = encodeURIComponent(svgText).replace(/%0A/g, "");
  return `data:image/svg+xml,${encoded}`;
}

function install({ appTitle, themeColor, colorScheme, accent }) {
  // Helpful metas
  if (colorScheme) upsertMeta("color-scheme", colorScheme);
  if (themeColor) upsertMeta("theme-color", themeColor);
  upsertMeta("apple-mobile-web-app-title", appTitle);

  // Clear existing icons so we don't stack duplicates
  removeAllLinks("icon");
  removeAllLinks("shortcut icon");
  removeAllLinks("apple-touch-icon");
  removeAllLinks("manifest");

  const chosen = pickColor(accent);

  // Dynamic SVG favicon (themed)
  const svgHref = toDataSvg(svgFavicon(chosen));
  addLink("icon", svgHref, { type: "image/svg+xml" });

  // iOS/PWA icons cannot be dynamically themed; keep static assets
  addLink("apple-touch-icon", `${BASE}/apple-touch-icon.png`, { sizes: "180x180" });
  addLink("manifest", `${BASE}/site.webmanifest`);

  // Optional: if you want absolute maximum legacy support, uncomment these:
  // addLink("icon", `${BASE}/favicon-96x96.png`, { type: "image/png", sizes: "96x96" });
  // addLink("shortcut icon", `${BASE}/favicon.ico`);
}

function waitForCssVars(accentSetting, tries = 8) {
  // If accent is "auto", give CSS a moment to load so --accent exists
  return new Promise((resolve) => {
    const tick = () => {
      const a = pickColor(accentSetting);
      // If still fallback-ish and we have tries left, keep waiting a frame
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

// Read config from the script tag that loaded this module
const self = document.currentScript;

const cfg = {
  appTitle: self?.dataset?.appTitle || "buk1t",
  themeColor: self?.dataset?.themeColor || null,
  colorScheme: self?.dataset?.colorScheme || "dark light",
  accent: self?.dataset?.accent || "auto"
};

waitForCssVars(cfg.accent).then(() => install(cfg));