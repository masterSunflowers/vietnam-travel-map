"use client";

import React from "react";
import { MetricKey, metricLabels } from "@/lib/provinceApi";

interface MetricSelectorProps {
  selected: MetricKey;
  onChange: (metric: MetricKey) => void;
}

const metrics: MetricKey[] = [
  "tourists_total",
  "tourists_domestic",
  "tourists_international",
  "overnight_stays_total",
  "hotels_count",
  "hotel_rooms_total",
];

const MetricSelector: React.FC<MetricSelectorProps> = ({
  selected,
  onChange,
}) => {
  return (
    <div style={{ padding: "8px 0" }}>
      <select 
        value={selected} 
        onChange={(e) => onChange(e.target.value as MetricKey)}
        className="metric-dropdown"
      >
        {metrics.map((m) => (
          <option key={m} value={m}>
            {metricLabels[m]}
          </option>
        ))}
      </select>
    </div>
  );
};

export default MetricSelector;
