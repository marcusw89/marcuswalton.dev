# Portfolio

A personal portfolio site in plain HTML/CSS/JS, with no build step or dependencies.

## Structure

```
src/index.js            Worker: redirects www to the main domain, serves public/
wrangler.jsonc          Cloudflare config (domains, assets)
public/                 Everything that gets published
  index.html            The page
  css/style.css         Styles (light/dark theme via CSS variables)
  js/main.js            Mobile nav, project filters, scroll effects
  assets/               Photo, CV, project images
```

## Run locally

```sh
python3 -m http.server 8000 -d public
```

Then open http://localhost:8000.

## Deploy

Hosted on Cloudflare Workers (static assets) at https://marcuswalton.dev, with www.marcuswalton.dev redirecting there.

Pushing to `main` on GitHub deploys automatically (Cloudflare Workers Builds):

```sh
git add -A && git commit -m "describe the change"
git push
```

Build logs are on the Worker's **Deployments** page in the Cloudflare dashboard. To deploy by hand instead, run `npx wrangler deploy`.

## Making it yours

Notes:

- **CV**: when it changes, export a new PDF to `public/assets/Marcus-Walton-CV.pdf`

Colors and fonts are CSS variables at the top of `public/css/style.css`.
