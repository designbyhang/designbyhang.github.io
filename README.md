# designbyhang.github.io

Static portfolio, no build step. Open it through any static server (GitHub Pages, or locally:
`python3 -m http.server 8080` → http://localhost:8080).

## Layout
```
index.html                      Home page
projects/<name>.html            One hand-built page per case study (fmss, citi, usps, vac, studio)
content/projects/fmss/          FMSS media
css/, js/                       Shared styles and scripts (case.css + case.js for case pages)
css/gate.css, js/gate.js        Passcode screen
```

## Add a new project
Copy the closest existing case page in `projects/`, rename it, edit its content, and link it from the
project strip in `index.html`.

## Passcode
`js/gate.js` stores only the SHA-256 hash of the passcode. An unlock lasts for the browser tab
session (sessionStorage). To change the passcode, run
`printf %s 'NEWCODE' | sha256sum` and paste the hash into `HASH` in `js/gate.js`.
Note: this is a deterrent, not real security. Every file, including the images, is still
publicly downloadable from GitHub Pages, and anyone can read a public repo.

## Deploy
Push the folder's contents to the root of a repo named `designbyhang.github.io`, then enable Pages
(Settings → Pages → Deploy from branch → main / root). All paths are relative.

## FMSS scroll story (projects/fmss.html)
A scroll-driven version of the FMSS Figma presentation, rendered by `js/scroll-story.js` from
`content/projects/fmss/scenes.json` and `content/projects/fmss/images/`. Each scene is a 1920×1080
artboard scaled to the viewport. Each scene has `steps` (one per Figma frame) holding
`[x, y, w, h, opacity]` per element key:
- An element in step N+1 that wasn't in step N fades and slides in.
- An element in both steps animates to its new position (smart animate).
- The page crossfades between scenes.

Text elements (`"kind":"text"`) are live HTML, so edit their `text` (and `runs`, if present) directly.
To swap in a real video, see `content/projects/fmss/VIDEO_PLACEHOLDERS.md`.
The JSON was generated from the Figma file. Hand edits are kept unless the export is re-run.

## Home page (project strip)
`index.html` is a horizontal project strip. Covers are Figma 2× exports in `assets/cover-*.webp`.
To publish a project: wrap its `.card.proj` contents in `<a class="hit" href="projects/….html">`, add
`class="live"` to the card, and replace the `.soon` pill with `<span class="go">View case study ↗</span>`.

## FMSS case study (`projects/fmss.html`)
Long-form editorial page (not the scroll story). Edit the HTML directly — every section is a plain
`<section>`. Images are in `content/projects/fmss/case/*.webp`. The archived scroll-story lives
under `archive/` and is not linked.
