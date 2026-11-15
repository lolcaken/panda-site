# PANDA site

Static download page for the PANDA release channel. No build step, no
dependencies: one HTML file, one stylesheet, one script, one icon.

```
index.html
style.css
site.js
assets/mark.svg
```

## Preview

```powershell
python -m http.server 8127 --bind 127.0.0.1
# http://127.0.0.1:8127
```

Opening `index.html` from disk works too, but the manifest fetch is blocked by
`file://` CORS rules, so the numbers fall back to the ones baked into the markup.

## Keeping it current

`site.js` reads `version.json` from the app repository, newest source first:

1. `api.github.com/.../contents/version.json?ref=main` — authoritative, CORS enabled
2. `cdn.jsdelivr.net/gh/...@main/version.json` — fallback

If both fail, the baked-in version, sizes and checksum stay on screen. The
download buttons are rewritten from the manifest on load; the static `href`s
point at `/releases/latest`, which never goes stale.

## Design

- Black canvas, white ink, hairline rules. No second accent — emphasis comes
  from weight and space, not colour.
- Type: Outfit for headings, Work Sans for prose, system mono for numbers and
  labels. Both loaded from Google Fonts with system fallbacks.
- Motion is limited to hover and colour transitions, and collapses under
  `prefers-reduced-motion`.
- Icons are inline SVG paths, never emoji.

## Deploying

This repo is served directly by GitHub Pages from the root of `main`. Push to
`main` and the site rebuilds; nothing else to run.
