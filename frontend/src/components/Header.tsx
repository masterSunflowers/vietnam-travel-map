"use client";

import React from "react";

const Header = () => {
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
              width: 36,
              height: 36,
              borderRadius: 10,
              background:
                "linear-gradient(135deg, rgba(45, 212, 191, 0.2) 0%, rgba(56, 189, 248, 0.2) 100%)",
              border: "1px solid rgba(45, 212, 191, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
            }}
          >
            🗺️
          </div>
          <div>
            <h1
              style={{
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: "-0.02em",
                background:
                  "linear-gradient(135deg, #2dd4bf 0%, #38bdf8 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Travel View
            </h1>
            <p
              style={{
                fontSize: 11,
                color: "var(--text-muted)",
                letterSpacing: "0.04em",
                marginTop: -2,
              }}
            >
              BẢNG ĐIỀU KHIỂN DU LỊCH
            </p>
          </div>
        </div>

        {/* Right side — could add time/date later */}
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
          Dữ liệu trực tiếp
        </div>
      </div>
      {/* Gradient accent line */}
      <div className="gradient-line" />
    </header>
  );
};

export default Header;
