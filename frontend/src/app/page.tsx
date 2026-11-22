"use client";

import React, { useCallback, useEffect, useState, useMemo } from "react";
import Header from "@/components/Header";
import VietnamMapD3 from "@/components/VietnamMapD3";
import MetricSelector from "@/components/MetricSelector";
import ProvinceDetail from "@/components/ProvinceDetail";
import VerificationView from "@/components/VerificationView";
import { useLanguage } from "@/lib/i18n";
import {
  DateOption,
  MetricKey,
  ProvinceData,
  fetchAvailableDates,
  fetchProvinceStats,
  getProvinceByKey,
} from "@/lib/provinceApi";

export default function Home() {
  const { t, formatNumber } = useLanguage();
  const [activeTab, setActiveTab] = useState<"map" | "verification">("map");
  const [viewMode, setViewMode] = useState<"cumulative" | "monthly">("cumulative");
  const [availableDates, setAvailableDates] = useState<DateOption[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>("tourists_total");
  const [provinces, setProvinces] = useState<ProvinceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<ProvinceData | null>(null);

  // 1. Fetch available dates on mount
  useEffect(() => {
    let isMounted = true;
    const loadDates = async () => {
      try {
        const dates = await fetchAvailableDates();
        if (!isMounted) return;
        setAvailableDates(dates);
        if (dates.length > 0) {
          // Default to the first (latest) date
          setSelectedDate(dates[0].date);
        }
      } catch (err) {
        console.error("Failed to load available dates:", err);
      }
    };
    loadDates();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Fetch stats whenever selectedDate or viewMode changes
  useEffect(() => {
    let isMounted = true;

    const loadProvinceStats = async () => {
      try {
        setIsLoading(true);
        const result = await fetchProvinceStats(selectedDate || undefined, viewMode);
        if (!isMounted) return;
        setProvinces(result);
        setError(null);
      } catch (err) {
        if (!isMounted) return;
        const message = err instanceof Error ? err.message : t.loadError;
        setError(message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProvinceStats();
    return () => {
      isMounted = false;
    };
  }, [selectedDate, viewMode, t.loadError]);

  const handleProvinceClick = useCallback(
    (hcKey: string) => {
      const province = getProvinceByKey(provinces, hcKey);
      if (province) {
        setSelectedProvince(province);
      }
    },
    [provinces]
  );

  const handleCloseDetail = useCallback(() => {
    setSelectedProvince(null);
  }, []);

  const totalTourists = provinces.reduce((sum, province) => sum + province.tourists_total, 0);
  const totalHotels = provinces.reduce((sum, province) => sum + province.hotels_count, 0);
  const totalRooms = provinces.reduce((sum, province) => sum + province.hotel_rooms_total, 0);
  const topProvince = provinces.length
    ? provinces.reduce((max, province) =>
        province.tourists_total > max.tourists_total ? province : max
      )
    : null;

  const currentDateMeta = useMemo(() => {
    return availableDates.find((d) => d.date === selectedDate);
  }, [availableDates, selectedDate]);

  return (
    <>
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        availableDates={availableDates}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {activeTab === "map" ? (
        <main className="map-page">
          <div className="map-left-panel">
            <div className="map-card">
              <VietnamMapD3
                metric={selectedMetric}
                provinces={provinces}
                onProvinceClick={handleProvinceClick}
              />
            </div>
          </div>

          <div className="map-right-panel">
            <div className="animate-fade-in" style={{ animationDelay: "0.05s" }}>
              <div className="map-section-label">{t.displayMetric}</div>
              <MetricSelector selected={selectedMetric} onChange={setSelectedMetric} />
            </div>

            <div className="map-stats-grid animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <SummaryCard
                icon="🌏"
                label={t.totalTourists}
                value={formatNumber(totalTourists)}
                accent="var(--accent-teal)"
                subValue={viewMode === "monthly" ? `• ${t.monthlyView}` : `• ${t.cumulativeView}`}
              />
              <SummaryCard
                icon="🏨"
                label={t.totalHotels}
                value={formatNumber(totalHotels)}
                accent="var(--accent-blue)"
              />
              <SummaryCard
                icon="🛏️"
                label={t.totalRooms}
                value={formatNumber(totalRooms)}
                accent="var(--accent-purple)"
              />
              <SummaryCard
                icon="🏆"
                label={t.topProvince}
                value={topProvince ? topProvince.name.replace("Thanh pho ", "TP. ") : "N/A"}
                accent="var(--accent-amber)"
                subValue={topProvince ? `${formatNumber(topProvince.tourists_total)} ${t.visitorsSuffix}` : undefined}
              />
            </div>

            {isLoading && (
              <div style={{ marginTop: 12, color: "var(--text-muted)", fontSize: 13 }}>
                {t.loadingData}
              </div>
            )}
            {error && (
              <div style={{ marginTop: 12, color: "#f87171", fontSize: 13 }}>
                {error}
              </div>
            )}
          </div>
        </main>
      ) : (
        <main className="verification-main-wrapper">
          <VerificationView
            provinces={provinces}
            currentDateMeta={currentDateMeta}
            isLoading={isLoading}
            viewMode={viewMode}
          />
        </main>
      )}

      {/* Province Detail Drawer (on Map Tab) */}
      {activeTab === "map" && (
        <>
          <ProvinceDetail province={selectedProvince} onClose={handleCloseDetail} />

          {selectedProvince && (
            <div
              onClick={handleCloseDetail}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0, 0, 0, 0.4)",
                zIndex: 90,
                transition: "opacity 0.3s ease",
              }}
            />
          )}
        </>
      )}
    </>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  accent,
  subValue,
}: {
  icon: string;
  label: string;
  value: string;
  accent: string;
  subValue?: string;
}) {
  return (
    <div className="map-stat-card">
      <div
        className="map-stat-icon"
        style={{
          background: `${accent}15`,
          border: `1px solid ${accent}30`,
        }}
      >
        {icon}
      </div>
      <div className="map-stat-content">
        <div className="map-stat-label">{label}</div>
        <div className="map-stat-value">{value}</div>
        {subValue && (
          <div className="map-stat-sub" style={{ color: accent }}>
            {subValue}
          </div>
        )}
      </div>
    </div>
  );
}
