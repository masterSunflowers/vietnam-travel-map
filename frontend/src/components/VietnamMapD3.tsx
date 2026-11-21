"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import {
  MetricKey,
  ProvinceData,
  getProvinceByKey,
  getProvinceGroupKeys,
} from "@/lib/provinceApi";
import { useLanguage } from "@/lib/i18n";

interface VietnamMapD3Props {
  metric: MetricKey;
  provinces: ProvinceData[];
  onProvinceClick: (hcKey: string) => void;
}

interface TooltipState {
  province: ProvinceData | null;
  x: number;
  y: number;
  visible: boolean;
}

const PROVINCE_GREYS = [
  "#2a2e38",
  "#31353f",
  "#383c47",
  "#3f434e",
  "#464b56",
  "#4d525e",
  "#545966",
  "#5b616e",
];

const HOVER_COLOR = "#e8d44d";
const HOVER_BORDER = "#f0e86c";
const DEFAULT_BORDER = "rgba(255, 255, 255, 0.1)";
const NULL_COLOR = "#1e2028";

function createFallbackProvince(
  feature: any,
  hcKey: string,
  regionLabel = "Chưa có dữ liệu"
): ProvinceData {
  const name = feature.properties?.name || feature.properties?.adm1_name1 || hcKey;

  return {
    id: hcKey.toLowerCase(),
    hcKeys: [hcKey],
    name,
    region: regionLabel,
    hasData: false,
    tourists_total: 0,
    tourists_domestic: 0,
    tourists_international: 0,
    overnight_stays_total: 0,
    hotels_count: 0,
    hotel_rooms_total: 0,
    landmarks: [],
  };
}

