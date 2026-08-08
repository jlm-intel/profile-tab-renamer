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

// src/content/parsers.ts

// src/content/parsers.ts

async function parseFacebook(url: URL): Promise<ProfileInfo | null> {
  const pathname = url.pathname.toLowerCase();
  const pathSegments = pathname.split("/").filter(Boolean);

  // print the pathname and pathSegments for debugging
  console.log("Facebook pathname:", pathname);
  console.log("Facebook pathSegments:", pathSegments);

  // 1. Root page checks (e.g., https://www.facebook.com/ or https://www.facebook.com/?filter=friends)
  if (pathSegments.length === 0) {
    console.log("Facebook root page detected. No profile info to parse.");
    return null;
  }

  // 2. Explicitly block feed routes and top-level Meta pages
  const reserved = [
    "friends",
    "watch",
    "groups",
    "marketplace",
    "gaming",
    "events",
    "messages",
    "notifications",
    "saved",
    "memories",
    "pages",
    "ads",
    "bookmarks",
    "home.php",
  ];

  // If the first segment matches any reserved keyword, return null immediately
  if (reserved.includes(pathSegments[0])) {
    console.log(`Facebook reserved route detected: ${pathSegments[0]}`);
    return null;
  }

  // Block any feed parameters in the query string
  if (url.searchParams.has("filter") || url.searchParams.has("sk")) {
    console.log(
      "Facebook feed route detected via query parameters. No profile info to parse.",
    );
    return null;
  }

  // Handle /profile.php?id=123456 vs /username routes
  let username = pathSegments[0];
  if (username === "profile.php") {
    console.log(
      "Facebook profile.php route detected. Extracting username from query params.",
    );
    username = url.searchParams.get("id") || "";
    console.log(`Extracted username from profile.php: ${username}`);
    if (!username) return null;
  }

  // 3. LOOP/REPEAT PREVENTION: Check if document.title is already formatted by us
  const rawTitle = document.title || "";
  if (rawTitle.includes("@ Facebook") || rawTitle.endsWith("(Facebook)")) {
    console.log(
      "Facebook title already formatted by extension. Skipping further parsing:",
      rawTitle,
    );
    return null;
  }

  // 4. PRIORITY 1: Try getting the fresh display name from the current H1 element
  let displayName = "";
  const h1Element = document.querySelector("main h1, div[role='main'] h1");
  if (h1Element && h1Element.textContent) {
    console.log(
      "Extracted display name from H1 element:",
      h1Element.textContent,
    );
    displayName = h1Element.textContent.trim();
  }

  // 5. PRIORITY 2: Fallback to script tag extraction ONLY if H1 isn't available
  if (!displayName || displayName.toLowerCase() === "facebook") {
    console.log(
      "H1 element not found or invalid. Attempting to extract display name from script tags.",
    );
    displayName = extractNameFromScriptTags(username) || "";
  }

  // 6. PRIORITY 3: Fallback to current document title
  if (!displayName) {
    console.log(
      "Script tag extraction failed. Attempting to extract display name from document.title.",
    );
    displayName = rawTitle.split("|")[0].split("-")[0].trim();
  }

  // If no valid name was found or it matches default branding, fall back to username
  if (!displayName || displayName.toLowerCase() === "facebook") {
    console.log(
      "No valid display name found. Falling back to using username as display name.",
    );
    displayName = username;
  }

  return { displayName, username, site: "Facebook" };
}

async function parseThreads(url: URL): Promise<ProfileInfo | null> {
  const pathSegments = url.pathname.split("/").filter(Boolean);
  if (pathSegments.length === 0 || !pathSegments[0].startsWith("@")) {
    return null;
  }

  // 1. Extract username directly from path
  const username = pathSegments[0].replace("@", "");

  // 2. Preserve notification badge if present
  const badgeMatch = document.title.match(/^(\(\d+\+?\))\s*/);
  const badgePrefix = badgeMatch ? `${badgeMatch[1]} ` : "";

  // 3. Get text from the last H1 element in the DOM
  const h1Elements = document.querySelectorAll("h1");
  let rawDisplayName = "";

  if (h1Elements.length > 0) {
    rawDisplayName =
      h1Elements[h1Elements.length - 1].textContent?.trim() || "";
  }

  // Fallback to username if no H1 text exists
  if (!rawDisplayName) {
    rawDisplayName = username;
  }

  const displayName = `${badgePrefix}${rawDisplayName}`;

  return {
    displayName,
    username,
    site: "Threads",
  };
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

function extractNameFromScriptTags(currentUsername: string): string | null {
  const scripts = Array.from(document.querySelectorAll("script:not([src])"));

  // Search through script tags in reverse order (newest script tags first)
  for (let i = scripts.length - 1; i >= 0; i--) {
    const text = scripts[i].textContent || "";
    if (!text.includes('"profile_owner"')) continue;

    // Verify the script tag is relevant to the current profile route
    if (currentUsername && !text.includes(currentUsername)) {
      // If the script payload doesn't reference the current username/ID, skip it
      // to avoid using stale data from a previously visited profile
      console.log(
        "(NOT) Skipping script tag extraction: does not reference current username:",
        currentUsername,
      );
      //continue;
    }

    // if text contains the pattern "profile_owner", print 100 characters beginning with that pattern for debugging
    const profileOwnerIndex = text.indexOf('"profile_owner"');
    if (profileOwnerIndex !== -1) {
      const snippet = text.substring(
        profileOwnerIndex,
        profileOwnerIndex + 100,
      );
      console.log(
        "Found 'profile_owner' in script tag. Snippet for debugging:",
        snippet,
      );
    }

    let match = text.match(
      /"profile_owner"\s*:\s*\{[^}]*?"name"\s*:\s*"([^"]+)"/,
    );
    if (!match) {
      match = text.match(
        /"__isProfile"\s*:\s*"User"\s*,[^}]*?"name"\s*:\s*"([^"]+)"/,
      );
    }
    if (match) {
      // print the matched name for debugging
      console.log("Extracted display name from script tag:", match[1]);
    } else {
      console.log(
        "No display name found in script tag. Continuing to next script tag.",
      );
    }

    if (match && match[1]) {
      let name = match[1];
      try {
        name = JSON.parse(`"${name}"`);
      } catch {
        // Fall back to raw match if un-escaping fails
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
