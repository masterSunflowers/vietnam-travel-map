"use client";

import React from "react";
import {
  ProvinceData,
  formatNumber,
  metricLabels,
  metricUnits,
  MetricKey,
} from "@/lib/provinceApi";

interface ProvinceDetailProps {
  province: ProvinceData | null;
  onClose: () => void;
}

const landmarkTypeColors: Record<string, string> = {
  nature: "badge-nature",
  culture: "badge-culture",
  beach: "badge-beach",
  city: "badge-city",
  heritage: "badge-heritage",
};

const statMetrics: { key: MetricKey; icon: string }[] = [
  { key: "tourists_total", icon: "👥" },
  { key: "tourists_domestic", icon: "🏠" },
  { key: "tourists_international", icon: "✈️" },
  { key: "overnight_stays_total", icon: "🌙" },
  { key: "hotels_count", icon: "🏨" },
  { key: "hotel_rooms_total", icon: "🛏️" },
];

const ProvinceDetail: React.FC<ProvinceDetailProps> = ({
  province,
  onClose,
}) => {
  return (
    <div className={`province-panel ${province ? "open" : ""}`}>
      {province && (
        <div style={{ padding: 32 }}>
          {/* Back button */}
          <button className="back-button" onClick={onClose}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10 12L6 8L10 4" />
            </svg>
            Quay lại Bản đồ
          </button>

          {/* Province header */}
          <div
            className="animate-fade-in"
            style={{ marginTop: 28, animationDelay: "0.05s" }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "var(--accent-teal)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: 6,
              }}
            >
              {province.region}
            </div>
            <h2
              style={{
                fontSize: 32,
                fontWeight: 800,
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
                background:
                  "linear-gradient(135deg, #f1f5f9 0%, #94a3b8 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {province.name}
            </h2>
          </div>

          {/* Stats grid */}
          <div
            className="animate-fade-in"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginTop: 28,
              animationDelay: "0.1s",
            }}
          >
            {statMetrics.map(({ key, icon }) => (
              <div key={key} className="stat-card">
                <div
                  style={{
                    fontSize: 16,
                    marginBottom: 6,
                  }}
                >
                  {icon}
                </div>
                <div className="stat-value">
                  {formatNumber(province[key] as number)}
                </div>
                <div className="stat-label">{metricLabels[key]}</div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--text-muted)",
                    marginTop: 2,
                  }}
                >
                  {metricUnits[key]}
                </div>
              </div>
            ))}
          </div>

          {/* Landmarks */}
          {province.landmarks.length > 0 && (
            <div
              className="animate-fade-in"
              style={{ marginTop: 32, animationDelay: "0.2s" }}
            >
              <h3
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 16,
                }}
              >
                🏛️ Địa Danh Nổi Bật
              </h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {province.landmarks.map((lm, i) => (
                  <div
                    key={i}
                    className="landmark-card"
                    style={{
                      animationDelay: `${0.25 + i * 0.05}s`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 6,
                      }}
                    >
                      <span
                        className={`badge ${
                          landmarkTypeColors[lm.type] || ""
                        }`}
                      >
                        {lm.type}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        marginBottom: 4,
                      }}
                    >
                      {lm.name}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: "var(--text-muted)",
                        lineHeight: 1.5,
                      }}
                    >
                      {lm.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {province.landmarks.length === 0 && (
            <div
              className="animate-fade-in"
              style={{
                marginTop: 32,
                padding: 24,
                textAlign: "center",
                color: "var(--text-muted)",
                fontSize: 14,
                border: "1px dashed var(--border-subtle)",
                borderRadius: 12,
                animationDelay: "0.2s",
              }}
            >
              Chưa có dữ liệu địa danh cho khu vực này.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProvinceDetail;
