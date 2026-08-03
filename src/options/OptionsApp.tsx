import React, { useEffect, useState } from "react";
import { DEFAULT_TEMPLATE } from "../types";

export const OptionsApp: React.FC = () => {
  const [template, setTemplate] = useState<string>(DEFAULT_TEMPLATE);
  const [savedStatus, setSavedStatus] = useState<boolean>(false);

  useEffect(() => {
    chrome.storage.sync.get(["template"], (result) => {
      if (result.template) {
        setTemplate(result.template as string);
      }
    });
  }, []);

  const handleSave = () => {
    chrome.storage.sync.set({ template }, () => {
      setSavedStatus(true);
      setTimeout(() => setSavedStatus(false), 2500);
    });
  };

  const previewData = {
    displayName: "Your Kickstarter Sucks",
    username: "ykspod",
    site: "Instagram",
  };

  const renderPreview = (pattern: string) => {
    return pattern
      .replace(/\{displayName\}/g, previewData.displayName)
      .replace(/\{username\}/g, previewData.username)
      .replace(/\{site\}/g, previewData.site);
  };

  return (
    <div
      style={{
        maxWidth: "560px",
        margin: "0 auto",
        background: "#fff",
        padding: "24px",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      }}
    >
      <h2>Meta Profile Tab Renamer Settings</h2>
      <p style={{ color: "#6c757d" }}>
        Customize how tab titles are formatted when navigating to profile pages.
      </p>

      <div style={{ margin: "20px 0" }}>
        <label
          style={{ fontWeight: 600, display: "block", marginBottom: "8px" }}
        >
          Title Template:
        </label>
        <input
          type="text"
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            fontSize: "14px",
            borderRadius: "4px",
            border: "1px solid #ced4da",
            boxSizing: "border-box",
          }}
        />
      </div>

      <div
        style={{
          background: "#f1f3f5",
          padding: "12px",
          borderRadius: "4px",
          marginBottom: "20px",
        }}
      >
        <strong>Available Placeholders:</strong>
        <ul
          style={{ margin: "8px 0 0 0", paddingLeft: "20px", fontSize: "13px" }}
        >
          <code>{"{displayName}"}</code> — Profile display name
          <br />
          <code>{"{username}"}</code> — Profile handle / username
          <br />
          <code>{"{site}"}</code> — Platform name (Instagram, Facebook, Threads)
        </ul>
      </div>

      <div style={{ marginBottom: "24px" }}>
        <strong>Live Preview:</strong>
        <div
          style={{ marginTop: "6px", fontStyle: "italic", color: "#495057" }}
        >
          "{renderPreview(template)}"
        </div>
      </div>

      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        <button
          onClick={handleSave}
          style={{
            backgroundColor: "#0d6efd",
            color: "#fff",
            border: "none",
            padding: "10px 18px",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Save Template
        </button>
        <button
          onClick={() => setTemplate(DEFAULT_TEMPLATE)}
          style={{
            backgroundColor: "#e9ecef",
            color: "#495057",
            border: "none",
            padding: "10px 18px",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Reset Default
        </button>
        {savedStatus && (
          <span style={{ color: "#198754", fontWeight: 500 }}>Saved!</span>
        )}
      </div>
    </div>
  );
};
