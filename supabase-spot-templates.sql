-- 景點資料庫：可在 Supabase SQL Editor 獨立重複執行。
CREATE TABLE IF NOT EXISTS spot_templates (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    country_zh text NOT NULL,
    country_en text,
    city_zh text,
    name_zh text NOT NULL,
    name_en text,
    description text,
    tag text,
    image_url text,
    image_source text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT spot_templates_country_name_unique UNIQUE (country_zh, name_zh)
);

CREATE INDEX IF NOT EXISTS spot_templates_country_zh_idx ON spot_templates (country_zh);
CREATE INDEX IF NOT EXISTS spot_templates_name_zh_idx ON spot_templates (name_zh);

ALTER TABLE spot_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "允許所有使用者讀取 spot_templates" ON spot_templates;
CREATE POLICY "允許所有使用者讀取 spot_templates"
ON spot_templates FOR SELECT
USING (true);

DROP POLICY IF EXISTS "允許所有使用者新增 spot_templates" ON spot_templates;
CREATE POLICY "允許所有使用者新增 spot_templates"
ON spot_templates FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "允許所有使用者更新 spot_templates" ON spot_templates;
CREATE POLICY "允許所有使用者更新 spot_templates"
ON spot_templates FOR UPDATE
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "允許所有使用者刪除 spot_templates" ON spot_templates;
CREATE POLICY "允許所有使用者刪除 spot_templates"
ON spot_templates FOR DELETE
USING (true);