const VietnamMapD3: React.FC<VietnamMapD3Props> = ({ metric, provinces, onProvinceClick }) => {
  const { t, formatNumber, language } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [geoData, setGeoData] = useState<any>(null);
  const [containerSize, setContainerSize] = useState<{ width: number; height: number } | null>(
    null
  );
  const [tooltipState, setTooltipState] = useState<TooltipState>({
    province: null,
    x: 0,
    y: 0,
    visible: false,
  });

  useEffect(() => {
    fetch("/data/vietnam-34-provinces.geojson")
      .then((response) => response.json())
      .then((payload) => setGeoData(payload))
      .catch(() => console.error("Failed to load GeoJSON"));
  }, []);

  useEffect(() => {
    const measure = () => {
      const element = containerRef.current;
      if (!element) return;
      const width = element.offsetWidth;
      const height = element.offsetHeight;
      if (width > 0 && height > 0) {
        setContainerSize((prev) => {
          if (prev && prev.width === width && prev.height === height) return prev;
          return { width, height };
        });
      }
    };

    measure();
    const t1 = setTimeout(measure, 100);
    const t2 = setTimeout(measure, 300);
    const t3 = setTimeout(measure, 600);

    const observer = new ResizeObserver(() => measure());
    if (containerRef.current) observer.observe(containerRef.current);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      observer.disconnect();
    };
  }, []);

  const getGreyFill = useCallback((index: number) => PROVINCE_GREYS[index % PROVINCE_GREYS.length], []);

  const moveTooltip = useCallback((event: MouseEvent) => {
    const tooltip = tooltipRef.current;
    const container = containerRef.current;
    if (!tooltip || !container) return;

    const rect = container.getBoundingClientRect();
    let x = event.clientX - rect.left + 16;
    let y = event.clientY - rect.top - 10;

    const tooltipRect = tooltip.getBoundingClientRect();
    if (x + tooltipRect.width > rect.width) {
      x = event.clientX - rect.left - tooltipRect.width - 16;
    }
    if (y + tooltipRect.height > rect.height) {
      y = rect.height - tooltipRect.height - 8;
    }
    if (y < 0) y = 8;

    setTooltipState((prev) => ({ ...prev, x, y }));
  }, []);

  const showTooltip = useCallback((event: MouseEvent, province: ProvinceData) => {
    setTooltipState((prev) => ({ ...prev, province, visible: true }));
    window.requestAnimationFrame(() => moveTooltip(event));
  }, [moveTooltip]);

  const hideTooltip = useCallback(() => {
    setTooltipState((prev) => ({ ...prev, visible: false }));
  }, []);

  useEffect(() => {
    if (!geoData || !containerRef.current || !containerSize) return;

    const { width, height } = containerSize;
    if (width <= 0 || height <= 0) return;

    const findProvinceByKey = (hcKey: string) => getProvinceByKey(provinces, hcKey);
    const findProvinceForFeature = (feature: any) => {
      const hcKey = feature.properties?.["hc-key"];
      if (!hcKey) return null;
      return (
        findProvinceByKey(hcKey) ||
        createFallbackProvince(
          feature,
          hcKey,
          language === "en" ? "No data" : "Chưa có dữ liệu"
        )
      );
    };
    const findGroupKeys = (hcKey: string) => {
      const groupKeys = getProvinceGroupKeys(provinces, hcKey);
      return groupKeys.length > 0 ? groupKeys : [hcKey];
    };

    const container = containerRef.current;
    let svg = container.querySelector("svg.map-svg");
    if (!svg) {
      svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.classList.add("map-svg");
      svg.setAttribute("style", "display:block;position:absolute;top:0;left:0;");
      container.appendChild(svg);
    }

    const svgSel = d3.select(svg as SVGSVGElement);
    svgSel.selectAll("*").remove();
    svgSel.attr("width", width).attr("height", height).attr("viewBox", `0 0 ${width} ${height}`);

    const padding = 24;
    const projection = d3
      .geoIdentity()
      .reflectY(true)
      .fitSize([width - padding * 2, height - padding * 2], geoData as any);
    const tx = projection.translate();
    projection.translate([tx[0] + padding, tx[1] + padding]);
    const pathGen = d3.geoPath().projection(projection as any);

    const g = svgSel.append("g");

    const paths = g
      .selectAll("path")
      .data((geoData as any).features)
      .enter()
      .append("path")
      .attr("d", (d: any) => pathGen(d) || "")
      .attr("fill", (feature: any, index: number) => {
        const hcKey = feature.properties?.["hc-key"];
        const province = hcKey ? findProvinceByKey(hcKey) : null;
        return province ? getGreyFill(index) : NULL_COLOR;
      })
      .attr("stroke", DEFAULT_BORDER)
      .attr("stroke-width", 0.5)
      .attr("cursor", (feature: any) => {
        const hcKey = feature.properties?.["hc-key"];
        return hcKey ? "pointer" : "default";
      })
      .attr("data-hc-key", (feature: any) => feature.properties?.["hc-key"] || "")
      .attr("data-index", (_feature: any, index: number) => String(index))
      .on("mouseenter", function (event: any, feature: any) {
        const hcKey = feature.properties?.["hc-key"];
        if (!hcKey) return;
        const province = findProvinceForFeature(feature);
        if (!province) return;

        const groupKeys = findGroupKeys(hcKey);
        g.selectAll<SVGPathElement, any>("path").each(function () {
          const element = d3.select(this);
          if (groupKeys.includes(element.attr("data-hc-key"))) {
            element
              .raise()
              .transition()
              .duration(120)
              .attr("fill", HOVER_COLOR)
              .attr("stroke", HOVER_BORDER)
              .attr("stroke-width", 1.5);
          }
        });

        svgSel.selectAll<SVGGElement, any>(".archipelago-group").each(function () {
          const element = d3.select(this);
          if (groupKeys.includes(element.attr("data-hc-key"))) {
            element.selectAll("circle").transition().duration(120).attr("fill", HOVER_COLOR);
            element
              .select("rect")
              .transition()
              .duration(120)
              .attr("stroke", HOVER_BORDER)
              .attr("fill", "rgba(255,255,255,0.05)");
          }
        });

        showTooltip(event, province);
      })
      .on("mousemove", function (event: any, feature: any) {
        const hcKey = feature.properties?.["hc-key"];
        if (hcKey) {
          moveTooltip(event);
        }
      })
      .on("mouseleave", function (_event: any, feature: any) {
        const hcKey = feature.properties?.["hc-key"];
        if (!hcKey) return;

        const groupKeys = findGroupKeys(hcKey);
        g.selectAll<SVGPathElement, any>("path").each(function () {
          const element = d3.select(this);
          const elementKey = element.attr("data-hc-key");
          if (groupKeys.includes(elementKey)) {
            const index = parseInt(element.attr("data-index") || "0", 10);
            const province = elementKey ? findProvinceByKey(elementKey) : null;
            element
              .transition()
              .duration(180)
              .attr("fill", province ? getGreyFill(index) : NULL_COLOR)
              .attr("stroke", DEFAULT_BORDER)
              .attr("stroke-width", 0.5);
          }
        });

        svgSel.selectAll<SVGGElement, any>(".archipelago-group").each(function () {
          const element = d3.select(this);
          if (groupKeys.includes(element.attr("data-hc-key"))) {
            const originalFill = element.attr("data-fill");
            element.selectAll("circle").transition().duration(180).attr("fill", originalFill);
            element
              .select("rect")
              .transition()
              .duration(180)
              .attr("stroke", DEFAULT_BORDER)
              .attr("fill", "rgba(0,0,0,0.1)");
          }
        });

        hideTooltip();
      })
      .on("click", function (_event: any, feature: any) {
        const hcKey = feature.properties?.["hc-key"];
        if (hcKey && findProvinceByKey(hcKey)) {
          onProvinceClick(hcKey);
        }
      });

    const boxW = 100;
    const boxH = 80;
    const rightPad = 24;
    const bottomPad = 24;
    const spacing = 16;
    const archipelagos = [
      {
        name: language === "en" ? "Paracel Is." : "QĐ. Hoàng Sa",
        provName: language === "en" ? "(Da Nang)" : "(Đà Nẵng)",
        hcKey: "VN48",
        x: width - boxW - rightPad,
        y: height - boxH * 2 - spacing - bottomPad,
      },
      {
        name: language === "en" ? "Spratly Is." : "QĐ. Trường Sa",
        provName: language === "en" ? "(Khanh Hoa)" : "(Khánh Hòa)",
        hcKey: "VN56",
        x: width - boxW - rightPad,
        y: height - boxH - bottomPad,
      },
    ];

    const archiGroup = svgSel.append("g").attr("class", "archipelagos-layer");

    archipelagos.forEach((archipelago) => {
      const featureIndex = (geoData as any).features.findIndex(
        (feature: any) => feature.properties?.["hc-key"] === archipelago.hcKey
      );
      const fill = featureIndex >= 0 ? getGreyFill(featureIndex) : PROVINCE_GREYS[0];

      const gArch = archiGroup
        .append("g")
        .attr("class", "archipelago-group")
        .attr("transform", `translate(${archipelago.x}, ${archipelago.y})`)
        .attr("cursor", "pointer")
        .attr("data-hc-key", archipelago.hcKey)
        .attr("data-fill", fill);

      gArch
        .append("rect")
        .attr("width", boxW)
        .attr("height", boxH)
        .attr("fill", "rgba(0,0,0,0.1)")
        .attr("stroke", DEFAULT_BORDER)
        .attr("stroke-dasharray", "3 3")
        .attr("stroke-width", 1)
        .attr("rx", 6);

      const dotSeeds = [0.2, 0.8, 0.5, 0.1, 0.9, 0.3, 0.7, 0.4, 0.6, 0.15, 0.85, 0.45];
      const dots = dotSeeds.map((seed) => ({
        cx: 15 + ((seed * 13.7) % 1) * (boxW - 30),
        cy: 15 + ((seed * 19.3) % 1) * (boxH - 45),
        r: 1.5 + ((seed * 7.1) % 1) * 1.5,
      }));

      gArch
        .selectAll("circle")
        .data(dots)
        .enter()
        .append("circle")
        .attr("cx", (dot) => dot.cx)
        .attr("cy", (dot) => dot.cy)
        .attr("r", (dot) => dot.r)
        .attr("fill", fill)
        .attr("class", "island-dot")
        .attr("opacity", 0)
        .transition()
        .duration(500)
        .delay((_dot, index) => index * 30)
        .attr("opacity", 1);

      gArch
        .append("text")
        .attr("x", boxW / 2)
        .attr("y", boxH - 22)
        .attr("text-anchor", "middle")
        .attr("fill", "rgba(255, 255, 255, 0.8)")
        .attr("font-size", "11px")
        .attr("font-weight", "500")
        .attr("pointer-events", "none")
        .text(archipelago.name);

      gArch
        .append("text")
        .attr("x", boxW / 2)
        .attr("y", boxH - 8)
        .attr("text-anchor", "middle")
        .attr("fill", "rgba(255, 255, 255, 0.5)")
        .attr("font-size", "10px")
        .attr("pointer-events", "none")
        .text(archipelago.provName);

      gArch
        .on("mouseenter", function (event: any) {
          const province = findProvinceByKey(archipelago.hcKey);
          if (!province) return;

          const groupKeys = findGroupKeys(archipelago.hcKey);
          g.selectAll<SVGPathElement, any>("path").each(function () {
            const element = d3.select(this);
            if (groupKeys.includes(element.attr("data-hc-key"))) {
              element
                .raise()
                .transition()
                .duration(120)
                .attr("fill", HOVER_COLOR)
                .attr("stroke", HOVER_BORDER)
                .attr("stroke-width", 1.5);
            }
          });

          const self = d3.select(this);
          self.selectAll("circle").transition().duration(120).attr("fill", HOVER_COLOR);
          self
            .select("rect")
            .transition()
            .duration(120)
            .attr("stroke", HOVER_BORDER)
            .attr("fill", "rgba(255,255,255,0.05)");

          showTooltip(event, province);
        })
        .on("mousemove", function (event: any) {
          moveTooltip(event);
        })
        .on("mouseleave", function () {
          const groupKeys = findGroupKeys(archipelago.hcKey);
          g.selectAll<SVGPathElement, any>("path").each(function () {
            const element = d3.select(this);
            if (groupKeys.includes(element.attr("data-hc-key"))) {
              const index = parseInt(element.attr("data-index") || "0", 10);
              const province = findProvinceByKey(element.attr("data-hc-key"));
              element
                .transition()
                .duration(180)
                .attr("fill", province ? getGreyFill(index) : NULL_COLOR)
                .attr("stroke", DEFAULT_BORDER)
                .attr("stroke-width", 0.5);
            }
          });

          const self = d3.select(this);
          self.selectAll("circle").transition().duration(180).attr("fill", fill);
          self
            .select("rect")
            .transition()
            .duration(180)
            .attr("stroke", DEFAULT_BORDER)
            .attr("fill", "rgba(0,0,0,0.1)");
          hideTooltip();
        })
        .on("click", function () {
          if (findProvinceByKey(archipelago.hcKey)) {
            onProvinceClick(archipelago.hcKey);
          }
        });
    });

    paths
      .attr("opacity", 0)
      .transition()
      .duration(500)
      .delay((_feature: any, index: number) => index * 6)
      .attr("opacity", 1);
  }, [containerSize, geoData, getGreyFill, hideTooltip, language, metric, moveTooltip, onProvinceClick, provinces, showTooltip]);

  if (!geoData) {
    return (
      <div className="map-loading">
        <div className="skeleton" style={{ width: 280, height: 420 }} />
        <div className="map-loading-text">{t.loadingMap}</div>
      </div>
    );
  }

  const tooltipProvince = tooltipState.province;
  const tooltipHasData = tooltipProvince?.hasData !== false;
  const tooltipMetricValue = tooltipProvince
    ? tooltipHasData
      ? formatNumber(tooltipProvince[metric] as number)
      : t.noData
    : "";
  const tooltipStatValue = (value: number | undefined) =>
    tooltipHasData && value !== undefined ? formatNumber(value) : t.noData;

  return (
    <div ref={containerRef} className="map-svg-container">
      <div
        ref={tooltipRef}
        className="map-tooltip"
        style={{
          left: tooltipState.x,
          top: tooltipState.y,
          opacity: tooltipState.visible && tooltipProvince ? 1 : 0,
          pointerEvents: "none",
        }}
      >
        {tooltipProvince ? (
          <div className="map-tooltip-inner">
            <div className="map-tooltip-region">{tooltipProvince.region}</div>
            <div className="map-tooltip-name">{tooltipProvince.name}</div>
            <div className="map-tooltip-divider" />
            <div className="map-tooltip-metric">
              <span className="map-tooltip-metric-label">{t.metrics[metric]}</span>
              <span className="map-tooltip-metric-value">{tooltipMetricValue}</span>
            </div>
            <div className="map-tooltip-stats">
              <div className="map-tooltip-stat">
                <span className="map-tooltip-stat-icon">{t.quickVisitors}</span>
                <span>{tooltipStatValue(tooltipProvince.tourists_total)}</span>
              </div>
              <div className="map-tooltip-stat">
                <span className="map-tooltip-stat-icon">{t.quickHotels}</span>
                <span>{tooltipStatValue(tooltipProvince.hotels_count)}</span>
              </div>
              <div className="map-tooltip-stat">
                <span className="map-tooltip-stat-icon">{t.quickRooms}</span>
                <span>{tooltipStatValue(tooltipProvince.hotel_rooms_total)}</span>
              </div>
            </div>
            <div className="map-tooltip-hint">
              {tooltipHasData ? t.clickHint : t.noStats}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default VietnamMapD3;
