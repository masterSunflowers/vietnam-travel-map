"use client";

import React from "react";
import { useLanguage } from "@/lib/i18n";
import { DateOption } from "@/lib/provinceApi";

interface HeaderProps {
  activeTab?: "map" | "verification";
  onTabChange?: (tab: "map" | "verification") => void;
  availableDates?: DateOption[];
  selectedDate?: string;
  onDateChange?: (date: string) => void;
  viewMode?: "cumulative" | "monthly";
  onViewModeChange?: (mode: "cumulative" | "monthly") => void;
}

const Header: React.FC<HeaderProps> = ({
  activeTab = "map",
  onTabChange,
  availableDates = [],
  selectedDate,
  onDateChange,
  viewMode = "cumulative",
  onViewModeChange,
}) => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="app-header">
      <div className="header-inner">
        {/* Brand */}
        <div className="header-brand">
          <div className="header-brand-icon">
            🗺️
          </div>
          <div>
            <h1 className="header-brand-title">
              {t.appTitle}
            </h1>
          </div>
        </div>

        {/* Center: 2 Tabs Switcher */}
        {onTabChange && (
          <nav className="tab-switcher" aria-label="Tab Navigation">
            <button
              type="button"
              className={`tab-btn ${activeTab === "map" ? "active" : ""}`}
              onClick={() => onTabChange("map")}
            >
              <span className="tab-icon">🗺️</span>
              <span className="tab-label">{t.mapTab}</span>
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === "verification" ? "active" : ""}`}
              onClick={() => onTabChange("verification")}
            >
              <span className="tab-icon">📋</span>
              <span className="tab-label">{t.verificationTab}</span>
            </button>
          </nav>
        )}

        {/* Right side: View Mode Toggle, Time Filter, Language & Status */}
        <div className="header-actions">
          {/* Perspective View Mode Toggle (Lũy kế vs Trong tháng) */}
          {onViewModeChange && (
            <div className="view-mode-switcher" title={t.perspective}>
              <button
                type="button"
                className={`view-mode-btn ${viewMode === "cumulative" ? "active" : ""}`}
                onClick={() => onViewModeChange("cumulative")}
              >
                <span>📊</span>
                <span>{t.cumulativeView}</span>
              </button>
              <button
                type="button"
                className={`view-mode-btn ${viewMode === "monthly" ? "active" : ""}`}
                onClick={() => onViewModeChange("monthly")}
              >
                <span>📅</span>
                <span>{t.monthlyView}</span>
              </button>
            </div>
          )}

          {/* Shared Time Filter Droplist */}
          {availableDates.length > 0 && onDateChange && (
            <div className="time-filter-wrapper">
              <span className="time-filter-icon">🗓️</span>
              <select
                className="time-filter-select"
                value={selectedDate}
                onChange={(e) => onDateChange(e.target.value)}
                aria-label={t.timeFilter}
              >
                {availableDates.map((item) => {
                  const label =
                    language === "vi"
                      ? item.label_short_vi || item.label_vi
                      : item.label_short_en || item.label_en;

                  return (
                    <option key={item.date} value={item.date}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </div>
          )}

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
          <div className="header-status-badge">
            <span className="header-status-dot" />
            <span className="header-status-text">{t.liveData}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
