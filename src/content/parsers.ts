// src/content/parsers.ts
import type { ProfileInfo } from "../types";

export async function parseProfileInfo(): Promise<ProfileInfo | null> {
  const url = new URL(window.location.href);
  const hostname = url.hostname;

  if (hostname.includes("instagram.com")) {
    return await parseInstagram(url);
  } else if (hostname.includes("facebook.com")) {
    return await parseFacebook(url);
  } else if (
    hostname.includes("threads.net") ||
    hostname.includes("threads.com")
  ) {
    return await parseThreads(url);
  }

  return null;
}

async function parseInstagram(url: URL): Promise<ProfileInfo | null> {
  const pathSegments = url.pathname.split("/").filter(Boolean);
  if (pathSegments.length === 0) return null;

  const reserved = ["explore", "reels", "direct", "stories", "p", "accounts"];
  if (reserved.includes(pathSegments[0])) return null;

  const username = pathSegments[0];
  let displayName = username;

  // Try extracting from og:title tag first
  const ogTitle =
    document
      .querySelector('meta[property="og:title"]')
      ?.getAttribute("content") || "";

  if (ogTitle && ogTitle.includes("(@")) {
    const match = ogTitle.match(/^(.*?)\s*\(@/);
    if (match && match[1]) {
      displayName = match[1].trim();
    }
  } else {
    // Fallback: Check document title or primary heading
    const titleMatch = document.title.match(/^(.*?)\s*\(@/);
    if (titleMatch && titleMatch[1]) {
      displayName = titleMatch[1].trim();
    } else {
      displayName = (await getRawServerTitle()) || "";
      // Fallback: Try header elements inside the main profile layout
      if (!displayName) {
        const h1Text = document
          .querySelector("header h1, main h1")
          ?.textContent?.trim();
        if (h1Text && h1Text !== username) {
          displayName = h1Text;
        }
      }
    }
  }

  return { displayName: displayName || username, username, site: "Instagram" };
}

async function parseFacebook(url: URL): Promise<ProfileInfo | null> {
  const pathSegments = url.pathname.split("/").filter(Boolean);
  if (pathSegments.length === 0) return null;

  const reserved = [
    "watch",
    "groups",
    "marketplace",
    "gaming",
    "events",
    "messages",
    "friends",
    "bookmark",
  ];
  if (reserved.includes(pathSegments[0])) return null;

  let username = pathSegments[0];
  if (username === "profile.php") {
    username = url.searchParams.get("id") || "profile";
  }

  let displayName = extractNameFromScriptTags() || "";

  if (!displayName) {
    const metaTitle = document.title || "";
    displayName = metaTitle.split("|")[0].split("-")[0].trim() || username;
  }

  return { displayName, username, site: "Facebook" };
}

async function parseThreads(url: URL): Promise<ProfileInfo | null> {
  const pathSegments = url.pathname.split("/").filter(Boolean);
  if (pathSegments.length === 0 || !pathSegments[0].startsWith("@"))
    return null;

  const fallbackUsername = pathSegments[0].replace("@", "");

  // 1. Decode any HTML entities present in document.title
  const rawTitle = document.title || "";
  const doc = new DOMParser().parseFromString(rawTitle, "text/html");
  const decodedTitle = doc.documentElement.textContent || rawTitle;

  // 2. LOOP PREVENTION: If the title already ends with "@ Threads" or contains our template format,
  // it means we've already renamed it. Return null so updateTabTitle leaves it alone!
  if (
    decodedTitle.includes("@ Threads") ||
    decodedTitle.endsWith("(Threads)")
  ) {
    return null;
  }

  // 3. Pattern A: Custom display name present in Threads' native title format
  // Matches: "Trischa Marie (@that1lilredhead) • Threads, Say more"
  const customNameMatch = decodedTitle.match(/^(.*?)\s*\(@([^)]+)\)/);

  if (customNameMatch) {
    const displayName = customNameMatch[1].trim();
    const username = customNameMatch[2].trim();

    if (displayName && username) {
      return {
        displayName,
        username,
        site: "Threads",
      };
    }
  }

  // 4. Pattern B: No custom display name set (starts directly with @username)
  // Matches: "@dolphin.1844328 • Threads, Say more"
  const defaultUserMatch = decodedTitle.match(/^@([^\s•]+)/);

  if (defaultUserMatch) {
    const username = defaultUserMatch[1].trim();
    if (username) {
      return {
        displayName: username,
        username,
        site: "Threads",
      };
    }
  }

  // 5. Fallback: If document.title was reset to "Threads" or similar default SPA title,
  // fallback to using the username parsed directly from the URL path.
  // BUT only do this if document.title is literally just "Threads" or empty,
  // avoiding overwriting existing valid states.
  if (decodedTitle === "Threads" || decodedTitle === "") {
    return {
      displayName: fallbackUsername,
      username: fallbackUsername,
      site: "Threads",
    };
  }

  return null;
}

/*
function extractFullNameFromScriptTags(): string | null {
  // Query scripts that are set to application/json or similar data scripts
  const scripts = Array.from(
    document.querySelectorAll('script[type*="json"], script:not([src])'),
  );

  for (const script of scripts) {
    const text = script.textContent || "";
    if (!text.includes('"full_name"')) continue;

    // Match "full_name":"Value"
    const match = text.match(/"full_name"\s*:\s*"([^"]+)"/);

    if (match && match[1]) {
      let name = match[1];

      try {
        // Unescape unicode characters (e.g., \u0020)
        name = JSON.parse(`"${name}"`);
      } catch {
        // Fall back to raw matched string if JSON parsing fails
      }

      return name.trim();
    }
  }

  return null;
}
*/

function extractNameFromScriptTags(): string | null {
  const scripts = Array.from(document.querySelectorAll("script:not([src])"));

  for (const script of scripts) {
    const text = script.textContent || "";
    if (!text.includes('"profile_owner"')) continue;

    const match = text.match(
      /"profile_owner"\s*:\s*\{[^}]*?"name"\s*:\s*"([^"]+)"/,
    );

    if (match && match[1]) {
      let name = match[1];

      try {
        name = JSON.parse(`"${name}"`);
      } catch {
        // Fall back to raw match
      }

      return name.trim();
    }
  }

  return null;
}

async function getRawServerTitle(): Promise<string | null> {
  try {
    const response = await fetch(window.location.href, {
      cache: "force-cache",
    });
    const htmlText = await response.text();

    const titleMatch = htmlText.match(/<title[^>]*>(.*?)<\/title>/i);
    if (!titleMatch || !titleMatch[1]) return null;

    const rawTitle = titleMatch[1];

    const doc = new DOMParser().parseFromString(rawTitle, "text/html");
    const decodedTitle = doc.documentElement.textContent || rawTitle;

    const nameMatch = decodedTitle.match(/^(.*?)\s*\(@/);
    if (nameMatch && nameMatch[1]) {
      return nameMatch[1].trim();
    }

    return decodedTitle.split("•")[0].trim();
  } catch (error) {
    console.error("Failed to fetch raw server HTML:", error);
    return null;
  }
}
