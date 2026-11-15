// Redirect www.marcuswalton.dev to marcuswalton.dev; serve static files for everything else.
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname === "www.marcuswalton.dev") {
      url.hostname = "marcuswalton.dev";
      return Response.redirect(url.toString(), 301);
    }
    return env.ASSETS.fetch(request);
  },
};
