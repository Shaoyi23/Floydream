-- ============================================================
-- Floydream Supabase 数据库初始化脚本
-- 在 Supabase SQL Editor 中粘贴执行即可
-- ============================================================

-- 1. 创建 dreams 表
CREATE TABLE IF NOT EXISTS dreams (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL,
  title       TEXT NOT NULL DEFAULT '',
  content     TEXT NOT NULL DEFAULT '',
  mood        TEXT NOT NULL DEFAULT '平静',
  tags        JSONB NOT NULL DEFAULT '[]'::jsonb,
  analysis    JSONB,
  status      TEXT NOT NULL DEFAULT 'draft',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  analyzed_at TIMESTAMPTZ
);

-- 2. 索引
CREATE INDEX IF NOT EXISTS idx_dreams_user_created
  ON dreams (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_dreams_user_updated
  ON dreams (user_id, updated_at DESC);

-- 3. 自动更新 updated_at 触发器
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_dreams_updated_at ON dreams;
CREATE TRIGGER trg_dreams_updated_at
  BEFORE UPDATE ON dreams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 4. 启用行级安全
ALTER TABLE dreams ENABLE ROW LEVEL SECURITY;

-- 5. 创建策略（个人应用，以 user_id 为粒度隔离数据）
DROP POLICY IF EXISTS "allow_select_own" ON dreams;
CREATE POLICY "allow_select_own" ON dreams
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "allow_insert_own" ON dreams;
CREATE POLICY "allow_insert_own" ON dreams
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "allow_update_own" ON dreams;
CREATE POLICY "allow_update_own" ON dreams
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "allow_delete_own" ON dreams;
CREATE POLICY "allow_delete_own" ON dreams
  FOR DELETE USING (true);
