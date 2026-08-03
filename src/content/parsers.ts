import type { ProfileInfo } from "../types";

export function parseProfileInfo(): ProfileInfo | null {
  const url = new URL(window.location.href);
  const hostname = url.hostname;

  if (hostname.includes("instagram.com")) {
    return parseInstagram(url);
  } else if (hostname.includes("facebook.com")) {
    return parseFacebook(url);
  } else if (
    hostname.includes("threads.net") ||
    hostname.includes("threads.com")
  ) {
    return parseThreads(url);
  }

  return null;
}

function parseInstagram(url: URL): ProfileInfo | null {
  // IG Profile paths are generally /username/
  const pathSegments = url.pathname.split("/").filter(Boolean);
  if (pathSegments.length === 0) return null;

  // Ignore non-profile routes
  const reserved = ["explore", "reels", "direct", "stories", "p"];
  if (reserved.includes(pathSegments[0])) return null;

  const username = pathSegments[0];

  // Instagram meta titles usually take the form: "Display Name (@username) • Instagram..."
  const ogTitle =
    document
      .querySelector('meta[property="og:title"]')
      ?.getAttribute("content") || "";
  let displayName = username;

  if (ogTitle) {
    const match = ogTitle.match(/^(.*?)\s*\(@/);
    if (match && match[1]) {
      displayName = match[1].trim();
    }
  }

  return { displayName, username, site: "Instagram" };
}

function parseFacebook(url: URL): ProfileInfo | null {
  const pathSegments = url.pathname.split("/").filter(Boolean);
  if (pathSegments.length === 0) return null;

  const reserved = [
    "watch",
    "groups",
    "marketplace",
    "gaming",
    "events",
    "messages",
  ];
  if (reserved.includes(pathSegments[0])) return null;

  // Facebook meta titles usually say "Display Name | Facebook" or "Display Name"
  const metaTitle = document.title || "";
  const displayName =
    metaTitle.split("|")[0].split("-")[0].trim() || pathSegments[0];
  const username = pathSegments[0];

  return { displayName, username, site: "Facebook" };
}

function parseThreads(url: URL): ProfileInfo | null {
  // Threads profile URLs follow /@username
  const pathSegments = url.pathname.split("/").filter(Boolean);
  if (pathSegments.length === 0 || !pathSegments[0].startsWith("@"))
    return null;

  const username = pathSegments[0].replace("@", "");

  // Extract display name from document title or meta tag
  const metaTitle = document.title || "";
  let displayName = username;

  // Threads title format: "Display Name (@username) on Threads"
  const match = metaTitle.match(/^(.*?)\s*\(@/);
  if (match && match[1]) {
    displayName = match[1].trim();
  }

  return { displayName, username, site: "Threads" };
}
