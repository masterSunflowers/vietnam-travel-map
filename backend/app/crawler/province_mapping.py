"""
Province mapping configuration.
Maps each of the 63 traditional Vietnamese provinces/cities to one of the 34 merged provinces.
"""

# Mapping of the 34 merged province codes to their metadata
MERGED_PROVINCES: dict[str, dict] = {
    "HN": {"name": "Thành phố Hà Nội", "hc_key": "VN01", "sub_provinces": ["Hà Nội"]},
    "HCM": {
        "name": "Thành phố Hồ Chí Minh",
        "hc_key": "VN79",
        "sub_provinces": ["Hồ Chí Minh", "Bà Rịa - Vũng Tàu"],
    },
    "DN": {
        "name": "Thành phố Đà Nẵng",
        "hc_key": "VN48",
        "sub_provinces": ["Đà Nẵng", "Quảng Nam"],
    },
    "KH": {
        "name": "Tỉnh Khánh Hòa",
        "hc_key": "VN56",
        "sub_provinces": ["Khánh Hòa", "Phú Yên"],
    },
    "HP": {
        "name": "Thành phố Hải Phòng",
        "hc_key": "VN31",
        "sub_provinces": ["Hải Phòng", "Hải Dương"],
    },
    "HUE": {
        "name": "Thành phố Huế",
        "hc_key": "VN46",
        "sub_provinces": ["Thừa Thiên Huế"],
    },
    "CT": {
        "name": "Thành phố Cần Thơ",
        "hc_key": "VN92",
        "sub_provinces": ["Cần Thơ", "Hậu Giang", "Sóc Trăng"],
    },
    "QN": {
        "name": "Tỉnh Quảng Ninh",
        "hc_key": "VN22",
        "sub_provinces": ["Quảng Ninh"],
    },
    "NB": {
        "name": "Tỉnh Ninh Bình",
        "hc_key": "VN37",
        "sub_provinces": ["Ninh Bình", "Nam Định", "Hà Nam"],
    },
    "LC": {
        "name": "Tỉnh Lào Cai",
        "hc_key": "VN15",
        "sub_provinces": ["Lào Cai", "Yên Bái"],
    },
    "CB": {"name": "Tỉnh Cao Bằng", "hc_key": "VN04", "sub_provinces": ["Cao Bằng"]},
    "LS": {"name": "Tỉnh Lạng Sơn", "hc_key": "VN20", "sub_provinces": ["Lạng Sơn"]},
    "LCH": {"name": "Tỉnh Lai Châu", "hc_key": "VN12", "sub_provinces": ["Lai Châu"]},
    "DB": {"name": "Tỉnh Điện Biên", "hc_key": "VN11", "sub_provinces": ["Điện Biên"]},
    "SL": {"name": "Tỉnh Sơn La", "hc_key": "VN14", "sub_provinces": ["Sơn La"]},
    "TQ": {
        "name": "Tỉnh Tuyên Quang",
        "hc_key": "VN08",
        "sub_provinces": ["Tuyên Quang", "Hà Giang"],
    },
    "TNG": {
        "name": "Tỉnh Thái Nguyên",
        "hc_key": "VN19",
        "sub_provinces": ["Thái Nguyên", "Bắc Kạn"],
    },
    "PT": {
        "name": "Tỉnh Phú Thọ",
        "hc_key": "VN25",
        "sub_provinces": ["Phú Thọ", "Vĩnh Phúc", "Hòa Bình"],
    },
    "BN": {
        "name": "Tỉnh Bắc Ninh",
        "hc_key": "VN24",
        "sub_provinces": ["Bắc Ninh", "Bắc Giang"],
    },
    "HY": {
        "name": "Tỉnh Hưng Yên",
        "hc_key": "VN33",
        "sub_provinces": ["Hưng Yên", "Thái Bình"],
    },
    "TH": {"name": "Tỉnh Thanh Hóa", "hc_key": "VN38", "sub_provinces": ["Thanh Hóa"]},
    "NA": {"name": "Tỉnh Nghệ An", "hc_key": "VN40", "sub_provinces": ["Nghệ An"]},
    "HT": {"name": "Tỉnh Hà Tĩnh", "hc_key": "VN42", "sub_provinces": ["Hà Tĩnh"]},
    "QT": {
        "name": "Tỉnh Quảng Trị",
        "hc_key": "VN44",
        "sub_provinces": ["Quảng Trị", "Quảng Bình"],
    },
    "QNG": {
        "name": "Tỉnh Quảng Ngãi",
        "hc_key": "VN51",
        "sub_provinces": ["Quảng Ngãi", "Bình Định"],
    },
    "GL": {
        "name": "Tỉnh Gia Lai",
        "hc_key": "VN52",
        "sub_provinces": ["Gia Lai", "Kon Tum"],
    },
    "DLK": {
        "name": "Tỉnh Đắk Lắk",
        "hc_key": "VN66",
        "sub_provinces": ["Đắk Lắk", "Đắk Nông"],
    },
    "LD": {
        "name": "Tỉnh Lâm Đồng",
        "hc_key": "VN68",
        "sub_provinces": ["Lâm Đồng", "Ninh Thuận", "Bình Thuận"],
    },
    "DNA": {
        "name": "Tỉnh Đồng Nai",
        "hc_key": "VN75",
        "sub_provinces": ["Đồng Nai", "Bình Dương", "Bình Phước"],
    },
    "TN": {
        "name": "Tỉnh Tây Ninh",
        "hc_key": "VN80",
        "sub_provinces": ["Tây Ninh", "Long An"],
    },
    "VL": {
        "name": "Tỉnh Vĩnh Long",
        "hc_key": "VN86",
        "sub_provinces": ["Vĩnh Long", "Bến Tre", "Trà Vinh"],
    },
    "DT": {
        "name": "Tỉnh Đồng Tháp",
        "hc_key": "VN82",
        "sub_provinces": ["Đồng Tháp", "Tiền Giang"],
    },
    "CM": {
        "name": "Tỉnh Cà Mau",
        "hc_key": "VN96",
        "sub_provinces": ["Cà Mau", "Bạc Liêu"],
    },
    "AG": {
        "name": "Tỉnh An Giang",
        "hc_key": "VN91",
        "sub_provinces": ["An Giang", "Kiên Giang"],
    },
}

# Reverse lookup dictionary: traditional province name -> target merged code
PROVINCE_TO_MERGED_CODE: dict[str, str] = {}
for code, data in MERGED_PROVINCES.items():
    for sub in data["sub_provinces"]:
        PROVINCE_TO_MERGED_CODE[sub.lower()] = code
        # Also add without prefixes like 'tỉnh', 'thành phố'
        clean_sub = (
            sub.lower().replace("thành phố ", "").replace("tp. ", "").replace("tỉnh ", "").strip()
        )
        PROVINCE_TO_MERGED_CODE[clean_sub] = code


def resolve_merged_code(province_name: str) -> str | None:
    """Find the target merged province code for a given province name."""
    norm = (
        province_name.lower()
        .replace("thành phố ", "")
        .replace("tp. ", "")
        .replace("tỉnh ", "")
        .strip()
    )
    return PROVINCE_TO_MERGED_CODE.get(norm) or PROVINCE_TO_MERGED_CODE.get(province_name.lower())
