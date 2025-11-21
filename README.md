# Merge Google Maps Stops (Chrome extension)

Lightweight Chrome extension that merges multiple Google Maps directions tabs into a single route so you can plan trips with more than 10 stops.

## How it works
- Open multiple Google Maps directions tabs (each must be a `/maps/dir/...` URL).
- Click the extension icon and press **Merge google maps tabs!** in the popup.
- The extension grabs all Google Maps tabs in the current window, preserves their order, stitches the `/dir/` segments together, and opens one combined tab with every stop.

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
1) Run `yarn build` to generate `dist/` (it copies the popup bundle and `background.js`, and writes `dist/manifest.json`).
2) Go to `chrome://extensions`, enable Developer mode, and choose **Load unpacked**.
3) Select the `dist/` folder. The popup is `index.html`; the background worker runs from `background.js`.

## Notes / limitations
- Only tabs whose URLs match `https://*.google.{tld}/maps/dir/...` are merged.
- Stops are merged in the order of your open tabs; duplicate stops are not deduped.
- Manifest v3; permissions limited to `tabs` for reading open Google Maps URLs.
- When a Google Maps tab is active, the extension icon shows a hot-pink badge `GO!` to prompt merging. Pin the icon in Chrome’s toolbar to see the badge.
