// src/content/index.ts
import { parseProfileInfo } from "./parsers";
import { DEFAULT_TEMPLATE, DEFAULT_ENABLE_FACEBOOK } from "../types";

let currentTemplate = DEFAULT_TEMPLATE;
let isFacebookEnabled = DEFAULT_ENABLE_FACEBOOK;
let isUpdatingTitle = false;

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
const DEBOUNCE_DELAY_MS = 500;

// Load stored settings
chrome.storage.sync.get(["template", "enableFacebook"], (result) => {
  if (result.template !== undefined) {
    currentTemplate = result.template as string;
  }
  if (result.enableFacebook !== undefined) {
    isFacebookEnabled = result.enableFacebook as boolean;
  }
  debounceUpdate();
});

// Listen for settings changes from Options UI
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === "sync") {
    if (changes.template) {
      currentTemplate = changes.template.newValue as string;
    }
    if (changes.enableFacebook) {
      isFacebookEnabled = changes.enableFacebook.newValue as boolean;
    }
    debounceUpdate();
  }
});

function applyTemplate(
  template: string,
  info: Awaited<ReturnType<typeof parseProfileInfo>>,
): string {
  if (!info) return document.title;

  return template
    .replace(/\{displayName\}/g, info.displayName)
    .replace(/\{username\}/g, info.username)
    .replace(/\{site\}/g, info.site);
}

async function updateTabTitle() {
  // Guard clause: skip processing if Facebook is disabled and user is on Facebook
  if (!isFacebookEnabled && window.location.hostname.includes("facebook.com")) {
    return;
  }

  const info = await parseProfileInfo();

  if (info && info.displayName.trim() !== "" && info.username.trim() !== "") {
    const newTitle = applyTemplate(currentTemplate, info);

    if (document.title !== newTitle) {
      isUpdatingTitle = true;
      document.title = newTitle;

      // Ignore our own title mutation
      setTimeout(() => {
        isUpdatingTitle = false;
      }, 300);
    }
  }
}

// Resets and restarts the 500ms countdown timer
function debounceUpdate() {
  if (debounceTimer !== null) {
    clearTimeout(debounceTimer);
  }
  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    updateTabTitle();
  }, DEBOUNCE_DELAY_MS);
}

// 1. Observe the entire document for mutations, deferring parsing until rendering settles
const observer = new MutationObserver(() => {
  if (isUpdatingTitle) return;
  debounceUpdate();
});

observer.observe(document.documentElement, {
  childList: true,
  subtree: true,
});

// 2. Poll for URL shifts to trigger the debounce timer immediately on client-side route changes
let lastUrl = location.href;
setInterval(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    debounceUpdate();
  }
}, 200);
