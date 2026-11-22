"use client";

import React, { useMemo, useState } from "react";
import { DateOption, ProvinceData } from "@/lib/provinceApi";
import { useLanguage } from "@/lib/i18n";

interface VerificationViewProps {
  provinces: ProvinceData[];
  currentDateMeta?: DateOption;
  isLoading: boolean;
  viewMode?: "cumulative" | "monthly";
}

type SortField =
  | "name"
  | "tourists_total"
  | "tourists_domestic"
  | "tourists_international"
  | "overnight_stays_total"
  | "hotels_count"
  | "hotel_rooms_total";

type SortDirection = "asc" | "desc";

export default function VerificationView({
  provinces,
  currentDateMeta,
  isLoading,
  viewMode = "cumulative",
}: VerificationViewProps) {
  const { t, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("tourists_total");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const filteredProvinces = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    let result = provinces;

    if (term) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          (p.merged_from && p.merged_from.toLowerCase().includes(term))
      );
    }

    return [...result].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDirection === "asc"
          ? aVal.localeCompare(bVal, "vi")
          : bVal.localeCompare(aVal, "vi");
      }

      const numA = (aVal as number) ?? 0;
      const numB = (bVal as number) ?? 0;
      return sortDirection === "asc" ? numA - numB : numB - numA;
    });
  }, [provinces, searchTerm, sortField, sortDirection]);

  // Aggregate totals
  const totalTourists = useMemo(
    () => provinces.reduce((sum, p) => sum + p.tourists_total, 0),
    [provinces]
  );
  const totalDomestic = useMemo(
    () => provinces.reduce((sum, p) => sum + p.tourists_domestic, 0),
    [provinces]
  );
  const totalIntl = useMemo(
    () => provinces.reduce((sum, p) => sum + p.tourists_international, 0),
    [provinces]
  );
  const totalHotels = useMemo(
    () => provinces.reduce((sum, p) => sum + p.hotels_count, 0),
    [provinces]
  );
  const totalRooms = useMemo(
    () => provinces.reduce((sum, p) => sum + p.hotel_rooms_total, 0),
    [provinces]
  );

  const formatNum = (num: number) => {
    return num.toLocaleString(language === "vi" ? "vi-VN" : "en-US");
  };

  return (
    <div className="verification-page animate-fade-in">
      {/* 1. Official Citation & Source Header */}
      <div className="citation-banner">
        <div className="citation-header-content">
          <div className="citation-badge">
            <span className="citation-live-dot" />
            {viewMode === "monthly" ? t.monthlyBadge : t.cumulativeBadge}
          </div>
          <h2 className="citation-title">
            🏛️ {t.sourceBannerTitle}
          </h2>
          <p className="citation-desc">
            {t.sourceBannerDesc}
          </p>

          <div className="citation-meta-grid">
            <div className="citation-meta-item">
              <span className="citation-meta-label">{t.pubAgency}:</span>
              <strong className="citation-meta-value">
                {currentDateMeta?.source || "Cục Du lịch Quốc gia Việt Nam (VNAT)"}
              </strong>
            </div>
            <div className="citation-meta-item">
              <span className="citation-meta-label">{t.pubTitle}:</span>
              <strong className="citation-meta-value">
                {currentDateMeta?.publication_title || "Thông tin du lịch nổi bật"}
              </strong>
            </div>
            <div className="citation-meta-item">
              <span className="citation-meta-label">{t.pubDate}:</span>
              <strong className="citation-meta-value">
                {currentDateMeta?.publication_date || "2026-11-09"}
              </strong>
            </div>
          </div>
        </div>

        {/* Action / Citation Links */}
        <div className="citation-actions">
          {currentDateMeta?.source_url && (
            <a
              href={currentDateMeta.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="citation-btn primary"
            >
              <span>🌐</span> {t.viewVnatPortal}
            </a>
          )}
          <a
            href="https://thongke.tourism.vn"
            target="_blank"
            rel="noopener noreferrer"
            className="citation-btn secondary"
          >
            <span>📊</span> {t.viewGsoPortal}
          </a>
          {currentDateMeta?.report_url && (
            <a
              href={currentDateMeta.report_url}
              target="_blank"
              rel="noopener noreferrer"
              className="citation-btn outline"
            >
              <span>📄</span> {t.viewOfficialPost}
            </a>
          )}
        </div>
      </div>

      {/* 2. Quick Overview Ribbon */}
      <div className="proof-overview-ribbon">
        <div className="proof-pill">
          <span className="proof-pill-label">{t.colTotalTourists}:</span>
          <span className="proof-pill-val teal">{formatNum(totalTourists)}</span>
        </div>
        <div className="proof-pill">
          <span className="proof-pill-label">{t.colDomestic}:</span>
          <span className="proof-pill-val">{formatNum(totalDomestic)}</span>
        </div>
        <div className="proof-pill">
          <span className="proof-pill-label">{t.colIntl}:</span>
          <span className="proof-pill-val purple">{formatNum(totalIntl)}</span>
        </div>
        <div className="proof-pill">
          <span className="proof-pill-label">{t.colHotels}:</span>
          <span className="proof-pill-val blue">{formatNum(totalHotels)}</span>
        </div>
        <div className="proof-pill">
          <span className="proof-pill-label">{t.colRooms}:</span>
          <span className="proof-pill-val amber">{formatNum(totalRooms)}</span>
        </div>
      </div>

      {/* 3. Search & Toolbar */}
      <div className="verification-toolbar">
        <div className="verification-search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="verification-search-input"
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearchTerm("")}
            >
              ✕
            </button>
          )}
        </div>
        <div className="verification-toolbar-right">
          <div className="table-scroll-hint">
            {t.tableScrollHint}
          </div>
          <div className="verification-count-badge">
            {filteredProvinces.length} / {provinces.length} {t.allProvincesCount}
          </div>
        </div>
      </div>

      {/* 4. Data Verification Table */}
      <div className="verification-table-container">
        {isLoading ? (
          <div className="table-loading-state">
            <span className="loading-spinner" />
            <p>{t.loadingData}</p>
          </div>
        ) : filteredProvinces.length === 0 ? (
          <div className="table-empty-state">
            <p>{t.noResultsFound}</p>
          </div>
        ) : (
          <table className="verification-table">
            <thead>
              <tr>
                <th className="th-sticky-stt" style={{ width: 38, textAlign: "center" }}>{t.colNo}</th>
                <th
                  onClick={() => handleSort("name")}
                  className={`sortable th-sticky-name ${sortField === "name" ? "sorted" : ""}`}
                >
                  {t.colProvince}
                  <span className="sort-indicator">
                    {sortField === "name" ? (sortDirection === "asc" ? " ↑" : " ↓") : " ↕"}
                  </span>
                </th>
                <th>{t.colMergedFrom}</th>
                <th
                  onClick={() => handleSort("tourists_total")}
                  className={`sortable num-col ${sortField === "tourists_total" ? "sorted" : ""}`}
                >
                  {t.colTotalTourists}
                  <span className="sort-indicator">
                    {sortField === "tourists_total" ? (sortDirection === "asc" ? " ↑" : " ↓") : " ↕"}
                  </span>
                </th>
                <th
                  onClick={() => handleSort("tourists_domestic")}
                  className={`sortable num-col ${sortField === "tourists_domestic" ? "sorted" : ""}`}
                >
                  {t.colDomestic}
                  <span className="sort-indicator">
                    {sortField === "tourists_domestic" ? (sortDirection === "asc" ? " ↑" : " ↓") : " ↕"}
                  </span>
                </th>
                <th
                  onClick={() => handleSort("tourists_international")}
                  className={`sortable num-col ${sortField === "tourists_international" ? "sorted" : ""}`}
                >
                  {t.colIntl}
                  <span className="sort-indicator">
                    {sortField === "tourists_international" ? (sortDirection === "asc" ? " ↑" : " ↓") : " ↕"}
                  </span>
                </th>
                <th className="num-col">{t.colIntlRatio}</th>
                <th
                  onClick={() => handleSort("overnight_stays_total")}
                  className={`sortable num-col ${sortField === "overnight_stays_total" ? "sorted" : ""}`}
                >
                  {t.colOvernight}
                  <span className="sort-indicator">
                    {sortField === "overnight_stays_total" ? (sortDirection === "asc" ? " ↑" : " ↓") : " ↕"}
                  </span>
                </th>
                <th
                  onClick={() => handleSort("hotels_count")}
                  className={`sortable num-col ${sortField === "hotels_count" ? "sorted" : ""}`}
                >
                  {t.colHotels}
                  <span className="sort-indicator">
                    {sortField === "hotels_count" ? (sortDirection === "asc" ? " ↑" : " ↓") : " ↕"}
                  </span>
                </th>
                <th
                  onClick={() => handleSort("hotel_rooms_total")}
                  className={`sortable num-col ${sortField === "hotel_rooms_total" ? "sorted" : ""}`}
                >
                  {t.colRooms}
                  <span className="sort-indicator">
                    {sortField === "hotel_rooms_total" ? (sortDirection === "asc" ? " ↑" : " ↓") : " ↕"}
                  </span>
                </th>
                <th className="th-proof">{t.colProof}</th>
              </tr>
            </thead>
            <tbody>
              {filteredProvinces.map((province, idx) => {
                const intlRatio =
                  province.tourists_total > 0
                    ? ((province.tourists_international / province.tourists_total) * 100).toFixed(1)
                    : "0.0";

                return (
                  <tr key={province.id} className="table-row">
                    <td className="td-sticky-stt" style={{ textAlign: "center", color: "var(--text-muted)" }}>
                      {idx + 1}
                    </td>
                    <td className="td-sticky-name province-name-cell">
                      <span className="province-primary-name">{province.name}</span>
                      <span className="province-region-tag">{province.region}</span>
                    </td>
                    <td className="merged-from-cell">
                      {province.merged_from ? (
                        <div className="sub-tag-container">
                          {province.merged_from.split(",").map((item) => (
                            <span key={item.trim()} className="sub-province-tag">
                              {item.trim()}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: "var(--text-muted)" }}>—</span>
                      )}
                    </td>
                    <td className="num-col font-mono bold highlight-teal">
                      {formatNum(province.tourists_total)}
                    </td>
                    <td className="num-col font-mono">
                      {formatNum(province.tourists_domestic)}
                    </td>
                    <td className="num-col font-mono highlight-purple">
                      {formatNum(province.tourists_international)}
                    </td>
                    <td className="num-col font-mono">
                      <span className="ratio-badge">{intlRatio}%</span>
                    </td>
                    <td className="num-col font-mono">
                      {formatNum(province.overnight_stays_total)}
                    </td>
                    <td className="num-col font-mono">
                      {formatNum(province.hotels_count)}
                    </td>
                    <td className="num-col font-mono">
                      {formatNum(province.hotel_rooms_total)}
                    </td>
                    <td className="td-proof">
                      <a
                        href={province.citation_url || "https://vietnamtourism.gov.vn/statistic?view=home&category=71"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="proof-link-btn"
                        title={t.viewProof}
                      >
                        🔗 {t.viewProof}
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
