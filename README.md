# Portfolio

A personal portfolio site in plain HTML/CSS/JS, with no build step or dependencies.

## Structure

```
src/index.js                  Worker: redirects www and .co.uk to the main domain, adds security headers and analytics, serves public/
wrangler.jsonc                Cloudflare config (domains, assets, analytics token)
public/                       Everything that gets published
  index.html                  The page
  work/memset-migration.html  Case study (served at /work/memset-migration)
  work/linux-vault.html       How the Linux Command Vault is built (served at /work/linux-vault)
  404.html                    Not-found page
  css/style.css               Styles (light/dark follows the system setting, via CSS variables)
  js/main.js                  Mobile nav, email link, scroll effects
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

Hosted on Cloudflare Workers (static assets) at https://marcuswalton.dev, with www.marcuswalton.dev, marcuswalton.co.uk and www.marcuswalton.co.uk redirecting there (paths are kept).

Pushing to `main` on GitHub deploys automatically (Cloudflare Workers Builds):

```sh
git add -A && git commit -m "describe the change"
git push
```

Build logs are on the Worker's **Deployments** page in the Cloudflare dashboard. To deploy by hand instead, run `npx wrangler deploy`.

## Editing

- **CV**: when it changes, export a new PDF to `public/assets/Marcus-Walton-CV.pdf`.
- **Colors and fonts**: CSS variables at the top of `public/css/style.css`.
- **Security headers**: the Content-Security-Policy in `src/index.js` only allows files from this site plus Cloudflare Web Analytics. If you add anything from another domain (analytics, embeds, external images), add that domain to the policy.
- **Email address**: kept out of the HTML so scrapers can't read it. `js/main.js` builds the link from `data-user` and `data-domain` on the contact button.
- **Vault numbers**: elements with `data-vault-stat="commands|playbooks|guides"` (on the homepage and `/work/linux-vault`) are filled in by the Worker from `linux.marcuswalton.dev/stats.json`, read through the `VAULT` service binding to the `linux-vault` Worker and rounded down to the nearest ten ("450+"). The numbers written in the HTML are the fallback, so update them now and then. A new page that uses them must be added to `STATS_PAGES` in `src/index.js`. In `wrangler dev` the binding only connects if the vault's `wrangler dev` is running too (use a different `--port` and `--inspector-port`).
- **Caching**: fonts are cached for a year as immutable, and the icons and `og.png` for a week (`CACHE_RULES` in `src/index.js`). If you replace a font, give it a new file name. Everything else revalidates on every visit.
- **Sitemap**: update `<lastmod>` in `public/sitemap.xml` when a page changes, and add new pages.
- **Analytics**: Cloudflare Web Analytics, which is cookie-free. Put the site token in `CF_ANALYTICS_TOKEN` in `wrangler.jsonc`; leave it empty to turn analytics off.
