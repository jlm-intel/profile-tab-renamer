import React, { useEffect, useState } from "react";
import { DEFAULT_TEMPLATE, DEFAULT_ENABLE_FACEBOOK } from "../types";

export const OptionsApp: React.FC = () => {
  const [template, setTemplate] = useState<string>(DEFAULT_TEMPLATE);
  const [enableFacebook, setEnableFacebook] = useState<boolean>(
    DEFAULT_ENABLE_FACEBOOK,
  );
  const [savedStatus, setSavedStatus] = useState<boolean>(false);

  useEffect(() => {
    chrome.storage.sync.get(["template", "enableFacebook"], (result) => {
      if (result.template !== undefined) {
        setTemplate(result.template as string);
      }
      if (result.enableFacebook !== undefined) {
        setEnableFacebook(result.enableFacebook as boolean);
      }
    });
  }, []);

  const handleSave = () => {
    chrome.storage.sync.set({ template, enableFacebook }, () => {
      setSavedStatus(true);
      setTimeout(() => setSavedStatus(false), 2500);
    });
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
      <h2>Profile Tab Renamer Settings</h2>
      <p style={{ color: "#6c757d" }}>
        Customize how tab titles are formatted when navigating profile pages.
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
          margin: "20px 0",
          padding: "12px 0",
          borderTop: "1px solid #eee",
          borderBottom: "1px solid #eee",
        }}
      >
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          <input
            type="checkbox"
            checked={enableFacebook}
            onChange={(e) => setEnableFacebook(e.target.checked)}
            style={{ width: "18px", height: "18px", cursor: "pointer" }}
          />
          Enable tab renaming on Facebook (Experimental)
        </label>
        <p
          style={{ margin: "4px 0 0 28px", fontSize: "12px", color: "#6c757d" }}
        >
          Facebook uses aggressive client-side routing that may affect
          navigation feeds.
        </p>
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
          Save Settings
        </button>
        {savedStatus && (
          <span style={{ color: "#198754", fontWeight: 500 }}>Saved!</span>
        )}
      </div>
    </div>
  );
};
