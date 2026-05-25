const fs = require('fs');
const path = require('path');
let content = fs.readFileSync(path.join(__dirname, 'src/lib/provinceData.ts'), 'utf8');

const replacements = {
  '"Red River Delta"': '"Đồng bằng sông Hồng"',
  '"Southeast"': '"Đông Nam Bộ"',
  '"South Central Coast"': '"Duyên hải Nam Trung Bộ"',
  '"Mekong Delta"': '"Đồng bằng sông Cửu Long"',
  '"North Central"': '"Bắc Trung Bộ"',
  '"Northeast"': '"Đông Bắc Bộ"',
  '"Central Highlands"': '"Tây Nguyên"',
  '"Northwest"': '"Tây Bắc Bộ"',
  'tourists_total: "Total Tourists"': 'tourists_total: "Tổng Lượt Khách"',
  'tourists_domestic: "Domestic Tourists"': 'tourists_domestic: "Khách Nội Địa"',
  'tourists_international: "International Tourists"': 'tourists_international: "Khách Quốc Tế"',
  'overnight_stays_total: "Overnight Stays"': 'overnight_stays_total: "Khách Lưu Trú"',
  'hotels_count: "Hotels"': 'hotels_count: "Số Khách Sạn"',
  'hotel_rooms_total: "Hotel Rooms"': 'hotel_rooms_total: "Số Phòng"',
  'tourists_total: "visitors"': 'tourists_total: "lượt khách"',
  'tourists_domestic: "visitors"': 'tourists_domestic: "lượt khách"',
  'tourists_international: "visitors"': 'tourists_international: "lượt khách"',
  'overnight_stays_total: "nights"': 'overnight_stays_total: "lượt"',
  'hotels_count: "properties"': 'hotels_count: "cơ sở"',
  'hotel_rooms_total: "rooms"': 'hotel_rooms_total: "phòng"'
};

for (const [key, value] of Object.entries(replacements)) {
  content = content.split(key).join(value);
}

fs.writeFileSync(path.join(__dirname, 'src/lib/provinceData.ts'), content);
console.log('Done');
