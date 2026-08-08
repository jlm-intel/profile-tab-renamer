export interface TemplateOptions {
  template: string;
  enableFacebook: boolean;
}

export interface ProfileInfo {
  displayName: string;
  username: string;
  site: "Instagram" | "Facebook" | "Threads";
}

export const DEFAULT_TEMPLATE = "{d} ({u}) @ {s}";
export const DEFAULT_ENABLE_FACEBOOK = false;

// Template variables available to users:
// {d} - displayName, e.g., "Your Kickstarter Sucks"
// {u} - username, e.g., "ykspod"
// {s} - site, e.g., "Instagram"
