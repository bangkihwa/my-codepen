-- =====================================================
-- My CodePen - Supabase 데이터베이스 스키마
-- =====================================================

-- 1. pages 테이블 생성
CREATE TABLE IF NOT EXISTS public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  html_content TEXT NOT NULL DEFAULT '',
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_pages_owner_updated
  ON public.pages(owner_id, updated_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_pages_slug
  ON public.pages(slug);

-- 3. updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_pages_updated_at ON public.pages;
CREATE TRIGGER update_pages_updated_at
  BEFORE UPDATE ON public.pages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 4. 공개 페이지 뷰 생성 (비로그인 사용자용)
CREATE OR REPLACE VIEW public.public_pages AS
SELECT
  slug,
  title,
  html_content,
  updated_at
FROM public.pages
WHERE is_published = true;

-- 5. RLS (Row Level Security) 활성화
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

-- 6. RLS 정책 설정

-- 기존 정책 삭제 (재실행 시 충돌 방지)
DROP POLICY IF EXISTS "Owner can select own pages" ON public.pages;
DROP POLICY IF EXISTS "Owner can insert own pages" ON public.pages;
DROP POLICY IF EXISTS "Owner can update own pages" ON public.pages;
DROP POLICY IF EXISTS "Owner can delete own pages" ON public.pages;

-- owner만 자신의 페이지 조회 가능
CREATE POLICY "Owner can select own pages"
  ON public.pages
  FOR SELECT
  USING (auth.uid() = owner_id);

-- owner만 자신의 페이지 생성 가능
CREATE POLICY "Owner can insert own pages"
  ON public.pages
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- owner만 자신의 페이지 수정 가능
CREATE POLICY "Owner can update own pages"
  ON public.pages
  FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- owner만 자신의 페이지 삭제 가능
CREATE POLICY "Owner can delete own pages"
  ON public.pages
  FOR DELETE
  USING (auth.uid() = owner_id);

-- 7. public_pages 뷰에 대한 익명 사용자 접근 허용
-- (뷰는 RLS 정책을 우회하므로 별도 권한 부여 필요)
GRANT SELECT ON public.public_pages TO anon;
GRANT SELECT ON public.public_pages TO authenticated;

-- =====================================================
-- 설정 완료!
-- =====================================================
