export default async function handler(req, res) {
  try {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      res.status(500).json({ error: "Missing GITHUB_TOKEN env var" });
      return;
    }

    const pathRaw = (req.query.path || "").toString().trim();
    if (!pathRaw) {
      res.status(400).json({ error: "Missing ?path=" });
      return;
    }

    // Prevent SSRF: no full URLs
    if (pathRaw.includes("://")) {
      res.status(400).json({ error: "Invalid path" });
      return;
    }

    const path = pathRaw.startsWith("/") ? pathRaw : `/${pathRaw}`;
    const url = `https://api.github.com${path}`;

    const headers = {
      "Accept": "application/vnd.github+json",
      "Authorization": `Bearer ${token}`,
      "User-Agent": "buk1t-api-proxy"
    };

    // Support conditional requests if client sends If-None-Match
    const inm = req.headers["if-none-match"];
    if (inm) headers["If-None-Match"] = inm;

    const gh = await fetch(url, { headers });

    // Pass through important headers
    const passthru = [
      "content-type",
      "etag",
      "x-ratelimit-limit",
      "x-ratelimit-remaining",
      "x-ratelimit-reset"
    ];
    for (const h of passthru) {
      const v = gh.headers.get(h);
      if (v) res.setHeader(h, v);
    }

    // CDN cache at Vercel edge
    res.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=86400");

    res.status(gh.status);

    if (gh.status === 304) {
      res.end();
      return;
    }

    const text = await gh.text();
    res.send(text);
  } catch (e) {
    res.status(500).json({ error: "Proxy error", detail: String(e?.message || e) });
  }
}