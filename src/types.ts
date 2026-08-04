export interface TemplateOptions {
  template: string;
  enableFacebook: boolean;
}

export interface ProfileInfo {
  displayName: string;
  username: string;
  site: "Instagram" | "Facebook" | "Threads";
}

export const DEFAULT_TEMPLATE = "{displayName} ({username}) @ {site}";
export const DEFAULT_ENABLE_FACEBOOK = false;

// Template variables available to users:
// {displayName} - e.g., "Your Kickstarter Sucks"
// {username}    - e.g., "ykspod"
// {site}        - e.g., "Instagram"
