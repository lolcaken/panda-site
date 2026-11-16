# panda-site

Public download page for CHIMERA. One file, no build step:

```
index.html
```

Inline CSS, inline JS, inline SVG. The page reads `version.json` from the app
repository on load and points both cards at the current release; the static
`href`s fall back to `/releases/latest`, which never goes stale.

Served by GitHub Pages from the root of `main`.