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

// src/types.ts

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
  notificationBadge?: string | null; // optional notification badge, e.g., "(3)"
}

// Template variables available to users:
// {d} - displayName, e.g., "Your Kickstarter Sucks"
// {u} - username, e.g., "ykspod"
// {s} - site, e.g., "Instagram"

export const DEFAULT_TEMPLATE = "{d} (@{u}) - {s}"; // example: "Your Kickstarter Sucks (@ykspod) - Instagram"
export const DEFAULT_ENABLE_FACEBOOK = false;
