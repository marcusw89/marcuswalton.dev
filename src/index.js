// Redirect www.marcuswalton.dev to marcuswalton.dev; serve static files with security headers for everything else.
// If CF_ANALYTICS_TOKEN is set in wrangler.jsonc, the Cloudflare Web Analytics beacon is added to every HTML page.

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
    if (url.hostname === "www.marcuswalton.dev") {
      url.hostname = "marcuswalton.dev";
      return Response.redirect(url.toString(), 301);
    }

    let response = await env.ASSETS.fetch(request);

    const isHtml = (response.headers.get("Content-Type") || "").startsWith("text/html");
    if (isHtml && env.CF_ANALYTICS_TOKEN) {
      response = addAnalytics(response, env.CF_ANALYTICS_TOKEN);
    }

    const secured = new Response(response.body, response);
    for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
      secured.headers.set(name, value);
    }
    return secured;
  },
};
