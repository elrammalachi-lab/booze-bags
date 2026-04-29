# cocktail-orders

## Project type
Static single-file PWA — one `index.html` file, no build step, no package.json.
Deployed via GitHub Pages at: https://booze-bags.github.io/booze-bags/

## Dev server
The preview MCP tools do not work reliably for this project.
**Do NOT attempt `preview_start` or the verification workflow.**
Verification is done by pushing to GitHub and checking the live site.

## Pushing changes
Push to GitHub using credentials stored in local git config (not committed here).

## Key facts
- All code is in `index.html` — React 18 via CDN, Babel, Firebase RTDB
- Images stored as base64 in Firebase RTDB (not Firebase Storage)
- `ML_PER_BAG = 20` (ml per bag for liters calculation)
- JSZip 3.10.1 and SheetJS xlsx-0.20.3 already included via CDN
