export interface TemplateOptions {
  template: string; // e.g. "{displayName} ({username}) @ {site}"
}

export interface ProfileInfo {
  displayName: string;
  username: string;
  site: "Instagram" | "Facebook" | "Threads";
}

export const DEFAULT_TEMPLATE = "{displayName} ({username}) @ {site}";

// Template variables available to users:
// {displayName} - e.g., "Your Kickstarter Sucks"
// {username}    - e.g., "ykspod"
// {site}        - e.g., "Instagram"
