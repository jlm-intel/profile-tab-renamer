// src/content/index.ts
import { parseProfileInfo } from "./parsers";
import { DEFAULT_TEMPLATE } from "../types";

console.log("Content script loaded!");

let currentTemplate = DEFAULT_TEMPLATE;
let isUpdatingTitle = false; // Flag to prevent observer loops

// Load stored template setting
chrome.storage.sync.get(["template"], (result) => {
  if (result.template) {
    currentTemplate = result.template as string;
  }
  updateTabTitle();
});

// Watch for settings changes saved from Options UI
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === "sync" && changes.template) {
    currentTemplate = changes.template.newValue as string;
    updateTabTitle();
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
  const info = await parseProfileInfo();

  // Validate that info exists AND that essential fields are not empty
  if (info && info.displayName.trim() !== "" && info.username.trim() !== "") {
    const newTitle = applyTemplate(currentTemplate, info);

    if (document.title !== newTitle) {
      isUpdatingTitle = true;
      document.title = newTitle;

      // Brief pause to ignore our own title change in MutationObserver
      setTimeout(() => {
        isUpdatingTitle = false;
      }, 100);
    }
  }
}
// Observe URL shifts and external DOM title rewrites
let lastUrl = location.href;
const observer = new MutationObserver(() => {
  if (isUpdatingTitle) return;

  if (location.href !== lastUrl) {
    lastUrl = location.href;
    // SPAs take a moment to load profile metadata into the DOM/Title
    setTimeout(updateTabTitle, 600);
    setTimeout(updateTabTitle, 1500); // Secondary fallback for slower connections
  }
});

observer.observe(document.querySelector("head") || document.documentElement, {
  subtree: true,
  childList: true,
});
