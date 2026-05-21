-- 建立 notice_templates (注意事項範本) 資料表
CREATE TABLE IF NOT EXISTS notice_templates (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL, -- 如: 簽證須知
    content text NOT NULL, -- 說明內容
    category text, -- 標籤/分類 (可選)
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 設定 notice_templates 的 RLS (允許匿名讀寫以便測試，正式環境請依需求調整)
ALTER TABLE notice_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "允許所有使用者讀取 notice_templates" 
ON notice_templates FOR SELECT 
USING (true);

CREATE POLICY "允許所有使用者新增 notice_templates" 
ON notice_templates FOR INSERT 
WITH CHECK (true);

CREATE POLICY "允許所有使用者更新 notice_templates" 
ON notice_templates FOR UPDATE 
USING (true);

CREATE POLICY "允許所有使用者刪除 notice_templates" 
ON notice_templates FOR DELETE 
USING (true);


-- ==========================================
-- 建立 itinerary_versions (歷史存檔紀錄) 資料表
-- ==========================================
CREATE TABLE IF NOT EXISTS itinerary_versions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    itinerary_id uuid REFERENCES itineraries(id) ON DELETE CASCADE,
    modifier_id integer REFERENCES users(id) ON DELETE SET NULL,
    modifier_name text,
    snapshot_data jsonb NOT NULL, -- 儲存完整的 JSON 備份
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 設定 itinerary_versions 的 RLS
ALTER TABLE itinerary_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "允許所有使用者讀取 itinerary_versions" 
ON itinerary_versions FOR SELECT 
USING (true);

CREATE POLICY "允許所有使用者新增 itinerary_versions" 
ON itinerary_versions FOR INSERT 
WITH CHECK (true);

CREATE POLICY "允許所有使用者更新 itinerary_versions" 
ON itinerary_versions FOR UPDATE 
USING (true);

CREATE POLICY "允許所有使用者刪除 itinerary_versions" 
ON itinerary_versions FOR DELETE 
USING (true);


-- ==========================================
-- 建立 airline_codes (航空公司代碼字典) 資料表
-- ==========================================
CREATE TABLE IF NOT EXISTS airline_codes (
    code text PRIMARY KEY,
    name_zh text NOT NULL,
    name_en text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE airline_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "允許所有使用者讀取 airline_codes"
ON airline_codes FOR SELECT
USING (true);

CREATE POLICY "允許所有使用者新增 airline_codes"
ON airline_codes FOR INSERT
WITH CHECK (true);

CREATE POLICY "允許所有使用者更新 airline_codes"
ON airline_codes FOR UPDATE
USING (true);

CREATE POLICY "允許所有使用者刪除 airline_codes"
ON airline_codes FOR DELETE
USING (true);

INSERT INTO airline_codes (code, name_zh, name_en) VALUES
('BR', '長榮航空', 'EVA Air'),
('CI', '中華航空', 'China Airlines'),
('JX', '星宇航空', 'STARLUX Airlines'),
('IT', '台灣虎航', 'Tigerair Taiwan'),
('AE', '華信航空', 'Mandarin Airlines'),
('B7', '立榮航空', 'UNI Air'),
('CX', '國泰航空', 'Cathay Pacific'),
('HX', '香港航空', 'Hong Kong Airlines'),
('SQ', '新加坡航空', 'Singapore Airlines'),
('TR', '酷航', 'Scoot'),
('TG', '泰國航空', 'Thai Airways'),
('VN', '越南航空', 'Vietnam Airlines'),
('VJ', '越捷航空', 'VietJet Air'),
('NH', '全日空', 'All Nippon Airways'),
('JL', '日本航空', 'Japan Airlines'),
('KE', '大韓航空', 'Korean Air'),
('OZ', '韓亞航空', 'Asiana Airlines'),
('MH', '馬來西亞航空', 'Malaysia Airlines'),
('PR', '菲律賓航空', 'Philippine Airlines'),
('5J', '宿霧太平洋航空', 'Cebu Pacific'),
('EK', '阿聯酋航空', 'Emirates'),
('QR', '卡達航空', 'Qatar Airways'),
('TK', '土耳其航空', 'Turkish Airlines')
ON CONFLICT (code) DO UPDATE SET
    name_zh = EXCLUDED.name_zh,
    name_en = EXCLUDED.name_en,
    updated_at = timezone('utc'::text, now());


-- ==========================================
-- 建立 city_codes (城市 / 機場代碼字典) 資料表
-- ==========================================
CREATE TABLE IF NOT EXISTS city_codes (
    code text PRIMARY KEY,
    city_zh text NOT NULL,
    city_en text NOT NULL,
    country_zh text,
    airport_name_zh text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE city_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "允許所有使用者讀取 city_codes"
ON city_codes FOR SELECT
USING (true);

CREATE POLICY "允許所有使用者新增 city_codes"
ON city_codes FOR INSERT
WITH CHECK (true);

CREATE POLICY "允許所有使用者更新 city_codes"
ON city_codes FOR UPDATE
USING (true);

CREATE POLICY "允許所有使用者刪除 city_codes"
ON city_codes FOR DELETE
USING (true);

INSERT INTO city_codes (code, city_zh, city_en, country_zh, airport_name_zh) VALUES
('TPE', '台北', 'Taipei', '台灣', '桃園國際機場'),
('TSA', '台北', 'Taipei', '台灣', '台北松山機場'),
('KHH', '高雄', 'Kaohsiung', '台灣', '高雄國際機場'),
('RMQ', '台中', 'Taichung', '台灣', '台中國際機場'),
('HKG', '香港', 'Hong Kong', '香港', '香港國際機場'),
('MFM', '澳門', 'Macau', '澳門', '澳門國際機場'),
('NRT', '東京', 'Tokyo Narita', '日本', '成田國際機場'),
('HND', '東京', 'Tokyo Haneda', '日本', '羽田機場'),
('KIX', '大阪', 'Osaka Kansai', '日本', '關西國際機場'),
('NGO', '名古屋', 'Nagoya', '日本', '中部國際機場'),
('FUK', '福岡', 'Fukuoka', '日本', '福岡機場'),
('OKA', '沖繩', 'Okinawa', '日本', '那霸機場'),
('CTS', '札幌', 'Sapporo', '日本', '新千歲機場'),
('ICN', '首爾', 'Seoul Incheon', '韓國', '仁川國際機場'),
('GMP', '首爾', 'Seoul Gimpo', '韓國', '金浦國際機場'),
('PUS', '釜山', 'Busan', '韓國', '金海國際機場'),
('BKK', '曼谷', 'Bangkok', '泰國', '蘇凡納布機場'),
('DMK', '曼谷', 'Bangkok Don Mueang', '泰國', '廊曼機場'),
('HKT', '普吉', 'Phuket', '泰國', '普吉國際機場'),
('CNX', '清邁', 'Chiang Mai', '泰國', '清邁國際機場'),
('SIN', '新加坡', 'Singapore', '新加坡', '樟宜機場'),
('KUL', '吉隆坡', 'Kuala Lumpur', '馬來西亞', '吉隆坡國際機場'),
('DPS', '峇里島', 'Bali Denpasar', '印尼', '伍拉賴國際機場'),
('CGK', '雅加達', 'Jakarta', '印尼', '蘇卡諾哈達國際機場'),
('HAN', '河內', 'Hanoi', '越南', '內排國際機場'),
('SGN', '胡志明市', 'Ho Chi Minh City', '越南', '新山一國際機場'),
('DAD', '峴港', 'Da Nang', '越南', '峴港國際機場'),
('PQC', '富國島', 'Phu Quoc', '越南', '富國國際機場'),
('CXR', '芽莊', 'Nha Trang Cam Ranh', '越南', '金蘭國際機場'),
('PNH', '金邊', 'Phnom Penh', '柬埔寨', '金邊國際機場'),
('SAI', '暹粒', 'Siem Reap', '柬埔寨', '暹粒吳哥國際機場'),
('MNL', '馬尼拉', 'Manila', '菲律賓', '尼諾伊艾奎諾國際機場'),
('CEB', '宿霧', 'Cebu', '菲律賓', '麥克坦宿霧國際機場'),
('DXB', '杜拜', 'Dubai', '阿拉伯聯合大公國', '杜拜國際機場'),
('DOH', '杜哈', 'Doha', '卡達', '哈馬德國際機場'),
('IST', '伊斯坦堡', 'Istanbul', '土耳其', '伊斯坦堡機場'),
('LAX', '洛杉磯', 'Los Angeles', '美國', '洛杉磯國際機場'),
('SFO', '舊金山', 'San Francisco', '美國', '舊金山國際機場'),
('JFK', '紐約', 'New York JFK', '美國', '甘迺迪國際機場'),
('LHR', '倫敦', 'London Heathrow', '英國', '希斯洛機場'),
('CDG', '巴黎', 'Paris Charles de Gaulle', '法國', '戴高樂機場'),
('FRA', '法蘭克福', 'Frankfurt', '德國', '法蘭克福機場')
ON CONFLICT (code) DO UPDATE SET
    city_zh = EXCLUDED.city_zh,
    city_en = EXCLUDED.city_en,
    country_zh = EXCLUDED.country_zh,
    airport_name_zh = EXCLUDED.airport_name_zh,
    updated_at = timezone('utc'::text, now());
