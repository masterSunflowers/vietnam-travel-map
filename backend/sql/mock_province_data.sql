-- Run migrations first:
--   alembic upgrade head
BEGIN;

CREATE SCHEMA IF NOT EXISTS travel_view;
SET search_path TO travel_view, public;

WITH region_seed(name, code) AS (
  VALUES
    ('Dong bang song Hong', 'RSH'),
    ('Bac Trung Bo', 'RBT'),
    ('Duyen hai Nam Trung Bo', 'RNT'),
    ('Dong Nam Bo', 'RNB'),
    ('Dong bang song Cuu Long', 'RCL'),
    ('Dong Bac Bo', 'RDB'),
    ('Tay Nguyen', 'RTN')
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
    ('Thanh pho Ha Noi', 'HN', 'ha-noi', 'VN01', 'RSH', 'Ha Noi'),
    ('Thanh pho Ho Chi Minh', 'HCM', 'ho-chi-minh', 'VN79', 'RNB', 'Ho Chi Minh'),
    ('Thanh pho Da Nang', 'DN', 'da-nang', 'VN48', 'RNT', 'Da Nang'),
    ('Tinh Khanh Hoa', 'KH', 'khanh-hoa', 'VN56', 'RNT', 'Nha Trang'),
    ('Thanh pho Hai Phong', 'HP', 'hai-phong', 'VN31', 'RSH', 'Hai Phong'),
    ('Thanh pho Hue', 'HUE', 'hue', 'VN46', 'RBT', 'Hue'),
    ('Thanh pho Can Tho', 'CT', 'can-tho', 'VN92', 'RCL', 'Can Tho'),
    ('Tinh Quang Ninh', 'QN', 'quang-ninh', 'VN22', 'RDB', 'Ha Long'),
    ('Tinh Ninh Binh', 'NB', 'ninh-binh', 'VN37', 'RSH', 'Ninh Binh'),
    ('Tinh Lao Cai', 'LC', 'lao-cai', 'VN15', 'RDB', 'Lao Cai'),
    ('Tinh Dak Lak', 'DLK', 'dak-lak', 'VN66', 'RTN', 'Buon Ma Thuot'),
    ('Tinh Dong Nai', 'DNA', 'dong-nai', 'VN75', 'RNB', 'Bien Hoa'),
    ('Tinh An Giang', 'AG', 'an-giang', 'VN91', 'RCL', 'Long Xuyen')
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
    AND code IN ('HN', 'HCM', 'DN', 'KH', 'HP', 'HUE', 'CT', 'QN', 'NB', 'LC', 'DLK', 'DNA', 'AG')
)
DELETE FROM travel_view.statistic
WHERE location_id IN (SELECT id FROM province_ids);

WITH stats_seed(code, record_date, tourists_total, tourists_domestic, tourists_international, overnight_stays_total, hotels_count, hotel_rooms_total) AS (
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
  ls.category::landmarkcategory,
  ls.description
FROM landmark_seed ls
JOIN travel_view.location l
  ON l.code = ls.code;

COMMIT;
