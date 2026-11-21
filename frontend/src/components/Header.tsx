"use client";

import React from "react";
import { useLanguage } from "@/lib/i18n";

const Header = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: "rgba(11, 15, 26, 0.8)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          padding: "0 32px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Logo icon */}
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background:
                "linear-gradient(135deg, rgba(45, 212, 191, 0.2) 0%, rgba(56, 189, 248, 0.2) 100%)",
              border: "1px solid rgba(45, 212, 191, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
            }}
          >
            🗺️
          </div>
          <div>
            <h1
              style={{
                fontSize: 20,
                fontWeight: 800,
                letterSpacing: "-0.02em",
                background:
                  "linear-gradient(135deg, #2dd4bf 0%, #38bdf8 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {t.appTitle}
            </h1>
          </div>
        </div>

        {/* Right side: Language Switcher & Status */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* Language Toggle Button */}
          <div className="language-switcher">
            <button
              type="button"
              className={`lang-btn ${language === "vi" ? "active" : ""}`}
              onClick={() => setLanguage("vi")}
              aria-label="Tiếng Việt"
            >
              VI
            </button>
            <span className="lang-divider">/</span>
            <button
              type="button"
              className={`lang-btn ${language === "en" ? "active" : ""}`}
              onClick={() => setLanguage("en")}
              aria-label="English"
            >
              EN
            </button>
          </div>

          {/* Connection Status */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
              color: "var(--text-muted)",
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "var(--accent-emerald)",
                display: "inline-block",
                boxShadow: "0 0 8px rgba(52, 211, 153, 0.4)",
              }}
            />
            {t.liveData}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
