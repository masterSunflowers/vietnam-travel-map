"use client";

import React, { useCallback, useEffect, useState } from "react";
import Header from "@/components/Header";
import VietnamMapD3 from "@/components/VietnamMapD3";
import MetricSelector from "@/components/MetricSelector";
import ProvinceDetail from "@/components/ProvinceDetail";
import {
  MetricKey,
  ProvinceData,
  fetchProvinceStats,
  formatNumber,
  getProvinceByKey,
} from "@/lib/provinceApi";

export default function Home() {
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>("tourists_total");
  const [provinces, setProvinces] = useState<ProvinceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<ProvinceData | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadProvinceStats = async () => {
      try {
        setIsLoading(true);
        const result = await fetchProvinceStats();
        if (!isMounted) return;
        setProvinces(result);
        setError(null);
      } catch (err) {
        if (!isMounted) return;
        const message =
          err instanceof Error ? err.message : "Không thể tải dữ liệu tỉnh thành";
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
  }, []);

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

  return (
    <>
      <Header />

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
            <div className="map-section-label">Chỉ tiêu hiển thị</div>
            <MetricSelector selected={selectedMetric} onChange={setSelectedMetric} />
          </div>

          <div className="map-stats-grid animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <SummaryCard
              icon="🌏"
              label="Tổng lượt khách"
              value={formatNumber(totalTourists)}
              accent="var(--accent-teal)"
            />
            <SummaryCard
              icon="🏨"
              label="Tổng khách sạn"
              value={formatNumber(totalHotels)}
              accent="var(--accent-blue)"
            />
            <SummaryCard
              icon="🛏️"
              label="Tổng số phòng"
              value={formatNumber(totalRooms)}
              accent="var(--accent-purple)"
            />
            <SummaryCard
              icon="🏆"
              label="Tỉnh dẫn đầu"
              value={topProvince ? topProvince.name.replace("Thanh pho ", "TP. ") : "N/A"}
              accent="var(--accent-amber)"
              subValue={topProvince ? `${formatNumber(topProvince.tourists_total)} khách` : undefined}
            />
          </div>

          {isLoading && (
            <div style={{ marginTop: 12, color: "var(--text-muted)", fontSize: 13 }}>
              Đang tải dữ liệu từ database...
            </div>
          )}
          {error && (
            <div style={{ marginTop: 12, color: "#f87171", fontSize: 13 }}>
              {error}
            </div>
          )}
        </div>
      </main>

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
      <div>
        <div className="map-stat-value">{value}</div>
        <div className="map-stat-label">{label}</div>
        {subValue && (
          <div className="map-stat-sub" style={{ color: accent }}>
            {subValue}
          </div>
        )}
      </div>
    </div>
  );
}
