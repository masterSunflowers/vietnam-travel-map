BEGIN;

  SET search_path TO travel_view, public;

  WITH region_seed(name, code) AS (
    VALUES
      ('Đồng bằng sông Hồng', 'RSH'),
      ('Bắc Trung Bộ', 'RBT'),
      ('Duyên hải Nam Trung Bộ', 'RNT'),
      ('Đông Nam Bộ', 'RNB'),
      ('Đồng bằng sông Cửu Long', 'RCL'),
      ('Đông Bắc Bộ', 'RDB'),
      ('Tây Nguyên', 'RTN')
  ),
  upserted_regions AS (
    INSERT INTO travel_view.location(name, code, slug, level)
    SELECT rs.name, rs.code, lower(rs.code), 'region'
    FROM region_seed rs
    ON CONFLICT (code) DO UPDATE
      SET name = EXCLUDED.name
    RETURNING id, code
  ),
  province_seed(name, code, slug, hc_key, region_code, admin_center) AS (
    VALUES
      ('Thành phố Hà Nội', 'HN', 'ha-noi', 'VN01', 'RSH', 'Hà Nội'),
      ('Thành phố Hồ Chí Minh', 'HCM', 'ho-chi-minh', 'VN79', 'RNB', 'Hồ Chí Minh'),
      ('Thành phố Đà Nẵng', 'DN', 'da-nang', 'VN48', 'RNT', 'Đà Nẵng'),
      ('Tỉnh Khánh Hòa', 'KH', 'khanh-hoa', 'VN56', 'RNT', 'Nha Trang'),
      ('Thành phố Hải Phòng', 'HP', 'hai-phong', 'VN31', 'RSH', 'Hải Phòng'),
      ('Thành phố Huế', 'HUE', 'hue', 'VN46', 'RBT', 'Huế'),
      ('Thành phố Cần Thơ', 'CT', 'can-tho', 'VN92', 'RCL', 'Cần Thơ'),
      ('Tỉnh Quảng Ninh', 'QN', 'quang-ninh', 'VN22', 'RDB', 'Hạ Long'),
      ('Tỉnh Ninh Bình', 'NB', 'ninh-binh', 'VN37', 'RSH', 'Ninh Bình'),
      ('Tỉnh Lào Cai', 'LC', 'lao-cai', 'VN15', 'RDB', 'Lào Cai'),
      ('Tỉnh Cao Bằng', 'CB', 'cao-bang', 'VN04', 'RDB', 'Cao Bằng'),
      ('Tỉnh Lạng Sơn', 'LS', 'lang-son', 'VN20', 'RDB', 'Lạng Sơn'),
      ('Tỉnh Lai Châu', 'LCH', 'lai-chau', 'VN12', 'RDB', 'Lai Châu'),
      ('Tỉnh Điện Biên', 'DB', 'dien-bien', 'VN11', 'RDB', 'Điện Biên Phủ'),
      ('Tỉnh Sơn La', 'SL', 'son-la', 'VN14', 'RDB', 'Sơn La'),
      ('Tỉnh Tuyên Quang', 'TQ', 'tuyen-quang', 'VN08', 'RDB', 'Tuyên Quang'),
      ('Tỉnh Thái Nguyên', 'TNG', 'thai-nguyen', 'VN19', 'RDB', 'Thái Nguyên'),
      ('Tỉnh Phú Thọ', 'PT', 'phu-tho', 'VN25', 'RDB', 'Việt Trì'),
      ('Tỉnh Bắc Ninh', 'BN', 'bac-ninh', 'VN24', 'RSH', 'Bắc Giang'),
      ('Tỉnh Hưng Yên', 'HY', 'hung-yen', 'VN33', 'RSH', 'Hưng Yên'),
      ('Tỉnh Thanh Hóa', 'TH', 'thanh-hoa', 'VN38', 'RBT', 'Thanh Hóa'),
      ('Tỉnh Nghệ An', 'NA', 'nghe-an', 'VN40', 'RBT', 'Vinh'),
      ('Tỉnh Hà Tĩnh', 'HT', 'ha-tinh', 'VN42', 'RBT', 'Hà Tĩnh'),
      ('Tỉnh Quảng Trị', 'QT', 'quang-tri', 'VN44', 'RBT', 'Đồng Hới'),
      ('Tỉnh Quảng Ngãi', 'QNG', 'quang-ngai', 'VN51', 'RNT', 'Quảng Ngãi'),
      ('Tỉnh Gia Lai', 'GL', 'gia-lai', 'VN52', 'RTN', 'Quy Nhơn'),
      ('Tỉnh Đắk Lắk', 'DLK', 'dak-lak', 'VN66', 'RTN', 'Buôn Ma Thuột'),
      ('Tỉnh Lâm Đồng', 'LD', 'lam-dong', 'VN68', 'RTN', 'Đà Lạt'),
      ('Tỉnh Đồng Nai', 'DNA', 'dong-nai', 'VN75', 'RNB', 'Biên Hòa'),
      ('Tỉnh Tây Ninh', 'TN', 'tay-ninh', 'VN80', 'RNB', 'Tân An'),
      ('Tỉnh Vĩnh Long', 'VL', 'vinh-long', 'VN86', 'RCL', 'Vĩnh Long'),
      ('Tỉnh Đồng Tháp', 'DT', 'dong-thap', 'VN82', 'RCL', 'Mỹ Tho'),
      ('Tỉnh Cà Mau', 'CM', 'ca-mau', 'VN96', 'RCL', 'Cà Mau'),
      ('Tỉnh An Giang', 'AG', 'an-giang', 'VN91', 'RCL', 'Long Xuyên')
  ),
  upserted_provinces AS (
    INSERT INTO travel_view.location(name, code, slug, level, parent_id, hc_key, admin_center)
    SELECT
      ps.name,
      ps.code,
      ps.slug,
      'province',
      ur.id,
      ps.hc_key,
      ps.admin_center
    FROM province_seed ps
    JOIN upserted_regions ur
      ON ur.code = ps.region_code
    ON CONFLICT (code) DO UPDATE
      SET name = EXCLUDED.name,
          slug = EXCLUDED.slug,
          level = EXCLUDED.level,
          parent_id = EXCLUDED.parent_id,
          hc_key = EXCLUDED.hc_key,
          admin_center = EXCLUDED.admin_center
    RETURNING id, code
  )
  DELETE FROM travel_view.landmark
  WHERE location_id IN (SELECT id FROM upserted_provinces);

  WITH province_ids AS (
    SELECT id, code
    FROM travel_view.location
    WHERE level = 'province'
      AND code IN (
        'HN', 'HCM', 'DN', 'KH', 'HP', 'HUE', 'CT', 'QN', 'NB', 'LC',
        'CB', 'LS', 'LCH', 'DB', 'SL', 'TQ', 'TNG', 'PT', 'BN', 'HY',
        'TH', 'NA', 'HT', 'QT', 'QNG', 'GL', 'DLK', 'LD', 'DNA', 'TN',
        'VL', 'DT', 'CM', 'AG'
      )
  )
  DELETE FROM travel_view.statistic
  WHERE location_id IN (SELECT id FROM province_ids);

  WITH stats_seed(code, record_date, tourists_total, tourists_domestic, tourists_international, overnight_stays_total,
  hotels_count, hotel_rooms_total) AS (
    VALUES
      ('HN', DATE '2026-03-01', 2850000, 1650000, 1200000, 5680000, 2400, 42000),
      ('HCM', DATE '2026-03-01', 4938000, 3005000, 1933000, 9522000, 3698, 67550),
      ('DN', DATE '2026-03-01', 2800000, 1500000, 1300000, 5350000, 1410, 29500),
      ('KH', DATE '2026-03-01', 1528000, 938000, 590000, 2825000, 782, 16840),
      ('HP', DATE '2026-03-01', 668000, 535000, 133000, 978000, 340, 6340),
      ('HUE', DATE '2026-03-01', 890000, 545000, 345000, 1420000, 420, 8200),
      ('CT', DATE '2026-03-01', 663000, 575000, 88000, 953000, 249, 4180),
      ('QN', DATE '2026-03-01', 1420000, 890000, 530000, 2340000, 580, 12500),
      ('NB', DATE '2026-03-01', 1003000, 769000, 234000, 1530000, 398, 6950),
      ('LC', DATE '2026-03-01', 855000, 650000, 205000, 1265000, 410, 6150),
      ('DLK', DATE '2026-03-01', 490000, 435000, 55000, 682000, 183, 2550),
      ('DNA', DATE '2026-03-01', 357000, 335000, 22000, 490000, 127, 1710),
      ('AG', DATE '2026-03-01', 1165000, 875000, 290000, 1900000, 558, 10850)
  )
  INSERT INTO travel_view.statistic(
    location_id,
    record_date,
    tourists_total,
    tourists_domestic,
    tourists_international,
    overnight_stays_total,
    hotels_count,
    hotel_rooms_total
  )
  SELECT
    l.id,
    ss.record_date,
    ss.tourists_total,
    ss.tourists_domestic,
    ss.tourists_international,
    ss.overnight_stays_total,
    ss.hotels_count,
    ss.hotel_rooms_total
  FROM stats_seed ss
  JOIN travel_view.location l
    ON l.code = ss.code;

  WITH landmark_seed(code, name, category, description) AS (
    VALUES
      ('HN', 'Hoan Kiem Lake', 'culture', 'Historic lake and cultural center of Ha Noi'),
      ('HCM', 'Ben Thanh Market', 'city', 'Iconic market in central Ho Chi Minh City'),
      ('DN', 'Golden Bridge', 'culture', 'Bridge in Ba Na Hills with giant stone hands'),
      ('KH', 'Nha Trang Bay', 'beach', 'Coastal bay known for clear blue water'),
      ('HP', 'Cat Ba Island', 'nature', 'Island and national park area near Hai Phong'),
      ('HUE', 'Imperial Citadel', 'heritage', 'UNESCO complex in former imperial capital'),
      ('CT', 'Cai Rang Floating Market', 'culture', 'Traditional floating market in Mekong'),
      ('QN', 'Ha Long Bay', 'heritage', 'UNESCO world heritage bay'),
      ('NB', 'Trang An Landscape Complex', 'heritage', 'Boat cave system and limestone landscapes'),
      ('LC', 'Sapa Town', 'city', 'Mountain tourism center in northern Vietnam'),
      ('DLK', 'Yok Don National Park', 'nature', 'Large dry forest reserve in Central Highlands'),
      ('DNA', 'Cat Tien National Park', 'nature', 'Biodiversity hotspot in southern Vietnam'),
      ('AG', 'Sam Mountain', 'culture', 'Religious and cultural destination in An Giang')
  )
 INSERT INTO travel_view.landmark(location_id, name, category, description)
  SELECT
    l.id,
    ls.name,
    ls.category::text::travel_view.landmarkcategory,
    ls.description
  FROM landmark_seed ls
  JOIN travel_view.location l
    ON l.code = ls.code;

  COMMIT;


    BEGIN;

  SET search_path TO travel_view, public;
  SELECT setseed(0.20260424); -- deterministic random values

  WITH provinces AS (
    SELECT id, name, row_number() OVER (ORDER BY name) AS rn
    FROM travel_view.location
    WHERE level = 'province'
  ),
  deleted_stats AS (
    DELETE FROM travel_view.statistic s
    USING provinces p
    WHERE s.location_id = p.id
    RETURNING s.id
  ),
  deleted_landmarks AS (
    DELETE FROM travel_view.landmark l
    USING provinces p
    WHERE l.location_id = p.id
    RETURNING l.id
  )
  SELECT 1;

  WITH provinces AS (
    SELECT id, name, row_number() OVER (ORDER BY name) AS rn
    FROM travel_view.location
    WHERE level = 'province'
  )
  INSERT INTO travel_view.statistic (
    location_id,
    record_date,
    tourists_total,
    tourists_domestic,
    tourists_international,
    overnight_stays_total,
    hotels_count,
    hotel_rooms_total,
    overnight_stays_domestic,
    overnight_stays_international,
    hotel_guests,
    hotel_overnight_stays,
    hotel_rooms_available,
    hotel_rooms_occupied
  )
  SELECT
    p.id,
    DATE '2026-04-01',
    t.total,
    (t.total * 0.72)::int,
    (t.total * 0.28)::int,
    (t.total * (1.75 + random() * 0.65))::int,
    (80 + p.rn * 14 + (random() * 70)::int),
    (900 + p.rn * 260 + (random() * 1200)::int),
    (t.total * 0.72 * (1.3 + random() * 0.4))::int,
    (t.total * 0.28 * (1.6 + random() * 0.5))::int,
    (t.total * (0.42 + random() * 0.22))::int,
    (t.total * (0.95 + random() * 0.45))::int,
    (1000 + p.rn * 280 + (random() * 1300)::int),
    (700 + p.rn * 180 + (random() * 900)::int)
  FROM provinces p
  CROSS JOIN LATERAL (
    SELECT (220000 + p.rn * 115000 + (random() * 180000)::int)::int AS total
  ) t;

  WITH provinces AS (
    SELECT id, name, row_number() OVER (ORDER BY name) AS rn
    FROM travel_view.location
    WHERE level = 'province'
  )
  INSERT INTO travel_view.landmark (location_id, name, category, description)
  SELECT
    p.id,
    'Điểm đến tiêu biểu - ' || p.name,
    CASE (p.rn % 6)
      WHEN 0 THEN 'nature'
      WHEN 1 THEN 'culture'
      WHEN 2 THEN 'beach'
      WHEN 3 THEN 'city'
      WHEN 4 THEN 'heritage'
      ELSE 'other'
    END::text::travel_view.landmarkcategory,
    'Dữ liệu giả lập phục vụ test bản đồ cho ' || p.name
  FROM provinces p;

  COMMIT;
