"use client";

import React, { createContext, useContext, useSyncExternalStore } from "react";
import { MetricKey } from "./provinceApi";

export type Language = "vi" | "en";

export interface Translations {
  appTitle: string;
  liveData: string;
  mapTab: string;
  verificationTab: string;
  timeFilter: string;
  cumulativeView: string;
  monthlyView: string;
  perspective: string;
  cumulativeBadge: string;
  monthlyBadge: string;
  sourceBannerTitle: string;
  sourceBannerDesc: string;
  viewVnatPortal: string;
  viewGsoPortal: string;
  viewOfficialPost: string;
  pubAgency: string;
  pubTitle: string;
  pubDate: string;
  searchPlaceholder: string;
  allProvincesCount: string;
  colNo: string;
  colProvince: string;
  colMergedFrom: string;
  colTotalTourists: string;
  colDomestic: string;
  colIntl: string;
  colIntlRatio: string;
  colOvernight: string;
  colHotels: string;
  colRooms: string;
  colProof: string;
  viewProof: string;
  tableScrollHint: string;
  noResultsFound: string;
  timePeriod: string;
  displayMetric: string;
  totalTourists: string;
  totalHotels: string;
  totalRooms: string;
  topProvince: string;
  visitorsSuffix: string;
  loadingData: string;
  loadingMap: string;
  loadError: string;
  backToMap: string;
  notableLandmarks: string;
  noLandmarks: string;
  clickHint: string;
  noData: string;
  noStats: string;
  quickVisitors: string;
  quickHotels: string;
  quickRooms: string;
  metrics: Record<MetricKey, string>;
  metricUnits: Record<MetricKey, string>;
  categories: Record<string, string>;
}

