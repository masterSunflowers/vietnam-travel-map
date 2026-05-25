"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Highcharts from "highcharts/highmaps";
import HighchartsReact from "highcharts-react-official";
import {
  MetricKey,
  getMapSeriesData,
  metricLabels,
  formatNumber,
  getProvinceByKey,
} from "@/lib/provinceData";

interface VietnamMapProps {
  metric: MetricKey;
  onProvinceClick: (hcKey: string) => void;
}

const VietnamMap: React.FC<VietnamMapProps> = ({ metric, onProvinceClick }) => {
  const [linesData, setLinesData] = useState<any>(null);
  const [pointsData, setPointsData] = useState<any>(null);
  const chartRef = useRef<HighchartsReact.RefObject>(null);

  useEffect(() => {
    // Load the lines (boundaries) and points (centers)
    Promise.all([
      fetch("/data/vietnamadminlines-level1.geojson").then((r) => r.json()),
      fetch("/data/vietnammap-level1.geojson").then((r) => r.json())
    ])
      .then(([lines, points]) => {
        setLinesData(lines);
        setPointsData(points);
      })
      .catch(() => console.error("Failed to load map data"));
  }, []);

  const handlePointClick = useCallback(
    (e: any) => {
      const point = e.point;
      const key = point.id || point.properties?.adm1_pcode;
      if (key) {
        onProvinceClick(key);
      }
    },
    [onProvinceClick]
  );

  if (!linesData || !pointsData) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div className="skeleton" style={{ width: 280, height: 420 }} />
        <div
          style={{
            fontSize: 13,
            color: "var(--text-muted)",
            letterSpacing: "0.04em",
          }}
        >
          Loading 34-Province Map…
        </div>
      </div>
    );
  }

  const seriesData = getMapSeriesData(metric);
  const values = seriesData.map(([, v]) => v);
  const maxVal = Math.max(...values, 1);

  // Map the point features to Highcharts mapbubble data format
  const bubbleData = pointsData.features.map((feat: any) => {
    const pcode = feat.properties.adm1_pcode;
    const province = getProvinceByKey(pcode);
    const value = province ? (province[metric] as number) : 0;
    
    return {
      id: pcode,
      name: feat.properties.adm1_name1,
      geometry: feat.geometry,
      value: value,
      z: value, // z determines bubble size
      properties: feat.properties
    };
  });

  const options: Highcharts.Options = {
    chart: {
      backgroundColor: "transparent",
      style: {
        fontFamily: "'Inter', sans-serif",
      },
      spacing: [10, 10, 10, 10],
    },
    title: {
      text: undefined,
    },
    credits: {
      enabled: false,
    },
    legend: {
      enabled: true,
      layout: "horizontal",
      align: "center",
      verticalAlign: "bottom",
      floating: false,
      itemStyle: {
        color: "#94a3b8",
        fontWeight: "500",
        fontSize: "11px",
      },
    },
    mapNavigation: {
      enabled: true,
      buttonOptions: {
        align: "right",
        verticalAlign: "bottom",
        style: {
          color: "#94a3b8",
        },
      },
    },
    colorAxis: {
      min: 0,
      max: maxVal,
      stops: [
        [0, "#2dd4bf"],
        [0.5, "#fbbf24"],
        [1, "#fb923c"],
      ],
      labels: {
        style: {
          color: "#64748b",
          fontSize: "10px",
        },
        formatter: function (this: any): string {
          return formatNumber(this.value as number);
        },
      },
    },
    tooltip: {
      backgroundColor: "rgba(11, 15, 26, 0.95)",
      borderColor: "rgba(45, 212, 191, 0.3)",
      borderRadius: 12,
      style: {
        color: "#f1f5f9",
        fontSize: "13px",
        fontFamily: "'Inter', sans-serif",
      },
      useHTML: true,
      formatter: function (this: any) {
        if (!this.point.id) return false;
        
        const province = getProvinceByKey(this.point.id);
        const val = this.point.value || 0;

        if (!province)
          return `<div style="padding:4px"><strong>${this.point.name}</strong></div>`;

        return `
          <div style="padding:8px 4px; min-width:180px">
            <div style="font-size:10px; color:#2dd4bf; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:4px">
              ${province.region}
            </div>
            <div style="font-size:16px; font-weight:700; margin-bottom:8px">
              ${province.name}
            </div>
            <div style="display:flex; justify-content:space-between; align-items:baseline; padding:4px 0; border-top:1px solid rgba(255,255,255,0.06)">
              <span style="color:#94a3b8; font-size:12px">${metricLabels[metric]}</span>
              <span style="font-weight:600; color:#2dd4bf; font-size:14px">${formatNumber(val)}</span>
            </div>
            <div style="font-size:11px; color:#64748b; margin-top:6px">
              Click to view details →
            </div>
          </div>
        `;
      },
    },
    plotOptions: {
      mapbubble: {
        minSize: 8,
        maxSize: 45,
        cursor: "pointer",
        point: {
          events: {
            click: handlePointClick,
          },
        },
      } as any,
    },
    series: [
      {
        type: "mapline",
        name: "Boundaries",
        data: Highcharts.geojson(linesData, "mapline"),
        color: "rgba(148, 163, 184, 0.3)",
        lineWidth: 1,
        enableMouseTracking: false,
      } as any,
      {
        type: "mapbubble",
        name: metricLabels[metric],
        data: bubbleData,
        colorKey: "value",
        enableMouseTracking: true,
        marker: {
          fillOpacity: 0.8,
          lineColor: "#fff",
          lineWidth: 1,
        },
      } as any,
    ],
  };

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <HighchartsReact
        highcharts={Highcharts}
        options={options}
        constructorType="mapChart"
        ref={chartRef}
        containerProps={{
          style: { width: "100%", height: "100%" },
        }}
      />
    </div>
  );
};

export default VietnamMap;

