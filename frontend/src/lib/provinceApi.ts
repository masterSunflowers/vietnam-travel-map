export interface ProvinceLandmark {
  name: string;
  type: "nature" | "culture" | "beach" | "city" | "heritage" | "other";
  description: string;
}

export interface ProvinceData {
  id: string;
  hcKeys: string[];
  name: string;
  region: string;
  merged_from?: string;
  record_date?: string;
  citation_url?: string;
  hasData?: boolean;
  tourists_total: number;
  tourists_domestic: number;
  tourists_international: number;
  overnight_stays_total: number;
  hotels_count: number;
  hotel_rooms_total: number;
  landmarks: ProvinceLandmark[];
}

export interface DateOption {
  date: string;
  label_vi: string;
  label_short_vi?: string;
  label_monthly_vi?: string;
  label_en: string;
  label_short_en?: string;
  label_monthly_en?: string;
  is_latest: boolean;
  source: string;
  source_url: string;
  publication_title: string;
  publication_date: string;
  report_url: string;
}

export type MetricKey =
  | "tourists_total"
  | "tourists_domestic"
  | "tourists_international"
  | "overnight_stays_total"
  | "hotels_count"
  | "hotel_rooms_total";

export const metricLabels: Record<MetricKey, string> = {
  tourists_total: "Tổng lượt khách",
  tourists_domestic: "Khách nội địa",
  tourists_international: "Khách quốc tế",
  overnight_stays_total: "Khách lưu trú",
  hotels_count: "Số khách sạn",
  hotel_rooms_total: "Số phòng",
};

export const metricUnits: Record<MetricKey, string> = {
  tourists_total: "lượt khách",
  tourists_domestic: "lượt khách",
  tourists_international: "lượt khách",
  overnight_stays_total: "lượt",
  hotels_count: "cơ sở",
  hotel_rooms_total: "phòng",
};

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:8000";

export async function fetchAvailableDates(): Promise<DateOption[]> {
  const response = await fetch(`${apiBaseUrl}/provinces/stats/dates`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to load available dates: ${response.status}`);
  }

  const payload = (await response.json()) as DateOption[];
  return payload;
}

export async function fetchProvinceStats(
  date?: string,
  viewMode: "cumulative" | "monthly" = "cumulative"
): Promise<ProvinceData[]> {
  const params = new URLSearchParams();
  if (date) params.append("date", date);
  params.append("view_mode", viewMode);

  const url = `${apiBaseUrl}/provinces/stats/latest?${params.toString()}`;

  const response = await fetch(url, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to load province stats: ${response.status}`);
  }

  const payload = (await response.json()) as ProvinceData[];
  return payload;
}

export function getProvinceByKey(
  provinces: ProvinceData[],
  hcKey: string
): ProvinceData | undefined {
  return provinces.find((province) => province.hcKeys.includes(hcKey));
}

export function getProvinceGroupKeys(
  provinces: ProvinceData[],
  hcKey: string
): string[] {
  const province = getProvinceByKey(provinces, hcKey);
  return province ? province.hcKeys : [];
}

export function formatNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} triệu`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)} nghìn`;
  return value.toLocaleString("vi-VN");
}
