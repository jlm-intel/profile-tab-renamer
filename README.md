# Profile Tab Renamer

Profile Tab Renamer is a Chrome extension that reformats browser tabs for social media profile pages so they are easier to identify and create more
meaningful bookmark names.

Supported sites:

- Instagram
- Threads
- Facebook (optional/experimental)

## What It Does

When you open a supported profile page, the extension extracts profile data and applies a customizable title template.

Default template:

```text
{d} ({u}) @ {s}
```

_Example title:_ Jane Doe (janedoe93) @ Intstagram

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

### 3. Load in Chrome (local builds)

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

## Notes

- Facebook support is marked experimental in the UI and may behave inconsistently on some client-side navigation flows.
- The extension only modifies titles when it can parse both display name and username from the active route/page.

## Known issues

- On Facebook, tab titles don't always update automatically when you click a user's profile. (Title will update if you perform a page reload.)
- On Facebook, profile URLs that contain the user's account ID instead of their username/handle display the ID in parenthesis instead of the username.
