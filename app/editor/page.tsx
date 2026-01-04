'use client'

import { useState, useEffect, useCallback, Suspense, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { slugify, isValidSlug } from '@/lib/slugify'
import PreviewFrame from '@/components/PreviewFrame'
import Toast, { useToast } from '@/components/Toast'

// 아이콘 컴포넌트
const CodeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
  </svg>
)

const EyeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
)

const SaveIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
  </svg>
)

const PublishIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
)

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
)

const ListIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
  </svg>
)

const LinkIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
)

const CopyIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
)

const LogoutIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
)

function EditorContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const slugParam = searchParams.get('slug')
  const supabase = useMemo(() => createClient(), [])
  const { toast, showToast, hideToast } = useToast()

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [htmlContent, setHtmlContent] = useState('')
  const [isPublished, setIsPublished] = useState(false)
  const [pageId, setPageId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [slugError, setSlugError] = useState<string | null>(null)

  // 페이지 로드
  useEffect(() => {
    const loadPage = async () => {
      if (!slugParam) return

      setLoading(true)
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('slug', slugParam)
        .single()

      if (error) {
        showToast('페이지를 불러올 수 없습니다.', 'error')
        setLoading(false)
        return
      }

      if (data) {
        setPageId(data.id)
        setTitle(data.title)
        setSlug(data.slug)
        setHtmlContent(data.html_content)
        setIsPublished(data.is_published)
      }
      setLoading(false)
    }

    loadPage()
  }, [slugParam, supabase, showToast])

  // 제목 변경 시 slug 자동 생성
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle)
    if (!pageId) {
      setSlug(slugify(newTitle))
    }
  }

  // Slug 유효성 검사
  const handleSlugChange = (newSlug: string) => {
    setSlug(newSlug)
    if (newSlug && !isValidSlug(newSlug)) {
      setSlugError('영문 소문자, 숫자, 하이픈만 허용됩니다.')
    } else {
      setSlugError(null)
    }
  }

  // 저장
  const handleSave = useCallback(async () => {
    if (!title.trim() || !slug.trim() || !htmlContent.trim()) {
      showToast('제목, slug, 내용을 모두 입력해주세요.', 'error')
      return
    }

    if (!isValidSlug(slug)) {
      showToast('유효하지 않은 slug입니다.', 'error')
      return
    }

    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      showToast('로그인이 필요합니다.', 'error')
      router.push('/login')
      return
    }

    if (pageId) {
      const { error } = await supabase
        .from('pages')
        .update({
          title,
          slug,
          html_content: htmlContent,
          updated_at: new Date().toISOString(),
        })
        .eq('id', pageId)

      if (error) {
        if (error.code === '23505') {
          showToast('이미 사용 중인 slug입니다.', 'error')
        } else {
          showToast('저장에 실패했습니다.', 'error')
        }
        setSaving(false)
        return
      }
    } else {
      const { data, error } = await supabase
        .from('pages')
        .insert({
          owner_id: user.id,
          title,
          slug,
          html_content: htmlContent,
          is_published: false,
        })
        .select()
        .single()

      if (error) {
        if (error.code === '23505') {
          showToast('이미 사용 중인 slug입니다.', 'error')
        } else {
          showToast('저장에 실패했습니다.', 'error')
        }
        setSaving(false)
        return
      }

      setPageId(data.id)
      router.replace(`/editor?slug=${slug}`)
    }

    showToast('저장되었습니다!', 'success')
    setSaving(false)
  }, [title, slug, htmlContent, pageId, supabase, router, showToast])

  // Ctrl+S 저장
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleSave])

  // 게시
  const handlePublish = async () => {
    if (!pageId) {
      await handleSave()
    }

    if (!pageId && !title.trim()) {
      showToast('먼저 페이지를 저장해주세요.', 'error')
      return
    }

    setSaving(true)

    const { error } = await supabase
      .from('pages')
      .update({ is_published: true, updated_at: new Date().toISOString() })
      .eq('id', pageId)

    if (error) {
      showToast('게시에 실패했습니다.', 'error')
      setSaving(false)
      return
    }

    setIsPublished(true)
    showToast('게시되었습니다!', 'success')
    setSaving(false)
  }

  // 게시 취소
  const handleUnpublish = async () => {
    if (!pageId) return

    setSaving(true)

    const { error } = await supabase
      .from('pages')
      .update({ is_published: false, updated_at: new Date().toISOString() })
      .eq('id', pageId)

    if (error) {
      showToast('게시 취소에 실패했습니다.', 'error')
      setSaving(false)
      return
    }

    setIsPublished(false)
    showToast('게시가 취소되었습니다.', 'info')
    setSaving(false)
  }

  // 새 문서
  const handleNew = () => {
    setPageId(null)
    setTitle('')
    setSlug('')
    setHtmlContent('')
    setIsPublished(false)
    router.replace('/editor')
  }

  // 로그아웃
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  // URL 복사
  const handleCopyUrl = () => {
    const url = `${window.location.origin}/p/${slug}`
    navigator.clipboard.writeText(url)
    showToast('URL이 복사되었습니다!', 'success')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-500">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}

      {/* 헤더 */}
      <header className="header-gradient text-white px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <CodeIcon />
              </div>
              My CodePen
            </h1>
            <nav className="flex items-center gap-2">
              <button
                onClick={handleNew}
                className="btn bg-white/10 hover:bg-white/20 text-white text-sm"
              >
                <PlusIcon />
                새 문서
              </button>
              <a
                href="/list"
                className="btn bg-white/10 hover:bg-white/20 text-white text-sm"
              >
                <ListIcon />
                내 문서
              </a>
            </nav>
          </div>
          <button
            onClick={handleLogout}
            className="btn bg-white/10 hover:bg-red-500/80 text-white text-sm"
          >
            <LogoutIcon />
            로그아웃
          </button>
        </div>
      </header>

      {/* 툴바 */}
      <div className="bg-white border-b shadow-sm px-6 py-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* 제목 입력 */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="프로젝트 제목을 입력하세요"
              className="input-field"
            />
          </div>

          {/* Slug 입력 */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">URL 슬러그</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">/p/</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="my-project"
                className={`input-field pl-10 ${slugError ? 'border-red-500 focus:ring-red-500' : ''}`}
              />
            </div>
            {slugError && (
              <p className="text-red-500 text-xs mt-1">{slugError}</p>
            )}
          </div>

          {/* 버튼들 */}
          <div className="flex items-center gap-3 pt-5">
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn btn-primary"
            >
              <SaveIcon />
              {saving ? '저장 중...' : '저장'}
            </button>

            {!isPublished ? (
              <button
                onClick={handlePublish}
                disabled={saving || !pageId}
                className="btn btn-success disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PublishIcon />
                게시
              </button>
            ) : (
              <button
                onClick={handleUnpublish}
                disabled={saving}
                className="btn btn-warning"
              >
                게시 취소
              </button>
            )}
          </div>

          {/* 게시 상태 */}
          {isPublished && slug && (
            <div className="flex items-center gap-3 pt-5 ml-auto">
              <span className="badge badge-success flex items-center gap-1">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                게시됨
              </span>
              <a
                href={`/p/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center gap-1"
              >
                <LinkIcon />
                /p/{slug}
              </a>
              <button
                onClick={handleCopyUrl}
                className="btn btn-secondary text-sm py-1"
              >
                <CopyIcon />
                복사
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 에디터 + 미리보기 */}
      <div className="flex-1 flex p-4 gap-4 overflow-hidden">
        {/* 코드 에디터 */}
        <div className="w-1/2 card overflow-hidden flex flex-col">
          <div className="panel-header">
            <CodeIcon />
            <span className="panel-header-title">HTML 코드</span>
            <span className="ml-auto text-xs text-gray-400">Ctrl+S 저장</span>
          </div>
          <textarea
            value={htmlContent}
            onChange={(e) => setHtmlContent(e.target.value)}
            className="flex-1 p-4 resize-none focus:outline-none code-editor"
            placeholder="<!DOCTYPE html>
<html>
<head>
  <title>My Page</title>
</head>
<body>
  <h1>Hello World!</h1>
</body>
</html>"
            spellCheck={false}
          />
        </div>

        {/* 미리보기 */}
        <div className="w-1/2 card overflow-hidden flex flex-col">
          <div className="panel-header">
            <EyeIcon />
            <span className="panel-header-title">미리보기</span>
            <span className="ml-auto badge badge-info text-xs">실시간</span>
          </div>
          <div className="flex-1 bg-white">
            <PreviewFrame htmlContent={htmlContent} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function EditorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="card p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-500">로딩 중...</p>
        </div>
      </div>
    }>
      <EditorContent />
    </Suspense>
  )
}
