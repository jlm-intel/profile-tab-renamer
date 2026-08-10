// Extension options
export interface ExtensionOptions {
  template: string; // format for tab title, e.g., "{d} ({u}) @ {s}"
  enableFacebook: boolean; // whether to enable title updates on Facebook profile pages
}

// Profile information parsed from the page
export interface ProfileInfo {
  displayName: string;
  username: string;
  site: "Instagram" | "Facebook" | "Threads";
  notificationBadge?: string; // optional notification badge, e.g., "(3)"
}

// Template variables available to users:
// {d} - displayName, e.g., "Your Kickstarter Sucks"
// {u} - username, e.g., "ykspod"
// {s} - site, e.g., "Instagram"

export const DEFAULT_TEMPLATE = "{d} ({u}) @ {s}"; // example: "Your Kickstarter Sucks (ykspod) @ Instagram"
export const DEFAULT_ENABLE_FACEBOOK = false;
