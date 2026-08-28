/**
 * Profile Tab Renamer - Customizes tab title formats across social media profile pages.
 * Copyright (C) 2026 Josh Mayfield (ultimateoutsider) <ultimateoutsider@ultimateoutsider.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

// src/content/parsers.ts
import type { ProfileInfo } from "../types";

export async function parseProfileInfo(): Promise<ProfileInfo | null> {
  const url = new URL(window.location.href);
  const hostname = url.hostname;

  // each site has its own parsing logic.
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

  // skip parsing for unsupported sites
  return null;
}

async function parseInstagram(url: URL): Promise<ProfileInfo | null> {
  const pathSegments = url.pathname.split("/").filter(Boolean);
  if (pathSegments.length === 0) return null;

  // Ignore reserved non-profile routes
  const reserved = ["explore", "reels", "direct", "stories", "p", "accounts"];
  if (reserved.includes(pathSegments[0])) return null;

  const username = pathSegments[0];
  let displayName = username;

  // 1. Preserve any leading notification badges (e.g., "(1) ")
  const badgeMatch = document.title.match(/^(\(\d+\+?\))\s*/);
  const badgePrefix = badgeMatch ? `${badgeMatch[1]} ` : "";

  // 2. Try extracting from og:title tag first
  const ogTitle =
    document
      .querySelector('meta[property="og:title"]')
      ?.getAttribute("content") || "";

  if (ogTitle) {
    const tempUserName = extractUsername(ogTitle);
    if (tempUserName && tempUserName == username) {
      // If og:title starts with "(@", there is no custom display name
      if (ogTitle.trim().startsWith("(@") || ogTitle.trim().startsWith("@")) {
        displayName = username;
      } else {
        const match = ogTitle.match(/^(.*?)\s*\(@/);
        if (match && match[1].trim()) {
          displayName = match[1].trim();
        }
      }
    }
  }

  // 4. Fallback: Check header/h1 in the live DOM
  if (displayName === username) {
    // See if current page has a valid display name in the HTML title
    const tempDisplayName = (await getInstagramHtmlTitle()) || "";
    if (!tempDisplayName) {
      const h1Text = document
        .querySelector("header h1, main h1")
        ?.textContent?.trim();
      if (h1Text && h1Text !== username && !h1Text.startsWith("@")) {
        displayName = h1Text;
      }
    } else {
      displayName = tempDisplayName;
    }
  }

  // 3. Fallback: Check document.title if displayName hasn't been extracted yet
  if (displayName === username) {
    const rawTitle = (document.title || "").replace(/^\(\d+\+?\)\s*/, "");
    if (!rawTitle.startsWith("(@") && !rawTitle.startsWith("@")) {
      const titleMatch = rawTitle.match(/^(.*?)\s*\(@/);
      if (titleMatch && titleMatch[1].trim()) {
        displayName = titleMatch[1].trim();
      }
    }
  }

  // 5. Final fallback cleanup
  if (
    !displayName ||
    displayName.startsWith("(@") ||
    displayName.startsWith("@")
  ) {
    displayName = username;
  }

  return {
    displayName,
    username,
    site: "Instagram",
    notificationBadge: badgePrefix,
  };
}

async function parseFacebook(url: URL): Promise<ProfileInfo | null> {
  const pathname = url.pathname.toLowerCase(); // example: /ultimateoutsider/
  const pathSegments = pathname.split("/").filter(Boolean); // example: ['ultimateoutsider']

  // 1. Root page checks (e.g., https://www.facebook.com/)
  if (pathSegments.length === 0) {
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
    return null;
  }

  // Preserve notification badge if present
  const badgeMatch = document.title.match(/^(\(\d+\+?\))\s*/);
  const badgePrefix = badgeMatch ? `${badgeMatch[1]} ` : "";

  // Block any feed parameters in the query string
  if (url.searchParams.has("filter") || url.searchParams.has("sk")) {
    // console.log(
    //   "Facebook feed route detected via query parameters. No profile info to parse.",
    // );
    return null;
  }

  // Handle /profile.php?id=123456 vs /username routes
  let username = pathSegments[0];
  if (username === "profile.php") {
    // console.log(
    //   "Facebook profile.php route detected. Extracting username from query params.",
    // );
    username = url.searchParams.get("id") || "";
    // console.log(`Extracted username from profile.php: ${username}`);
    if (!username) return null;
  }

  const rawTitle = document.title || "";

  // Try getting the fresh display name from the current H1 element
  let displayName = "";
  const h1Element = document.querySelector("main h1, div[role='main'] h1");
  if (h1Element && h1Element.textContent) {
    // console.log(
    //   "Extracted display name from H1 element:",
    //   h1Element.textContent,
    // );
    displayName = h1Element.textContent.trim();
  }

  // Fallback to script tag extraction ONLY if H1 isn't available
  if (!displayName || displayName.toLowerCase() === "facebook") {
    // console.log(
    //   "H1 element not found or invalid. Attempting to extract display name from script tags.",
    // );
    displayName = getFacebookNameFromScripts() || "";
  }

  // Fallback to current document title
  if (!displayName) {
    // console.log(
    //   "Script tag extraction failed. Attempting to extract display name from document.title.",
    // );
    // Strip leading notification badge (e.g., "(3) ") before splitting on delimiters
    const cleanTitle = rawTitle.replace(/^\(\d+\+?\)\s*/, "");
    displayName = cleanTitle.split("|")[0].split("-")[0].trim();
  }

  // If no valid name was found or it matches default branding, fall back to username
  if (!displayName || displayName.toLowerCase() === "facebook") {
    // console.log(
    //   "No valid display name found. Falling back to using username as display name.",
    // );
    displayName = username;
  }

  if (displayName) {
    // console.log(
    //   `Final display name determined: "${displayName}" for username: "${username}"`,
    // );
  }
  if (badgePrefix) {
    // console.log(
    //   `Notification badge detected: "${badgePrefix}" for username: "${username}"`,
    // );
  }

  return {
    displayName,
    username,
    site: "Facebook",
    notificationBadge: badgePrefix,
  };
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

  const displayName = `${rawDisplayName}`;

  return {
    displayName,
    username,
    site: "Threads",
    notificationBadge: badgePrefix,
  };
}

function getFacebookNameFromScripts(): string | null {
  const scripts = Array.from(document.querySelectorAll("script:not([src])"));

  // Search through script tags in reverse order (newest script tags first)
  for (let i = scripts.length - 1; i >= 0; i--) {
    const text = scripts[i].textContent || "";
    if (!text.includes('"profile_owner"')) continue;

    // if text contains the pattern "profile_owner", print 100 characters beginning with that pattern for debugging
    const profileOwnerIndex = text.indexOf('"profile_owner"');
    if (profileOwnerIndex !== -1) {
      // const snippet = text.substring(
      //   profileOwnerIndex,
      //   profileOwnerIndex + 100,
      // );
      // console.log(
      //   "Found 'profile_owner' in script tag. Snippet for debugging:",
      //   snippet,
      // );
    }

    let match = text.match(
      /"profile_owner"\s*:\s*\{[^}]*?"name"\s*:\s*"([^"]+)"/,
    );
    if (!match) {
      match = text.match(
        /"__isProfile"\s*:\s*"User"\s*,[^}]*?"name"\s*:\s*"([^"]+)"/,
      );
    }
    // if (match) {
    //   // print the matched name for debugging
    //   console.log("Extracted display name from script tag:", match[1]);
    // }

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

async function getInstagramHtmlTitle(): Promise<string | null> {
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

function extractUsername(title: string): string | null {
  const match = title.match(/\(@([a-zA-Z0-9._]+)\)/);
  return match ? match[1] : null;
}
