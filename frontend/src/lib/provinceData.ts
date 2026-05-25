// Mock tourism data for the 34-province structure of Vietnam (as of 2025 reorganization)
// hc-key values match the Highcharts topo.json for vn-all

export interface ProvinceLandmark {
  name: string;
  type: "nature" | "culture" | "beach" | "city" | "heritage";
  description: string;
}

export interface ProvinceData {
  id: string;
  hcKeys: string[];
  name: string;
  region: string;
  tourists_total: number;
  tourists_domestic: number;
  tourists_international: number;
  overnight_stays_total: number;
  hotels_count: number;
  hotel_rooms_total: number;
  landmarks: ProvinceLandmark[];
}

export type MetricKey =
  | "tourists_total"
  | "tourists_domestic"
  | "tourists_international"
  | "overnight_stays_total"
  | "hotels_count"
  | "hotel_rooms_total";

export const metricLabels: Record<MetricKey, string> = {
  tourists_total: "Tổng Lượt Khách",
  tourists_domestic: "Khách Nội Địa",
  tourists_international: "Khách Quốc Tế",
  overnight_stays_total: "Khách Lưu Trú",
  hotels_count: "Số Khách Sạn",
  hotel_rooms_total: "Số Phòng",
};

export const metricUnits: Record<MetricKey, string> = {
  tourists_total: "lượt khách",
  tourists_domestic: "lượt khách",
  tourists_international: "lượt khách",
  overnight_stays_total: "lượt",
  hotels_count: "cơ sở",
  hotel_rooms_total: "phòng",
};

