# Monsoon Atlas

Three small generative artworks that keep moving. Each frame comes from a **seed**, so every image you see can be made again exactly.

| | Piece | What it is |
|---|---|---|
| I | **Tide** | Thousands of particles riding an invisible current (a Perlin flow field). Your cursor bends the current. Hold the mouse button to reverse it. |
| II | **Loom** | Warp and weft threads woven over and under, breathing with noise. Your cursor pushes the cloth apart. Hold the button to pull it in. |
| III | **Monsoon** | Rain falling onto dark water. Every drop leaves ripples that cross each other. Click to drop your own stone. |

Each piece comes with a three-line verse. The four colour palettes are drawn from Indian everyday life: *spice market, sea glass, dusk saree, paddy field*.

## Controls

| Input | Action |
|---|---|
| Move / touch | Interact with the piece |
| Click / hold | Reverse the force (Tide, Loom) or drop a stone (Monsoon) |
| `1` `2` `3` | Switch piece |
| `R` | New seed |
| `S` | Save a PNG |
| `Space` | Pause |

**Shareable seeds:** the URL updates to `#piece/seed` (for example, `#loom/482910337`). Send the link and the other person sees the same artwork.

## Run it

There's no build step and nothing to install. Open `index.html` in a browser, or:

```bash
npx serve .
```

## Deploy

- **Vercel:** import the repo and keep the framework set to *Other*. No settings needed.
- **GitHub Pages:** Settings → Pages → deploy from `main` / root.

## How it works

- `art.js`: a seeded PRNG (mulberry32), a hand-written 2D Perlin noise function, and three piece modules that each have `init()` and `frame()`.
- No libraries, frameworks or images. Only Canvas 2D and about 200 lines of JavaScript.

---
*Built by Microsoft Copilot as a creativity showcase for [@TJ-zip](https://<scrubbed-url-domain>/TJ-zip).*