export const dictionaries: Record<Language, Translations> = {
  vi: {
    appTitle: "Bản đồ du lịch Việt Nam",
    liveData: "Dữ liệu trực tiếp",
    mapTab: "Bản đồ du lịch",
    verificationTab: "Tài liệu đối chứng",
    timeFilter: "Kỳ dữ liệu",
    cumulativeView: "Lũy kế",
    monthlyView: "Trong tháng",
    perspective: "Góc nhìn",
    cumulativeBadge: "SỐ LIỆU LŨY KẾ ĐẦU NĂM (YTD)",
    monthlyBadge: "SỐ LIỆU PHÁT SINH TRONG THÁNG",
    sourceBannerTitle: "Nguồn tài liệu & Báo cáo thống kê chính thức",
    sourceBannerDesc: "Số liệu được đối soát từ Cục Du lịch Quốc gia Việt Nam (VNAT) và Tổng cục Thống kê (GSO).",
    viewVnatPortal: "Cổng Thống kê VNAT",
    viewGsoPortal: "Cơ sở Dữ liệu Du lịch",
    viewOfficialPost: "Xem văn bản số liệu chính thức",
    pubAgency: "Cơ quan phát hành",
    pubTitle: "Ấn phẩm báo cáo",
    pubDate: "Ngày công bố",
    searchPlaceholder: "Tìm kiếm tỉnh / thành phố...",
    allProvincesCount: "tỉnh / thành phố",
    colNo: "STT",
    colProvince: "Tỉnh / Thành phố mới",
    colMergedFrom: "Đơn vị sáp nhập cấu thành",
    colTotalTourists: "Tổng lượt khách",
    colDomestic: "Khách nội địa",
    colIntl: "Khách quốc tế",
    colIntlRatio: "Tỷ lệ QT",
    colOvernight: "Khách lưu trú",
    colHotels: "Khách sạn",
    colRooms: "Số phòng",
    colProof: "Minh chứng",
    viewProof: "Kiểm chứng",
    tableScrollHint: "↔ Cuộn ngang để xem đủ 11 chỉ tiêu & minh chứng",
    noResultsFound: "Không tìm thấy tỉnh thành phù hợp với từ khóa.",
    timePeriod: "Thời gian thống kê",
    displayMetric: "Chỉ tiêu hiển thị",
    totalTourists: "Tổng lượt khách",
    totalHotels: "Tổng khách sạn",
    totalRooms: "Tổng số phòng",
    topProvince: "Tỉnh dẫn đầu",
    visitorsSuffix: "khách",
    loadingData: "Đang tải dữ liệu từ database...",
    loadingMap: "Đang tải bản đồ...",
    loadError: "Không thể tải dữ liệu tỉnh thành",
    backToMap: "Quay lại Bản đồ",
    notableLandmarks: "Địa Danh Nổi Bật",
    noLandmarks: "Chưa có dữ liệu địa danh cho khu vực này.",
    clickHint: "Nhấn để xem chi tiết",
    noData: "Không có dữ liệu",
    noStats: "Chưa có dữ liệu thống kê",
    quickVisitors: "Khách",
    quickHotels: "KS",
    quickRooms: "Phòng",
    metrics: {
      tourists_total: "Tổng lượt khách",
      tourists_domestic: "Khách nội địa",
      tourists_international: "Khách quốc tế",
      overnight_stays_total: "Khách lưu trú",
      hotels_count: "Số khách sạn",
      hotel_rooms_total: "Số phòng",
    },
    metricUnits: {
      tourists_total: "lượt khách",
      tourists_domestic: "lượt khách",
      tourists_international: "lượt khách",
      overnight_stays_total: "lượt",
      hotels_count: "cơ sở",
      hotel_rooms_total: "phòng",
    },
    categories: {
      nature: "Thiên nhiên",
      culture: "Văn hóa",
      beach: "Biển đảo",
      city: "Đô thị",
      heritage: "Di sản",
      other: "Khác",
    },
  },
  en: {
    appTitle: "Vietnam Travel Map",
    liveData: "Live Data",
    mapTab: "Travel Map",
    verificationTab: "Verification",
    timeFilter: "Period",
    cumulativeView: "Cumulative",
    monthlyView: "Monthly",
    perspective: "Perspective",
    cumulativeBadge: "CUMULATIVE YEAR-TO-DATE (YTD)",
    monthlyBadge: "SINGLE MONTH RECORD",
    sourceBannerTitle: "Official Data Sources & Statistical Releases",
    sourceBannerDesc: "Statistics cross-verified against official releases from VNAT and GSO.",
    viewVnatPortal: "VNAT Statistics Portal",
    viewGsoPortal: "Tourism Database Portal",
    viewOfficialPost: "View Official Release",
    pubAgency: "Issuing Agency",
    pubTitle: "Publication",
    pubDate: "Release Date",
    searchPlaceholder: "Search province / city...",
    allProvincesCount: "provinces",
    colNo: "No.",
    colProvince: "Merged Province",
    colMergedFrom: "Constituent Provinces",
    colTotalTourists: "Total Tourists",
    colDomestic: "Domestic",
    colIntl: "International",
    colIntlRatio: "Intl %",
    colOvernight: "Overnight Stays",
    colHotels: "Hotels",
    colRooms: "Rooms",
    colProof: "Proof",
    viewProof: "Verify",
    tableScrollHint: "↔ Scroll horizontally to view all 11 indicators & proof",
    noResultsFound: "No provinces match your search query.",
    timePeriod: "Statistical Period",
    displayMetric: "Display Metric",
    totalTourists: "Total Visitors",
    totalHotels: "Total Hotels",
    totalRooms: "Total Rooms",
    topProvince: "Leading Province",
    visitorsSuffix: "visitors",
    loadingData: "Loading data from database...",
    loadingMap: "Loading map...",
    loadError: "Failed to load province stats",
    backToMap: "Back to Map",
    notableLandmarks: "Notable Landmarks",
    noLandmarks: "No landmark data available for this province.",
    clickHint: "Click to view details",
    noData: "No data available",
    noStats: "No statistics available",
    quickVisitors: "Visitors",
    quickHotels: "Hotels",
    quickRooms: "Rooms",
    metrics: {
      tourists_total: "Total Visitors",
      tourists_domestic: "Domestic Visitors",
      tourists_international: "International Visitors",
      overnight_stays_total: "Overnight Stays",
      hotels_count: "Hotels Count",
      hotel_rooms_total: "Total Rooms",
    },
    metricUnits: {
      tourists_total: "visitors",
      tourists_domestic: "visitors",
      tourists_international: "visitors",
      overnight_stays_total: "stays",
      hotels_count: "properties",
      hotel_rooms_total: "rooms",
    },
    categories: {
      nature: "Nature",
      culture: "Culture",
      beach: "Beach",
      city: "City",
      heritage: "Heritage",
      other: "Other",
    },
  },
};

export function formatNumberLocale(value: number, lang: Language): string {
  if (lang === "en") {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
    return value.toLocaleString("en-US");
  }

  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} triệu`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)} nghìn`;
  return value.toLocaleString("vi-VN");
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  formatNumber: (value: number) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "vi",
  setLanguage: () => {},
  t: dictionaries.vi,
  formatNumber: (val: number) => formatNumberLocale(val, "vi"),
});

const STORAGE_KEY = "travel_view_lang";

let listeners: Array<() => void> = [];

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getSnapshot(): Language {
  if (typeof window === "undefined") return "vi";
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (saved === "vi" || saved === "en") return saved;
  } catch {
    // Ignore restricted storage access
  }
  return "vi";
}

function getServerSnapshot(): Language {
  return "vi";
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const language = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setLanguage = (lang: Language) => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Ignore
    }
    emitChange();
  };

  const t = dictionaries[language];
  const formatNumber = (value: number) => formatNumberLocale(value, language);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        formatNumber,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
