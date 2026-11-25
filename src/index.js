// Redirect www and the .co.uk domains to marcuswalton.dev; serve static files with security headers for everything else.
// If CF_ANALYTICS_TOKEN is set in wrangler.jsonc, the Cloudflare Web Analytics beacon is added to every HTML page.
// Elements with data-vault-stat="commands|playbooks|guides" get the Linux Command Vault's current counts,
// read from linux.marcuswalton.dev/stats.json through the VAULT service binding. If that fails, the
// numbers written in the HTML are shown.

const CANONICAL_HOST = "marcuswalton.dev";
const REDIRECT_HOSTS = new Set([
  "www.marcuswalton.dev",
  "marcuswalton.co.uk",
  "www.marcuswalton.co.uk",
]);

const SECURITY_HEADERS = {
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  "Content-Security-Policy": [
    "default-src 'self'",
    // Cloudflare Web Analytics: the beacon script and where it reports to.
    "script-src 'self' https://static.cloudflareinsights.com",
    "connect-src 'self' https://cloudflareinsights.com",
    // Project cards set colors through inline style attributes.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'none'",
    "frame-ancestors 'none'",
  ].join("; "),
};

// Browser caching. Anything not listed revalidates on every visit (Cloudflare's default), so HTML,
// CSS and JS changes show up straight away. Fonts never change in place: give a new font a new file name.
const CACHE_RULES = [
  [/^\/fonts\//, "public, max-age=31536000, immutable"],
  [/^\/(og\.png|favicon\.(ico|svg)|apple-touch-icon\.png)$/, "public, max-age=604800"],
];

// Pages with data-vault-stat elements.
const STATS_PAGES = new Set(["/", "/index.html", "/work/linux-vault", "/work/linux-vault.html"]);

// Vault counts, kept per Worker instance for STATS_TTL_MS so most page views don't fetch them.
const STATS_TTL_MS = 10 * 60 * 1000;
let statsCache = { at: 0, value: null };

async function vaultStats(env) {
  if (!env.VAULT) return null; // no binding (e.g. a local preview without the vault running)
  if (Date.now() - statsCache.at < STATS_TTL_MS) return statsCache.value;
  let value = null;
  try {
    const res = await env.VAULT.fetch("https://linux.marcuswalton.dev/stats.json", {
      signal: AbortSignal.timeout(1500),
    });
    if (res.ok) {
      const data = await res.json();
      if (["commands", "playbooks", "guides"].every((k) => Number.isInteger(data[k]) && data[k] > 0)) value = data;
    }
  } catch {
    // Keep the numbers in the HTML.
  }
  // After a failure, try again in a minute rather than waiting out the full TTL.
  statsCache = { at: value ? Date.now() : Date.now() - STATS_TTL_MS + 60 * 1000, value: value ?? statsCache.value };
  return statsCache.value;
}

// 454 -> "450+": the same rounding used when the numbers were written by hand.
const roundDown = (n) => (n >= 20 ? `${Math.floor(n / 10) * 10}+` : String(n));

function addVaultStats(response, stats) {
  return new HTMLRewriter()
    .on("[data-vault-stat]", {
      element(el) {
        const n = stats[el.getAttribute("data-vault-stat")];
        if (Number.isInteger(n)) el.setInnerContent(roundDown(n));
      },
    })
    .transform(response);
}

function addAnalytics(response, token) {
  const beacon = JSON.stringify({ token });
  return new HTMLRewriter()
    .on("head", {
      element(head) {
        head.append(
          `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='${beacon}'></script>`,
          { html: true }
        );
      },
    })
    .transform(response);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (REDIRECT_HOSTS.has(url.hostname)) {
      // Keep the path and query, so marcuswalton.co.uk/work/x lands on marcuswalton.dev/work/x.
      url.protocol = "https:";
      url.hostname = CANONICAL_HOST;
      url.port = "";
      return Response.redirect(url.toString(), 301);
    }

    // Pages showing the vault's numbers change without the file changing, so they're always sent
    // in full (no 304 from the file's ETag) and without an ETag of their own.
    const hasStats = STATS_PAGES.has(url.pathname);
    let assetRequest = request;
    if (hasStats) {
      assetRequest = new Request(request);
      assetRequest.headers.delete("If-None-Match");
      assetRequest.headers.delete("If-Modified-Since");
    }
    let response = await env.ASSETS.fetch(assetRequest);

    const isHtml = (response.headers.get("Content-Type") || "").startsWith("text/html");
    if (isHtml && response.ok && hasStats) {
      const stats = await vaultStats(env);
      if (stats) response = addVaultStats(response, stats);
    }
    if (isHtml && env.CF_ANALYTICS_TOKEN) {
      response = addAnalytics(response, env.CF_ANALYTICS_TOKEN);
    }

    const secured = new Response(response.body, response);
    for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
      secured.headers.set(name, value);
    }
    if (hasStats) secured.headers.delete("ETag");
    const rule = response.ok && CACHE_RULES.find(([pattern]) => pattern.test(url.pathname));
    if (rule) secured.headers.set("Cache-Control", rule[1]);
    return secured;
  },
};
