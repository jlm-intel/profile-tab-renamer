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
      if (typeof result.template === "string") {
        setTemplate(result.template);
      }
      if (typeof result.enableFacebook === "boolean") {
        setEnableFacebook(result.enableFacebook);
      }
    });
  }, []);

  const handleSave = () => {
    chrome.storage.sync.set({ template, enableFacebook }, () => {
      setSavedStatus(true);
      setTimeout(() => setSavedStatus(false), 2000);
    });
  };

  return (
    <div style={{ width: "100%", boxSizing: "border-box" }}>
      <h3 style={{ margin: "0 0 4px 0", fontSize: "16px" }}>
        Profile Tab Renamer
      </h3>
      <p style={{ color: "#6c757d", fontSize: "12px", margin: "0 0 16px 0" }}>
        Customize tab title formats across profile routes.
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
          onChange={(e) => setTemplate(e.target.value)}
          style={{
            width: "100%",
            padding: "8px",
            fontSize: "13px",
            borderRadius: "4px",
            border: "1px solid #ced4da",
            boxSizing: "border-box",
          }}
        />
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
          Experimental. May interfere with client-side feed navigation.
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
