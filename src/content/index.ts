import { parseProfileInfo } from "./parsers";
import { DEFAULT_TEMPLATE, DEFAULT_ENABLE_FACEBOOK } from "../types";

let currentTemplate = DEFAULT_TEMPLATE;
let isFacebookEnabled = DEFAULT_ENABLE_FACEBOOK;
let isUpdatingTitle = false;

// Load stored settings
chrome.storage.sync.get(["template", "enableFacebook"], (result) => {
  if (result.template !== undefined) {
    currentTemplate = result.template as string;
  }
  if (result.enableFacebook !== undefined) {
    isFacebookEnabled = result.enableFacebook as boolean;
  }
  updateTabTitle();
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

      setTimeout(() => {
        isUpdatingTitle = false;
      }, 300);
    }
  }
}

// Observe URL shifts and title changes
let lastUrl = location.href;
setInterval(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    updateTabTitle();
  }
}, 400);

const titleElement = document.querySelector("title");
if (titleElement) {
  const titleObserver = new MutationObserver(() => {
    if (isUpdatingTitle) return;
    updateTabTitle();
  });

  titleObserver.observe(titleElement, {
    childList: true,
    characterData: true,
    subtree: true,
  });
}
