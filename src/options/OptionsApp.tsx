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

  return (
    <div style={{ width: "100%", boxSizing: "border-box" }}>
      <h3 style={{ margin: "0 0 4px 0", fontSize: "16px" }}>
        Profile Tab Renamer
      </h3>
      <p style={{ color: "#6c757d", fontSize: "12px", margin: "0 0 16px 0" }}>
        Edit the Title Template to change how profile tab titles are named. You
        can use the following variables in your template:
        <ul
          style={{
            margin: "4px 0 0 16px",
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
        <label
          style={{
            fontWeight: 600,
            display: "block",
            marginBottom: "6px",
            fontSize: "13px",
          }}
        >
          Title Template:
        </label>
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
            fontSize: "13px",
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
            fontSize: "12px",
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
              fontSize: "10px",
              letterSpacing: "0.5px",
            }}
          >
            Preview:
          </span>
          <span
            style={{
              color: "#212529",
              fontFamily: "monospace",
              fontSize: "11px",
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
          borderTop: "1px solid #eee",
          borderBottom: "1px solid #eee",
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
            fontSize: "13px",
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
        <p
          style={{ margin: "4px 0 0 24px", fontSize: "11px", color: "#6c757d" }}
        >
          Experimental. You might need to reload profile pages on Facebook in
          order for title changes to take effect. Some profile names may not be
          parsed correctly.
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
            fontSize: "13px",
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