// Data based on the 34-province reorganization (Resolution 202/2025/QH15)
export const provinces: ProvinceData[] = [
  {
    id: "hanoi",
    hcKeys: ["VN01"],
    name: "Thành phố Hà Nội",
    region: "Đồng bằng sông Hồng",
    tourists_total: 2850000,
    tourists_domestic: 1650000,
    tourists_international: 1200000,
    overnight_stays_total: 5680000,
    hotels_count: 2400,
    hotel_rooms_total: 42000,
    landmarks: [
      { name: "Hoàn Kiếm Lake", type: "culture", description: "Iconic lake in the heart of old Hà Nội with the Turtle Tower" },
      { name: "Old Quarter", type: "city", description: "Ancient 36 streets district bustling with shops and colonial architecture" },
    ],
  },
  {
    id: "hcmc",
    hcKeys: ["VN79"],
    name: "Thành phố Hồ Chí Minh",
    region: "Đông Nam Bộ",
    tourists_total: 4938000,
    tourists_domestic: 3005000,
    tourists_international: 1933000,
    overnight_stays_total: 9522000,
    hotels_count: 3698,
    hotel_rooms_total: 67550,
    landmarks: [
      { name: "Bến Thành Market", type: "city", description: "Iconic central market and symbol of the city" },
      { name: "Côn Đảo Islands", type: "nature", description: "Pristine archipelago with turquoise waters" },
    ],
  },
  {
    id: "haiphong",
    hcKeys: ["VN31"],
    name: "Thành phố Hải Phòng",
    region: "Đồng bằng sông Hồng",
    tourists_total: 668000,
    tourists_domestic: 535000,
    tourists_international: 133000,
    overnight_stays_total: 978000,
    hotels_count: 340,
    hotel_rooms_total: 6340,
    landmarks: [
      { name: "Cát Bà Island", type: "nature", description: "National park island with diverse ecosystems" },
    ],
  },
  {
    id: "danang",
    hcKeys: ["VN48"],
    name: "Thành phố Đà Nẵng",
    region: "Duyên hải Nam Trung Bộ",
    tourists_total: 2800000,
    tourists_domestic: 1500000,
    tourists_international: 1300000,
    overnight_stays_total: 5350000,
    hotels_count: 1410,
    hotel_rooms_total: 29500,
    landmarks: [
      { name: "Golden Bridge", type: "culture", description: "Iconic bridge held by giant stone hands" },
      { name: "Hội An Ancient Town", type: "heritage", description: "UNESCO World Heritage Site" },
      { name: "Hoàng Sa Archipelago", type: "nature", description: "Integral island territory of Vietnam" },
    ],
  },
  {
    id: "cantho",
    hcKeys: ["VN92"],
    name: "Thành phố Cần Thơ",
    region: "Đồng bằng sông Cửu Long",
    tourists_total: 663000,
    tourists_domestic: 575000,
    tourists_international: 88000,
    overnight_stays_total: 953000,
    hotels_count: 249,
    hotel_rooms_total: 4180,
    landmarks: [
      { name: "Cái Răng Floating Market", type: "culture", description: "The most famous floating market in the Mekong Delta" },
    ],
  },
  {
    id: "hue",
    hcKeys: ["VN46"],
    name: "Thành phố Huế",
    region: "Bắc Trung Bộ",
    tourists_total: 890000,
    tourists_domestic: 545000,
    tourists_international: 345000,
    overnight_stays_total: 1420000,
    hotels_count: 420,
    hotel_rooms_total: 8200,
    landmarks: [
      { name: "Imperial Citadel", type: "heritage", description: "UNESCO World Heritage Site, the former imperial capital" },
    ],
  },
  {
    id: "laocai",
    hcKeys: ["VN15"],
    name: "Tỉnh Lào Cai",
    region: "Đông Bắc Bộ",
    tourists_total: 855000,
    tourists_domestic: 650000,
    tourists_international: 205000,
    overnight_stays_total: 1265000,
    hotels_count: 410,
    hotel_rooms_total: 6150,
    landmarks: [
      { name: "Sapa Town", type: "city", description: "Famous highland town with terraced rice fields" },
      { name: "Mù Cang Chải", type: "nature", description: "Breathtaking rice terraces" },
    ],
  },
  {
    id: "thainguyen",
    hcKeys: ["VN19"],
    name: "Tỉnh Thái Nguyên",
    region: "Đông Bắc Bộ",
    tourists_total: 352000,
    tourists_domestic: 326000,
    tourists_international: 26000,
    overnight_stays_total: 483000,
    hotels_count: 130,
    hotel_rooms_total: 1730,
    landmarks: [
      { name: "Ba Bể Lake", type: "nature", description: "One of the largest natural lakes in Vietnam" },
    ],
  },
  {
    id: "phutho",
    hcKeys: ["VN25"],
    name: "Tỉnh Phú Thọ",
    region: "Đông Bắc Bộ",
    tourists_total: 584000,
    tourists_domestic: 547000,
    tourists_international: 37000,
    overnight_stays_total: 795000,
    hotels_count: 230,
    hotel_rooms_total: 3100,
    landmarks: [
      { name: "Hùng Kings Temple", type: "heritage", description: "Sacred temple honoring the founders of Vietnam" },
      { name: "Mai Châu Valley", type: "nature", description: "Peaceful valley" },
    ],
  },
  {
    id: "bacninh",
    hcKeys: ["VN24"],
    name: "Tỉnh Bắc Ninh",
    region: "Đồng bằng sông Hồng",
    tourists_total: 310000,
    tourists_domestic: 292000,
    tourists_international: 18000,
    overnight_stays_total: 413000,
    hotels_count: 117,
    hotel_rooms_total: 1560,
    landmarks: [
      { name: "Bút Tháp Pagoda", type: "culture", description: "Ancient pagoda famous for its architecture" },
    ],
  },
  {
    id: "hungyen",
    hcKeys: ["VN33"],
    name: "Tỉnh Hưng Yên",
    region: "Đồng bằng sông Hồng",
    tourists_total: 240000,
    tourists_domestic: 228000,
    tourists_international: 12000,
    overnight_stays_total: 320000,
    hotels_count: 80,
    hotel_rooms_total: 1050,
    landmarks: [],
  },
  {
    id: "ninhbinh",
    hcKeys: ["VN37"],
    name: "Tỉnh Ninh Bình",
    region: "Đồng bằng sông Hồng",
    tourists_total: 1003000,
    tourists_domestic: 769000,
    tourists_international: 234000,
    overnight_stays_total: 1530000,
    hotels_count: 398,
    hotel_rooms_total: 6950,
    landmarks: [
      { name: "Tràng An Complex", type: "heritage", description: "UNESCO World Heritage Site with rivers and caves" },
    ],
  },
  {
    id: "quangtri",
    hcKeys: ["VN44"],
    name: "Tỉnh Quảng Trị",
    region: "Bắc Trung Bộ",
    tourists_total: 688000,
    tourists_domestic: 528000,
    tourists_international: 160000,
    overnight_stays_total: 1072000,
    hotels_count: 278,
    hotel_rooms_total: 4980,
    landmarks: [
      { name: "Phong Nha-Kẻ Bàng", type: "heritage", description: "World's largest cave systems" },
      { name: "Vĩnh Mốc Tunnels", type: "heritage", description: "Underground tunnel system from the war" },
    ],
  },
  {
    id: "quangngai",
    hcKeys: ["VN51"],
    name: "Tỉnh Quảng Ngãi",
    region: "Duyên hải Nam Trung Bộ",
    tourists_total: 330000,
    tourists_domestic: 295000,
    tourists_international: 35000,
    overnight_stays_total: 454000,
    hotels_count: 116,
    hotel_rooms_total: 1560,
    landmarks: [
      { name: "Lý Sơn Island", type: "nature", description: "Volcanic island with unique garlic fields" },
    ],
  },
  {
    id: "gialai",
    hcKeys: ["VN52"],
    name: "Tỉnh Gia Lai",
    region: "Tây Nguyên",
    tourists_total: 453000,
    tourists_domestic: 403000,
    tourists_international: 50000,
    overnight_stays_total: 630000,
    hotels_count: 163,
    hotel_rooms_total: 2280,
    landmarks: [
      { name: "Quy Nhơn Beach", type: "beach", description: "Emerging beach destination" },
    ],
  },
  {
    id: "khanhhoa",
    hcKeys: ["VN56"],
    name: "Tỉnh Khánh Hòa",
    region: "Duyên hải Nam Trung Bộ",
    tourists_total: 1528000,
    tourists_domestic: 938000,
    tourists_international: 590000,
    overnight_stays_total: 2825000,
    hotels_count: 782,
    hotel_rooms_total: 16840,
    landmarks: [
      { name: "Nha Trang Bay", type: "beach", description: "World-famous bay with crystal clear waters" },
      { name: "Trường Sa Archipelago", type: "nature", description: "Sacred island territory of Vietnam" },
    ],
  },
  {
    id: "lamdong",
    hcKeys: ["VN68"],
    name: "Tỉnh Lâm Đồng",
    region: "Tây Nguyên",
    tourists_total: 2072000,
    tourists_domestic: 1544000,
    tourists_international: 528000,
    overnight_stays_total: 3485000,
    hotels_count: 1098,
    hotel_rooms_total: 22790,
    landmarks: [
      { name: "Đà Lạt City", type: "city", description: "The City of Eternal Spring" },
      { name: "Mũi Né Sand Dunes", type: "nature", description: "Stunning red and white sand dunes" },
    ],
  },
  {
    id: "daklak",
    hcKeys: ["VN66"],
    name: "Tỉnh Đắk Lắk",
    region: "Tây Nguyên",
    tourists_total: 490000,
    tourists_domestic: 435000,
    tourists_international: 55000,
    overnight_stays_total: 682000,
    hotels_count: 183,
    hotel_rooms_total: 2550,
    landmarks: [
      { name: "Buôn Ma Thuột Coffee", type: "culture", description: "Coffee capital of Vietnam" },
      { name: "Gành Đá Đĩa", type: "nature", description: "Unique basalt rock columns" },
    ],
  },
  {
    id: "dongnai",
    hcKeys: ["VN75"],
    name: "Tỉnh Đồng Nai",
    region: "Đông Nam Bộ",
    tourists_total: 357000,
    tourists_domestic: 335000,
    tourists_international: 22000,
    overnight_stays_total: 490000,
    hotels_count: 127,
    hotel_rooms_total: 1710,
    landmarks: [
      { name: "Cát Tiên National Park", type: "nature", description: "UNESCO Biosphere Reserve" },
    ],
  },
  {
    id: "tayninh",
    hcKeys: ["VN80"],
    name: "Tỉnh Tây Ninh",
    region: "Đông Nam Bộ",
    tourists_total: 433000,
    tourists_domestic: 405000,
    tourists_international: 28000,
    overnight_stays_total: 588000,
    hotels_count: 133,
    hotel_rooms_total: 1790,
    landmarks: [
      { name: "Bà Đen Mountain", type: "nature", description: "Highest peak in southern Vietnam" },
    ],
  },
  {
    id: "vinhlong",
    hcKeys: ["VN86"],
    name: "Tỉnh Vĩnh Long",
    region: "Đồng bằng sông Cửu Long",
    tourists_total: 458000,
    tourists_domestic: 412000,
    tourists_international: 46000,
    overnight_stays_total: 629000,
    hotels_count: 138,
    hotel_rooms_total: 1830,
    landmarks: [
      { name: "Coconut Kingdom", type: "nature", description: "Lush coconut groves" },
    ],
  },
  {
    id: "dongthap",
    hcKeys: ["VN82"],
    name: "Tỉnh Đồng Tháp",
    region: "Đồng bằng sông Cửu Long",
    tourists_total: 453000,
    tourists_domestic: 390000,
    tourists_international: 63000,
    overnight_stays_total: 622000,
    hotels_count: 144,
    hotel_rooms_total: 1940,
    landmarks: [
      { name: "Mỹ Tho Floating Market", type: "culture", description: "Colorful river market" },
    ],
  },
  {
    id: "camau",
    hcKeys: ["VN96"],
    name: "Tỉnh Cà Mau",
    region: "Đồng bằng sông Cửu Long",
    tourists_total: 273000,
    tourists_domestic: 250000,
    tourists_international: 23000,
    overnight_stays_total: 377000,
    hotels_count: 86,
    hotel_rooms_total: 1130,
    landmarks: [
      { name: "Cà Mau Cape", type: "nature", description: "Southernmost point of Vietnam" },
    ],
  },
  {
    id: "angiang",
    hcKeys: ["VN91"],
    name: "Tỉnh An Giang",
    region: "Đồng bằng sông Cửu Long",
    tourists_total: 1165000,
    tourists_domestic: 875000,
    tourists_international: 290000,
    overnight_stays_total: 1900000,
    hotels_count: 558,
    hotel_rooms_total: 10850,
    landmarks: [
      { name: "Phú Quốc Island", type: "beach", description: "World-class resort island" },
      { name: "Sam Mountain", type: "culture", description: "Sacred mountain with temples" },
    ],
  },
  { id: "laichau", hcKeys: ["VN12"], name: "Tỉnh Lai Châu", region: "Tây Bắc Bộ", tourists_total: 95000, tourists_domestic: 88000, tourists_international: 7000, overnight_stays_total: 132000, hotels_count: 35, hotel_rooms_total: 450, landmarks: [] },
  { id: "dienbien", hcKeys: ["VN11"], name: "Tỉnh Điện Biên", region: "Tây Bắc Bộ", tourists_total: 185000, tourists_domestic: 165000, tourists_international: 20000, overnight_stays_total: 256000, hotels_count: 68, hotel_rooms_total: 920, landmarks: [{ name: "Điện Biên Phủ", type: "heritage", description: "Historic battlefield" }] },
  { id: "sonla", hcKeys: ["VN14"], name: "Tỉnh Sơn La", region: "Tây Bắc Bộ", tourists_total: 165000, tourists_domestic: 152000, tourists_international: 13000, overnight_stays_total: 228000, hotels_count: 58, hotel_rooms_total: 780, landmarks: [{ name: "Mộc Châu", type: "nature", description: "Scenic highland" }] },
  { id: "langson", hcKeys: ["VN20"], name: "Tỉnh Lạng Sơn", region: "Đông Bắc Bộ", tourists_total: 198000, tourists_domestic: 178000, tourists_international: 20000, overnight_stays_total: 270000, hotels_count: 92, hotel_rooms_total: 1300, landmarks: [] },
  { id: "quangninh", hcKeys: ["VN22"], name: "Tỉnh Quảng Ninh", region: "Đông Bắc Bộ", tourists_total: 1420000, tourists_domestic: 890000, tourists_international: 530000, overnight_stays_total: 2340000, hotels_count: 580, hotel_rooms_total: 12500, landmarks: [{ name: "Hạ Long Bay", type: "heritage", description: "UNESCO World Heritage Site" }] },
  { id: "thanhhoa", hcKeys: ["VN38"], name: "Tỉnh Thanh Hóa", region: "Bắc Trung Bộ", tourists_total: 465000, tourists_domestic: 410000, tourists_international: 55000, overnight_stays_total: 680000, hotels_count: 195, hotel_rooms_total: 3400, landmarks: [{ name: "Sầm Sơn", type: "beach", description: "Popular beach resort" }] },
  { id: "nghean", hcKeys: ["VN40"], name: "Tỉnh Nghệ An", region: "Bắc Trung Bộ", tourists_total: 385000, tourists_domestic: 348000, tourists_international: 37000, overnight_stays_total: 545000, hotels_count: 165, hotel_rooms_total: 2800, landmarks: [{ name: "Kim Liên", type: "heritage", description: "Birthplace of Ho Chi Minh" }] },
  { id: "hatinh", hcKeys: ["VN42"], name: "Tỉnh Hà Tĩnh", region: "Bắc Trung Bộ", tourists_total: 195000, tourists_domestic: 178000, tourists_international: 17000, overnight_stays_total: 268000, hotels_count: 72, hotel_rooms_total: 960, landmarks: [] },
  { id: "caobang", hcKeys: ["VN04"], name: "Tỉnh Cao Bằng", region: "Đông Bắc Bộ", tourists_total: 195000, tourists_domestic: 172000, tourists_international: 23000, overnight_stays_total: 280000, hotels_count: 85, hotel_rooms_total: 1200, landmarks: [{ name: "Bản Giốc Waterfall", type: "nature", description: "Largest waterfall in SE Asia" }] },
  {
    id: "tuyenquang",
    hcKeys: ["VN08"],
    name: "Tỉnh Tuyên Quang",
    region: "Đông Bắc Bộ",
    tourists_total: 453000,
    tourists_domestic: 403000,
    tourists_international: 50000,
    overnight_stays_total: 643000,
    hotels_count: 184,
    hotel_rooms_total: 2690,
    landmarks: [
      { name: "Đồng Văn Karst Plateau", type: "nature", description: "UNESCO Geopark" },
      { name: "Na Hang Lake", type: "nature", description: "Scenic emerald lake" },
    ],
  },
];

// Helper: get province by any of its hc-keys
export function getProvinceByKey(hcKey: string): ProvinceData | undefined {
  return provinces.find((p) => p.hcKeys.includes(hcKey));
}

// Helper: get map series data for a specific metric
// Returns an array of [hc-key, value] for ALL original 63 regions
export function getMapSeriesData(metric: MetricKey): [string, number][] {
  const data: [string, number][] = [];
  provinces.forEach((p) => {
    p.hcKeys.forEach((key) => {
      data.push([key, p[metric] as number]);
    });
  });
  return data;
}

// Helper: get all sibling hc-keys for a province group (for grouped hover)
export function getProvinceGroupKeys(hcKey: string): string[] {
  const province = getProvinceByKey(hcKey);
  return province ? province.hcKeys : [];
}

// Helper: format large numbers
export function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + " Triệu";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + " Nghìn";
  return n.toString();
}
