// Redirect www.marcuswalton.dev to marcuswalton.dev; serve static files with security headers for everything else.

const SECURITY_HEADERS = {
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self'",
    // Project cards set colors through inline style attributes.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'none'",
    "frame-ancestors 'none'",
  ].join("; "),
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname === "www.marcuswalton.dev") {
      url.hostname = "marcuswalton.dev";
      return Response.redirect(url.toString(), 301);
    }

    const response = await env.ASSETS.fetch(request);
    const secured = new Response(response.body, response);
    for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
      secured.headers.set(name, value);
    }
    return secured;
  },
};
