-- 修復注意事項範本的欄位預設值與 REST 寫入權限。
-- 本專案使用自訂員工登入，Supabase 請求會使用 anon role。

CREATE TABLE IF NOT EXISTS public.notice_templates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    content text NOT NULL,
    category text,
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.notice_templates
    ALTER COLUMN id SET DEFAULT gen_random_uuid(),
    ALTER COLUMN created_at SET DEFAULT timezone('utc'::text, now()),
    ALTER COLUMN updated_at SET DEFAULT timezone('utc'::text, now());

ALTER TABLE public.notice_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "允許所有使用者讀取 notice_templates" ON public.notice_templates;
CREATE POLICY "允許所有使用者讀取 notice_templates"
ON public.notice_templates FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "允許所有使用者新增 notice_templates" ON public.notice_templates;
CREATE POLICY "允許所有使用者新增 notice_templates"
ON public.notice_templates FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "允許所有使用者更新 notice_templates" ON public.notice_templates;
CREATE POLICY "允許所有使用者更新 notice_templates"
ON public.notice_templates FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "允許所有使用者刪除 notice_templates" ON public.notice_templates;
CREATE POLICY "允許所有使用者刪除 notice_templates"
ON public.notice_templates FOR DELETE
TO anon, authenticated
USING (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.notice_templates TO anon, authenticated;
