-- ============================================
-- セミナー受付管理アプリ: Supabase セットアップ
-- ============================================
-- このSQLをSupabaseの「SQL Editor」で実行してください。

-- 1. 参加者テーブルの作成
CREATE TABLE IF NOT EXISTS participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  company TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'checked_in')),
  check_in_time TIMESTAMPTZ,
  memo TEXT
);

-- 2. RLS (Row Level Security) を有効化
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

-- 3. 認証済みユーザーのみ読み書き許可のポリシー
CREATE POLICY "認証済みユーザーは全操作可能"
ON participants
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 4. Realtime を有効化 (Supabaseダッシュボードからも設定可能)
ALTER PUBLICATION supabase_realtime ADD TABLE participants;
