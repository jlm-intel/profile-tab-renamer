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
    .replace(/\{d\}/g, info.displayName)
    .replace(/\{u\}/g, info.username)
    .replace(/\{s\}/g, info.site);
}

async function updateTabTitle() {
  // Skip processing if Facebook is disabled and user is on Facebook
  if (!isFacebookEnabled && window.location.hostname.includes("facebook.com")) {
    return;
  }

  // Prevent multiple updates from overlapping while we are parsing and updating the title
  isUpdatingTitle = true;
  const info = await parseProfileInfo();

  // If info is NULL, it means we couldn't parse the profile info and shouldn't update the title.
  // If info is valid, we check if displayName and username are non-empty before applying the template.
  if (info && info.displayName.trim() !== "" && info.username.trim() !== "") {
    let newTitle = applyTemplate(currentTemplate, info);
    if (info.notificationBadge) {
      newTitle = `${info.notificationBadge}${newTitle}`;
    }

    // Only update the title if it has changed to avoid unnecessary reflows
    if (!document.title.includes(newTitle)) {
      document.title = newTitle;
    }
  }
  isUpdatingTitle = false;
}

// Resets and restarts the 500ms countdown timer
function debounceUpdate() {
  if (debounceTimer !== null) {
    // always reset the timer if a new mutation is observed before the previous timer has completed. we do this because Meta
    // sites often have multiple mutations in quick succession when rendering profile pages, and we want to wait until the
    // rendering has settled before parsing the profile info and updating the title.
    clearTimeout(debounceTimer);
  }

  // once the timer completes, call updateTabTitle() to parse the profile info and update the title. this ensures that we
  // don't update the title too frequently, which could cause performance issues or flickering.
  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    updateTabTitle();
  }, DEBOUNCE_DELAY_MS);
}

// Observe the entire document for mutations, deferring parsing until rendering settles
const observer = new MutationObserver(() => {
  // If we're already in the process of updating the title, we don't want to trigger another update. This prevents
  // multiple overlapping updates that could cause flickering or performance issues.
  if (isUpdatingTitle) return;
  debounceUpdate();
});

observer.observe(document.documentElement, {
  childList: true,
  subtree: true,
});

// Poll for URL shifts to trigger the debounce timer immediately on client-side route changes
let lastUrl = location.href;
setInterval(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    debounceUpdate();
  }
}, 200);
