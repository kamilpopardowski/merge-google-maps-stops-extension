# Merge Google Maps Stops (Chrome extension)

Lightweight Chrome extension that merges multiple Google Maps directions tabs into a single route so you can plan trips with more than 10 stops.

## How it works
- Open multiple Google Maps directions tabs (each must be a `/maps/dir/...` URL).
- Open the popup, review the tab list, select/deselect and reorder tabs.
- Click **Merge selected tabs**. A temp probe tab tries to render the merged route:
  - If it renders, the merged tab opens.
  - If it fails or times out, you’ll see a red in-page banner in Maps; the merged tab is not opened.

## Development
Prereqs: Node 18+, Yarn.

### Install
```bash
yarn install
```

### Run in dev (Vite)
```bash
yarn dev --host
```

### Build
```bash
yarn build
```

## Load the extension in Chrome
1) Run `yarn build` to generate `dist/` (popup bundle, compiled `background.js`, content scripts, and `dist/manifest.json`).
2) Go to `chrome://extensions`, enable Developer mode, and choose **Load unpacked**.
3) Select the `dist/` folder. The popup is `index.html`; the background worker runs from `background.js`.

## Notes / limitations
- Only tabs whose URLs match `https://*.google.{tld}/maps/dir/...` are merged.
- Stops are merged in the order of your open tabs; duplicate stops are not deduped.
- Google Maps enforces waypoint limits; if a merged route can’t render, the probe will fail and a red banner appears in Maps. Use fewer stops or split routes manually.
- Manifest v3; permissions limited to `tabs` and `storage`.
