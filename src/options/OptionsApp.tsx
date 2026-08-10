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

// src/options/OptionsApp.tsx
import React, { useEffect, useState } from "react";
import { DEFAULT_TEMPLATE, DEFAULT_ENABLE_FACEBOOK } from "../types";

const MOCK_PROFILE = {
  displayName: "Chris Jones",
  username: "chrisjones95",
  site: "Instagram",
};

const MAX_TEMPLATE_LENGTH = 150;

function sanitizeString(input: string): string {
  // Remove control characters, newlines, and carriage returns
  return input.replace(/[\r\n\t\0]/g, "");
}

function formatPreview(template: string): string {
  return template
    .replace(/\{d\}|\{displayName\}/g, MOCK_PROFILE.displayName)
    .replace(/\{u\}|\{username\}/g, MOCK_PROFILE.username)
    .replace(/\{s\}|\{site\}/g, MOCK_PROFILE.site);
}

export const OptionsApp: React.FC = () => {
  const [template, setTemplate] = useState<string>(DEFAULT_TEMPLATE);
  const [enableFacebook, setEnableFacebook] = useState<boolean>(
    DEFAULT_ENABLE_FACEBOOK,
  );
  const [savedStatus, setSavedStatus] = useState<boolean>(false);

  useEffect(() => {
    chrome.storage.sync.get(["template", "enableFacebook"], (result) => {
      if (typeof result.template === "string") {
        setTemplate(result.template);
      }
      if (typeof result.enableFacebook === "boolean") {
        setEnableFacebook(result.enableFacebook);
      }
    });
  }, []);

  const handleSave = () => {
    const sanitizedTemplate = sanitizeString(template).slice(
      0,
      MAX_TEMPLATE_LENGTH,
    );
    chrome.storage.sync.set(
      { template: sanitizedTemplate, enableFacebook },
      () => {
        setSavedStatus(true);
        setTimeout(() => setSavedStatus(false), 2000);
      },
    );
  };

  const handleResetTemplate = () => {
    setTemplate(DEFAULT_TEMPLATE);
  };

  return (
    <div
      style={{
        width: "100%",
        boxSizing: "border-box",
        backgroundColor: "#ecf7bd",
        border: "2px solid #7d8364",
        padding: "8px",
      }}
    >
      <h3 style={{ margin: "0 0 4px 0", fontSize: "18px" }}>
        Profile Tab Renamer
      </h3>
      <p style={{ color: "#3f3f46", fontSize: "14px", margin: "0 0 16px 0" }}>
        Edit the Title Template to change how profile tab titles are named. You
        can use the following variables in your template:
        <ul
          style={{
            margin: "4px 0 0 24px",
            padding: "0",
            listStyleType: "disc",
          }}
        >
          <li>
            <code>{"{d}"}</code> - displayName (ex: "Chris Jones")
          </li>
          <li>
            <code>{"{u}"}</code> - username (ex: "chrisjones95")
          </li>
          <li>
            <code>{"{s}"}</code> - site (ex: "Instagram")
          </li>
        </ul>
      </p>

      <div style={{ marginBottom: "16px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "6px",
          }}
        >
          <label style={{ fontWeight: 600, fontSize: "16px" }}>
            Title Template:
          </label>
          <button
            type="button"
            onClick={handleResetTemplate}
            style={{
              background: "none",
              border: "none",
              color: "#0d6efd",
              cursor: "pointer",
              fontSize: "14px",
              padding: 0,
              textDecoration: "underline",
            }}
          >
            Restore Default Template
          </button>
        </div>

        <input
          type="text"
          value={template}
          onChange={(e) =>
            setTemplate(
              sanitizeString(e.target.value).slice(0, MAX_TEMPLATE_LENGTH),
            )
          }
          style={{
            width: "100%",
            padding: "8px",
            fontSize: "14px",
            borderRadius: "4px",
            border: "1px solid #ced4da",
            boxSizing: "border-box",
          }}
        />

        {/* Live Preview Box */}
        <div
          style={{
            marginTop: "8px",
            padding: "8px 10px",
            backgroundColor: "#f8f9fa",
            border: "1px solid #e9ecef",
            borderRadius: "4px",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          }}
        >
          <span
            style={{
              fontWeight: 700,
              color: "#6c757d",
              textTransform: "uppercase",
              fontSize: "12px",
              letterSpacing: "0.5px",
            }}
          >
            Preview:
          </span>
          <span
            style={{
              color: "#212529",
              fontFamily: "monospace",
              fontSize: "14px",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {formatPreview(template)}
          </span>
        </div>
      </div>

      <div
        style={{
          padding: "12px 0",
          borderTop: "1px solid #7d8364",
          borderBottom: "1px solid #7d8364",
          marginBottom: "16px",
        }}
      >
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "16px",
          }}
        >
          <input
            type="checkbox"
            checked={enableFacebook}
            onChange={(e) => setEnableFacebook(e.target.checked)}
            style={{ width: "16px", height: "16px", cursor: "pointer" }}
          />
          Enable on Facebook
        </label>
        <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#3f3f46" }}>
          Experimental. You might need to reload profile pages on Facebook in
          order for title changes to take effect. Some profiles may show user ID
          number instead of username.
        </p>
      </div>

      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <button
          onClick={handleSave}
          style={{
            backgroundColor: "#0d6efd",
            color: "#fff",
            border: "none",
            padding: "8px 14px",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "14px",
          }}
        >
          Save Settings
        </button>
        {savedStatus && (
          <span style={{ color: "#198754", fontWeight: 600, fontSize: "12px" }}>
            Saved!
          </span>
        )}
      </div>
    </div>
  );
};
