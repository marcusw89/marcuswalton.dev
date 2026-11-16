# Portfolio

A personal portfolio site in plain HTML/CSS/JS, with no build step or dependencies.

## Structure

```
src/index.js                  Worker: redirects www to the main domain, adds security headers, serves public/
wrangler.jsonc                Cloudflare config (domains, assets)
public/                       Everything that gets published
  index.html                  The page
  work/memset-migration.html  Case study (served at /work/memset-migration)
  404.html                    Not-found page
  css/style.css               Styles (light/dark follows the system setting, via CSS variables)
  js/main.js                  Mobile nav, project filters, scroll effects
  fonts/                      Self-hosted Inter and Fraunces (Latin subset, woff2)
  assets/                     CV, project images
  robots.txt, sitemap.xml     For search engines; add new pages to the sitemap
```

## Run locally

```sh
npx wrangler dev
```

Then open http://localhost:8787. This runs the Worker too, so the 404 page, clean URLs and security headers behave as they do in production.

For a quick look at the static files only: `python3 -m http.server 8000 -d public`.

## Deploy

Hosted on Cloudflare Workers (static assets) at https://marcuswalton.dev, with www.marcuswalton.dev redirecting there.

Pushing to `main` on GitHub deploys automatically (Cloudflare Workers Builds):

```sh
git add -A && git commit -m "describe the change"
git push
```

Build logs are on the Worker's **Deployments** page in the Cloudflare dashboard. To deploy by hand instead, run `npx wrangler deploy`.

## Editing

- **CV**: when it changes, export a new PDF to `public/assets/Marcus-Walton-CV.pdf`.
- **Colors and fonts**: CSS variables at the top of `public/css/style.css`.
- **Security headers**: the Content-Security-Policy in `src/index.js` only allows files from this site. If you add anything from another domain (analytics, embeds, external images), add that domain to the policy.
