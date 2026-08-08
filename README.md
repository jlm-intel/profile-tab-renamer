# Profile Tab Renamer

Profile Tab Renamer is a Chrome extension that rewrites browser tab titles on profile pages so they are easier to scan and switch between.

Supported sites:

- Instagram
- Threads
- Facebook (optional/experimental)

## What It Does

When you open a supported profile route, the extension extracts profile data and applies a customizable title template.

Default template:

```text
{d} ({u}) @ {s}
```

Available template variables:

- `{d}`: Profile **d**isplay name (for example, `Jane Doe`)
- `{u}`: Profile **u**sername handle or identifier (for example, `janedoe93`)
- `{s}`: **S**ite name (`Instagram`, `Facebook`, or `Threads`)

## Extension Settings

The extension popup includes:

- `Title Template`: Custom text format using the variables above
- `Enable on Facebook`: Toggle for Facebook support

Settings are persisted with `chrome.storage.sync`.

## Tech Stack

- TypeScript
- React (options UI)
- Vite
- CRXJS Vite plugin (`@crxjs/vite-plugin`) for Chrome extension bundling

## Project Structure

- `manifest.json`: Extension manifest (MV3), permissions, host matches, popup, and content script registration
- `src/content/index.ts`: Main content script, settings sync, mutation observation, and debounced title updates
- `src/content/parsers.ts`: Site-specific profile parsing for Instagram, Facebook, and Threads
- `src/options/OptionsApp.tsx`: Popup UI for template and Facebook toggle settings
- `src/types.ts`: Shared types and default option values

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Build the extension

```bash
npm run build
```

This outputs the unpacked extension to `dist/`.

### 3. Load in Chrome

1. Open `chrome://extensions`
2. Enable Developer mode
3. Click Load unpacked
4. Select the `dist/` folder

## Development

Run Vite in dev mode:

```bash
npm run dev
```

Useful scripts:

- `npm run build`: Type-check and production build
- `npm run lint`: Run ESLint
- `npm run preview`: Preview the built output

## Notes

- Facebook support is marked experimental in the UI and may behave inconsistently on some client-side navigation flows.
- The extension only modifies titles when it can parse both display name and username from the active route/page.
